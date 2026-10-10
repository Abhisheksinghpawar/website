// Site-wide runtime configuration (loaded before the page scripts).
window.SITE_CONFIG = {
  // Cloudflare Worker that proxies Groq / NVIDIA (AI analysis) and API Ninjas (quote + fact of the day).
  // Source: workers/analyze/. API keys live in Cloudflare secrets, never in this repo.
  workerUrl: "https://groq-perf-proxy.abhisheksinghpawar17.workers.dev",
};
