/**
 * Cloudflare Worker – AI + API Ninjas proxy
 *
 * Supports two modes selected by the `type` field in the POST body:
 *
 *   type "ai"  → AI performance analysis
 *     provider "groq"   → uses GROQ_API_KEY   (model: llama-3.1-8b-instant)
 *     provider "nvidia" → uses NVIDIA_API_KEY  (model: nvidia/llama-3.1-nemotron-ultra-253b-v1)
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
const GROQ_MODEL    = "llama-3.1-8b-instant";
const NVIDIA_MODEL  = "nvidia/nemotron-content-safety-reasoning-4b";
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
        return new Response(
          JSON.stringify({ error: "API Ninjas request failed", details: err.message }),
          { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders(ALLOWED_ORIGIN) } }
        );
      }
      if (!ninjasResponse.ok) {
        const errText = await ninjasResponse.text();
        return new Response(
          JSON.stringify({ error: `API Ninjas error ${ninjasResponse.status}`, details: errText }),
          { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders(ALLOWED_ORIGIN) } }
        );
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
      groq:   `You are a web performance assistant. Reply in under 20 words. One verdict sentence for a non-technical reader, then two bullet suggestions (each under 10 words).\n\nMetrics:\n${metricLines}`,
      nvidia: `You are a senior web performance engineer. Reply in under 30 words. One technical verdict sentence, then two bullet recommendations with brief reasoning.\n\nMetrics:\n${metricLines}`,
    };

    const prompt = prompts[provider] || prompts.groq;

    let apiUrl, apiKey, model;
    if (provider === "nvidia") {
      apiUrl = `${NVIDIA_BASE}/chat/completions`;
      apiKey = env.NVIDIA_API_KEY;
      model  = NVIDIA_MODEL;
    } else {
      apiUrl = "https://api.groq.com/openai/v1/chat/completions";
      apiKey = env.GROQ_API_KEY;
      model  = GROQ_MODEL;
    }

    let aiResponse;
    try {
      aiResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.4,
          max_tokens: provider === "nvidia" ? 120 : 80,
        }),
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: `${provider} request failed`, details: err.message }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders(ALLOWED_ORIGIN) } }
      );
    }

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      return new Response(
        JSON.stringify({ error: `${provider} API error ${aiResponse.status}`, details: errText }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders(ALLOWED_ORIGIN) } }
      );
    }

    const data    = await aiResponse.json();
    const verdict = data?.choices?.[0]?.message?.content || "No verdict returned.";

    return new Response(JSON.stringify({ verdict, provider }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders(ALLOWED_ORIGIN) },
    });
  },
};

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
