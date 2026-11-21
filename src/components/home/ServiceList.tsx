import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { SERVICES } from "../../data/content";
import { SectionDoodle } from "./SectionDoodle";
import { ChillDoodle } from "./ChillDoodle";

const ROWS = [
  { label: "Fashion", slug: "fashion", to: "/services/fashion" },
  { label: "Commercial", slug: "commercial", to: "/services/commercial" },
  { label: "Studio", slug: "studio", to: "/services/studio" },
  { label: "Events", slug: "events", to: "/services/events" },
] as const;

export function ServiceList() {
  const [active, setActive] = useState<(typeof ROWS)[number]["slug"]>(ROWS[0].slug);
  const current = SERVICES.find((s) => s.slug === active) ?? SERVICES[0]!;

  return (
    <section className="landing-services landing-band-services" aria-label="Services">
      <ChillDoodle kind="clapper" className="chill-doodle--bl" />
      <ServicesShell preview={current.img} previewAlt={current.name} caption={current.name}>
        <h2 className="section-pointer">
          <SectionDoodle kind="sun" />
          What we shoot
        </h2>
        <ul>
          {ROWS.map((row) => {
            const svc = SERVICES.find((s) => s.slug === row.slug);
            return (
              <li key={row.label}>
                <Link
                  to={row.to}
                  className={active === row.slug ? "is-active" : undefined}
                  onMouseEnter={() => setActive(row.slug)}
                  onFocus={() => setActive(row.slug)}
                >
                  <img
                    className="landing-services-thumb"
                    src={svc?.img ?? current.img}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="landing-services-label">{row.label}</span>
                  <span className="landing-services-tagline">{svc?.short.slice(0, 72) ?? ""}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </ServicesShell>
    </section>
  );
}

function ServicesShell({
  children,
  preview,
  previewAlt,
  caption,
}: {
  children: ReactNode;
  preview: string;
  previewAlt: string;
  caption: string;
}) {
  return (
    <div className="landing-services-layout">
      <div className="landing-services-list">{children}</div>
      <div className="landing-services-sticky">
        <img key={preview} src={preview} alt={previewAlt} loading="lazy" decoding="async" />
        <p className="landing-feature-caption">{caption}</p>
      </div>
    </div>
  );
}