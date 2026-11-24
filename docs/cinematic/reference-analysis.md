# Reference analysis

Source: `docs/cinematic/reference-capture/` captured 2026-11-22 from https://the-courtyard-studio.vercel.app/. Every figure below is OBSERVED unless marked PROPOSED.

`SUMMARY.md` mode is **three** on desktop and mobile. A perspective camera was recorded (121 samples each way).

## Scroll

| Profile | scrollHeight | viewport | lengths | scroll |
|---------|--------------|----------|---------|--------|
| desktop | 11523 px | 1440×900 | 12.80 vh | native. Lenis false. GSAP/ScrollTrigger globals false |
| mobile | 13587 px | from detect.json | 16.10 vh | native |

Desktop FOV stays **32°**. Mobile FOV stays **50°**. Near 0.5, far 700. Tone mapping 7, exposure 1 at start and end. Background and linear fog stay `#e8d8c3`, fog near 70, far 330.

## Camera (desktop `camera-down.json`)

| p | pos | fwd (start) |
|---|-----|-------------|
| 0 | `[0, 2.30, 54.25]` | `[0, 0.088, -0.996]` |
| 1 | `[-61.07, 28.55, 58.73]` | recorded per sample |

The path is not a straight dolly. It travels left and rises. Mobile start `[0, 2.60, 69.25]`, end `[-21.57, 13.25, 28.66]`. Do not scale the desktop path for phones.

Speed median on desktop is about 65 world-units per progress unit. A long slow band sits around progress 0.42–0.48. That is one observed hold cluster, not five separate chapters. Finer holds need a second pass on `camera-keyframes.json` (39 desktop, 20 mobile).

`camera-up.json` was not aligned by progress in this pass, so hysteresis is not claimed. Pointer parallax from center to the next sample is ~0. Camera does not follow the pointer.

## World

`scene-dump.json` (desktop): 655 meshes, 40 instanced meshes, 5532 instances, 169197 triangles in the scene bounds. Materials are almost all `MeshStandardMaterial`. Lights: hemisphere intensity 1, directional intensity 3.1 at `[-34, 60, 42]` with a 4096 shadow map, plus a spotlight recorded at intensity 0.

`layout.json` groups are unnamed. Centres sit on a ring around the origin, y near -4, radius about 30. Scene bounds are 640 × 20.7 × 640. No GLTF/Draco/KTX2 URLs in `assets.json`. Network assets are the page, CSS, and JS (`StudioCanvas-*.js` matches three, react-three-fiber, CatmullRom, and a spline string).

## Overlays (reference copy, not ours)

Observed headings, in order: opening “One studio. Endless worlds…”, “THE ENTRANCE”, “THE WORLDS” (“12 sets rise around you”), “THE COLLECTION” with Royal & Traditional, European, Modern Interiors, then Nature & Floral and Lifestyle on mobile, then featured galleries. Fonts detected: Cormorant Garamond, Manrope. That is the reference’s type, not this site’s Fraunces.

## Grey boxes

The 32 depth-2 boxes with a non-zero size are **PROPOSED stand-ins**. They show where groups sit. They are not the buildings. The depth-1 hub box of 640 × 10.86 × 640 is not drawn as a solid, because the opening camera sits inside it.

**Known limitation:** `layout.json` bounding boxes for instanced meshes ignore per-instance positions. Do not place trees or other vegetation from `layout.json` in Phase 3. Instance positions need a separate capture.

## Asset decision

**Option B, approved by owner on 22 November 2026.** Grey boxes on the measured footprints first, then an original procedural village at those same footprints. Reference stills in `reference-capture/shots/` may be used only as art direction. Nothing is extracted from the reference bundles.

## Content assignment (PROPOSED, not observed)

| Observed stage | Our content |
|----------------|-------------|
| Opening hold | `HeroStatement` |
| Collection categories | five `ARCHITECTURAL_SETS` in content order. The reference shows more than five worlds (“12 sets”). Extra holds stay empty |
| Later editorial blocks | recent shoots, then statement and services |
| After the track | existing `LandingClose`, footer, enquiry. No WebGL |

## Generated tracks

`tools/cinematic/build-camera-track.mjs` writes 200-point tracks to `src/cinematic/story/camera-track.{desktop,mobile}.generated.json`. `tools/cinematic/fit-damping.mjs` reads `timeseries.json`. Those samples store `cam.pos` only, so no follow-lag constant was fitted. Scroll feel is native.

No homepage code in this step.

## Phase 1 addendum (approved constraints)

### Damping — OBSERVED

`desktop/timeseries.json` has `y` (scroll offset) and `cam.pos` on 2485 samples. Compared with `camera-down.json` at `p = y / (scrollHeight - innerHeight)` from `desktop/detect.json` (`11523 - 900`).

| Residual | World units | Share of 905-unit scene diagonal |
|----------|-------------|-----------------------------------|
| p50 | 0.37 | 0.04% |
| p95 | 5.90 | 0.65% |
| max | 77.4 | 8.6% |

p95 is inside the 2% tolerance. The max is a few samples on the fastest moves, not a steady lag. **No follow-lag, direct mapping.** `CAMERA_DAMPING` is `0` and marked PROPOSED. It is not applied.

### Zones — PROPOSED labels, OBSERVED centres

`desktop/layout.json` depth-1 groups, footprints unchanged. Split by angle around the origin.

| Zone | Groups | Centre xz | Nearest camera behaviour |
|------|--------|-----------|--------------------------|
| zone-01 | index 0, at `[0, 4.4, 0]` | hub | Opening move, camera starts at z 54 looking toward -z |
| zone-02 | indices 1–3, west | about `[-28, -8]` | Beside the path; exit camera ends near x -61 |
| zone-03 | indices 4–6 | about `[-12, -26]` | The still camera at p 0.45–0.80 sits at `[0, 71.6, 106.5]` looking -z, so this arc is in frame |
| zone-04 | indices 7–9 | about `[12, -26]` | Same hold |
| zone-05 | indices 10–12, east | about `[28, -8]` | Edge of the opening view |

### Stage assignment

Camera path is one file. These windows only change which DOM chapter is visible.

| Progress | OBSERVED | Our content | Status |
|----------|----------|-------------|--------|
| 0.00–0.22 | Overlay “SCROLL TO STEP INSIDE” through “THE ENTRANCE”. Camera is moving (speed ~200–280, then slower) | Hero | PROPOSED span. There is no stationary opening hold |
| 0.22–0.38 | “THE WORLDS” / “12 sets” | None | Camera move, no content |
| 0.38–0.67 | Collection cards appear together (Royal, European, Modern, Nature, Lifestyle), not as five separate holds | Five `ARCHITECTURAL_SETS` in content order, five equal slices | PROPOSED slices inside one observed window. Camera samples are not duplicated |
| 0.43–0.83 | Camera speed is 0 (`camera-down.json`) | The set slices and the following chapters sit inside this still | OBSERVED hold |
| 0.67–0.76 | Featured galleries observed at 0.64–0.71 | Recent shoots | PROPOSED start moved to 0.67 so it does not cover the last set |
| 0.76–0.86 | After the galleries, before the exit move at ~0.87 | Set of the month, marquee, estate statement, services | PROPOSED |
| 0.86–1.00 | Camera moves to `[-61.07, 28.55, 58.73]` | None | Exit move |

### Display colour on sand — measured, not applied

Background `#e8d8c3` (OBSERVED). Contrast ratio:

| Ink | Ratio | Use |
|-----|-------|-----|
| `#D94F1F` | 2.96:1 | Current title colour. Below AA for body. Large text needs 3:1, so it is just under |
| `#9A3412` | 5.23:1 | Approved for small text. Also passes large-text AA |
| `#7A2E0E` | 6.76:1 | Option for display if you want AA body as well |
| `#5C2410` | 8.77:1 | Darker option |
| `#3A1A0C` | 11.28:1 | Strongest option |

Headlines in the story shell stay `#D94F1F` until you pick one. Small story text uses `#9A3412`.

### Seam — PROPOSED, not built

The track ends on sand. `LandingClose` and the footer are dark `#07091A`.

1. **Hard cut.** Sand track, then the existing dark close with no blend. Clearest handoff. This is what Phase 1 ships.
2. **One-viewport dissolve.** The last 100vh of the track fades a `#07091A` veil from 0 to 1 while the camera plays the exit move, and the close begins already dark. No change to the camera samples.

### Tablet

Only 390 and 1440 were captured. At `max-width: 767px` the track is 1610vh. Above that it is 1280vh, including 768–1024. That tablet choice is PROPOSED and open.

