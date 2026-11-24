/** PROPOSED: off. Timeseries y→camera residual is direct (see reference-analysis). */
export const CAMERA_DAMPING = 0;

/** OBSERVED document height / viewport from detect.json, before the set-card gap is removed. */
const CAMERA_SPAN = { desktop: 12.8, mobile: 16.1 } as const;

/**
 * The five set cards used to sit on this stretch. The camera is already held still
 * on both ends (p 0.43 and p 0.67), so skipping it does not move the view.
 */
export const SCROLL_GAP = { from: 0.43, to: 0.67 } as const;

const SCROLL_KEPT = 1 - (SCROLL_GAP.to - SCROLL_GAP.from);

export const SCROLL_VH = {
  desktop: Math.round(CAMERA_SPAN.desktop * SCROLL_KEPT * 100) / 100,
  mobile: Math.round(CAMERA_SPAN.mobile * SCROLL_KEPT * 100) / 100,
} as const;

/** Scroll fraction across the shortened track → camera progress, skipping SCROLL_GAP. */
export function cameraProgress(scrollP: number) {
  const { from, to } = SCROLL_GAP;
  const head = from / SCROLL_KEPT;
  const clamped = Math.min(1, Math.max(0, scrollP));
  if (clamped <= head) return (clamped / head) * from;
  const u = (clamped - head) / (1 - head);
  return to + u * (1 - to);
}

/** Mobile track at <=767px or portrait. Desktop otherwise. Tablet 768–1024 landscape stays desktop (PROPOSED, uncaptured). */
export function cameraProfile(): "mobile" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const narrow = window.matchMedia("(max-width: 767px)").matches;
  const portrait = window.innerHeight > window.innerWidth;
  return narrow || portrait ? "mobile" : "desktop";
}

export type ChapterKind = "hero" | "set" | "shoots" | "statement" | "empty";

export type Chapter = {
  id: string;
  from: number;
  to: number;
  kind: ChapterKind;
  setId?: string;
};

/**
 * Windows are PROPOSED placements on OBSERVED overlay ranges.
 * The camera samples are not split, duplicated, or reordered.
 * Desktop camera-down speed is ~0 from p 0.43–0.83 (one hold).
 */
export const CHAPTERS: Chapter[] = [
  { id: "hero", from: 0, to: 0.1, kind: "hero" },
  { id: "worlds", from: 0.1, to: 0.38, kind: "empty" },
  { id: "set-royal-haveli", from: 0.38, to: 0.438, kind: "set", setId: "royal-haveli" },
  { id: "set-mughal-colonnade", from: 0.438, to: 0.496, kind: "set", setId: "mughal-colonnade" },
  { id: "set-chefchaouen-suite", from: 0.496, to: 0.554, kind: "set", setId: "chefchaouen-suite" },
  { id: "set-rustic-village", from: 0.554, to: 0.612, kind: "set", setId: "rustic-village" },
  { id: "set-night-gala", from: 0.612, to: 0.67, kind: "set", setId: "night-gala" },
  { id: "shoots", from: 0.67, to: 0.76, kind: "shoots" },
  { id: "statement", from: 0.76, to: 0.86, kind: "statement" },
  { id: "exit", from: 0.86, to: 1, kind: "empty" },
];

export function chapterIndexAt(p: number) {
  const i = CHAPTERS.findIndex((ch, idx) => p >= ch.from && (p < ch.to || idx === CHAPTERS.length - 1));
  return i < 0 ? 0 : i;
}
