# Cursor master prompt: The Courtyard Stories, cinematic 3D redesign

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


Paste this whole file into Cursor (Agent mode). Work in phases. After each phase, stop, summarise what changed, run `npm run build`, and wait for my "go" before the next phase.

---

## 0. Context

- Project: **The Courtyard Stories**, a film and photo studio in Delhi with five architectural sets (Royal Haveli, Mughal Colonnade, Chefchaouen blue suite, Rustic village / thatched tower, Night gala).
- Read `FRONTEND-UI-INVENTORY.md` in the repo first. It maps every file. Stack: Vite 8, React 19, React Router 7, TypeScript, one CSS file `src/styles.css`, Three.js `^0.187` loaded by dynamic import. Keep all routes, the enquiry form, the `/api/enquiry` flow, SEO/JSON-LD in `Page`, and the WhatsApp CTA working.
- Audience: **business leads and brand producers** judging the studio in under 30 seconds. The site must feel like a film title sequence, not a template.
- Source footage on this machine: `C:\Users\shyam\Downloads\Business Profile` (Windows, path contains a space, so quote every path). **Never modify, move or delete the originals.** Write derived output only inside the repo.

### Why the current theme must go
The current look (cream paper, brass accent, Fraunces serif, monospace all-caps labels, film grain, 2px radius) is the most common "AI-generated studio site" look. Replace it entirely. Delete `GrainOverlay`, the mono eyebrow/slate labels, and the "Studio daylight" light theme. The new site is **dark-first and colour-graded per chapter**.

---

## 1. Inspiration (Awwwards, study before coding if you can browse)

I reviewed the Awwwards Film & TV and WebGL collections. These are the patterns to borrow, not copy:

| Reference (Awwwards) | Borrow |
|---|---|
| Revelatio Studio (SOTD Aug 2026) | Preloader that flows straight into the hero; big-number scroll section; modal work viewer |
| Hero Studios (Honorable Mention Jun 2026) | Transition-driven intro animation; scroll-driven work list |
| PSP Production (SOTD Nov 18 2026), Preymaker (SOTD Nov 14 2026), IL CAPO PRODUCTION (SOTD Jun 2026) | How film/production sites pair full-bleed footage with very large, quiet type |
| The Tuscan Journey Begins by Monogrid (WebGL SOTD Sep 2026) | A place rendered in real-time 3D, with the camera as the storyteller |
| Iventions (3D spotlight storytelling, per its developer write-up) | Spaces and events presented through light, not boxes |

Trend notes that apply: dark mode as a designed "mood" palette rather than an inverted light theme; soft cinematic glow gradients rather than rainbow gradients; bold oversized type; scroll-based narrative where visuals lead and copy supports.

Awwwards does not publish per-site hex palettes, so the palette below is **my synthesis**, grounded in the studio's own sets.

---

## 2. PHASE A: Analyse the videos and build `scene-manifest.json`

Create `tools/analyze/` (Python 3.11 venv) and an npm script `npm run analyze:videos`. Check for `ffmpeg`/`ffprobe` (install with `winget install Gyan.FFmpeg` if missing).

1. **Inventory.** Recursively list every video in `C:\Users\shyam\Downloads\Business Profile`. For each: ffprobe duration, resolution, fps, codec, has-audio. Group by folder name, and infer which of the five sets each folder or file belongs to (use file names such as haveli, colonnade, mediterranean, thatched, nightgala, plus visual confirmation in step 3).
2. **Shots.** Use PySceneDetect to split into shots. Extract keyframes (first, middle, last of each shot, plus one every 2 s) as 1600px WebP into `tools/analyze/out/<video>/keyframes/`.
3. **Understand each set visually.** Look at the keyframes yourself (you can view images) and write per set: architectural vocabulary (arch type, column style, jali/lattice pattern, domes, thatch, lanterns, steps, water, floor material), materials, repeated modules and their approximate real-world proportions, and where the light comes from. Be concrete, e.g. "cusped Mughal arches, spacing about 3.2 m, sandstone with terracotta lattice".
4. **Colour and light.** For each set, k-means in Lab space on keyframes: 6 dominant colours, plus shadow, midtone and highlight colour, an estimated colour temperature (K), contrast and a bloom/glow estimate. Export as hex.
5. **Camera motion.** From optical flow (OpenCV Farneback) classify each shot as dolly-in, pan, orbit, crane/drone-rise or static, with speed and approximate FOV. Reconstruct a rough camera path as a list of keyframes: `{t, position[3], lookAt[3], fov}` in a normalised local space.
6. **Depth.** Run a monocular depth model (Depth Anything V2 via `transformers`) on the best 3 to 5 keyframes per set. Save 16-bit depth PNGs next to the keyframes. These feed the 2.5D layers in Phase D.
7. **Optional reconstruction (try, but do not depend on it).** If a flythrough has enough parallax, attempt COLMAP or Nerfstudio (splatfacto) to produce a Gaussian-splat `.ply`/`.splat`. Many of these clips may be AI-generated and not multi-view consistent, so reconstruction can fail. If it fails, report it and continue with the procedural plan. Do not spend more than one attempt per set.
8. **Output** `src/world/scene-manifest.json`:

```json
{
  "sets": [{
    "id": "royal-haveli",
    "sourceVideos": ["flythrough-02-haveli.mp4"],
    "palette": { "dominant": ["#..."], "shadow": "#...", "mid": "#...", "highlight": "#...", "kelvin": 3200 },
    "architecture": { "arch": "cusped", "column": "...", "pattern": "...", "materials": ["..."], "moduleSizeM": 3.2 },
    "light": { "dir": [0.4, 0.8, 0.2], "intensity": 1.1, "fog": "#...", "fogDensity": 0.02 },
    "cameraPath": [{ "t": 0, "pos": [0,1.6,12], "look": [0,1.8,0], "fov": 42 }],
    "keyframes": ["/assets/world/haveli/kf_001.webp"],
    "depth": ["/assets/world/haveli/kf_001_depth.png"]
  }]
}
```

Also write `tools/analyze/REPORT.md` with the findings, so I can review them before Phase D. **Stop and show me the report.**

---

## 3. PHASE B: New design system (replace tokens in `src/styles.css`)

Dark-first. The page background **re-grades per chapter** as the user scrolls (animate CSS custom properties `--bg`, `--accent`, `--glow`).

### Base tokens
```css
:root{
  --night:#0A0F1F;      /* night courtyard, base */
  --plaster:#F3EBDD;    /* lime-wash text and light surfaces */
  --marigold:#FF9F1C;   /* primary accent, CTA */
  --bougain:#D6336C;    /* secondary pop, hover glow */
  --cobalt:#2F5BD0;     /* links, focus, Chefchaouen link */
  --sand:#C9A37A;       /* muted secondary text */
  --bg:var(--night); --ink:var(--plaster); --accent:var(--marigold); --glow:var(--bougain);
  --radius:20px; --radius-pill:999px;
  --font-display:'Syne',system-ui,sans-serif;          /* 700-800, tracking -0.04em */
  --font-body:'Instrument Sans',system-ui,sans-serif;  /* 400-500 */
  --font-deva:'Tiro Devanagari Hindi',serif;           /* small bilingual accents only */
}
```

### Chapter grading (set `data-chapter` on `<html>`; tween with GSAP)
| Chapter | `--bg` | `--accent` |
|---|---|---|
| Prologue / Courtyard | `#0A0F1F` | `#FF9F1C` |
| Royal Haveli | `#1C1308` | `#E0A44A` |
| Mughal Colonnade | `#1F0F0B` | `#E2704F` |
| Chefchaouen Suite | `#07142E` | `#4E86E8` |
| Rustic Village | `#14110A` | `#B8975F` |
| Night Gala | `#120C1A` | `#E8B84B` |

After Phase A, replace these with colours actually sampled from the videos if they differ. Update `ARCHITECTURAL_SETS[].palette` in `content.ts`, `MOTIF_TINT` in `StudioImage.tsx`, and the hard-coded `#f7ca7d` / `#0d0b09` values listed in section 3.3 of the inventory.

### Typography rules
- Swap the Google Fonts link in `index.html` to Syne (700, 800), Instrument Sans (400, 500) and Tiro Devanagari Hindi.
- Display type is huge: `clamp(3.5rem, 12vw, 11rem)`, line-height 0.95, sentence case. Body 1rem / 1.6, max 62ch.
- **Do not** use all-caps eyebrow labels, monospace data labels, `→` suffixes, or numbered markers unless the content is truly a sequence (the five chapters are not numbered 01 to 05 in the UI).
- Buttons: pill, 48px min height, marigold fill with night text; hover = glow in `--glow`, never a drop shadow.
- Navigation: a minimal fixed pill (logo mark left, "Menu" right) that opens a full-screen overlay with giant links. Keep the 44px touch targets.
- Add a custom cursor (desktop only, `pointer: fine`) that becomes a small "aperture" ring over video and links. Magnetic effect on primary CTAs.
- Spend boldness in **one** place: the 3D walkthrough. Everything else stays quiet and disciplined.

---

## 4. PHASE C: Loading screen (port the reference)

I have a working reference: **`courtyard-loader.html`** (provided alongside this file; open it in a browser). Port it to a React component `src/components/Loader.tsx`:

- **Concept:** an arched doorway outlines itself, fills bottom-to-top with marigold-to-bougainvillea light as loading progresses, while "The Courtyard / Stories" rises letter by letter from a masked line (blend mode `difference` over the arch). A counter sits bottom right, and "द कोर्टयार्ड स्टोरीज़" sits bottom left in `--font-deva`.
- **Exit = the first scene of the site:** at 100% the arch scales up as a portal (about 1.3 s, `cubic-bezier(.75,0,.2,1)`), the loader fades, and the 3D camera begins **inside that same arch** looking into the courtyard, so loader and world feel like one continuous shot.
- **Real progress, not fake:** drive the counter from `THREE.LoadingManager` plus preload of the hero video poster, the manifest, fonts (`document.fonts.ready`) and the first chapter's textures. Minimum display 2.2 s so the animation always finishes; maximum 8 s, then continue anyway.
- **Once per session** (`sessionStorage`; this is fine inside the real app). On repeat visits show a 600 ms version.
- Lock scroll while the loader is up. Respect `prefers-reduced-motion` (simple fade, no scale). Set `aria-live="polite"` status text. Replace the old `FrameScrollScrubber` preloading and mount `Loader` in the root layout (`main.tsx`).

---

## 5. PHASE D: The 3D world and the scroll walkthrough

### Architecture
- One persistent full-viewport canvas in the root layout (`src/world/WorldCanvas.tsx`), **mounted once and surviving route changes**. DOM content scrolls above it. Keep vanilla Three.js with dynamic import (or react-three-fiber if you can justify it), and split into `world/` modules: `scene.ts`, `chapters/*.ts`, `camera-rig.ts`, `post.ts`, `video-surfaces.ts`.
- One master `progress` (0 to 1) from the scroll position. Use **Lenis** for smooth scrolling and **GSAP ScrollTrigger** for chapter boundaries. Camera follows a `CatmullRomCurve3` assembled from the manifest `cameraPath`s, easing between chapters; `lookAt` follows a second curve; FOV changes per chapter. Total scroll height about 900vh on desktop, 600vh on mobile.

### Building the world so it looks like the videos
Use a **hybrid** approach, in this priority order:
1. **Procedural architecture kit** per set, built from the Phase A report: arches (extruded cusped/pointed shapes), colonnades (instanced columns), jali lattice screens (alpha-tested or SDF patterns), the haveli staircase and jharokhas, Chefchaouen cobalt walls with stairs and pots, the thatched tower (cone with instanced thatch strands), hanging brass lanterns (instanced, emissive). Use palette, module sizes and materials from `scene-manifest.json`. Use `InstancedMesh` everywhere repeated.
2. **2.5D depth layers** from the keyframes + depth maps: displaced planes or a mesh per layer, for far backgrounds and anything too complex to model. This is how the world matches the footage quickly.
3. **Video surfaces**: the studio's own clips as `VideoTexture`s on in-world surfaces (a courtyard wall screen, a "projector" beam on the plaster wall) so the leads see real work inside the world. Muted, `playsinline`, paused when offscreen.
4. **Splats (only if Phase A reconstruction succeeded):** load with a maintained Three.js splat renderer (verify current options such as Spark or @mkkellogg/gaussian-splats-3d before choosing).

Lighting and mood: warm key + coloured rim per chapter from the manifest, exponential fog, baked-looking ambient (no heavy realtime shadows; one shadow-casting light at most), emissive lanterns and glints. Dust motes (points) drifting in light shafts. Post-processing via the `postprocessing` library: bloom (selective on lanterns), soft vignette, subtle chromatic aberration at the edges, and a per-chapter colour grade LUT or uniform tint. Keep film grain **off** (we removed it), or at most 2%.

### Scroll story (adjust the ranges after Phase A)
| Scroll | Chapter | Camera | DOM overlay |
|---|---|---|---|
| 0 to 8% | Prologue | Starts inside the arch from the loader, slow dolly into the empty courtyard | Giant headline "Stories live in places." plus one CTA |
| 8 to 26% | Royal Haveli | Crane up the staircase, slight orbit | Chapter title, one line, link to the set |
| 26 to 42% | Mughal Colonnade | Lateral dolly along columns, jali light patterns sweeping | Title + 2 stats |
| 42 to 58% | Chefchaouen Suite | Descend the cobalt steps; background re-grades to blue | Title |
| 58 to 72% | Rustic Village | Pull back and orbit the thatched tower | Title |
| 72 to 86% | Night Gala | Lanterns ignite, camera rises above the banquet | Title + "see the work" |
| 86 to 100% | Epilogue | Camera pulls out through the arch to a lit courtyard | Stats, reel strip, enquiry CTA, footer |

Titles reveal with a masked line-by-line rise (same language as the loader). Everything else uses the **scrubbed** progress, not time-based fade-ins on every block. Keep the work gallery, services, FAQ and enquire sections but restyle them to the new tokens and let them sit over a dimmed, slowly drifting canvas. Inner routes (`/work`, `/services`, `/studio`, `/visit`, `/enquire`) keep the canvas, reduced to a calm ambient camera, and use a **dolly-through-the-arch** page transition (about 900 ms).

### Performance and fallbacks (non-negotiable)
- `canRun3D()` gate. Low-end, `prefers-reduced-motion`, Save-Data or WebGL failure: fall back to the existing `FrameScrollScrubber` or a poster-based 2.5D version, with the same copy and tokens.
- DPR clamp 2 desktop / 1.5 mobile; adaptive quality (drop post-FX, then DPR) if frame time exceeds about 20 ms.
- Assets: glTF with Draco or Meshopt, KTX2 textures, WebM and MP4 for video, total first-load JS for the world under about 350 kB gzip (lazy chunk), and the first chapter ready before the loader exits; load later chapters in the background.
- Pause rendering when the tab is hidden or the canvas is not visible. Dispose geometries, materials and textures on teardown.
- Accessibility: all copy stays real DOM text; skip link works; focus states use `--cobalt`; the full site is usable without 3D; reduced motion disables camera drift and parallax.

---

## 6. Acceptance criteria

- Loader and world feel like a single shot (the arch hand-off).
- Scrolling top to bottom gives a continuous guided walkthrough through all five sets with chapter colour grading.
- Visual match: side by side with the source videos, each set is recognisable by architecture, colour and light.
- Lighthouse performance 80 or better on mid-range mobile (with the lighter tier), no layout shift from the loader, 60 fps on a typical laptop.
- `npm run build` passes, no TypeScript errors, forms and routes unchanged.

## 7. Working rules for you, Cursor

- Make the **smallest set of files** that gets each phase done; update `FRONTEND-UI-INVENTORY.md` at the end of each phase.
- Do not commit the raw videos. Put compressed derivatives in `public/assets/world/`.
- Ask me before installing anything heavy (COLMAP, GPU models) or if a Phase A finding contradicts this plan.
- Treat the footage as the client's copyrighted material: no uploads to third-party services without asking me.
