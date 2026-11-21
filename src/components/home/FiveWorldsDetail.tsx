import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { ArchitecturalSet } from "../../data/content";

type Props = {
  set: ArchitecturalSet;
  onClose: () => void;
};

function titleOf(set: ArchitecturalSet) {
  return set.name.split("·")[0]?.trim() ?? set.name;
}

export function FiveWorldsDetail({ set, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      void v.play().catch(() => undefined);
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      v?.pause();
    };
  }, [onClose, set.id]);

  return (
    <div className="fw-detail" role="dialog" aria-modal="true" aria-labelledby="fw-detail-title">
      <button ref={closeRef} type="button" className="fw-detail-close" onClick={onClose} aria-label="Close">
        ×
      </button>
      <div className="fw-detail-sheet">
        <div className="fw-detail-media">
          <video
            ref={videoRef}
            src={set.video}
            poster={set.img}
            muted
            loop
            playsInline
            autoPlay
          />
        </div>
        <div className="fw-detail-copy">
          <p className="fw-detail-tag" style={{ color: set.palette.accent }}>
            {set.tag}
          </p>
          <h2 id="fw-detail-title">{titleOf(set)}</h2>
          <p className="fw-detail-desc">{set.description}</p>
          <h3>On the set</h3>
          <ul>
            {set.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <h3>Best for</h3>
          <p>{set.bestFor.join(" · ")}</p>
          <h3>Light</h3>
          <p>{set.lighting}</p>
          <Link to={`/enquire?set=${set.id}`} className="btn btn-primary">
            Enquire about this set
          </Link>
        </div>
      </div>
    </div>
  );
}