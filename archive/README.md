# Archive

Retired code and pages. **Nothing here is deployed** (`firebase.json` serves only `public/`). Kept so earlier versions can be consulted or restored.

| Folder | What it is |
|---|---|
| `legacy-site/` | The previous Bootstrap-based site: `index`, `slide` (TechStack), `LiveTiles` (Afterwork), `Ai`, `sports`, `dash` and `Login` (feedback + demo login). `img/` holds the images these pages use, with their original names/paths, so the pages still render when opened locally. Links to the topic pages (`python.html` …) point at files that now live in `public/topics/`. |
| `design-explorations/` | Alternative designs tried while building the current theme: a light editorial home page (`index-ai2.html`) and an "invite to the new theme" toast on the old home page. Design reference only — their asset paths are not maintained. |
| `functions-unused/` | A Firebase Functions scaffold that was never deployed (the AI proxy is the Cloudflare Worker in `workers/analyze/`). `node_modules` was removed; run `npm ci` here if you ever need it. |
| `misc/` | `swiper.min.*` (the old coverflow slider), a stray template `package.json`, and an unused GeoJSON file. |

To restore a legacy page: copy it back into `public/`, fix its asset paths to `/assets/...`, and add it to `sitemap.xml`. Then run `npm run check`.
