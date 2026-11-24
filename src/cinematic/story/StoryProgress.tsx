import { useEffect, useRef } from "react";
import { CHAPTERS } from "./storyboard";
import { subscribeStory } from "./storyStore";

export function StoryProgress() {
  const bar = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    return subscribeStory((snap) => {
      if (bar.current) bar.current.style.transform = `scaleX(${snap.p})`;
      const ch = CHAPTERS[snap.chapterIndex];
      if (label.current && ch) label.current.textContent = ch.id.replaceAll("-", " ");
    });
  }, []);

  return (
    <div className="story-progress" aria-hidden="true">
      <i>
        <span ref={bar} />
      </i>
      <span ref={label}>hero</span>
    </div>
  );
}
