# The Courtyard Stories — studio website

Production-grade frontend for a Delhi photo & video production studio:
high-end fashion, commercial, product cinematography and podcast production.
Built for two jobs — turn visitors into qualified shoot enquiries, and
dominate local search + AI answer engines.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React 19 + Vite (rolldown) | Fast builds, strict TS, no SSR needed for a Cloudflare Pages + Functions deploy |
| Routing | react-router-dom 7 | 10 clean routes incl. 4 service landing pages |
| 3D hero | three.js, **dynamically imported** | The ~190 kB (gz) chunk loads only on the homepage, only on capable devices; static poster fallback everywhere else |
| Styling | Hand-rolled token system (`src/styles.css`) | One source of truth: warm-neutral daylight (light) / darkroom (dark), Fraunces + Hanken Grotesk + IBM Plex Mono, film-grain overlay |
| SEO/GEO/AEO | JSON-LD (LocalBusiness, Service, FAQPage, Breadcrumb, ItemList, CollectionPage) + `sitemap.xml` + `robots.txt` + `llms.txt` | Crawlable by Google and AI engines (GPTBot, PerplexityBot, ClaudeBot, Google-Extended) |
| Forms | Multi-step conditional enquiry + Cloudflare Pages Function (`functions/api/enquiry.ts`) | AbortController 10 s timeout → one retry → WhatsApp fallback, so no enquiry is ever lost |
| Assets | Google Flow MCP generated (see `partner-asset-manifest.md`) | Prompt-engineered, watermark-guarded, no stock, no external CDNs |

## Develop

```bash
npm install
npm run dev          # http://localhost:5173 — includes a dev stand-in for /api/enquiry
npm run build        # tsc -b + vite build → dist/
npm run preview      # serve the production build locally
```

The dev server registers a tiny middleware (`vite.config.ts → devEnquiryApi`)
that accepts the same enquiry payload the Cloudflare Function does and logs it
to the console, so the full sent / fallback flow is testable without a deploy.

## Deploy (Cloudflare)

```bash
npx wrangler whoami                      # verify the company account
npx wrangler pages deploy dist           # static site + functions/ auto-bundled
```

`wrangler.toml` sets: Pages output dir, security headers, immutable caching
for `/assets/*`, and the `ENQUIRY_COLLECTOR_URL` var. Point that var at the
team's collector (email / Google-Sheet / webhook) after first deploy — until
then the Function acks submissions locally and the WhatsApp fallback keeps the
user flow intact.

## Page suite

| Route | Contents |
|---|---|
| `/` | Showpiece 3D hero, marquee, filtered work reel, service overview, trust stats, conditional enquiry teaser, FAQ, CTA band, WhatsApp FAB |
| `/work` | Filterable masonry (stills + reels, zero layout shift), lightbox, process cards |
| `/services` | Hub: 4 crafts with inclusions, kit, from-prices, hub FAQs |
| `/services/fashion · commercial · product · podcast` | Full landing pages: intro, numbered inclusions, equipment grid, service-specific FAQs, cross-links |
| `/studio` | Space facts, cyclorama/podcast-suite/grade-bay, light-by-the-hour timeline, directions |
| `/visit` | Walkthrough / quote-meeting / recce / grade-review booking cards, contact lines, directions |
| `/enquire` | 4-step conditional form (shoot type → dates & scale → crew & kit → contact), resilient submit, WhatsApp handoff |
| `*` | 404 with soft redirects |

## Design gates

- **Light is default** (studio daylight); the toggle is the darkroom/grading-suite theme; both are token-driven, no per-component one-offs
- 375 px / tablet / ultra-wide parity, 44 px minimum targets, `prefers-reduced-motion` disables grain + scroll reveals + the 3D loop
- LCP < 2.5 s: hero poster is a local `<img>`, `three` is a lazy chunk, fonts ship system fallbacks

## Verification

- `npm run build` — zero errors (tsc + vite)
- Screenshot gate: desktop + 375 px + one validated form state (see `CONTEXT.md` §Next for the current run)
