import { type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Page } from "../components/Chrome";
import { LazyViewportVideo } from "../components/LazyViewportVideo";
import { StudioImage } from "../components/StudioImage";
import { useReveal } from "../lib/hooks";
import { faqJSONLD, localBusiness, servicesListJSONLD } from "../lib/schema";
import { SERVICES, SITE_FAQS, STUDIO } from "../data/content";

export default function ServicesHub() {
  const reveal = useReveal<HTMLDivElement>();

  return (
    <Page
      title="Services — Fashion, Commercial, Product & Podcast · The Courtyard Stories, Delhi"
      description={`Transparent inclusions for fashion editorials, commercial campaigns, product cinematography and podcast production at The Courtyard Stories, ${STUDIO.addressShort}.`}
      schema={[localBusiness(), servicesListJSONLD(), faqJSONLD(SITE_FAQS.slice(0, 4))]}
    >
      <div ref={reveal}>
        <section className="page-hero">
          <span className="ghost-num" aria-hidden="true">
            04
          </span>
          <div className="container">
            <p className="eyebrow reveal">The services shelf</p>
            <h1 className="h1 reveal">
              Four ways into the courtyard, <span className="serif-italic">each with its own kit</span>
            </h1>
            <p className="lead reveal" style={{ marginTop: "var(--s-5)", maxWidth: "52ch" }}>
              What's in every booking, what the floor looks like, and what the finished
              files look like — stated up front so a quote is a confirmation, not a
              negotiation.
            </p>
            <div className="hero-ctas reveal">
              <Link to="/enquire" className="btn btn-primary">
                Start with a shoot type
              </Link>
              <Link to="/work" className="btn btn-ghost">
                See the finished work
              </Link>
            </div>
          </div>
        </section>

        {SERVICES.map((s, i) => (
          <section key={s.slug} className={`section ${i % 2 ? "studio-band" : ""}`} aria-label={s.name}>
            <div className="container split split-rev">
              <div className="split-media reveal">
                <StudioImage
                  className="plate-media"
                  src={s.img}
                  alt={`${s.name} at The Courtyard Stories`}
                  motif={s.motif}
                  eager={i === 0}
                  tag={`Craft ${s.index} of 04`}
                />
                <LazyViewportVideo
                  className="plate-video is-active"
                  src={s.video}
                  poster={s.img}
                />
              </div>
              <div>
                <p className="eyebrow reveal">
                  {s.index} · {s.turnaround}
                </p>
                <h2 className="h2 reveal">{s.name}</h2>
                <p className="muted reveal" style={{ marginTop: "var(--s-4)", lineHeight: 1.7 }}>
                  {s.short}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s-5)", marginTop: "var(--s-6)" }}>
                  <div>
                    <h3 className="h3" style={{ fontSize: "var(--t-small)" }}>
                      What you get
                    </h3>
                    <ul style={{ marginTop: "var(--s-3)", display: "grid", gap: 8, fontSize: "var(--t-small)", color: "var(--ink-soft)" }}>
                      {s.what.map((w) => (
                        <li key={w}>· {w}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="h3" style={{ fontSize: "var(--t-small)" }}>
                      On the floor
                    </h3>
                    <ul style={{ marginTop: "var(--s-3)", display: "grid", gap: 8, fontSize: "var(--t-small)", color: "var(--ink-soft)" }}>
                      {s.equipment.map((w) => (
                        <li key={w}>· {w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div style={{ marginTop: "var(--s-6)", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                  <Link to={`/services/${s.slug}`} className="btn btn-primary">
                    Full inclusions →
                  </Link>
                  <span className="serif-italic" style={{ fontSize: "var(--t-h3)" }}>
                    {s.from}
                  </span>
                </div>
              </div>
            </div>
          </section>
        ))}

        <section className="section" aria-label="Service FAQs">
          <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "clamp(32px,5vw,80px)" }}>
            <div className="reveal">
              <p className="eyebrow">Practical questions</p>
              <h2 className="h2">
                Before you pick a service <span className="serif-italic">page</span>
              </h2>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {SITE_FAQS.slice(0, 4).map((f, i) => (
                <details
                  key={f.q}
                  className="faq-item reveal"
                  style={{ ["--reveal-delay" as string]: `${i * 60}ms` } as CSSProperties}
                >
                  <summary>
                    <span>{f.q}</span>
                    <span className="plus" aria-hidden="true">+</span>
                  </summary>
                  <p className="faq-a">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Page>
  );
}
