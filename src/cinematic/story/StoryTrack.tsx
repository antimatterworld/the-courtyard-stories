import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { HeroStatement } from "../../components/home/HeroStatement";
import { ARCHITECTURAL_SETS, type ArchitecturalSet } from "../../data/content";
import { CHAPTERS } from "./storyboard";
import { getStory, subscribeStory } from "./storyStore";
import { debugStats } from "../scene/debugStats";
import { StoryCanvas } from "../scene/StoryCanvas";
import { useStoryProgress } from "./useStoryProgress";

function ZoneReveal({ set, onClose }: { set: ArchitecturalSet; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [showFilm, setShowFilm] = useState(false);

  useEffect(() => {
    closeRef.current?.focus();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setShowFilm(true), reduce ? 0 : 700);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, set.id]);

  return (
    <div className="zone-reveal" role="dialog" aria-modal="true" aria-labelledby="zone-reveal-title">
      <button type="button" className="zone-reveal-backdrop" aria-label="Close the set" onClick={onClose} />
      <article className="zone-reveal-card">
        <div className="zone-reveal-stage">
          <img src={set.img} alt="" />
          <video className={showFilm ? "is-on" : ""} src={set.video} poster={set.img} muted autoPlay playsInline loop />
        </div>
        <div className="zone-reveal-copy">
          <p className="zone-reveal-tag">{set.tag}</p>
          <h2 id="zone-reveal-title">{set.name}</h2>
          <p>{set.description}</p>
          <ul>
            {set.features.slice(0, 3).map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          <div className="zone-reveal-actions">
            <Link to="/enquire">Plan a shoot</Link>
            <button ref={closeRef} type="button" onClick={onClose}>
              Back to the map
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

function debugFlags() {
  const value = new URLSearchParams(window.location.search).get("debug") ?? "";
  return { cam: value.split(",").includes("cam"), boxes: value.split(",").includes("boxes") };
}

const ZONE_DOCK = [
  ["royal-haveli", "Haveli"],
  ["mughal-colonnade", "Mughal"],
  ["chefchaouen-suite", "Chefchaouen"],
  ["rustic-village", "Thatch"],
  ["night-gala", "Gala"],
] as const;

export function StoryTrack() {
  const trackRef = useRef<HTMLElement>(null);
  const debug = useRef(debugFlags());
  const hud = useRef<HTMLPreElement>(null);
  const chapters = useRef<Array<HTMLElement | null>>([]);
  const [portal, setPortal] = useState<HTMLDivElement | null>(null);
  const [openZoneId, setOpenZoneId] = useState<string | null>(null);
  const [returnTick, setReturnTick] = useState(0);
  const flyTo = useRef<(id: string) => void>(() => {});
  const openZone = useCallback((id: string) => flyTo.current(id), []);
  const closeZone = useCallback(() => {
    setOpenZoneId(null);
    setReturnTick((tick) => tick + 1);
  }, []);
  const revealed = ARCHITECTURAL_SETS.find((item) => item.id === openZoneId);
  useStoryProgress(trackRef);

  useEffect(() => {
    const apply = (snap: { p: number; chapterIndex: number }) => {
      chapters.current.forEach((el, index) => {
        if (!el) return;
        const chapter = CHAPTERS[index];
        const span = Math.max(0.04, chapter.to - chapter.from);
        const fade = Math.min(0.045, span * 0.45);
        let opacity = 0;
        if (snap.p >= chapter.from && snap.p < chapter.to) {
          if (chapter.kind === "hero") {
            opacity = snap.p < chapter.to - fade ? 1 : (chapter.to - snap.p) / fade;
          } else {
            const into = Math.min(1, (snap.p - chapter.from) / fade);
            const out = Math.min(1, (chapter.to - snap.p) / fade);
            opacity = Math.min(into, out);
          }
        }
        const on = opacity > 0.35;
        el.style.opacity = opacity.toFixed(3);
        el.style.visibility = opacity > 0.02 ? "visible" : "hidden";
        el.classList.toggle("is-active", on);
        el.toggleAttribute("aria-hidden", !on);
        el.querySelectorAll("video").forEach((video) => {
          if (on) void video.play().catch(() => {});
          else video.pause();
        });
      });
      const covering = chapters.current.some((el, index) => {
        const kind = CHAPTERS[index]?.kind;
        if (!el || (kind !== "set" && kind !== "shoots" && kind !== "statement")) return false;
        return Number(el.style.opacity) > 0.25;
      });
      document.querySelectorAll<HTMLElement>(".zone-label-wrap").forEach((label) => {
        label.style.visibility = covering ? "hidden" : "";
      });
      if (!debug.current.cam || !hud.current) return;
      const chapter = CHAPTERS[snap.chapterIndex];
      hud.current.textContent = [
        `p ${snap.p.toFixed(3)}`,
        `chapter ${chapter?.id ?? ""}`,
        `pos ${debugStats.pos.map((n) => n.toFixed(2)).join(" ")}`,
        `quat ${debugStats.quat.map((n) => n.toFixed(3)).join(" ")}`,
        `fov ${debugStats.fov.toFixed(1)}`,
        `canvas ${debugStats.canvas.join(" x ")}`,
        `meshes ${debugStats.meshes}`,
        `draws ${debugStats.calls}`,
      ].join("\n");
    };
    const stop = subscribeStory(apply);
    apply(getStory());
    return stop;
  }, []);

  return (
    <section ref={trackRef} className="story-track" aria-label="Studio journey">
      <div className="story-stage" ref={setPortal}>
        <StoryCanvas
          showWorldBounds={debug.current.boxes}
          portal={portal}
          flyTo={flyTo}
          returnTick={returnTick}
          onArrived={setOpenZoneId}
          activeId={openZoneId}
        />
        <nav className="zone-dock" aria-label="Zones">
          {ZONE_DOCK.map(([id, label]) => (
            <button key={id} type="button" className={openZoneId === id ? "is-on" : ""} onClick={() => openZone(id)}>
              {label}
            </button>
          ))}
        </nav>
        {revealed ? <ZoneReveal key={revealed.id} set={revealed} onClose={closeZone} /> : null}
        {debug.current.cam ? <pre className="story-debug" ref={hud} /> : null}
        {CHAPTERS.map((chapter, index) => (
            <section
              key={chapter.id}
              ref={(node) => {
                chapters.current[index] = node;
              }}
              className={index === 0 ? "story-chapter is-active" : "story-chapter"}
              aria-hidden={index === 0 ? undefined : true}
              data-kind={chapter.kind}
            >
              {chapter.kind === "hero" ? <HeroStatement pinned /> : null}
            </section>
          ))}
      </div>
      <p className="visually-hidden">Studio journey chapters</p>
    </section>
  );
}
