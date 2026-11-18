import { type CSSProperties } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Page } from "../components/Chrome";
import { FAQAccordion } from "../components/FAQ";
import { useReveal } from "../lib/hooks";
import { breadcrumbJSONLD, faqJSONLD, localBusiness, serviceJSONLD } from "../lib/schema";
import { SERVICES, STUDIO, waLink } from "../data/content";

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const s = SERVICES.find((x) => x.slug === slug);
  const reveal = useReveal<HTMLDivElement>();

  if (!s) return <Navigate to="/services" replace />;

  const others = SERVICES.filter((x) => x.slug !== s.slug);

  return (
    <Page
      title={`${s.name} in Delhi — Inclusions, Kit & FAQs · ${STUDIO.name}`}
      description={`${s.short} ${s.from} · ${s.turnaround}. Book at ${STUDIO.addressShort}.`}
      schema={[
        localBusiness(),
        serviceJSONLD(s.slug) ?? {},
        faqJSONLD(s.faqs),
        breadcrumbJSONLD([
          { name: STUDIO.name, url: "https://thecourtyard-stories.com/" },
          { name: "Services", url: "https://thecourtyard-stories.com/services" },
          { name: s.name, url: `https://thecourtyard-stories.com/services/${s.slug}` },
        ]),
      ]}
    >
      <div ref={reveal}>
        <section className="page-hero">
          <span className="ghost-num" aria-hidden="true">
            {s.index}
          </span>
          <div className="container">
            <p className="eyebrow reveal">
              Service {s.index} of 04 · <Link to="/services" style={{ textDecoration: "underline" }}>All services</Link>
            </p>
            <h1 className="h1 reveal">{s.name}</h1>
            <p className="lead reveal" style={{ marginTop: "var(--s-5)", maxWidth: "56ch" }}>
              {s.intro}
            </p>
            <div className="hero-ctas reveal">
              <Link to={`/enquire?type=${s.slug}`} className="btn btn-primary">
                Enquire for {s.name.split(" ")[0].toLowerCase()}
              </Link>
              <a
                className="btn btn-wa"
                href={waLink(`Hi — I'd like to plan a ${s.name.toLowerCase()} with The Courtyard Stories.`)}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp the desk
              </a>
            </div>
            <div className="hero-meta reveal">
              <div>
                <b>{s.from}</b>
                <span>From this floor</span>
              </div>
              <div>
                <b>{s.turnaround}</b>
                <span>Delivery</span>
              </div>
              <div>
                <b>{s.duration}</b>
                <span>On set</span>
              </div>
            </div>
            <div className="reveal" style={{ marginTop: "var(--s-7)" }}>
              <video
                src={s.video}
                poster={s.img}
                autoPlay
                loop
                muted
                playsInline
                controls
                style={{ width: "100%", maxHeight: "440px", objectFit: "cover", borderRadius: "var(--radius)", border: "1px solid var(--line-soft)" }}
              />
            </div>
          </div>
        </section>

        <section className="section" aria-label="Inclusions">
          <div className="container split">
            <div>
              <p className="eyebrow reveal">Transparent by default</p>
              <h2 className="h2 reveal">
                What's in <span className="serif-italic">the booking</span>
              </h2>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {s.inclusions.map((inc, i) => (
                <div
                  key={inc}
                  className="card reveal"
                  style={{ padding: "var(--s-4) var(--s-5)", ["--reveal-delay" as string]: `${i * 50}ms` } as CSSProperties}
                >
                  <span className="card-index">{String(i + 1).padStart(2, "0")}</span>
                  <p style={{ marginTop: 4, fontSize: "var(--t-body)", color: "var(--ink)" }}>{inc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-tight" aria-label="Equipment">
          <div className="container">
            <div className="reveal" style={{ marginBottom: "var(--s-6)" }}>
              <p className="eyebrow">On the floor</p>
              <h2 className="h2">
                The kit <span className="serif-italic">that runs this</span>
              </h2>
            </div>
            <div className="card-grid">
              {s.equipment.map((eq, i) => (
                <div
                  key={eq}
                  className="card reveal"
                  style={{ padding: "var(--s-5)", ["--reveal-delay" as string]: `${i * 60}ms` } as CSSProperties}
                >
                  <span className="card-index">{String(i + 1).padStart(2, "0")}</span>
                  <p style={{ marginTop: "var(--s-3)", color: "var(--ink)", fontSize: "var(--t-small)", lineHeight: 1.6 }}>{eq}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" aria-label="Local FAQs">
          <div className="container" style={{ maxWidth: "820px" }}>
            <FAQAccordion faqs={s.faqs} title={`Before you book ${s.name.split(" ")[0].toLowerCase()}`} />
          </div>
        </section>

        <section className="section-tight" aria-label="Other services">
          <div className="container">
            <div className="card-grid">
              {others.map((o) => (
                <div key={o.slug} className="card">
                  <span className="card-index">{o.index}</span>
                  <h3 className="h3">{o.name}</h3>
                  <p style={{ fontSize: "var(--t-small)" }}>{o.short}</p>
                  <div style={{ marginTop: "var(--s-4)" }}>
                    <Link to={`/services/${o.slug}`} className="link-arrow">
                      See inclusions →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Page>
  );
}
