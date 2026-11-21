import { useRef, useState } from "react";
import { PORTFOLIO, type PortfolioItem } from "../../data/content";
import { ensureGsap, useGSAP } from "../../lib/gsap";
import { prefersReducedMotion } from "../../lib/motion";
import { WorkLightbox } from "../Work";
import { SectionDoodle } from "./SectionDoodle";
import { ChillDoodle } from "./ChillDoodle";

const PILLS = PORTFOLIO.slice(0, 16);

function splitRows(items: PortfolioItem[]) {
  const half = Math.ceil(items.length / 2);
  return [items.slice(0, half), items.slice(half)];
}

function labelFor(item: PortfolioItem) {
  return item.category.replace(/^./, (c) => c.toUpperCase());
}

function rowTravel(row: HTMLElement): number {
  const lane = row.parentElement;
  const view = lane?.clientWidth ?? window.innerWidth;
  const cards = row.querySelectorAll<HTMLElement>(".landing-shoot-card");
  if (cards.length < 2) return Math.max(view * 0.8, 280);
  const first = cards[0]!;
  const last = cards[cards.length - 1]!;
  const span = last.offsetLeft + last.offsetWidth - first.offsetLeft;
  return Math.max(span - view, view * 0.65);
}

export function CounterRails() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [open, setOpen] = useState<PortfolioItem | null>(null);
  const [rows] = useState(() => splitRows(PILLS));

  useGSAP(
    () => {
      const section = sectionRef.current;
      const sticky = stickyRef.current;
      const top = rowRefs.current[0];
      const bottom = rowRefs.current[1];
      if (!section || !sticky || !top || !bottom || prefersReducedMotion()) return;

      let killed = false;
      let ctx: { revert: () => void } | null = null;
      const refresh = () => ctx && ensureGsap().then(({ ScrollTrigger }) => ScrollTrigger.refresh());

      void ensureGsap().then(({ gsap }) => {
        if (killed) return;
        ctx = gsap.context(() => {
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${Math.max(rowTravel(top), rowTravel(bottom), window.innerHeight)}`,
              pin: sticky,
              pinSpacing: true,
              pinReparent: true,
              anticipatePin: 1,
              scrub: 0.4,
              invalidateOnRefresh: true,
            },
          });
          tl.fromTo(top, { x: () => rowTravel(top) }, { x: () => -rowTravel(top) }, 0);
          tl.fromTo(bottom, { x: () => -rowTravel(bottom) }, { x: () => rowTravel(bottom) }, 0);
        }, section);
        refresh();
      });

      window.addEventListener("load", refresh);
      window.addEventListener("tcs:loader-done", refresh);
      const images = [...top.querySelectorAll("img"), ...bottom.querySelectorAll("img")];
      images.forEach((img) => img.addEventListener("load", refresh));

      return () => {
        killed = true;
        window.removeEventListener("load", refresh);
        window.removeEventListener("tcs:loader-done", refresh);
        images.forEach((img) => img.removeEventListener("load", refresh));
        ctx?.revert();
      };
    },
    { scope: sectionRef, dependencies: [rows] },
  );

  return (
    <section ref={sectionRef} className="landing-rails landing-band-recent" aria-label="Recent shoots">
      <div ref={stickyRef} className="landing-rails-sticky">
        <ChillDoodle kind="camera" className="chill-doodle--bl" />
        <ChillDoodle kind="tree" className="chill-doodle--tr" />
        <h2 className="section-pointer">
          <SectionDoodle kind="arrow" />
          Recent shoots
        </h2>
        {rows.map((row, ri) => (
          <div key={ri} className="landing-rail-lane">
            <div
              className="landing-rail-row"
              ref={(node) => {
                rowRefs.current[ri] = node;
              }}
            >
              {row.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="landing-shoot-card"
                  onClick={() => setOpen(item)}
                  aria-label={`Open ${item.title}`}
                >
                  <img src={item.img} alt="" loading="lazy" decoding="async" />
                  <div className="landing-shoot-caption">
                    <strong>{item.title}</strong>
                    <span>
                      {labelFor(item)} · {item.year}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {open && <WorkLightbox item={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
