import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { attachMotionToGsapTicker } from "./motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

let appInited = false;

export function initGsapApp(): void {
  if (appInited || typeof window === "undefined") return;
  appInited = true;
  gsap.defaults({ ease: "power3.out", duration: 0.8 });
  attachMotionToGsapTicker((fn) => gsap.ticker.add(fn));
}

let loadPromise: Promise<{ gsap: typeof gsap; ScrollTrigger: typeof ScrollTrigger; useGSAP: typeof useGSAP; initGsapApp: typeof initGsapApp }> | null = null;

/** Lazy init GSAP on first Five worlds / card section (ScrollTrigger + motion ticker bridge). */
export function ensureGsap(): Promise<{ gsap: typeof gsap; ScrollTrigger: typeof ScrollTrigger; useGSAP: typeof useGSAP; initGsapApp: typeof initGsapApp }> {
  if (!loadPromise) {
    loadPromise = Promise.resolve().then(() => {
      initGsapApp();
      return { gsap, ScrollTrigger, useGSAP, initGsapApp };
    });
  }
  return loadPromise;
}

let refreshTimer = 0;

export function refreshScrollTriggers(): void {
  if (typeof window === "undefined") return;
  window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => {
    ScrollTrigger.refresh();
  }, 120);
}

export { gsap, ScrollTrigger, useGSAP };