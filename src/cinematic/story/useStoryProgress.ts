import { useEffect, type RefObject } from "react";
import { cameraProgress, chapterIndexAt } from "./storyboard";
import { getStory, setStory } from "./storyStore";

/** Maps native scroll across the track to 0–1. No damping, no pointer offset. */
export function useStoryProgress(trackRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    const read = () => {
      frame = 0;
      const rect = track.getBoundingClientRect();
      const total = Math.max(1, track.offsetHeight - window.innerHeight);
      const scrolled = Math.min(total, Math.max(0, -rect.top));
      const p = cameraProgress(scrolled / total);
      const prev = getStory();
      const chapterIndex = chapterIndexAt(p);
      const direction = p > prev.p + 0.0005 ? 1 : p < prev.p - 0.0005 ? -1 : prev.direction;
      setStory({ p, chapterIndex, direction });
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [trackRef]);
}
