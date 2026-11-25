import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { SERVICES } from "../../data/content";
import { SectionDoodle } from "./SectionDoodle";

const ROWS = [
  { label: "Fashion", slug: "fashion", to: "/services/fashion" },
  { label: "Commercial", slug: "commercial", to: "/services/commercial" },
  { label: "Studio", slug: "studio", to: "/services/studio" },
  { label: "Events", slug: "events", to: "/services/events" },
] as const;

type Slug = (typeof ROWS)[number]["slug"];

export function ServiceList() {
  const [active, setActive] = useState<Slug>(ROWS[0].slug);
  const [paused, setPaused] = useState(false);
  // A finger has no hover: the first tap on a closed still opens it, the next one follows the link.
  const tapOpens = useRef(false);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setActive((current) => {
        const index = ROWS.findIndex((row) => row.slug === current);
        return ROWS[(index + 1) % ROWS.length]!.slug;
      });
    }, 4600);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section className="shoot-accordion landing-band-services" aria-label="What we shoot">
      <h2 className="section-pointer">
        <SectionDoodle kind="sun" />
        What we shoot
      </h2>
      <div
        className="shoot-accordion-row"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {ROWS.map((row, index) => {
          const service = SERVICES.find((item) => item.slug === row.slug) ?? SERVICES[0]!;
          const open = active === row.slug;
          return (
            <Link
              key={row.slug}
              to={row.to}
              className={open ? "is-open" : undefined}
              aria-expanded={open}
              onPointerDown={(event) => {
                tapOpens.current = event.pointerType !== "mouse" && !open;
              }}
              onClick={(event) => {
                if (!tapOpens.current) return;
                tapOpens.current = false;
                event.preventDefault();
                setPaused(true);
                setActive(row.slug);
              }}
              onMouseEnter={() => setActive(row.slug)}
              onFocus={() => {
                setPaused(true);
                setActive(row.slug);
              }}
              onBlur={() => setPaused(false)}
            >
              {open && service.video ? (
                <video src={service.video} poster={service.img} muted autoPlay playsInline loop />
              ) : (
                <img src={service.img} alt="" />
              )}
              <span className="shoot-veil" />
              <span className="shoot-spine">
                <i>0{index + 1}</i>
                {row.label}
              </span>
              <span className="shoot-copy">
                <strong>{row.label}</strong>
                <em>{service.short}</em>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
