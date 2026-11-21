/** Single rAF loop: scroll sets `dirty`; callbacks write transforms on refs (no React per frame). */

export type MotionContext = {
  scrollY: number;
  vh: number;
  reducedMotion: boolean;
};

export type MotionCallback = (ctx: MotionContext) => void;

let dirty = true;
let running = false;
let rafId = 0;
const callbacks = new Set<MotionCallback>();

const reducedMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function prefersReducedMotion(): boolean {
  return reducedMotion;
}

export function markMotionDirty(): void {
  dirty = true;
  ensureLoop();
}

function tick(): void {
  if (dirty && callbacks.size > 0) {
    const ctx: MotionContext = {
      scrollY: window.scrollY,
      vh: window.innerHeight,
      reducedMotion,
    };
    callbacks.forEach((cb) => cb(ctx));
    dirty = false;
  }
  rafId = requestAnimationFrame(tick);
}

function ensureLoop(): void {
  if (running || externalTicker) return;
  running = true;
  rafId = requestAnimationFrame(tick);
}

let externalTicker = false;

/** Single rAF: GSAP ticker drives scroll-linked writes once GSAP loads. */
export function attachMotionToGsapTicker(add: (fn: () => void) => void): void {
  if (externalTicker || typeof window === "undefined") return;
  externalTicker = true;
  running = true;
  if (rafId) cancelAnimationFrame(rafId);
  add(() => {
    if (dirty && callbacks.size > 0) {
      const ctx: MotionContext = {
        scrollY: window.scrollY,
        vh: window.innerHeight,
        reducedMotion,
      };
      callbacks.forEach((cb) => cb(ctx));
      dirty = false;
    }
  });
}

export function subscribeMotion(cb: MotionCallback): () => void {
  callbacks.add(cb);
  markMotionDirty();
  return () => {
    callbacks.delete(cb);
    if (callbacks.size === 0) {
      cancelAnimationFrame(rafId);
      running = false;
    }
  };
}

let motionInit = false;

export function initMotionEngine(): void {
  if (motionInit || typeof window === "undefined") return;
  motionInit = true;
  window.addEventListener("scroll", markMotionDirty, { passive: true });
  let resizeTimer = 0;
  window.addEventListener(
    "resize",
    () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => markMotionDirty(), 120);
    },
    { passive: true },
  );
  ensureLoop();
}