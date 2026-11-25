import { useRef, type PointerEvent } from "react";
import { PORTFOLIO, type PortfolioItem } from "../../data/content";

function ShootCard({ item }: { item: PortfolioItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Hover belongs to a mouse. A finger is handled by the row, as a tap.
  const hover = (event: PointerEvent<HTMLElement>, entering: boolean) => {
    if (event.pointerType !== "mouse") return;
    const video = videoRef.current;
    if (!video) return;
    if (entering) void video.play().catch(() => {});
    else video.pause();
  };

  return (
    <article
      className="recent-shoot-card"
      onPointerEnter={(event) => hover(event, true)}
      onPointerLeave={(event) => hover(event, false)}
    >
      <div className="recent-shoot-frame">
        {item.video ? (
          <video ref={videoRef} src={item.video} poster={item.img} muted playsInline loop preload="none" />
        ) : (
          <img src={item.img} alt="" />
        )}
      </div>
      <p>
        {item.title}
        <span>
          {item.type} · {item.year}
        </span>
      </p>
    </article>
  );
}

const EXTRA_SHOOTS: PortfolioItem[] = [
  {
    id: "fashion-editorial-reel",
    title: "Fashion Editorial",
    category: "fashion",
    type: "Reel",
    year: "2026",
    credit: "Couture lookbook · 4K",
    blurb: "Styled fashion looks shot across the estate for lookbooks and campaign stills.",
    aspect: "4/5",
    img: "/assets/real/fashion-still.webp",
    video: "/assets/real/fashion-reel.mp4",
    motif: "fashion",
  },
  {
    id: "brand-film-reel",
    title: "Brand Film",
    category: "commercial",
    type: "Reel",
    year: "2026",
    credit: "Cinematic brand film",
    blurb: "A broadcast-style brand film moving through the courtyards.",
    aspect: "4/5",
    img: "/assets/real/commercial-still.webp",
    video: "/assets/real/commercial-reel.mp4",
    motif: "commercial",
  },
];

export function RecentShoots() {
  const unique = [...PORTFOLIO, ...EXTRA_SHOOTS];
  const loop = [...unique, ...unique];
  const viewport = useRef<HTMLDivElement>(null);
  const byTouch = useRef(false);
  const watching = useRef<HTMLVideoElement | null>(null);

  /**
   * Touch has no hover, so a tap stands in for it: the row holds still and that
   * film plays. Tapping it again, or tapping the row elsewhere, lets the row go.
   * A scroll that starts on the row is not a tap and changes nothing.
   */
  const tap = (target: EventTarget) => {
    const card = target instanceof Element ? target.closest(".recent-shoot-card") : null;
    const video = card?.querySelector("video") ?? null;
    const previous = watching.current;
    previous?.pause();
    if (!video || video === previous) {
      watching.current = null;
      viewport.current?.classList.remove("is-held");
      return;
    }
    watching.current = video;
    void video.play().catch(() => {});
    viewport.current?.classList.add("is-held");
  };

  return (
    <section className="recent-shoots" aria-label="Recent shoots">
      <h2>Recent shoots</h2>
      <div
        ref={viewport}
        className="recent-shoots-viewport"
        onPointerDown={(event) => {
          byTouch.current = event.pointerType !== "mouse";
        }}
        onClick={(event) => {
          if (byTouch.current) tap(event.target);
        }}
      >
        <div className="recent-shoots-track">
          {loop.map((item, index) => (
            <ShootCard key={`${item.id}-${index}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
