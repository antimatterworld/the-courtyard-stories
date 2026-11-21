import { useRef } from "react";
import { SectionDoodle } from "./SectionDoodle";
import { ChillDoodle } from "./ChillDoodle";
import { ARCHITECTURAL_SETS } from "../../data/content";
import { ensureGsap } from "../../lib/gsap";
import { prefersReducedMotion } from "../../lib/motion";
import { useGSAP } from "../../lib/gsap";

export type FallingCard = {
  id: string;
  title: string;
  tag: string;
  image: string;
  accent: string;
};

type Props = {
  cards: FallingCard[];
  scrollPerCard?: number;
  onOpen?: (id: string) => void;
};

function titleOf(name: string) {
  return name.split("·")[0]?.trim() ?? name;
}

export function setsAsFallingCards(): FallingCard[] {
  return ARCHITECTURAL_SETS.map((set) => ({
    id: set.id,
    title: titleOf(set.name),
    tag: set.tag,
    image: set.img,
    accent: set.palette.accent,
  }));
}

export function FallingCardStack({ cards, scrollPerCard = 850, onOpen }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const root = rootRef.current;
      const stage = stageRef.current;
      if (!root || !stage || cards.length === 0) return;

      const nodes = cardRefs.current.filter((n): n is HTMLDivElement => Boolean(n));
      if (nodes.length !== cards.length) return;

      if (prefersReducedMotion()) {
        nodes.forEach((node) => {
          node.style.transform = "none";
        });
        return;
      }

      let killed = false;
      let ctx: { revert: () => void } | null = null;
      const onLoader = () => {
        void ensureGsap().then(({ ScrollTrigger }) => ScrollTrigger.refresh());
      };

      void ensureGsap().then(({ gsap, ScrollTrigger }) => {
        if (killed || !rootRef.current) return;

        ctx = gsap.context(() => {
          const n = nodes.length;

          const nameEls = gsap.utils.toArray<HTMLElement>(".falling-name", root);
          const offscreen = () => (stage.clientWidth || window.innerWidth) * 0.62;

          nodes.forEach((node, i) => {
            gsap.set(node, {
              xPercent: -50,
              yPercent: -50,
              x: offscreen,
              y: 0,
              rotation: 7,
              scale: 0.92,
              zIndex: n - i,
              transformOrigin: "50% 50%",
            });
          });
          nameEls.forEach((el) => gsap.set(el, { opacity: 0.42, scale: 1 }));
          if (nameEls[0]) gsap.set(nameEls[0], { opacity: 1, scale: 1.04 });

          const beat = 1;
          const move = beat;

          const tl = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: () => `+=${n * scrollPerCard}`,
              pin: stage,
              pinSpacing: true,
              pinReparent: true,
              anticipatePin: 1,
              scrub: 0.45,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const idx = Math.min(n - 1, Math.round(self.progress * Math.max(n - 1, 1)));
                if (countRef.current) {
                  countRef.current.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`;
                }
              },
            },
          });

          tl.to(nodes[0], { x: 0, rotation: 0, scale: 1, duration: move }, 0);

          for (let i = 0; i < n - 1; i++) {
            const at = (i + 1) * beat;
            tl.set(nodes[i + 1], { zIndex: n + 4 }, at);
            tl.set(nodes[i], { zIndex: n }, at);
            tl.to(
              nodes[i],
              {
                y: () => Math.round(window.innerHeight * 0.95),
                rotation: 8,
                duration: move,
              },
              at,
            );
            tl.to(nodes[i + 1], { x: 0, rotation: 0, scale: 1, duration: move }, at);
            if (nameEls[i + 1]) {
              tl.to(nameEls[i + 1], { opacity: 1, scale: 1.04, duration: move }, at);
            }
            if (nameEls[i]) {
              tl.to(nameEls[i], { opacity: 0.42, scale: 1, duration: move }, at);
            }
          }

          ScrollTrigger.refresh();
        }, root);
      });

      window.addEventListener("tcs:loader-done", onLoader);
      void document.fonts.ready.then(onLoader);

      return () => {
        killed = true;
        window.removeEventListener("tcs:loader-done", onLoader);
        ctx?.revert();
      };
    },
    { scope: rootRef, dependencies: [cards.length, scrollPerCard] },
  );

  return (
    <section ref={rootRef} className="falling-stack" aria-label="The five sets">
      <div ref={stageRef} className="falling-stack-stage">
        <ChillDoodle kind="frames" className="chill-doodle--mid" />
        <div className="falling-stack-head">
          <span className="section-pointer">
            <SectionDoodle kind="star" />
            Five worlds
          </span>
          <span ref={countRef}>01 / {String(cards.length).padStart(2, "0")}</span>
        </div>
        <div className="falling-stack-body">
          <ol className="falling-names">
            {cards.map((card) => (
              <li key={card.id} className="falling-name">
                <span style={{ color: card.accent }}>{card.tag}</span>
                <strong>{card.title}</strong>
              </li>
            ))}
          </ol>
          <div className="falling-stack-scene">
          {cards.map((card, i) => (
            <div
              key={card.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="falling-card"
            >
              <button type="button" className="falling-card-face" onClick={() => onOpen?.(card.id)}>
                <img src={card.image} alt="" draggable={false} />
              </button>
            </div>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}