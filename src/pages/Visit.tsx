import { type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Page } from "../components/Chrome";
import { useReveal } from "../lib/hooks";
import { localBusiness } from "../lib/schema";
import { STUDIO, waLink } from "../data/content";

const VISIT_TYPES = [
  { key: "walkthrough", label: "Studio walkthrough", desc: "20 min · cyclorama, podcast suite, grade bay" },
  { key: "quote", label: "Quote meeting", desc: "Bring the brief · we scope the floor + crew" },
  { key: "recce", label: "Location recce", desc: "For shoots we'll plan outside the studio" },
  { key: "delivery", label: "File pickup / grade review", desc: "Sit in the grade bay, approve before delivery" },
] as const;

export default function Visit() {
  const reveal = useReveal<HTMLDivElement>();

  return (
    <Page
      title="Visit the Studio & Book a Walkthrough · The Courtyard Stories, Saket"
      description={`Walkthroughs, quote meetings and grade reviews at ${STUDIO.addressShort}. ${STUDIO.hours}. Book online or WhatsApp the desk.`}
      schema={[localBusiness()]}
    >
      <div ref={reveal}>
        <section className="page-hero">
          <span className="ghost-num" aria-hidden="true">
            06
          </span>
          <div className="container">
            <p className="eyebrow reveal">Visit &amp; book</p>
            <h1 className="h1 reveal">
              Come see the light <span className="serif-italic">before you book it</span>
            </h1>
            <p className="lead reveal" style={{ marginTop: "var(--s-5)", maxWidth: "48ch" }}>
              Most of our clients start in the grade bay or on the cyclorama — a short
              walkthrough beats a long email. Pick the kind of visit that fits.
            </p>
          </div>
        </section>

        <section className="section" aria-label="Visit types">
          <div className="container">
            <div className="card-grid">
              {VISIT_TYPES.map((v, i) => (
                <div
                  key={v.key}
                  className="card reveal"
                  style={{ ["--reveal-delay" as string]: `${i * 60}ms` } as CSSProperties}
                >
                  <span className="card-index">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="h3">{v.label}</h3>
                  <p>{v.desc}</p>
                  <div style={{ marginTop: "var(--s-5)" }}>
                    <Link to={`/enquire?visit=${v.key}`} className="link-arrow">
                      Book this <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" aria-label="Contact details">
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "clamp(32px,5vw,80px)" }}>
              <div>
                <p className="eyebrow reveal">Direct lines</p>
                <h2 className="h2 reveal">
                  The desk, <span className="serif-italic">not a mailbox</span>
                </h2>
                <div className="card reveal" style={{ padding: "var(--s-6)", marginTop: "var(--s-6)", display: "grid", gap: "var(--s-5)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                    <div>
                      <span className="card-index">Phone</span>
                      <p style={{ marginTop: 4, fontSize: "var(--t-h3)", fontFamily: "var(--font-display)" }}>
                        <a href={STUDIO.phoneHref} style={{ color: "var(--ink)" }}>{STUDIO.phone}</a>
                      </p>
                    </div>
                    <div>
                      <span className="card-index">Email</span>
                      <p style={{ marginTop: 4, fontSize: "var(--t-h3)", fontFamily: "var(--font-display)" }}>
                        <a href={`mailto:${STUDIO.email}`} style={{ color: "var(--ink)" }}>{STUDIO.email}</a>
                      </p>
                    </div>
                    <div>
                      <span className="card-index">Hours</span>
                      <p style={{ marginTop: 4, fontSize: "var(--t-small)", color: "var(--ink-soft)" }}>{STUDIO.hours}<br />{STUDIO.hoursNote}</p>
                    </div>
                  </div>
                  <a
                    className="btn btn-wa"
                    href={waLink("Hi — I'd like to book a studio walkthrough at The Courtyard Stories.")}
                    target="_blank"
                    rel="noreferrer"
                    style={{ justifyContent: "flex-start" }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.76.46 3.45 1.34 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.23c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Z" /></svg>
                    WhatsApp the studio desk
                  </a>
                </div>
              </div>

              <div className="reveal">
                <p className="eyebrow">Getting here</p>
                <div className="card" style={{ padding: "var(--s-6)" }}>
                  <h3 className="h3">From Saket metro</h3>
                  <ul style={{ marginTop: "var(--s-4)", display: "grid", gap: 10, fontSize: "var(--t-small)", color: "var(--ink-soft)" }}>
                    <li>· 40 min by cab via the ring road (Saket → Studio Lane)</li>
                    <li>· 2 on-site car spaces · lot next door for the crew</li>
                    <li>· 10 min from a 24-hour pharmacy &amp; two cafés</li>
                  </ul>
                  <p style={{ marginTop: "var(--s-4)", fontSize: "var(--t-small)", color: "var(--ink-soft)", lineHeight: 1.7 }}>
                    The pin lands at the lane entrance — we share the exact drop-off
                    address on confirmation, along with the parking lot code.
                  </p>
                  <address style={{ marginTop: "var(--s-5)", paddingTop: "var(--s-4)", borderTop: "1px solid var(--line-soft)", fontSize: "var(--t-small)", color: "var(--ink-soft)", lineHeight: 1.9, fontStyle: "normal" }}>
                    {STUDIO.name}<br />
                    {STUDIO.address}
                  </address>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Page>
  );
}
