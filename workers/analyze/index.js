/**
 * Cloudflare Worker – AI + API Ninjas proxy
 *
 * Supports two modes selected by the `type` field in the POST body:
 *
 *   type "ai"  → AI performance analysis
 *     provider "groq"   → uses GROQ_API_KEY   (model: openai/gpt-oss-20b)
 *     provider "nvidia" → uses NVIDIA_API_KEY  (first available model from NVIDIA_MODELS)
 *
 *   type "ninjas" → API Ninjas proxy
 *     endpoint "quotes" → GET https://api.api-ninjas.com/v1/quotes
 *     endpoint "facts"  → GET https://api.api-ninjas.com/v1/facts
 *
 * Secrets setup (run from workers/analyze/):
 *   wrangler secret put GROQ_API_KEY
 *   wrangler secret put NVIDIA_API_KEY
 *   wrangler secret put NINJAS_API_KEY
 *   wrangler deploy
 */

const ALLOWED_ORIGIN = "*";
// llama-3.1-8b-instant was deprecated by Groq (shutdown 2026-08-16); gpt-oss-20b is their recommended replacement.
const GROQ_MODEL    = "openai/gpt-oss-20b";
// NVIDIA's catalogue changes often and not every listed model is deployed for every account (404 "Function ... not found"),
// or it may be retired (410). We try these in order and use the first one that answers; the one that worked last is
// remembered per Worker instance and tried first next time, so dead models don't add latency to every request.
// (The old nemotron-content-safety-reasoning-4b hit end of life on 2026-07-15 and was a safety classifier, not a chat model.)
const NVIDIA_MODELS = [
  "openai/gpt-oss-20b",                    // confirmed available on this account (2026-10-10)
  "nvidia/llama-3.1-nemotron-70b-instruct",
  "google/gemma-3-12b-it",
  "nvidia/nemotron-nano-3-30b-a3b",
];
let nvidiaPreferred = null;
const NVIDIA_BASE   = "https://integrate.api.nvidia.com/v1";
const NINJAS_BASE   = "https://api.api-ninjas.com/v1";

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(ALLOWED_ORIGIN) });
    }
    if (request.method !== "POST") {
      return new Response("POST only", { status: 405 });
    }

    let body;
    try { body = await request.json(); }
    catch { return new Response("Invalid JSON body", { status: 400 }); }

    const type = (body.type || "ai").toLowerCase();

    // ── API Ninjas proxy ────────────────────────────────────────────────────
    if (type === "ninjas") {
      const endpoint = body.endpoint === "facts" ? "facts" : "quotes";
      let ninjasResponse;
      try {
        ninjasResponse = await fetch(`${NINJAS_BASE}/${endpoint}`, {
          headers: { "X-Api-Key": env.NINJAS_API_KEY },
        });
      } catch (err) {
        console.error(`API Ninjas request failed: ${err.message}`);
        return jsonResponse({ error: "quote service is temporarily unavailable" }, 502);
      }
      if (!ninjasResponse.ok) {
        console.error(`API Ninjas ${ninjasResponse.status}: ${(await ninjasResponse.text()).slice(0, 300)}`);
        return jsonResponse({ error: "quote service is temporarily unavailable" }, 502);
      }
      const data = await ninjasResponse.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders(ALLOWED_ORIGIN) },
      });
    }

    // ── AI analysis ────────────────────────────────────────────────────────
    const metrics  = body.metrics;
    const provider = (body.provider || "groq").toLowerCase();

    if (!Array.isArray(metrics) || metrics.length === 0) {
      return new Response("metrics array required", { status: 400 });
    }

    const metricLines = metrics
      .map((m) => `- ${m.title}: ${m.value} (${m.note})`)
      .join("\n");

    const prompts = {
      groq:   `You are a web performance assistant. Write one plain-English verdict sentence (under 15 words) for a non-technical reader. Focus only on whether the experience feels fast or slow.\n\nMetrics:\n${metricLines}`,
      nvidia: `You are a senior web performance engineer reviewing Core Web Vitals. Identify the single most impactful issue: state the metric name, whether it passes Google's threshold (LCP < 2.5s good, TTFB < 800ms good, page load < 3s good), and the most likely cause. Reply in under 40 words.\n\nMetrics:\n${metricLines}`,
    };

    const prompt = prompts[provider] || prompts.groq;

    const isNvidia = provider === "nvidia";
    const apiUrl   = isNvidia ? `${NVIDIA_BASE}/chat/completions` : "https://api.groq.com/openai/v1/chat/completions";
    const apiKey   = isNvidia ? env.NVIDIA_API_KEY : env.GROQ_API_KEY;
    const models   = isNvidia
      ? (nvidiaPreferred ? [nvidiaPreferred, ...NVIDIA_MODELS.filter((m) => m !== nvidiaPreferred)] : NVIDIA_MODELS)
      : [GROQ_MODEL];

    if (!apiKey) {
      console.error(`${provider.toUpperCase()}_API_KEY secret is not set on this Worker`);
      return jsonResponse({ error: `${provider} analysis is not configured` }, 500);
    }

    const attempts = [];
    for (const model of models) {
      let aiResponse;
      try {
        aiResponse = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify(
            isNvidia
              // reasoning models (gpt-oss) spend part of the budget thinking, so give them plenty of headroom
              ? { model, messages: [{ role: "user", content: prompt }], temperature: 0.4, max_tokens: /gpt-oss|reasoning/.test(model) ? 1200 : 400 }
              // gpt-oss is a reasoning model: keep reasoning short and leave token headroom so the
              // reasoning pass doesn't use the whole budget and leave the answer empty.
              : { model, messages: [{ role: "user", content: prompt }], temperature: 0.4, max_tokens: 400, reasoning_effort: "low" }
          ),
        });
      } catch (err) {
        console.error(`${provider} request failed: ${err.message}`);
        return jsonResponse({ error: `${provider} analysis is temporarily unavailable` }, 502);
      }

      if (aiResponse.ok) {
        const data    = await aiResponse.json();
        const verdict = (data?.choices?.[0]?.message?.content || "").trim();
        if (verdict) {
          if (isNvidia) nvidiaPreferred = model;
          return jsonResponse({ verdict, provider, model });
        }
        attempts.push(`${model}: empty reply`);
        continue;
      }

      const errText = await aiResponse.text();
      console.error(`${provider} ${model} -> ${aiResponse.status}: ${errText.slice(0, 300)}`);
      attempts.push(`${model}: ${aiResponse.status}`);
      // Model unavailable for this account / retired / not found -> try the next one. Anything else (bad key, rate limit) is final.
      if (![404, 410].includes(aiResponse.status)) break;
    }

    if (isNvidia) nvidiaPreferred = null;
    return jsonResponse({ error: `${provider} analysis is temporarily unavailable`, attempts }, 502);
  },
};

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(ALLOWED_ORIGIN) },
  });
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
