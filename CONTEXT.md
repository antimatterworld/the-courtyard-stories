# The Courtyard Stories — session context (resume protocol)

## Completed
- Vite + React 19 + TS project scaffolded at `/Users/yasirkhan/The-Courtyard-Stories` (git initialized, no remote yet)
- Design token system locked: `src/styles.css` (light = studio daylight default, dark = darkroom; Fraunces / Hanken Grotesk / IBM Plex Mono; film-grain overlay; 44px touch targets; full responsive breakpoints)
- Content source of truth: `src/data/content.ts` (4 services with inclusions/equipment/FAQs, 8 portfolio items, studio facts, site FAQs, enquiry config)
- All pages built: Home (3D hero + filtered reel + services + trust + conditional enquiry teaser + FAQ + CTA band), Services hub, 4 service detail pages, filterable masonry portfolio with lightbox, Studio space (light-by-the-hour + amenities), Visit (walkthrough booking), Enquire (4-step conditional form with AbortController + retry + WhatsApp fallback), 404
- Three.js interactive hero (aperture + iris blades + dust + film strip, pointer parallax, theme re-tint, visibility-pause, DPR clamp, **dynamic import** so the 742 kB chunk only loads on-capable homepage visits; static poster fallback)
- SEO/GEO/AEO: per-page JSON-LD (LocalBusiness/PhotographyStudio, Service, FAQPage, ItemList, Breadcrumb, CollectionPage) injected by `Page` wrapper; `public/sitemap.xml`, `public/robots.txt` (AI-crawler allowances), `public/llms.txt` citation-optimized; OpenGraph/Twitter/canonical in `index.html`
- Cloudflare-ready: `wrangler.toml` (Pages + Functions, security headers, immutable asset cache), `functions/api/enquiry.ts` (validated POST collector forward), dev stand-in in `vite.config.ts`
- Build gate: `npm run build` passes with zero errors (tsc -b clean)
- `partner-asset-manifest.md` written (7 Flow images + 1 ffmpeg ambient-loop spec)

## Changed
- `index.html`, `src/styles.css`, `src/main.tsx`, `src/data/content.ts`, `src/lib/{hooks,submission,schema}.ts`
- `src/components/{HeroScene,Chrome,Work,FAQ,EnquiryForm}.tsx`
- `src/pages/{Home,ServicesHub,ServiceDetail,WorkPage,Studio,Visit,Enquire,NotFound}.tsx`
- `vite.config.ts`, `wrangler.toml`, `functions/api/enquiry.ts`, `public/{sitemap.xml,robots.txt,llms.txt,_redirects}`, `partner-asset-manifest.md`

## Next
1. **Wait for Flow render** of `~/flow-mcp-out/courtyard-hero/scene-01..07.jpg` → downscale with ffmpeg to 1600px, copy to `public/assets/flow/{hero,fashion,product,podcast,crew,lens,commercial}.jpg` (scene-07 = commercial)
2. ffmpeg ambient loop `public/assets/flow/hero-loop.mp4` per manifest spec
3. Create `public/assets/og/og-studio.jpg` (1200×630 crop of hero.jpg) for OG preview
4. Run `npm run build` final gate, then `npx playwright` screenshots: desktop home (3D + fallback), 375px mobile home, services detail, portfolio lightbox, enquire step-3 **validated form state** (filled fields + errors cleared), one empty/error state
5. Commit + push to BOTH GitHub accounts (dual-push rule): `devsak166-tech/courtyard-stories` + `asadmazhar12711/courtyard-stories` (private repos)
6. Report with screenshot paths
