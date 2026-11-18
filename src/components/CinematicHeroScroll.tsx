import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { STUDIO, waLink } from "../data/content";

export function CinematicHeroScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let rafId: number;

    const onScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScroll = rect.height - window.innerHeight;
      if (totalScroll <= 0) return;

      const current = -rect.top;
      const p = Math.min(Math.max(current / totalScroll, 0), 1);

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setScrollProgress(p);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Text fades out fast: 100% visible at scroll 0, completely gone by scroll 0.22
  const textOpacity = Math.max(0, 1 - scrollProgress * 4.5);
  const textTranslateY = -scrollProgress * 90;

  // Gentle cinematic drift
  const scale = 1 + scrollProgress * 0.12;

  // 3 smooth drone flight stages with crossfade:
  // Stage 1 (0.00 -> 0.45): 360° Grand Aerial Establishing Overview
  // Stage 2 (0.35 -> 0.75): Royal Haveli Facade & Stone Staircase Glide
  // Stage 3 (0.70 -> 1.00): Festive Evening Gala Starlit Courtyard
  const shot1Opacity = scrollProgress < 0.45 ? 1 : Math.max(0, 1 - (scrollProgress - 0.45) * 6);
  const shot2Opacity =
    scrollProgress >= 0.35 && scrollProgress < 0.75
      ? scrollProgress < 0.5
        ? (scrollProgress - 0.35) * 6.6
        : 1 - (scrollProgress - 0.65) * 10
      : scrollProgress >= 0.5 && scrollProgress < 0.75
        ? 1
        : 0;
  const shot3Opacity = scrollProgress >= 0.7 ? Math.min(1, (scrollProgress - 0.7) * 5) : 0;

  return (
    <section ref={containerRef} className="cinematic-hero-track" aria-label="Hero estate drone scrollytelling">
      <div className="cinematic-hero-sticky">
        {/* Full-bleed drone video layer */}
        <div className="cinematic-media-wrap" style={{ transform: `scale(${scale.toFixed(3)})` }}>
          <video
            className="cinematic-video"
            src="/assets/real/hero-drone-loop.mp4"
            poster="/assets/real/hero-drone-poster.webp"
            autoPlay
            loop
            muted
            playsInline
            style={{ opacity: shot1Opacity }}
          />
          <video
            className="cinematic-video"
            src="/assets/real/flythrough-02-haveli.mp4"
            poster="/assets/real/flythrough-02-haveli.webp"
            autoPlay
            loop
            muted
            playsInline
            style={{ opacity: shot2Opacity }}
          />
          <video
            className="cinematic-video"
            src="/assets/real/flythrough-05-nightgala.mp4"
            poster="/assets/real/flythrough-05-nightgala.webp"
            autoPlay
            loop
            muted
            playsInline
            style={{ opacity: shot3Opacity }}
          />
        </div>

        {/* Soft vignette at start for text contrast — disappears entirely as user scrolls */}
        <div
          className="cinematic-vignette"
          style={{ opacity: textOpacity * 0.7 }}
          aria-hidden="true"
        />

        {/* Clean Hero Text: Fades away completely on scroll! ZERO text or overlay remains */}
        <div
          className="cinematic-hero-content"
          style={{
            opacity: textOpacity,
            transform: `translate3d(0, ${textTranslateY}px, 0)`,
            pointerEvents: textOpacity < 0.05 ? "none" : "auto",
          }}
        >
          <div className="container">
            <p className="hero-eyebrow">
              Est. {STUDIO.est} · South Delhi · 12,000+ Sq Ft Heritage Production Estate
            </p>
            <h1 className="cinematic-hero-title">
              Where heritage architecture <span className="serif-italic">meets cinematic storytelling</span>
            </h1>
            <p className="cinematic-hero-lead">
              Double-story Rajasthani haveli, carved terracotta colonnade, cobalt Moroccan arches,
              and sunlit courtyards — custom-built for fashion lookbooks, commercial films, and drone cinematography.
            </p>

            <div className="cinematic-hero-ctas">
              <Link to="/enquire" className="btn btn-primary">
                Enquire for a shoot
              </Link>
              <Link to="/work" className="btn btn-ghost" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.4)" }}>
                View Selected Work
              </Link>
              <a
                href={waLink("Hi, I'd like to plan a shoot at The Courtyard Stories.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-wa"
              >
                WhatsApp Director
              </a>
            </div>
          </div>
        </div>

        {/* Minimal scroll prompt — fades out immediately with scroll */}
        <div
          className="cinematic-scroll-indicator"
          style={{
            opacity: textOpacity,
            pointerEvents: "none",
          }}
          aria-hidden="true"
        >
          <span className="scroll-mouse-wheel" />
          <span>SCROLL TO EXPLORE ESTATE</span>
        </div>
      </div>
    </section>
  );
}
