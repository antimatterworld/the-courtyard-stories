/** PROPOSED: off. Timeseries y→camera residual is direct (see reference-analysis). */
export const CAMERA_DAMPING = 0;

/** OBSERVED document height / viewport from detect.json, before the set-card gap is removed. */
const CAMERA_SPAN_VH = 12.8;

/**
 * The five set cards used to sit on this stretch. The camera is already held still
 * on both ends (p 0.43 and p 0.67), so skipping it does not move the view.
 */
export const SCROLL_GAP = { from: 0.43, to: 0.67 } as const;

const SCROLL_KEPT = 1 - (SCROLL_GAP.to - SCROLL_GAP.from);

/** One journey length for every screen. Phones follow the same path as laptops. */
export const SCROLL_VH = Math.round(CAMERA_SPAN_VH * SCROLL_KEPT * 100) / 100;

/** Scroll fraction across the shortened track → camera progress, skipping SCROLL_GAP. */
export function cameraProgress(scrollP: number) {
  const { from, to } = SCROLL_GAP;
  const head = from / SCROLL_KEPT;
  const clamped = Math.min(1, Math.max(0, scrollP));
  if (clamped <= head) return (clamped / head) * from;
  const u = (clamped - head) / (1 - head);
  return to + u * (1 - to);
}

const smooth = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/**
 * Framing for narrow screens. The path is the same as on a laptop; a tall screen
 * sees a thin slice of it, so the lens opens up and the camera steps back.
 *
 * `aspect` is canvas width / height. On a 16:10 laptop this returns the track's
 * own lens and no step back.
 */
export function portraitFraming(p: number, aspect: number, trackFov: number) {
  // Horizontal angle the story needs: the gate at the start, the whole ring from the air.
  const horizontal = 24 + 7 * smooth(0.27, 0.42, p);
  const needed = (2 * Math.atan(Math.tan((horizontal * Math.PI) / 360) / aspect) * 180) / Math.PI;
  const fov = Math.min(62, Math.max(trackFov, needed));

  const tall = Math.min(1, Math.max(0, (1.1 - aspect) / 0.6));
  // Step back for the gate, walk through it at the track's own position, step back again in the air,
  // and once more on the closing move, which swings in close to the yards.
  const dolly =
    tall * (15 * (1 - smooth(0, 0.06, p)) + 20 * smooth(0.27, 0.42, p) + 24 * smooth(0.86, 1, p));
  return { fov, dolly };
}

export type ChapterKind = "hero" | "empty";

export type Chapter = {
  id: string;
  from: number;
  to: number;
  kind: ChapterKind;
};

/** The headline holds for the approach, then the courtyard has the screen. */
export const CHAPTERS: Chapter[] = [
  { id: "hero", from: 0, to: 0.1, kind: "hero" },
  { id: "courtyard", from: 0.1, to: 1, kind: "empty" },
];

export function chapterIndexAt(p: number) {
  const i = CHAPTERS.findIndex((ch, idx) => p >= ch.from && (p < ch.to || idx === CHAPTERS.length - 1));
  return i < 0 ? 0 : i;
}
