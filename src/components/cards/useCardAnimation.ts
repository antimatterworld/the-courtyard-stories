import type gsap from "gsap";
import type { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../../lib/motion";
import { revealVisibleFallback } from "../../lib/reveal";

type GsapBundle = {
  gsap: typeof gsap;
  ScrollTrigger: typeof ScrollTrigger;
};

function cardParts(card: HTMLElement) {
  return {
    mediaInner: card.querySelector<HTMLElement>(".split-card-media-inner"),
    mediaImg: card.querySelector<HTMLElement>(".split-card-media img"),
    textPanel: card.querySelector<HTMLElement>(".split-card-text"),
    tag: card.querySelector<HTMLElement>(".split-card-tag"),
    title: card.querySelector<HTMLElement>(".split-card-title"),
    desc: card.querySelector<HTMLElement>(".split-card-desc"),
    link: card.querySelector<HTMLElement>(".split-card-link"),
  };
}

export function playCardEntrance(card: HTMLElement, bundle: GsapBundle): gsap.core.Timeline | null {
  const { gsap } = bundle;
  const parts = cardParts(card);
  if (!parts.mediaImg || !parts.textPanel) return null;

  if (card.dataset.cardAnimated === "1") return null;
  card.dataset.cardAnimated = "1";

  if (prefersReducedMotion()) {
    gsap.set([parts.mediaImg, parts.mediaInner, parts.textPanel, parts.tag, parts.title, parts.desc, parts.link].filter(Boolean), {
      clearProps: "all",
      opacity: 1,
    });
    revealVisibleFallback(card);
    return null;
  }

  card.classList.add("card-animating");
  gsap.set(parts.mediaImg, { scale: 1.08, opacity: 0, transformOrigin: "50% 50%" });
  if (parts.mediaInner) gsap.set(parts.mediaInner, { yPercent: 8 });
  gsap.set(parts.textPanel, { scale: 0.98, opacity: 0, transformOrigin: "50% 100%" });
  const copy = [parts.tag, parts.title, parts.desc, parts.link].filter(Boolean);
  gsap.set(copy, { opacity: 0, y: 22 });

  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete: () => {
      card.classList.remove("card-animating");
      gsap.set(card, { clearProps: "willChange" });
    },
  });

  tl.to(parts.mediaImg, { scale: 1, opacity: 1, duration: 0.95, ease: "power2.out" }, 0);
  if (parts.mediaInner) tl.to(parts.mediaInner, { yPercent: 0, duration: 1.05, ease: "power2.out" }, 0);
  tl.to(parts.textPanel, { scale: 1, opacity: 1, duration: 0.65 }, 0.08);
  if (parts.tag) tl.to(parts.tag, { opacity: 1, y: 0, duration: 0.55 }, 0.12);
  if (parts.title) tl.to(parts.title, { opacity: 1, y: 0, duration: 0.7 }, 0.24);
  if (parts.desc) tl.to(parts.desc, { opacity: 1, y: 0, duration: 0.6 }, 0.38);
  if (parts.link) tl.to(parts.link, { opacity: 1, y: 0, duration: 0.5 }, 0.5);

  return tl;
}

export function setPinnedRailActiveCard(cards: HTMLElement[], activeIndex: number, bundle: GsapBundle): void {
  const { gsap } = bundle;
  if (prefersReducedMotion()) {
    gsap.set(cards, { clearProps: "transform,opacity" });
    return;
  }

  cards.forEach((card, i) => {
    const on = i === activeIndex;
    card.classList.toggle("is-rail-active", on);
    gsap.to(card, {
      scale: on ? 1 : 0.97,
      opacity: on ? 1 : 0.78,
      duration: 0.45,
      ease: "power2.out",
      overwrite: "auto",
    });
  });
}

export function registerPinnedRailCards(track: HTMLElement, bundle: GsapBundle): ScrollTrigger[] {
  const { ScrollTrigger } = bundle;
  const cards = Array.from(track.querySelectorAll<HTMLElement>(".card--split"));
  const triggers: ScrollTrigger[] = [];

  cards.forEach((card) => revealVisibleFallback(card));

  if (prefersReducedMotion()) {
    cards.forEach((c) => revealVisibleFallback(c));
    return triggers;
  }

  cards.forEach((card) => {
    const st = ScrollTrigger.create({
      trigger: card,
      start: "left 88%",
      once: true,
      invalidateOnRefresh: true,
      onEnter: () => playCardEntrance(card, bundle),
    });
    triggers.push(st);
  });

  cards.forEach((img) => {
    const el = img.querySelector("img");
    if (el && !el.complete) {
      el.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
    }
  });

  return triggers;
}

/** When scrubber lands on a card, run entrance if ScrollTrigger has not fired yet. */
export function playCardEntranceIfNeeded(card: HTMLElement | undefined, bundle: GsapBundle): void {
  if (!card) return;
  playCardEntrance(card, bundle);
}