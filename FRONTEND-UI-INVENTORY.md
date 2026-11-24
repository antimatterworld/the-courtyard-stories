# The Courtyard Stories — Frontend UI Inventory

**Purpose:** Single reference for redesigning, extending, or AI-guiding the frontend (colors, typography, motion, video, layout, performance).  
**Stack:** Vite 8 · React 19 · React Router 7 · TypeScript · `styles.css` + `cinematic.css` + `home-landing.css` + `story.css` + `studio-explorer.css`. `/` mounts a Three.js canvas inside `CinematicHome` after the loader. `?cinematic=0`, reduced motion, or no WebGL falls back to `LandingHome`.  
**Last audited:** 2026-11-24, Playwright on `http://localhost:5174/` (Chrome), 1440×900 and 390×844. Pass 4 notes below still describe the fallback homepage, not the page a visitor gets.

---

## Landing page status — 24 November 2026

Walked as a visitor. The loader finishes and the page does not throw. What is on screen is distorted. The homepage is one very long sticky scene (about 13 screens on a laptop, longer on a phone). A block-built courtyard stays fixed behind the copy, and the real photographs and headlines are laid on top of it instead of replacing it.

**Opening.** The nav pill is intact (Work, All sets, Services, Studio, Visit, Enquire; Menu on a phone). The headline “Stories live in places.” is readable. On a laptop the line “Five architectural worlds on one private estate in Kapashera.” is repeated as a marquee and runs off both sides of the screen, so the sentence is cut in half. Zone name pills (Mughal Colonnade, Chefchaouen, Thatched Lookout) sit on that sentence and on the yellow gate. “Plan a shoot” and “Explore the studio” are usable. “SCROLL” is small and partly behind a column. On a phone the headline wraps cleanly and the marquee does not collide with it. Five chips — Haveli, Mughal, Chefchaouen, Thatch, Gala — wrap above the WhatsApp button.

**Middle of the scroll.** A real set card appears (first the haveli, later the night gala). The words run underneath the floating zone labels and get cut off. The same photograph is drawn twice, so a second copy sticks out under the card. A black band covers the top edge. “Recent shoots” is a strip of real photos whose captions crash into each other, while the orange blocks and the yellow gate poke through the row.

**End of the scroll.** The copy leaves and the visitor is left with the diagram: a yellow gate, blue and orange slabs, straw boxes, two white pads, and a compass. It reads as a rough model, not the photographed estate. The booking and FAQ copy is in the page, but it is not what fills this last frame.

**Zone click.** On a phone, tapping Haveli opens the real haveli photograph. On a laptop the matching control is the name pinned to the 3D building; the phone chip row is present in the page but not visible, so the first click target is easy to miss.

**Measured.** No horizontal page scroll at 1440 or 390. No console page errors. One night-gala video request was aborted while scrolling. The public Worker from 22 November is the same build family; this note is from the local app on 24 November.

---

## 1. Where design lives (edit map)

| Concern | Primary file(s) | Notes |
|--------|------------------|-------|
| Legacy layout + component CSS | `src/styles.css` (~2276 lines) | Base structure; **overridden** by cinematic layer for tokens/chrome |
| **Cinematic tokens & overrides** | `src/styles/cinematic.css` | Dark-first palette, **loader**, nav pill, buttons; grain off |
| Content + media + **location** | `src/data/content.ts` | `STUDIO`, sets, services, portfolio, FAQs, enquiry config |
| **Scene data (Phase A, archival)** | `src/world/scene-manifest.json` | Regenerate via `npm run analyze:videos`; **not** used by live UI |
| **Motion engine (landing)** | `src/lib/motion.ts`, `src/lib/useMotionSection.ts` | Single rAF; scroll → `transform` on refs; IO gating + **remeasure on re-enter** |
| **Landing (`/`)** | `src/components/home/*`, `LandingHome.tsx` | See §11 — hero → pinned sets → counter rails → statement → services → close |
| **Studio (`/studio`)** | `src/components/studio/StudioExplorer.tsx`, `studioTiles.ts`, `studio-explorer.css` | **100svh** shell; **absolute** canvas/HUD (footer scrollable); drag plane · detail · list view |
| App shell, nav, footer, FAB | `src/components/Chrome.tsx` | Centred 56px pill; scroll hide via `transform` |
| **Lazy video** | `src/components/LazyViewportVideo.tsx` | `preload="none"`, IO/hover, max **2** concurrent plays |
| **Entry loader** | `src/components/Loader.tsx` | Arch portal; `world-progress` = fonts + hero poster weights only |
| Image/video tiles | `src/components/StudioImage.tsx` | Dark cinematic `MOTIF_TINT` plates |
| Portfolio | `src/components/Work.tsx` | Masonry + lightbox |
| Enquiry | `src/components/EnquiryForm.tsx` | 4-step + API + WhatsApp fallback |
| Scroll reveal | `src/lib/hooks.ts` | `useReveal` (`useTheme` unused in UI) |
| Loader progress | `src/lib/world-progress.tsx` | `loaderDone`, `loaderRatio`; font + poster weights |
| JSON-LD | `src/lib/schema.ts` | Uses `STUDIO` address/geo/maps |
| Fonts + meta | `index.html` | **Fraunces** (display titles), Syne, Instrument Sans, Tiro Devanagari Hindi; `theme-color` `#0A0F1F` |
| **Display type treatment** | end of `src/styles/home-landing.css` | Overrides hero, `.h1`/`.h2`, `.section-pointer`, statement, services, CTA, FAQ, falling-stack, page heroes, `.sets-head h1` |
| Phase A pipeline | `tools/analyze/analyze_videos.py`, `tools/analyze/REPORT.md` | `npm run analyze:videos` |
| **Motion reference** | `public/courtyard-landing-studio-preview.html` | Landing + studio interaction prototype |
| **Theme preview (static)** | `public/courtyard-theme-preview.html` | Token toggles A/B/C |
| **Cursor rules** | `.cursor/rules/courtyard-ui.mdc` | Nav spec + performance contract |
| Spec sources | `_zip-import-3/`, `_zip-import-2/`, `_zip-import/` | Pass briefs + loader references |
| Legacy scaffold | `src/App.css` | **Not imported** |

**Routes:** `/` · `/work` · `/services` · `/services/:slug` · `/studio` · `/visit` · `/enquire` · `*` — `src/main.tsx`.

**App shell order:** `.app-layer` (TopBar, routes, Footer, FAB) → `Loader` overlay (`z-index: 10000` until `phase === "off"`).

**Home component tree (`LandingHome.tsx`):** `HeroStatement` → `PinnedRail` → `CounterRails` → `StatementBlock` → `ServiceList` → `LandingClose`.

---

## 2. Brand concept (current — cinematic)

- **Mode:** **Dark-first only** (`data-theme="night"` in `main.tsx`; token sets `night` \| `cobalt` \| `marigold` on `<html>` possible via preview HTML). No user theme toggle in app shell.
- **Mood:** Film title sequence → editorial landing; **`--bg` landing** often `#07091A` via `LandingHome` inline set (cinematic tokens still `#0A0F1F` base).
- **Palette anchors:** Night `#0A0F1F`, plaster `#F3EBDD`, marigold CTA `#FF9F1C`, bougainvillea `#D6336C`, cobalt focus `#2F5BD0`, sand `#C9A37A`.
- **Texture:** Film grain **disabled** (`.grain { display: none }`).
- **Typography:** **Fraunces** (italic, `SOFT` 100, `WONK` 1, `opsz` 144) for hero and section titles; **Syne** remains the UI display fallback in tokens; **Instrument Sans** body/UI; **Tiro Devanagari Hindi** on the loader footer line. Title colour is burnt orange `#D94F1F`. The hero band is seafoam `#A8C9BE` with a paper-grain overlay.
- **Shape:** Pill buttons, cinematic **`--radius: 20px`** on cards.
- **Home (`/`):** VS/Goods-style **scroll-linked rails** on `#07091A` — no chapter WebGL, no full-page scrub journey.
- **Studio (`/studio`):** ReframeHK-style **infinite drag** tile plane + detail panel + **List view** (a11y).
- **Motion philosophy:** Landing scroll uses **`motion.ts`** (transform/opacity on refs). **GSAP 3.15** + **`@gsap/react`** lazy-init via **`ensureGsap()`** for **Pass 5** card choreography on **Five worlds** `SplitCard`s (`docs/card-animation-spec.md`, `useCardAnimation.ts`); `ScrollTrigger` refresh on loader/fonts/images; ticker bridges motion dirty loop.

---

## 3. Color system

### 3.1 Cinematic base (`src/styles/cinematic.css`)

| Token | Value | Role |
|-------|-------|------|
| `--night` | `#0A0F1F` | Base night |
| `--plaster` | `#F3EBDD` | Primary text |
| `--marigold` | `#FF9F1C` | Primary CTA |
| `--bougain` | `#D6336C` | Hover glow |
| `--cobalt` | `#2F5BD0` | Focus ring |
| `--sand` | `#C9A37A` | Muted meta |
| `--bg` | `var(--night)` | Page |
| `--ink` | `var(--plaster)` | Body text |
| `--accent` | `var(--marigold)` | Accents |
| `--wa` / `--wa-deep` | `#2fd671` / `#23b55c` | WhatsApp |
| `--footer-bg` | `#060910` | Footer |
| `--grain-opacity` | `0` | Grain off |
| `--topbar-h` | `56px` | Nav pill height |

### 3.2 Chapter accents (content + archival manifest only)

Scroll chapter bounds (`chapters.ts`) and **`HomeJourney`** are **removed**. Set colours still come from `ARCHITECTURAL_SETS[].palette` in `content.ts` and from `scene-manifest.json` for tooling — not scroll-tweened in UI.

### 3.3 Per-set accents (`content.ts`)

`--set-c` / bento tokens on `.landing-set-card`, `.bento-set-card`, portfolio pills.

### 3.4 StudioImage motifs (`MOTIF_TINT`)

Dark gradient pairs per motif — see `StudioImage.tsx`.

### 3.5 Legacy tokens (`styles.css`)

Fraunces/brass/light tokens remain in `styles.css` but are **masked** by `cinematic.css` for production chrome.

### 3.6 Phase A palettes (`tools/analyze/REPORT.md`)

| Set (manifest id) | Flythrough | Notes |
|-------------------|------------|--------|
| prologue | `flythrough-01-aerial.mp4` | Estate aerial opener (8s, 1080p50) |
| royal-haveli | `flythrough-02-haveli.mp4` | Loader poster preload target |
| mughal-colonnade | `flythrough-03-colonnade.mp4` | |
| chefchaouen-suite | `flythrough-04-mediterranean.mp4` | |
| rustic-village | `portfolio-thatched-tower.mp4` | 6s |
| night-gala | `flythrough-05-nightgala.mp4` | 1080×1920 portrait |

Regenerate: `npm run analyze:videos` → `scene-manifest.json` + `public/assets/world/<set>/kf_*.webp`.

---

## 4. Typography

Direction: 1970s editorial poster. Soft high-contrast serif, thick stems, thin joins, rounded terminals, tight leading. Not a geometric inline face and not Bodoni. Recoleta / ITC Souvenir are the visual target; **Fraunces** is the webfont used because those cuts are not on Google Fonts.

### 4.1 Families (`index.html`)

| Role | Family | Where |
|------|--------|--------|
| Editorial display | **Fraunces** italic 700, axes `SOFT` 100, `WONK` 1, `opsz` 144 | End of `home-landing.css` |
| UI display (nav, buttons, tokens) | **Syne** 700–800 | `--font-display` |
| Body / UI | **Instrument Sans** 400–500 | `--font-body`, `--font-mono` |
| Loader Hindi | **Tiro Devanagari Hindi** | `--font-deva` |

Loaded from Google Fonts in `index.html` (Vite, not `next/font`). Fallback stack: `"Fraunces", "Iowan Old Style", "Palatino Linotype", serif`.

### 4.2 Where Fraunces is applied

Selectors: `.landing-hero h1`, `.landing-hero .hero-line`, `.section-pointer`, `.landing-statement-copy h2`, `.landing-services h2`, `.landing-band-cta h2`, `.landing-band-faq h2`, `.falling-stack-head`, `.page-hero h1`, `.h1`, `.h2`, `.sets-head h1`.

Not applied to card captions, nav, buttons, or body copy.

| Setting | Value |
|---------|--------|
| Colour | `#D94F1F` |
| Style | italic, weight 700, no uppercase, no shadow, no stroke |
| Tracking | `-0.035em` |
| Leading | `0.88` |
| Hero size | `clamp(3.5rem, 11vw, 8.4rem)` |
| Page / section titles | `clamp(2.5rem, 6.2vw, 5.4rem)` |
| Smaller section labels (`.section-pointer`, falling-stack, FAQ) | `clamp(1.9rem, 4.2vw, 3.2rem)` |

### 4.3 Hero field

`.landing-band-hero` background is `#A8C9BE` with a lighter radial `#D7EFE6` and the existing SVG noise overlay at `0.35` opacity, `mix-blend-mode: multiply`. Supporting hero lines (`.hero-mobile-lede`, scroll cue) are `#9A3412`.

### 4.4 Utilities

`.btn` pill primary, `.h1`–`.h3`, `.muted`, `.chip` — mostly `styles.css`, overridden where noted in `cinematic.css`. `.h1` and `.h2` pick up the Fraunces treatment above.

---

## 5. Spacing, layout, alignment

- **Landing** (`.landing`): `--landing-gutter: clamp(24px, 5vw, 72px)`; `overflow-x: clip`.
- **Hero** (`.landing-hero`): `min-height: 100svh`, bottom-aligned grid, `padding-top: 120px` (clears fixed nav).
- **Pinned rail** (`.landing-pinned`): sticky inner; section height = horizontal overflow + `100vh` (or static rows when reduced motion).
- **Studio** (`.studio-explorer`): `height/min-height: 100svh`; canvas **not** `position: fixed` (allows footer below).
- **`.app-layer`**: main content above any future full-bleed layers.
- **Touch:** 48px buttons, 44px nav; focus `outline: 2px solid var(--cobalt)`.

**Retired layout primitives (do not restore without intent):** `.home-journey-track`, `.world-canvas`, `.home-chapter-stage`.

---

## 6. Breakpoints

From `styles.css` + cinematic:

| Breakpoint | Behaviour |
|------------|-----------|
| **≤820px** | Hide `.topbar-nav-desktop`; **Menu** → `.menu-overlay` |
| **≤767px** | Hide desktop Enquire in pill; studio detail full-bleed; landing stacks tighten |
| **1024 / 980 / 640** | Grid collapses on work/services/visit patterns in `styles.css` |

---

## 7. Motion & animation

**Contract:** Prefer **`transform` and `opacity` only**. Landing: one shared rAF in `motion.ts`; passive scroll/resize; `ResizeObserver` for section metrics; **`useMotionVisible`** calls `markMotionDirty()` when a section re-enters view (avoids stale off-screen transforms).

### 7.1 Animation inventory

| Surface | Driver | What moves | File(s) |
|---------|--------|------------|---------|
| Entry loader | CSS + rAF | Arch stroke, fill rise, **3-line title**, portal zoom, fade | `Loader.tsx`, `cinematic.css` |
| Top bar | scroll listener | `translateY` hide/show | `Chrome.tsx`, `.topbar--hidden` |
| Menu overlay | class toggle | `opacity` / `visibility` | `cinematic.css` |
| Landing hero lines | scroll + rAF | Headline spans ±`10vw` max parallax cap | `HeroStatement.tsx` |
| Pinned “Five worlds” | scroll + rAF | Track `translateX`; bar `scaleX`; counter 01–05 | `PinnedRail.tsx` |
| Counter rails | scroll + rAF | Rows opposite `translateX` (`× 0.45`) | `CounterRails.tsx` |
| Studio canvas | pointer + rAF | Plane `translate3d`; inertia `×0.94` | `StudioExplorer.tsx` |
| Section reveal | IO | `.reveal` → `.reveal.in` | `hooks.ts` |
| Lazy video | IO / hover | play/pause | `LazyViewportVideo.tsx` |
| Work lightbox | mount | `modal-bg`, `modal-in` | `styles.css` |
| WhatsApp FAB | CSS | `fab-in`, `fab-pulse` | `styles.css` |
| Enquiry steps | React state | field focus borders | `EnquiryForm.tsx` |

### 7.2 Loader (`Loader.tsx`)

| Item | Detail |
|------|--------|
| **Title lines** | `The` / `Courtyard` / `Stories` (marigold on last line) |
| **Timing** | `LOADER_BASE_DELAY_MS` 900 · stagger 72ms · letter anim 2000ms · hold 1600ms after letters |
| **Progress** | rAF: time 50% + `loaderRatio` 50%; counter capped at **96%** until letters up |
| **Weights** | `fonts` 0.45 · `heroPoster` (`flythrough-02-haveli.webp`) 0.55 |
| **Revisit** | `sessionStorage` `tcs-loader-seen` — longer min duration than first visit |
| **Exit** | `.done` arch scale(18); title stays readable until `.gone`; `.gone` adds **`visibility: hidden`** |
| **Body scroll** | `overflow: hidden` during run; restored on `off` |

### 7.3 Landing scroll (`src/components/home/`)

| Section | Behaviour |
|---------|-----------|
| **HeroStatement** | `hp = scrollY / vh`; opposing `translate3d` on two headline spans |
| **PinnedRail** | `p = (scrollY - offsetTop) / scrollSpan`; track `-p * dist`; progress bar `scaleX(p)` |
| **CounterRails** | `t = (scrollY - offsetTop + vh) * 0.45`; row0 `-t`, row1 `+t` |
| **ServiceList** | Hover CSS on cards (not scroll-linked) |
| **LandingClose** | FAQs + CTA patterns |

`body.landing-reduced-motion`: pinned/counter rails degrade to horizontal scroll rows (`home-landing.css`).

### 7.4 Studio explorer

| Item | Detail |
|------|--------|
| **Layout** | Explorer `100svh`; **`.studio-canvas` absolute**; HUD/list toggle **absolute** inside explorer |
| **Plane** | Wrap period 1920×1600; 24 tiles from `studioTiles.ts` |
| **Input** | Drag, arrow keys, Enter picks nearest tile to viewport center |
| **Detail** | `position: fixed` panel `z-index: 8` |
| **Clock** | IST in HUD bottom |

### 7.5 Reduced motion

| Source | Behaviour |
|--------|-----------|
| `prefers-reduced-motion` | Loader short path; `useReveal` instant `.in`; landing rail static scroll |
| `LandingHome` | Adds `landing-reduced-motion` on `body` when preferred |

### 7.6 Retired / not mounted

| Item | Status |
|------|--------|
| **Three.js**, `world-engine.ts`, `WorldCanvas`, `HomeJourney` | Removed from bundle |
| **`chapters.ts`** (scroll UI) | Deleted |
| **`FrameScrollScrubber.tsx`** | Source remains; **not** on any route |
| **`HeroScene.tsx`** | Not mounted |
| **Lenis, grain overlay** | Not used |
| **GSAP ScrollTrigger drone hero** | Not in `src/`; optional future: `public/videos/drone-scroll.mp4` |

---

## 8. Backgrounds & overlays

| Layer | Implementation |
|-------|----------------|
| Page | `--bg` night; landing sets `#07091A` on mount |
| Grain | Off |
| Footer | `--footer-bg` |
| Topbar | Fixed centred pill; hide on scroll down; **no** backdrop-filter |
| Loader | Full-screen `var(--night)` until unmount |

No live WebGL canvas.

---

## 9. Video & image assets

### 9.1 Estate video (`public/assets/real/`)

Flythroughs `flythrough-01-aerial.mp4` … `05-nightgala.mp4`; portfolio loops — paths in `content.ts`. Playback via **`LazyViewportVideo`** except loader poster preload.

### 9.2 Keyframes (`public/assets/world/<chapter-id>/`)

`kf_001.webp` … from analyze script; used as posters / tooling, not scroll-scrub UI today.

### 9.3 Optional scroll-scrub slots (not required for current UI)

| Path | Purpose |
|------|---------|
| `public/videos/drone-scroll.mp4` | Future GSAP scrub master |
| `public/images/drone-poster.webp` | Future scrub poster |

### 9.4 OG / favicon

`public/assets/og/og-courtyard.jpg`; SVG favicon in `index.html`.

### 9.5 Flow stills (planned)

`partner-asset-manifest.md` → `public/assets/flow/*` for ambient loops (separate from estate reals).

---

## 10. Chrome & navigation

| Element | Behaviour |
|---------|-----------|
| `TopBar` | Fixed pill `z-index: 1000`; Work · Services · Studio · Visit · Enquire |
| Mobile menu | ≤820px full-screen overlay |
| `Footer` | 4-column grid; reachable on `/studio` after explorer block |
| `WhatsAppFab` | Fixed; `waLink` from `content.ts` |
| `Page` | `title`, meta, per-route JSON-LD |

---

## 11. Page layout summary

### `/` Home (what loads)

`CinematicHome`: sticky `StoryTrack` + Three.js courtyard, then `LandingClose`. Chapters over the canvas are hero, five set cards, recent shoots, statement. Zone names are 3D labels on desktop and a chip row on a phone. Clicking a name opens that set’s real still. See **Landing page status — 24 November 2026**. The list below is the `LandingHome` fallback only (`?cinematic=0`, reduced motion, or no WebGL).

1. **`HeroStatement`** — headline parallax, featured set video card  
2. **`PinnedRail`** — five architectural sets (horizontal scroll-scrub)  
3. **`CounterRails`** — recent shoots pill rows + lightbox  
4. **`StatementBlock`** — estate line  
5. **`ServiceList`** — what we shoot  
6. **`LandingClose`** — book + FAQs + desk copy  

### `/studio`

Full-viewport **`StudioExplorer`** only (no duplicate marketing hero).

### Other routes

`WorkPage`, `ServicesHub` / `ServiceDetail`, `Visit`, `Enquire`, `NotFound` — cinematic tokens + `styles.css` layouts; **no** journey scroll.

### `/enquire`

Maps embed (`STUDIO.mapsEmbedUrl`), steps form, location block.

---

## 12. Business / location (`STUDIO` in `content.ts`)

| Field | Value |
|-------|--------|
| Address | Farm No. 3, behind FIMT College, Kapashera, New Delhi **110037** |
| Geo | `28.526851`, `77.185752` |
| Phone / WhatsApp | +91-98186-37485 · `919818637485` |
| Email | studio@thecourtyard-stories.com |

Used in footer, Enquire, FAQ, JSON-LD, `llms.txt`.

---

## 13. Enquiry form

4 steps · conditional fields · `POST /api/enquiry` · WhatsApp handoff — `EnquiryForm.tsx`.

---

## 14. Performance contract (current)

| Rule | Detail |
|------|--------|
| JS (app chunk) | ~**107 kB** gzip main (`index-*.js`) + React/vendor split |
| CSS | ~**12 kB** gzip cinematic + landing + studio |
| Motion | No scroll-linked React state on landing rails |
| Videos | Max **2** concurrent `LazyViewportVideo`; hero featured set uses hover play |
| Studio | `touch-action: none` on canvas; tile images lazy in DOM |
| Build | `npm run build` (tsc + vite + wrangler functions) |
| Avoid | Full-page video textures, Lenis, grain, autoplay grids |

---

## 15. Dependencies

**Runtime (`package.json`):** `react`, `react-dom`, `react-router-dom`, **`gsap`** (installed; **unused in `src/`** until scroll-scrub hero is added).

**Dev:** Vite, TypeScript, oxlint, Playwright.

**Offline:** `tools/analyze/` Python stack for `npm run analyze:videos`.

---

## 16. Legacy / unused (do not wire without intent)

| Item | Status |
|------|--------|
| `FrameScrollScrubber.tsx` | Not routed |
| `HeroScene.tsx` | Not routed |
| `CursorAperture.tsx` | Not mounted |
| `useTheme()` | Not in UI |
| `App.css`, `.marquee`, old `.hero` | Orphan |
| `public/frames/frame_*.webp` | Scrub fallback assets; optional |

---

## 17. Redesign / iteration checklist

1. **Colours** — `cinematic.css` + set palettes in `content.ts`.  
2. **Home** — `src/components/home/*` + `home-landing.css`; motion via `motion.ts` only.  
3. **Studio** — `studio-explorer.css` stacking (keep canvas **absolute** inside `100svh`).  
4. **Loader** — `Loader.tsx` constants + `cinematic.css` letter keyframes in sync.  
5. **Scroll-scrub hero (optional)** — add component + `drone-scroll.css`; wire GSAP; place video at `public/videos/drone-scroll.mp4`; init after `loaderDone`.  
6. **Location** — single source `STUDIO` in `content.ts`.  
7. **Manifest** — `npm run analyze:videos` when footage changes.  
8. **Motion bugs** — if rails look “stuck off-screen”, verify `useMotionVisible` → `markMotionDirty`.  
9. **Update this file** when routes, tokens, landing sections, or `STUDIO` fields change.

---

## 18. AI prompt snippet (current stack)

> React 19 + Vite estate site, **dark-first** (`cinematic.css`). Fonts: Syne + Instrument Sans. **Home:** Loader arch → **`LandingHome`** (hero parallax, pinned five-set rail, counter portfolio rails, services, FAQs) on `#07091A`. **Studio:** drag tile explorer, list view, absolute full-viewport canvas. **Motion:** `motion.ts` single rAF; GSAP **not** in use yet. **No** Three.js. Content: `content.ts`; Kapashera 110037. Centred nav pill, lazy videos, no grain. Preserve routes + enquiry API + WhatsApp FAB.

---

## 19. Related docs

| Doc | Path |
|-----|------|
| Phase A report | `tools/analyze/REPORT.md` |
| Scene manifest | `src/world/scene-manifest.json` |
| Landing/studio preview | `public/courtyard-landing-studio-preview.html` |
| Theme preview | `public/courtyard-theme-preview.html` |
| UI rule | `.cursor/rules/courtyard-ui.mdc` |
| Partner video spec | `partner-asset-manifest.md` |

---

*Update this file when tokens, landing architecture, studio layout, loader, motion, dependencies, or `STUDIO` location fields change.*