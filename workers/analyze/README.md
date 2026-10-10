# analyze — Cloudflare Worker

Proxies the browser's AI and API calls so keys stay server-side. Deployed as `groq-perf-proxy`; the site calls it via `workerUrl` in `public/assets/js/config.js`.

| Request body | Result |
|---|---|
| `{ metrics: [...] }` (provider defaults to `groq`) | One-line performance verdict from Groq (`openai/gpt-oss-20b`) |
| `{ provider: "nvidia", metrics: [...] }` | Short expert analysis from the first available model in `NVIDIA_MODELS` |
| `{ type: "ninjas", endpoint: "quotes" \| "facts" }` | Quote / fact of the day from API Ninjas |

Secrets (set once, stored encrypted by Cloudflare — never in this repo):

```bash
npx wrangler secret put GROQ_API_KEY
npx wrangler secret put NVIDIA_API_KEY
npx wrangler secret put NINJAS_API_KEY
npx wrangler deploy
```

Provider model catalogues change often. If a card on the site shows `model_not_found`, `410` or `404`, update the model constants at the top of `index.js` (the Worker already falls back through several NVIDIA models and reports each attempt in its error text).
