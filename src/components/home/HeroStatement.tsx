import { useEffect, useRef } from "react";
import { ChillDoodle } from "./ChillDoodle";
import { Link } from "react-router-dom";
import { useWorldProgress } from "../../lib/world-progress";
import { initMotionEngine, markMotionDirty, prefersReducedMotion, subscribeMotion } from "../../lib/motion";

const MAX_SHIFT_VW = 12;
const FLOAT_LINE = "Five architectural worlds on one private estate in Kapashera.";

export function HeroStatement() {
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const ledeRef = useRef<HTMLDivElement>(null);
  const { loaderDone } = useWorldProgress();

  useEffect(() => {
    if (loaderDone) markMotionDirty();
  }, [loaderDone]);

  useEffect(() => {
    initMotionEngine();
    const l1 = line1Ref.current;
    const l2 = line2Ref.current;
    const lede = ledeRef.current;
    if (!l1 || !l2) return;

    return subscribeMotion(({ scrollY, vh }) => {
      if (!loaderDone) return;

      const hp = Math.min(1, scrollY / Math.max(vh, 1));
      const shift = Math.min(hp * 16, MAX_SHIFT_VW);
      l1.style.transform = `translate3d(${-shift}vw, 0, 0)`;
      l2.style.transform = `translate3d(${shift}vw, 0, 0)`;

      if (lede && !prefersReducedMotion()) {
        const fade = Math.min(1, scrollY / Math.max(vh * 0.42, 1));
        const opacity = 1 - fade;
        const lift = fade * 32;
        lede.style.opacity = `${opacity}`;
        lede.style.transform = `translate3d(0, ${-lift}px, 0)`;
        lede.style.pointerEvents = opacity < 0.2 ? "none" : "";
      }
    });
  }, [loaderDone]);

  return (
    <section className={`landing-hero landing-band-hero${loaderDone ? " hero-ready" : ""}`} aria-label="Introduction">
      <div className="landing-hero-glow" aria-hidden="true" />
      <ChillDoodle kind="gate" className="chill-doodle--br" />
      <div className="landing-hero-grid">
        <div className="landing-hero-copy">
          <div className="landing-hero-headline">
            <h1>
              <span ref={line1Ref} className="hero-line" style={{ ["--hero-i" as string]: 0 }}>
                Stories live
              </span>
              <span ref={line2Ref} className="hero-line" style={{ ["--hero-i" as string]: 1 }}>
                in places.
              </span>
            </h1>
          </div>
        </div>
        <p className="visually-hidden">{FLOAT_LINE}</p>
        <div className="hero-float" aria-hidden="true">
          <div className="hero-float-track">
            <span>
              {FLOAT_LINE} · {FLOAT_LINE} ·{" "}
            </span>
            <span>
              {FLOAT_LINE} · {FLOAT_LINE} ·{" "}
            </span>
          </div>
        </div>
        <div className="landing-hero-copy">
          <div className="landing-hero-row">
            <div ref={ledeRef} className="landing-hero-lede">
              <p className="landing-hero-scroll-cue" aria-hidden="true">
                <span className="landing-hero-scroll-cue-text">Scroll up</span>
                <span className="landing-hero-scroll-cue-chevron" aria-hidden="true">
                  ↑
                </span>
              </p>
            </div>
            <div className="landing-hero-actions">
              <Link to="/enquire" className="btn btn-primary">
                Plan a shoot
              </Link>
              <Link to="/studio" className="btn btn-ghost">
                Explore the studio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}