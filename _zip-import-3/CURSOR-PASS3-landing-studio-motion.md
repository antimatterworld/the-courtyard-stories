# Cursor pass 3: motion reset, VS/Goods-style landing, ReframeHK-style studio

## Agent operating mode (read first)

You are **Composer 2.5** working as a senior creative front-end engineer and performance engineer on this repo. **Use every capability and skill available to you in this Cursor workspace for UI development and optimisation. Do not limit yourself to editing files.** Specifically:

- **Plan before you code.** Write a short plan (files to touch, risks, order), then execute. Re-plan if a measurement contradicts the plan.
- **Use your tools, not guesses.** Run the terminal (`npm run build`, `tsc --noEmit`, lint), start the dev server, and use any browser, screenshot or DevTools tooling you have to look at `localhost:5173` at **1440, 1024, 768 and 390 px** widths. If a tool you need is missing (for example Lighthouse or a bundle visualizer), install it as a dev dependency or tell me; never skip verification silently.
- **Follow existing skills and rules.** Read and obey anything in `.cursor/rules`, any skills or docs folders in the workspace, `FRONTEND-UI-INVENTORY.md`, and any connected MCP tools that help (design, docs, browser). If you support sub-tasks or parallel work, split independent jobs (navbar, theme, performance) and merge carefully.
- **UI development skills to apply:** design tokens and a consistent system, responsive layout, typography and spacing rhythm, accessibility (focus, contrast, reduced motion, 44px targets), motion design that only animates `transform` and `opacity`, and Three.js/WebGL craft (instancing, lighting, materials, disposal).
- **Optimisation skills to apply:** profile first (Chrome Performance panel, React Profiler, `renderer.info` and a frame-time counter for Three.js, Lighthouse, a bundle visualizer such as `rollup-plugin-visualizer`), fix the biggest measured cost first, then re-measure. Report before/after numbers for every optimisation.
- **Make it persistent.** Create `.cursor/rules/courtyard-ui.mdc` summarising the design tokens, the navbar spec, and the performance contract (no `backdrop-filter` over the canvas, no per-frame React state, videos play only in view, DPR caps), so future edits keep the rules.
- **Verify before claiming done.** For each task give evidence: a screenshot per breakpoint, build output, and performance numbers. If something is unverified, say so.
- **Ask when blocked.** If a requirement conflicts with performance or with an existing file, stop and ask me instead of guessing.

Read `FRONTEND-UI-INVENTORY.md` first. The arch loader stays exactly as it is. Everything else about motion changes. Work in the phases in section 6, run `npm run build` after each, and show me screenshots and performance numbers before moving on.

Visual and motion reference for this pass: **`courtyard-landing-studio-preview.html`** (open it, use the Home / Studio links in its nav). Port its mechanics, not its placeholder gradients.

---

## 1. Decisions (and why)

I do not like the current animations and the site lags. So:

1. **Retire the 3D scene and the scroll-scrubbed hero from the runtime.** Remove `WorldCanvas`, `world-engine.ts`, `HomeJourney`, `FrameScrollScrubber`, `world-quality.ts`, `world-progress.tsx` (keep only what the loader needs for progress), the `three` dependency from the app bundle (about 742 kB chunk), and the 96-frame `/public/frames` requirement. The landing page is built from real photos and video loops of the estate, not a procedural 3D scene. Keep `scene-manifest.json` and `tools/analyze` in the repo; they are harmless.
2. **Keep** the Loader, the tokens in `cinematic.css` (night `#0A0F1F` base, marigold, plaster), Syne + Instrument Sans, the 56px nav pill, all routes, the enquiry form and the WhatsApp button.
3. **Fix `package.json`:** `"gsap": "^0.187.0"` is wrong (GSAP versions are 3.x; `0.187` is Three.js's number). GSAP is not needed for this pass, so **remove it**. Use plain JS + CSS only.
4. **Landing page = VS/Goods style. Studio page = ReframeHK style.** Details below.

## 2. What I saw on the reference sites

I read the text and structure of both pages (I could not watch their animations), so treat the motion behaviour as a brief, not a spec. **If you can open them in a browser, watch how they move first.** Do not copy their code, assets, copy text or branding. Recreate the interaction patterns with our own content.

**vs-goods.store (landing reference):** pure black page; a video loader; a huge one-statement hero with a single "Shop now" button and a featured product card; a "Ready to Glow" section made of rows of product cards that move horizontally (the markup repeats the card list twice, which is a looping rail); a "Just landed" pair; an awards strip; a big statement ("Chosen by those who set the standard"); a library list where each category has its own tagline; a free-items carousel; a community block; a "Meet the family" names list over a video; a closing pricing block. Big type, few colours, lots of motion that is horizontal.

**reframehk.com (studio reference):** near-black (`#0f0f0e`); a minimal top bar (logo, Services, Work, a 01/03 counter, Contact); the main view is a **draggable field of project tiles** with a hint "Drag · arrows · ↵ open"; a live Hong Kong clock and **X / Y coordinate readout** in a corner; a Sound toggle; tiles open into a detail view with "Close ×".

## 3. The no-lag contract (applies to everything in this pass)

- Animate **only `transform` and `opacity`**. No `filter`, `backdrop-filter`, `box-shadow` animation, `mix-blend-mode`, or animated `width/height/top/left`.
- **One shared `requestAnimationFrame` scheduler** for all scroll-linked motion. Scroll listeners are `{ passive: true }` and only set a dirty flag. The rAF callback writes `style.transform` directly on refs.
- **No React state or context updates per scroll or drag frame.** Motion lives outside React render. React state may change only on discrete events (route, opening a tile, active card index when it changes).
- **Map scroll to transform directly.** No smooth-scroll library, no lerp lag on scroll-linked rails; it must feel locked to the finger or wheel.
- **Measure on resize, not on scroll.** Cache section offsets and track widths (`ResizeObserver` + debounced resize). Never read layout (`offsetTop`, `getBoundingClientRect`) inside the scroll frame. On mobile, ignore height-only resizes from the address bar.
- `will-change: transform` only on the few moving tracks, not on cards. Use `contain: layout paint` and `content-visibility: auto` on below-the-fold sections.
- **Media:** rails and tiles show **WebP stills** (the portfolio `.webp` posters already exist). Video plays only for the hovered or active item, never more than **2** at once, `preload="none"`, via the existing `LazyViewportVideo`. No autoplaying video walls.
- Pause the rAF writes for a section when it is off screen (IntersectionObserver).
- `prefers-reduced-motion`: no pinning, no rail movement; the horizontal section becomes a normal horizontally scrollable row; the studio canvas still works by drag/keys but without inertia.
- **Test with Chrome DevTools CPU throttle 4× and 6×.** Targets: no long tasks over 50 ms from our code during scroll or drag, scroll-frame script time under 4 ms on a normal laptop, steady 60 fps. Report the numbers.

## 4. Landing page (`/`) like VS/Goods, with horizontal movement

Build in `src/components/home/` as small components (`HeroStatement`, `PinnedRail`, `CounterRails`, `ServiceList`, ...), reusing content from `content.ts`. Page order:

1. **Hero statement.** Huge Syne headline "Stories live in places." in two lines. As you scroll the hero away, line 1 moves **left** and line 2 moves **right** (opposite horizontal directions). One primary button ("Plan a shoot") and one link ("Explore the studio" → `/studio`). Right or below: a **featured set card** (a still, with a small label like "Set of the month") that plays its loop on hover only.
2. **Pinned horizontal section, "Five worlds".** A sticky 100svh stage. As the user scrolls **down**, a track of five large set cards moves **right to left**. Section height = track overflow + one viewport height. A thin progress bar and a counter (01 / 05). Card content: set still, set name, one line, link to the set. Use the real five sets from `ARCHITECTURAL_SETS`.
3. **Counter-moving rails, "Recent shoots".** Two rows of portfolio stills moving in **opposite horizontal directions** driven by the same scroll value (see the preview). Hover on a card plays its loop (max 2 at once); click opens the existing lightbox.
4. **Statement block** in huge type (our own line, for example about the estate and the five worlds). No stat cards.
5. **Services list** like the VS/Goods category list: Fashion, Commercial, Studio, Events as very large rows; hovering or focusing a row reveals that service's tagline on the right (opacity + small translate only). Each row links to its service page.
6. **Proof strip, crew list, packages.** Only if I give you real material: client or press logos, crew and partner names, and prices or packages. **Ask me; never invent logos, awards, names or prices.** If missing, leave the section out.
7. **Closing CTA** ("Book the courtyard.") + the existing enquiry teaser and FAQ, restyled to the same big-type language, then the footer.

Keep the black-indigo background; chapter identity comes from each card's accent colour only. Remove the page-wide glow and the chapter colour tweening.

## 5. Studio page (`/studio`) like ReframeHK

Replace the current stacked layout with an **explorer**:

- A full-viewport **infinite draggable canvas** of tiles. Implement as **one `plane` element moved with `translate3d`**, built from a repeating grid (copy the approach in the preview: a seamless period, the plane is offset by `x mod W`, `y mod H`, and copies are generated from viewport size). Drag with Pointer Events on `window` (not pointer capture, so clicks still reach tiles), inertia with friction (about 0.94 per frame) that runs **only while moving**, `touch-action: none`.
- **Tiles** (real content): the five sets, four services, the Kapashera location and map link, the visit and enquire actions, portfolio reels, amenities, the "light by hour" timeline, studio stats. Each tile shows a still and a title; clicking or pressing **Enter** opens a **detail panel** (bottom-right on desktop, bottom sheet on mobile) with the full content from the old Studio page, a link out where relevant, and "Close ×" (also **Esc**).
- **HUD:** centre hint "Drag · arrow keys · Enter to open"; bottom-left **live Delhi clock** (`Intl.DateTimeFormat` with `Asia/Kolkata`, updated once a second) and an **X / Y position readout** (updated only while moving).
- **Keyboard and accessibility:** arrow keys pan; Enter opens the tile nearest the centre (or the focused tile); Esc closes; focus moves into the panel and returns to the tile after. **Only one copy of each tile is focusable and exposed to assistive tech; the repeated copies are `aria-hidden` and `tabindex="-1"`.** Also provide a **"List view"** toggle (or a visually hidden real list) with all studio content as normal text, so screen readers, SEO and users who cannot drag get everything. Keep the existing JSON-LD and the `Page` title/meta.
- **Performance:** at most about 100 tile DOM nodes; images `loading="lazy"`, `decoding="async"`, small WebP sizes; no per-tile animation or hover transforms beyond opacity; the canvas does not touch React state while dragging.
- Keep the nav pill on top. No 3D on this page.

## 6. Phases

1. **Cleanup + baseline.** Remove the retired 3D/hero code and the `gsap` entry, confirm the loader still hands off to the landing page, then record a baseline Performance trace for `/` at 4× throttle.
2. **Motion engine.** Create `src/lib/motion.ts`: the shared rAF scheduler, a `useScrollMotion` hook that registers refs and writes transforms outside React, cached measurements, IntersectionObserver gating, reduced-motion handling.
3. **Landing page** sections 1 to 7 above. Verify at 1440, 1024, 768 and 390 px.
4. **Studio explorer.** Build the plane, drag, inertia, keyboard, detail panel, list view, HUD.
5. **Polish and measure.** Run Lighthouse and the throttled traces, fix the worst offenders, update `FRONTEND-UI-INVENTORY.md` (motion section) and `.cursor/rules/courtyard-ui.mdc` with the new no-lag contract.

## 7. Acceptance criteria

- Scrolling `/` is smooth with no visible stutter at 4× CPU throttle. The hero lines, the pinned "Five worlds" track and the two rails all move **horizontally in response to vertical scroll**.
- `/studio` can be dragged in any direction forever without gaps, opens a detail panel on click or Enter, shows the Delhi clock and X/Y readout, and has a usable list view.
- No WebGL, no `three` in the bundle, no `backdrop-filter` or `filter` on moving content, no per-frame React updates.
- All routes, the enquiry form, the WhatsApp button and SEO tags still work; `npm run build` passes.
- You report before and after numbers (bundle size, long tasks, frame times) and screenshots at four widths.
