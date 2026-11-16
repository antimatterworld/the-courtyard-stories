import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import { CATEGORIES, PORTFOLIO, type PortfolioItem } from "../data/content";
import { StudioImage } from "./StudioImage";

/* ————————————————————————————————————————————
   Filterable masonry portfolio.
   · declared aspect-ratios → zero layout shift
   · reels show a hover scrub bar (visual placeholder,
     media file swaps in via partner-asset-manifest)
   · lightbox modal with full metadata
   ———————————————————————————————————————————————— */

export function WorkGallery({ embedded = false }: { embedded?: boolean }) {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]["key"]>("all");
  const [open, setOpen] = useState<PortfolioItem | null>(null);

  const items = useMemo(
    () => (filter === "all" ? PORTFOLIO : PORTFOLIO.filter((p) => p.category === filter)),
    [filter],
  );

  return (
    <section className={embedded ? "" : "section"} id="work">
      <div className="container">
        {!embedded && (
          <div className="reveal" style={{ marginBottom: "var(--s-8)", display: "flex", flexWrap: "wrap", alignItems: "end", justifyContent: "space-between", gap: "var(--s-5)" }}>
            <div>
              <p className="eyebrow reveal">Selected work</p>
              <h2 className="h1 reveal">A year of frames, <span className="serif-italic">unrolled</span></h2>
            </div>
            <p className="muted reveal" style={{ maxWidth: "34ch", fontSize: "var(--t-small)" }}>
              Stills and reels from the studio floor. Filter by craft — every project was shot
              on our own cyclorama or in production across Delhi NCR.
            </p>
          </div>
        )}

        <div className="reveal" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: "var(--s-7)" }} role="group" aria-label="Filter work by category">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              className={`chip ${filter === c.key ? "active" : ""}`}
              onClick={() => setFilter(c.key)}
              aria-pressed={filter === c.key}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="masonry" style={embedded ? { columns: 2 } : undefined}>
          {items.map((item, i) => (
            <WorkItem key={item.id} item={item} index={i} onOpen={() => setOpen(item)} />
          ))}
        </div>

        {items.length === 0 && (
          <p className="muted">Nothing in this shelf yet — the archive is being scanned.</p>
        )}
      </div>

      {open && <WorkLightbox item={open} onClose={() => setOpen(null)} />}
    </section>
  );
}

function WorkItem({ item, index, onOpen }: { item: PortfolioItem; index: number; onOpen: () => void }) {
  const media = (
    <div className="masonry-media" style={{ aspectRatio: item.aspect }}>
      <StudioImage
        className="plate-fill"
        src={item.img}
        alt=""
        motif={item.motif}
        eager={index < 2}
      />
      <span className="masonry-type">
        {item.type === "Reel" ? "● Reel" : "Frame"} {item.year}
      </span>
      {item.type === "Reel" && (
        <div className="video-scrub" aria-hidden="true">
          <span>00:00 / 0:15</span>
          <span className="vbar"><i style={{ ["--v" as string]: "0.35" } as CSSProperties} /></span>
          <span>Reel</span>
        </div>
      )}
    </div>
  );

  return (
    <figure
      className="masonry-item reveal"
      style={{ margin: 0, ["--reveal-delay" as string]: `${(index % 4) * 70}ms` } as CSSProperties}
    >
      <button
        onClick={onOpen}
        style={{ border: "none", padding: 0, background: "none", cursor: "zoom-in", width: "100%", textAlign: "left" }}
        aria-label={`Open ${item.title}`}
      >
        {media}
      </button>
      <figcaption className="masonry-cap">
        <b>{item.title}</b>
        <span>{item.credit}</span>
      </figcaption>
    </figure>
  );
}

function WorkLightbox({ item, onClose }: { item: PortfolioItem; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [onClose]);

  const [progress, setProgress] = useState(0);
  const isReel = item.type === "Reel";

  // reel scrub loop: advances the visual scrub bar while open
  useEffect(() => {
    if (!isReel) return;
    let raf = 0;
    const start = performance.now();
    const loop = () => {
      const t = ((performance.now() - start) % 15000) / 15000;
      setProgress(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isReel]);

  const stop = useCallback(
    (e: ReactMouseEvent) => e.stopPropagation(),
    [],
  );

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={item.title}>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-panel" onClick={stop}>
        <div className="modal-media">
          <StudioImage className="plate-fill" src={item.img} alt={item.title} motif={item.motif} eager />
          {isReel && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 6,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(20,17,13,.7)",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.14em",
                color: "#f4efe7",
              }}
              aria-hidden="true"
            >
              <span style={{ opacity: 0.7 }}>▸ PREVIEW LOOP</span>
              <span style={{ flex: 1, height: 2, background: "rgba(244,239,231,.25)", overflow: "hidden" }}>
                <span
                  style={{
                    position: "relative",
                    display: "block",
                    height: "100%",
                    width: "100%",
                    transform: `scaleX(${progress})`,
                    transformOrigin: "left",
                    background: "var(--accent)",
                  }}
                />
              </span>
              <span>{String(Math.floor((progress * 15) / 60)).padStart(2, "0")}:{String(Math.floor(progress * 15) % 60).padStart(2, "0")}</span>
            </div>
          )}
        </div>
        <div className="modal-info">
          <span className="eyebrow">{item.credit}</span>
          <h3 className="h3">{item.title}</h3>
          <p className="muted" style={{ lineHeight: 1.7, fontSize: "var(--t-small)" }}>{item.blurb}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s-4)", marginTop: "auto", paddingTop: "var(--s-4)", borderTop: "1px solid var(--line-soft)" }}>
            <div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-faint)" }}>Craft</span>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", textTransform: "capitalize" }}>{item.category}</div>
            </div>
            <div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-faint)" }}>Year</span>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>{item.year}</div>
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={onClose}>
            Close
          </button>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close details">
          ✕
        </button>
      </div>
    </div>
  );
}
