# Card animation spec (Pass 5)

## Reference

- **Shot:** [Website Header Animation](https://dribbble.com/shots/26784275-Website-Header-Animation) (Dribbble **26784275**).
- **Access:** Automated fetch returned **403**; shot could not be played frame-by-frame in this environment.
- **Proxy pattern:** Typical “furniture / editorial header” dribbbles in this genre (large hero image, muted panel, staggered type) — cross-checked against similar tagged shots (e.g. Halal Lab furniture header, scroll-linked editorial headers).

## Observed / inferred motion language (header → card)

| Header element | Card mapping (`SplitCard` / Five worlds) |
|----------------|------------------------------------------|
| Full-bleed hero photograph | Left **`.split-card-media`** — scale down from ~1.08, fade in; inner pan **`yPercent`** 8→0 |
| Category / eyebrow | **`.split-card-tag`** — first text beat, `y` 18px → 0, opacity 0→1 |
| Main headline | **`.split-card-title`** — second beat, `y` 28px → 0, slight delay |
| Supporting line | **`.split-card-desc`** — third beat |
| Primary CTA / link | **`.split-card-link`** — last beat, `y` 12px → 0 |
| Panel / block | **`.split-card-text`** — subtle `scale` 0.98→1 (transform only) |

## Sequence (one card, entrance)

1. **0.00s** — Image + media wrapper begin (duration **0.95s**, `power2.out`).
2. **0.12s** — Tag (duration **0.55s**, `power3.out`).
3. **0.24s** — Title (duration **0.70s**, `power3.out`).
4. **0.38s** — Description (duration **0.60s**, `power3.out`).
5. **0.50s** — Link (duration **0.50s**, `power3.out`).

**Stagger between cards in view:** **0.08s** (ScrollTrigger `batch`).

## Active card (pinned rail)

When the Five worlds scrubber lands on a set, the active card gets a short **focus** pulse: scale **0.985→1**, opacity **0.88→1**, **0.45s** `power2.out`. Inactive siblings ease to **scale 0.97**, **opacity 0.78** (transform/opacity only).

## Triggers

- **Entrance:** `ScrollTrigger.batch` on `.card--split` in the pinned track, `start: "left 88%"`, `once: true` (horizontal rail).
- **Focus:** Pinned rail `activeIndex` change (no React state per frame; GSAP called on index change only).
- **Refresh:** `ScrollTrigger.refresh()` after `tcs:loader-done`, fonts ready, card images load, resize (debounced).

## Easing summary

- Settle: **`power3.out`**
- Image mass: **`power2.out`**
- No bounce, no elastic on entrance.

## Reduced motion

`gsap.matchMedia("(prefers-reduced-motion: reduce)")` — skip timelines; final state visible immediately.

## Content safety

- DOM text remains in HTML; GSAP only adjusts transform/opacity after JS runs.
- Pass 4 **1.5s reveal safety** unchanged.

## Five worlds scope (this pass)

GSAP choreography applied to **`PinnedRail`** `SplitCard` instances only. Recent shoots + studio tiles deferred to a follow-up pass unless requested.