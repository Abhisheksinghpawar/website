# Abhishek Singh Pawar — personal website

Source for [abhisheksinghpawar.com](https://abhisheksinghpawar.com/): a static, dark "AI theme" site hosted on Firebase Hosting, plus a small Cloudflare Worker that proxies the AI and API calls so no API key ever ships to the browser.

## Repository layout

```
public/                       Everything that is deployed (Firebase Hosting root)
├─ index.html                 Journey: hero, live page-performance + AI analysis, story, experience, recognition
├─ slide.html                 TechStack: tools for performance engineering, testing, monitoring, execution, APM
├─ LiveTiles.html             Afterwork: quote/fact of the day, interests, passions
├─ Ai.html                    AI: tools learned and AI-for-performance-engineering projects
├─ feedback.html              Feedback (embedded Google Form)
├─ 404.html                   Not-found page
├─ topics/                    Legacy learning notes: python, pythonprojects, bootstrap, c, firebase, html5, r, tableau
├─ assets/
│  ├─ css/
│  │  ├─ ai-theme.css         Shared theme for slide / LiveTiles / Ai / feedback / 404
│  │  └─ pages/               One stylesheet per page (home.css is self-contained)
│  ├─ js/
│  │  ├─ config.js            Site config (Worker URL)
│  │  ├─ analytics.js         Firebase Analytics, loaded on every page
│  │  ├─ ai-theme.js          Shared behaviour: progress bar, nav, scroll-reveal, marquee
│  │  └─ pages/               One script per page (home, afterwork, ai)
│  ├─ img/                    Images by purpose: brand, logos/{ai,tech,tools}, experience, education,
│  │                          recognition, afterwork, topics   (lowercase-kebab-case names)
│  └─ docs/                   PDFs linked from the topic pages
├─ favicon.ico  robots.txt  sitemap.xml
workers/analyze/              Cloudflare Worker: Groq + NVIDIA AI analysis and API Ninjas proxy
tools/check-links.mjs         Link / asset checker (also runs in CI)
archive/                      Retired code and pages, kept for reference (not deployed) — see archive/README.md
firebase.json                 Hosting config: redirects for retired URLs, cache + security headers
.github/workflows/            Deploy on merge to main, preview on PR, link check
```

## Develop

```bash
npm run serve        # static preview of public/ at http://localhost:3000
npm run check        # fail on any broken link, missing asset or bad #anchor
```

Pages use relative asset paths (`assets/...` from the root pages, `../assets/...` from `topics/`), so you can also just double-click `public/index.html` and it works offline. The one exception is `404.html`, which uses root-absolute paths because Firebase serves it at URLs of any depth — preview it through `npm run serve`.

## Deploy

- **Site** — push to `main`; the GitHub Action deploys `public/` to Firebase Hosting (project `abhisheksinghpawar-70ac7`). Manually: `npm run deploy:site`.
- **Worker** — deployed separately; it is not part of the Hosting deploy:
  ```bash
  cd workers/analyze
  npx wrangler secret put GROQ_API_KEY      # also NVIDIA_API_KEY, NINJAS_API_KEY
  npx wrangler deploy                       # or: npm run deploy:worker
  ```
  The Worker URL is set in `public/assets/js/config.js`. Model names live at the top of `workers/analyze/index.js`; providers retire models regularly, so if a card shows an error, check there first.

## Conventions

- New page → copy the head/nav/footer of an existing page, add its CSS/JS under `assets/{css,js}/pages/`, add it to `sitemap.xml`, then run `npm run check`.
- Images: lowercase-kebab-case, placed in the folder that matches where they are used; keep photos under ~1400px wide.
- Retiring a page: move it to `archive/`, and add a 301 to `firebase.json` if its URL was ever public.

---

> 💡 _"Tools should be as elegant as they are powerful."_
