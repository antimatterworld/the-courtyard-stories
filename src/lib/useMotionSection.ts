import { useEffect, useRef, useState, type RefObject } from "react";
import { markMotionDirty } from "./motion";

export type SectionMetrics = {
  offsetTop: number;
  scrollSpan: number;
  sectionHeight?: number;
};

export function useSectionMetrics(
  sectionRef: RefObject<HTMLElement | null>,
  compute: (el: HTMLElement, vh: number) => SectionMetrics,
): SectionMetrics | null {
  const [metrics, setMetrics] = useState<SectionMetrics | null>(null);
  const computeRef = useRef(compute);
  computeRef.current = compute;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const measure = () => {
      setMetrics(computeRef.current(el, window.innerHeight));
      markMotionDirty();
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (trackParentImages(el, measure)) {
      /* images wired */
    }

    void document.fonts.ready.then(measure);

    const onLoader = () => measure();
    window.addEventListener("tcs:loader-done", onLoader);

    let lastW = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth !== lastW) {
        lastW = window.innerWidth;
        measure();
      }
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("tcs:loader-done", onLoader);
    };
  }, [sectionRef]);

  return metrics;
}

function trackParentImages(_el: HTMLElement, measure: () => void): boolean {
  const imgs = document.querySelectorAll("img");
  let wired = false;
  imgs.forEach((img) => {
    if (!img.complete) {
      wired = true;
      img.addEventListener("load", measure, { once: true });
    }
  });
  return wired;
}

export function useMotionVisible(ref: RefObject<HTMLElement | null>): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setVisible(e?.isIntersecting ?? false),
      { rootMargin: "8% 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  useEffect(() => {
    if (visible) markMotionDirty();
  }, [visible]);

  return visible;
}

export function scrollProgressWithDwell(raw: number): number {
  return Math.min(1, Math.max(0, (raw - 0.05) / 0.9));
}