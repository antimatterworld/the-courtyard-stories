import { useRef } from "react";
import { PORTFOLIO, type PortfolioItem } from "../../data/content";

function ShootCard({ item }: { item: PortfolioItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const play = () => {
    const video = videoRef.current;
    if (!video) return;
    void video.play().catch(() => {});
  };

  const stop = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
  };

  return (
    <article className="recent-shoot-card" onMouseEnter={play} onMouseLeave={stop} onFocus={play} onBlur={stop}>
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
  return (
    <section className="recent-shoots" aria-label="Recent shoots">
      <h2>Recent shoots</h2>
      <div className="recent-shoots-viewport">
        <div className="recent-shoots-track">
          {loop.map((item, index) => (
            <ShootCard key={`${item.id}-${index}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
