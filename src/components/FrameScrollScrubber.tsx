import { useEffect, useRef, useState } from "react";
import { FRAME_COUNT, getFramePath } from "../lib/frames";

interface StoryBeat {
  id: string;
  start: number;
  end: number;
  align: "right" | "left";
  title: string;
}

const STORY_BEATS: StoryBeat[] = [
  {
    id: "beat-heritage",
    start: 0.0,
    end: 0.22,
    align: "right",
    title: "Where Heritage Architecture Meets Cinematic Space",
  },
  {
    id: "beat-light",
    start: 0.25,
    end: 0.46,
    align: "left",
    title: "Carved Jharokhas, Terracotta Jalis & Sandstone Verandas",
  },
  {
    id: "beat-airspace",
    start: 0.49,
    end: 0.70,
    align: "right",
    title: "Unrestricted 360° Drone Flight Airspace",
  },
  {
    id: "beat-estate",
    start: 0.73,
    end: 0.88,
    align: "left",
    title: "Five Contiguous Worlds on One Private Estate",
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

  // 1. Preload and pre-decode all frame images progressively for 0ms jank
  useEffect(() => {
    const images: (HTMLImageElement | null)[] = new Array(FRAME_COUNT).fill(null);
    imagesRef.current = images;

    let mounted = true;

    // Load Frame 0 first so the canvas paints immediately
    const firstImg = new Image();
    firstImg.src = getFramePath(0);
    const onFirstLoad = () => {
      if (!mounted) return;
      images[0] = firstImg;
      drawFrame(0);

      // Preload & pre-decode rest of frames off the main thread
      for (let i = 1; i < FRAME_COUNT; i++) {
        const img = new Image();
        img.src = getFramePath(i);
        img.decode()
          .then(() => {
            if (!mounted) return;
            images[i] = img;
          })
          .catch(() => {
            if (!mounted) return;
            images[i] = img;
          });
      }
    };

    firstImg.decode().then(onFirstLoad).catch(() => {
      firstImg.onload = onFirstLoad;
    });

    return () => {
      mounted = false;
    };
  }, []);

  // 2. High-performance Direct Canvas Render (1920x1080 native 1:1 hardware blit)
  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
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

    // Fast 1:1 hardware blit directly onto 1920x1080 canvas (zero CPU scaling overhead)
    ctx.drawImage(img, 0, 0, 1920, 1080);
    lastDrawnFrameRef.current = frameIndex;
  };

  // 3. Canvas setup: fixed 1920x1080 native internal buffer, CSS object-fit scales via GPU
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 1920;
    canvas.height = 1080;
    drawFrame(0);
  }, []);

  // 4. Snappy responsive scroll tracking (0.45 lerp for instant feel without lag)
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
      const diff = target - current;

      // Snappy 0.45 lerp: immediate response to wheel/scroll, zero sluggish drag
      const nextProgress = current + diff * 0.45;
      currentProgressRef.current = nextProgress;

      // Throttled state update for high performance
      if (Math.abs(nextProgress - progress) > 0.003) {
        setProgress(nextProgress);
      }

      const frameIndex = Math.min(
        FRAME_COUNT - 1,
        Math.max(0, Math.round(nextProgress * (FRAME_COUNT - 1)))
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

        {/* Minimalist alternating heading-only text (NO containers, NO subheadings) */}
        <div className="frame-scrub-text-stage">
          {STORY_BEATS.map((beat) => {
            const state = getBeatState(beat);
            return (
              <div
                key={beat.id}
                className={`frame-pure-heading-wrap align-${beat.align}`}
                style={{
                  opacity: state.opacity,
                  transform: `translate3d(0, ${state.translateY}px, 0)`,
                  pointerEvents: state.active ? "auto" : "none",
                  visibility: state.opacity > 0.01 ? "visible" : "hidden",
                }}
              >
                <h2 className="scrub-pure-heading">{beat.title}</h2>
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
