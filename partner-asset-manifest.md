# Partner Asset Manifest — The Courtyard Stories

All generated visual assets are logged here per project policy. Every image was
prompt-engineered and rendered through **Google Flow MCP** (`flow_generate`),
then downloaded locally and copied into `public/assets/flow/` for the build.
No third-party stock, no external image CDNs, no uploads off this machine.

## Generated images (Flow MCP)

Project: `courtyard-hero` · source dir: `~/flow-mcp-out/courtyard-hero/`
Quality: medium · aspect: 21:9 (all) · style: warm neutral film-grain editorial

| # | Scene (Flow id) | Prompt focus | Destination | Used in |
|---|---|---|---|---|
| 1 | `scene-01` | Sun-drenched cyclorama bay, vintage camera on tripod, warm daylight (empty establishing frame, no people) | `public/assets/flow/hero.jpg` | Home hero poster/fallback, Studio page media, OG preview, 3D scene backdrop |
| 2 | `scene-02` | Fashion editorial still — model in flowing cream linen, golden window light, Kodak 2383 look | `public/assets/flow/fashion.jpg` | Fashion service page, portfolio "Atelier Meraki" |
| 3 | `scene-03` | Product cinematography still — amber glass skincare bottle on rumpled cream linen, dust motes in side light | `public/assets/flow/product.jpg` | Product service page, portfolio "Lumen Skincare" |
| 4 | `scene-04` | Podcast studio still — two large-diaphragm mics on boom arms, warm tungsten practicals, walnut + felt | `public/assets/flow/podcast.jpg` | Podcast service page, portfolio "Field Notes S2" |
| 5 | `scene-05` | Behind-the-scenes crew walking a sun-lit studio corridor with a cinema camera on a shoulder rig, lens flare | `public/assets/flow/crew.jpg` | Portfolio "Dhara Runway" |
| 6 | `scene-06` | Extreme close-up: vintage cinema camera body + 50mm anamorphic lens on a wooden floor track, daylight | `public/assets/flow/lens.jpg` | Portfolio "Barista Co tools" |
| 7 | `scene-07` | Commercial brand-film still — ceramic cup + steam, glass carafe pour, teal-and-amber grade | `public/assets/flow/commercial.jpg` | Commercial service page, portfolio "Sundara" |

Notes on the render pipeline:
- All prompts explicitly forbid on-screen text/watermarks; the Flow tool
  injects its own NO-TEXT guardrail into every prompt.
- `flow_download` → local `~/flow-mcp-out/courtyard-hero/*.jpg` →
  `ffmpeg -i in.jpg -vf scale=1600:-2:flags=lanczos out.jpg` (downscale +
  sRGB) → copied to `public/assets/flow/`.
- The 3D hero (`HeroScene.tsx`) is fully procedural (Three.js geometry, no
  textures); images 1/5/6 are used as static fallback posters and page media
  only, so LCP is never gated on the 3D chunk.

## Generated video

| # | Asset | Source | Destination | Used in |
|---|---|---|---|---|
| 1 | 12s hero ambient loop | Flow scenes 01→07 stitched via `ffmpeg` (crossfade + slow Ken Burns zoom, H.264, 1280×558) | `public/assets/flow/hero-loop.mp4` | Home hero ambient layer under the 3D canvas (`<video autoplay muted loop playsinline>`, `preload="none"` on mobile, hidden when `prefers-reduced-motion`) |

Video is < 2.5 MB (H.264 800 kbps target) to keep LCP under 2.5 s.

## Not used
- 21st.dev / Magic components: not pulled. The design system is fully
  hand-rolled on the locked tokens in `src/styles.css`; pulling external
  component packs would fight the "zero AI slop" gate.
