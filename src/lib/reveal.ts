/** Visible by default; `html.js-reveal` hides `.reveal` until `.in` or safety timeout. */

export function revealVisibleFallback(el: HTMLElement): void {
  el.classList.add("in");
  el.style.opacity = "";
  el.style.transform = "";
}

export function initRevealSystem(root: ParentNode = document): void {
  const reduce =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const targets = Array.from(root.querySelectorAll<HTMLElement>(".reveal"));
  if (targets.length === 0) return;

  if (reduce) {
    targets.forEach((t) => t.classList.add("in"));
    return;
  }

  document.documentElement.classList.add("js-reveal");

  const inViewport = (el: Element) => {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight * 0.92 && r.bottom > window.innerHeight * 0.05;
  };

  targets.forEach((t) => {
    if (inViewport(t)) t.classList.add("in");
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -5% 0px" },
  );

  targets.forEach((t) => {
    if (!t.classList.contains("in")) io.observe(t);
  });

  window.setTimeout(() => {
    root.querySelectorAll<HTMLElement>(".reveal:not(.in)").forEach((t) => t.classList.add("in"));
  }, 1500);
}