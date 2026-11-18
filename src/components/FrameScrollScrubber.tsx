import { useEffect, useRef, useState } from "react";
import { FRAME_COUNT, getFramePath } from "../lib/frames";

interface StoryBeat {
  id: string;
  start: number;
  end: number;
  tag: string;
  step: string;
  title: string;
  sub: string;
}

const STORY_BEATS: StoryBeat[] = [
  {
    id: "beat-estate",
    start: 0.0,
    end: 0.22,
    tag: "THE ESTATE · SOUTH DELHI",
    step: "01 / 04",
    title: "12,000+ Square Feet of Heritage Architecture",
    sub: "Secluded outdoor production enclave custom-sculpted for haute couture lookbooks, period commercials, and cinematic campaigns.",
  },
  {
    id: "beat-haveli",
    start: 0.25,
    end: 0.46,
    tag: "ZONE 01 · ROYAL PALACE",
    step: "02 / 04",
    title: "Double-Story Ochre Haveli & Jharokhas",
    sub: "Authentic Rajasthani stone facade, carved floral portals, woven charpai patio, and grand exterior stone staircase.",
  },
  {
    id: "beat-colonnade",
    start: 0.49,
    end: 0.70,
    tag: "ZONE 02 · MUGHAL COLONNADE",
    step: "03 / 04",
    title: "Carved Terracotta Geometric Jalis",
    sub: "Full-height screens casting hypnotic architectural lace shadows across stone verandas under the Delhi sun.",
  },
  {
    id: "beat-airspace",
    start: 0.73,
    end: 0.88,
    tag: "PRODUCTION SPEC · AIRSPACE",
    step: "04 / 04",
    title: "Unrestricted 360° Drone Flight Clearance",
    sub: "Open-sky flight clearance for dynamic tracking passes, crane shots, and silent gen-set power tie-ins.",
  },
];

export function FrameScrollScrubber() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);

  // References for animation state without re-triggering renders
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const lastDrawnFrameRef = useRef(-1);

  // 1. Preload all frame images progressively
  useEffect(() => {
    const images: (HTMLImageElement | null)[] = new Array(FRAME_COUNT).fill(null);
    imagesRef.current = images;

    let mounted = true;

    // Load Frame 0 first so the canvas paints immediately
    const firstImg = new Image();
    firstImg.src = getFramePath(0);
    firstImg.onload = () => {
      if (!mounted) return;
      images[0] = firstImg;
      drawFrame(0);

      // Now load the rest of the frames in the background
      for (let i = 1; i < FRAME_COUNT; i++) {
        const img = new Image();
        img.src = getFramePath(i);
        img.onload = () => {
          if (!mounted) return;
          images[i] = img;
        };
      }
    };

    return () => {
      mounted = false;
    };
  }, []);

  // 2. High-performance Canvas Render
  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const images = imagesRef.current;
    let img = images[frameIndex];

    // Fallback: If target frame isn't loaded yet, find nearest loaded frame
    if (!img) {
      for (let offset = 1; offset < FRAME_COUNT; offset++) {
        if (frameIndex - offset >= 0 && images[frameIndex - offset]) {
          img = images[frameIndex - offset];
          break;
        }
        if (frameIndex + offset < FRAME_COUNT && images[frameIndex + offset]) {
          img = images[frameIndex + offset];
          break;
        }
      }
    }

    if (!img) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth || 1280;
    const ih = img.naturalHeight || 720;

    // object-fit: cover math
    const hRatio = cw / iw;
    const vRatio = ch / ih;
    const ratio = Math.max(hRatio, vRatio);

    const nw = iw * ratio;
    const nh = ih * ratio;
    const cx = (cw - nw) / 2;
    const cy = (ch - nh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, 0, 0, iw, ih, cx, cy, nw, nh);
    lastDrawnFrameRef.current = frameIndex;
  };

  // 3. Canvas resize handler for sharp Retina displays
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);

      // Redraw current frame
      if (lastDrawnFrameRef.current >= 0) {
        drawFrame(lastDrawnFrameRef.current);
      } else {
        drawFrame(0);
      }
    };

    window.addEventListener("resize", updateCanvasSize);
    updateCanvasSize();
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  // 4. Scroll tracking with lerp loop for Apple-smooth momentum
  useEffect(() => {
    let rafId: number;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScroll = rect.height - window.innerHeight;
      if (totalScroll <= 0) return;

      const currentScroll = -rect.top;
      const rawProgress = Math.min(Math.max(currentScroll / totalScroll, 0), 1);
      targetProgressRef.current = rawProgress;
    };

    const tick = () => {
      const target = targetProgressRef.current;
      const current = currentProgressRef.current;

      // Smooth lerp (0.16 interpolation rate for weighted luxurious feel)
      const nextProgress = current + (target - current) * 0.16;
      currentProgressRef.current = nextProgress;

      if (Math.abs(target - current) > 0.0005) {
        setProgress(nextProgress);
      }

      const frameIndex = Math.min(
        FRAME_COUNT - 1,
        Math.max(0, Math.floor(nextProgress * FRAME_COUNT))
      );

      if (frameIndex !== lastDrawnFrameRef.current) {
        drawFrame(frameIndex);
      }

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Helper to compute text opacity & translateY for each story beat
  const getBeatState = (beat: StoryBeat) => {
    const p = progress;
    if (p < beat.start || p > beat.end) {
      return { opacity: 0, translateY: 16, active: false };
    }

    const fadeDur = 0.035;
    let opacity = 1;
    let translateY = 0;

    if (p < beat.start + fadeDur) {
      // Smooth fade in
      const t = (p - beat.start) / fadeDur;
      opacity = t;
      translateY = (1 - t) * 16;
    } else if (p > beat.end - fadeDur) {
      // Smooth fade out
      const t = (beat.end - p) / fadeDur;
      opacity = t;
      translateY = (1 - t) * -16;
    }

    return { opacity, translateY, active: opacity > 0.05 };
  };

  return (
    <section
      ref={containerRef}
      className="frame-scrub-container"
      aria-label="Scroll-driven drone architectural flight"
    >
      <div className="frame-scrub-sticky">
        {/* High-definition frame canvas */}
        <canvas ref={canvasRef} className="frame-scrub-canvas" />

        {/* Minimalist right-aligned story text (zero overlays, zero boxes) */}
        <div className="frame-scrub-text-stage">
          {STORY_BEATS.map((beat) => {
            const state = getBeatState(beat);
            return (
              <div
                key={beat.id}
                className="frame-minimal-text"
                style={{
                  opacity: state.opacity,
                  transform: `translate3d(0, ${state.translateY}px, 0)`,
                  pointerEvents: state.active ? "auto" : "none",
                  visibility: state.opacity > 0.01 ? "visible" : "hidden",
                }}
              >
                <div className="minimal-text-meta">
                  <span className="minimal-text-tag">{beat.tag}</span>
                  <span className="minimal-text-sep">·</span>
                  <span className="minimal-text-step">{beat.step}</span>
                </div>
                <h2 className="minimal-text-headline">{beat.title}</h2>
                <p className="minimal-text-sub">{beat.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Scroll cue (visible only at the very top, fades out quickly) */}
        <div
          className="frame-scrub-hint"
          style={{
            opacity: Math.max(0, 1 - progress * 12),
            pointerEvents: "none",
          }}
          aria-hidden="true"
        >
          <span className="scroll-arrow-down" />
          <span>SCROLL TO EXPLORE ESTATE</span>
        </div>
      </div>
    </section>
  );
}
