# Cursor fix pass: navbar, theme, lag

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


Read `FRONTEND-UI-INVENTORY.md` first. The loader is approved and stays as it is. Three things must change: the navbar, the main theme, and the lag. Work in this order, run `npm run build` after each, and show me before/after screenshots.

Visual reference for the navbar and theme: `courtyard-theme-preview.html` (open it, switch options A, B, C at the bottom). Copy its structure and tokens.

---

## 1. Navbar (rebuild `TopBar` in `Chrome.tsx` + nav rules in `cinematic.css`)

### What is wrong now (from my screenshot)
- The logo "The Courtyard Stories" wraps onto 3 lines and the tagline "Photo · Video · Delhi" spills out, so the pill is taller than it should be and shaped wrongly.
- "The Studio" wraps onto 2 lines.
- "Enquire" appears twice (as a link and as the CTA button).
- The pill is off-centre and overlaps the hero headline.

### Spec
- One row, fixed `height: 56px`, `white-space: nowrap`, `border-radius: 999px`, centred: `left:50%; transform:translateX(-50%); top:14px; width:min(1080px, calc(100% - 28px))`.
- Left: small arch mark (SVG, 20×26, marigold stroke) + **"Courtyard Stories"** in Syne 800, 16px, one line. Drop the tagline and the word "The".
- Centre/right links: Work, Services, Studio, Visit. Label it **"Studio"**, not "The Studio". Remove "Enquire" from the link list.
- Right: one marigold "Enquire" pill button (`#FF9F1C` bg, `#0A0F1F` text, 44px min height).
- Background: a **solid** colour (`#0F1530`) with a 1px `#ffffff1a` border. **Remove `backdrop-filter` completely** from the topbar and drawer. Blur over a live WebGL canvas forces the browser to re-blur every frame and is a major cause of lag.
- At 820px and below: hide links, show a "Menu" button that opens the existing full-screen overlay. Keep 44px touch targets.
- Behaviour: hide on scroll down, show on scroll up, using `transform` only. Remove the `is-hero-transparent` logic that reads `progress` (it forces re-renders; see section 3).
- Hero content must clear the nav: `padding-top: 120px`.
- Remove the separate desktop "Menu" pill (`.menu-pill`) so there is one navigation system.

---

## 2. Theme (fix `cinematic.css`, `chapters.ts`, `scene-manifest.json` usage)

### What is wrong now
- Chapter backgrounds and fog use colours sampled from the footage (`#201712`, `#2b1f20`, `#37261e`, ...), which are muddy browns. That is why the site reads brown and maroon instead of the loader's night indigo and glowing marigold.
- The hero headline is too big (three lines at about 8rem), left-heavy, and collides with the nav.
- The 3D scene is crude: flat brown cylinders and square dust particles on a dark floor.

### Changes
1. **Stop using manifest `light.fog` / `light.accent` for the page background.** Keep the page `--bg` as the loader's night indigo `#0A0F1F` in every chapter. Use sampled footage colours **only** for 3D lighting and for a soft chapter glow, not for the page colour.
2. **Chapter identity = accent + glow**, not background. Per chapter set only `--accent` and `--glow` (Haveli `#E0A44A`, Colonnade `#E2704F`, Chefchaouen `#4E86E8`, Rustic `#B8975F`, Night Gala `#E8B84B`). The glow is a static radial gradient behind the arch/hero, never a CSS filter.
3. **Make theme options switchable by token set** (so I can pick): `data-theme="night" | "cobalt" | "marigold"` using the exact variables in `courtyard-theme-preview.html`. Default to the one I tell you after I review the preview. Delete the unused light/dark leftovers.
4. **Headline:** `font: 800 clamp(2.5rem, 7.2vw, 6.2rem)/0.98 Syne`, `letter-spacing:-0.04em`, `text-wrap: balance`, max about 2 lines. Remove the heavy `text-shadow` (it is expensive on huge text over a canvas); instead give the copy block a soft dark gradient behind it.
5. **Hero layout:** text bottom-left, arch/world to the right, as in the preview. Remove the "Scroll through the estate" letter-spaced line or make it a small normal-case hint.
6. **3D scene quality:** replace the plain cylinders with proper arches (cusped extrusions with a light-catching bevel), thicker colonnade with a visible base and capital, jali screens via an alpha-tested texture, emissive lanterns with a small bloom sprite, and round soft dust sprites (not squares). Light the scene with the loader's marigold-to-pink glow so the hand-off from the loader looks continuous.

---

## 3. Lag: measure first, then fix

I cannot see the code, so the causes below are the likely ones from the inventory. **Confirm each with the Chrome Performance panel and a frame-time counter before changing it**, and report numbers before/after (target: steady 60 fps on a mid-range laptop, no long tasks over 50 ms during scroll).

Check and fix, in this order:

1. **React re-rendering every scroll frame.** The inventory says scroll calls `setProgress(0–1)` into a context. Any component reading that context re-renders every frame. Fix: keep progress in a **mutable ref / external store** (e.g. a plain object plus a subscribe function, or `useSyncExternalStore` with a throttled selector for chapter id only). The WebGL loop reads the ref directly. React state changes only when the **chapter id** changes.
2. **`backdrop-filter` and `filter: blur()`** anywhere over or near the canvas (topbar, drawer, content sheets, FAB). Remove them; use solid or `color-mix` backgrounds.
3. **Autoplaying videos.** The home page has 5 bento videos plus 8 portfolio loops, all `autoplay loop`. Playing all at once is very likely the biggest lag source on the content sheet. Fix: `preload="none"` with a poster image; play a video only while it is in the viewport (IntersectionObserver), pause when it leaves; on hover-capable devices play on hover only; cap to 2 playing at once; never play videos while the WebGL canvas is also rendering a heavy frame.
4. **WebGL cost.** Cap DPR to 1.5 desktop / 1.0 mobile (not 1.75 / 1.25). Stop rendering entirely when the canvas is covered by the content sheet (below the journey), not just "ambient". Lower dust count, use `Points` with a small texture, use `InstancedMesh` for everything repeated, no real-time shadows, no per-frame material changes, no post-processing passes unless frame time stays under 12 ms.
5. **Too much running at once.** Do not run the loader's rAF, the 3D loop and the scroll listener together after the loader exits; dispose of the loader's rAF and listeners. Use a single shared rAF loop. Make scroll listeners `passive: true`.
6. **Expensive CSS.** Search `styles.css` and `cinematic.css` for `transition: all`, large `box-shadow` and `text-shadow` on big elements, `mix-blend-mode`, `will-change` on many elements, and animated `width/height/top/left`. Animate only `transform` and `opacity`.
7. **Bundle and first paint.** The Three.js chunk is about 742 kB; import only what is used (`three/src/...` or named imports), lazy-load the world after first paint, and decode large WebP frames/keyframes off the main thread (`img.decode()`).
8. **Add a quality switch.** On devices that cannot hold 50 fps for 2 seconds, automatically drop to the `FrameScrollScrubber` fallback or a static poster of the arch.

---

## 4. Acceptance criteria

- Navbar: always one row at 1280, 1024 and 768 widths; no text wraps; one Enquire button; no overlap with the headline.
- Theme: the page background stays the loader's night indigo (or the option I choose); no muddy brown/maroon backgrounds.
- Scrolling the home page is smooth (no visible stutter), and the Performance panel shows no long tasks over 50 ms from our code.
- All routes, the enquiry form and the WhatsApp button still work; `npm run build` passes.
- Update `FRONTEND-UI-INVENTORY.md` with what changed.
