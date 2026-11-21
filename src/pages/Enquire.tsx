import { useMemo } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Page } from "../components/Chrome";
import { EnquiryForm } from "../components/EnquiryForm";
import { useReveal } from "../lib/hooks";
import { localBusiness } from "../lib/schema";
import { SERVICES, SHOOT_TYPES, SITE_FAQS, STUDIO, waLink } from "../data/content";

const SERVICE_KEY_TO_SHOOT: Record<string, string> = {
  fashion: "fashion",
  commercial: "commercial",
  studio: "studio",
  events: "events",
};

const VISIT_LABELS: Record<string, string> = {
  walkthrough: "an estate walkthrough",
  quote: "a production scoping meeting",
  recce: "a technical director & DP recce",
  event: "an event & gala walkthrough",
};

export default function Enquire() {
  const reveal = useReveal<HTMLDivElement>();
  const location = useLocation();
  const [params] = useSearchParams();

  /* prefill: /services/<slug> link (?type=fashion) → shoot type;
     ?visit=walkthrough → notes line; homepage teaser state → { type, date } */
  const initial = useMemo(() => {
    const statePrefill = (location.state as { prefill?: { type?: string; date?: string } } | null)?.prefill;
    const typeParam = params.get("type");
    const type = statePrefill?.type ?? (typeParam && SERVICES.some((s) => s.slug === typeParam)
      ? SERVICE_KEY_TO_SHOOT[typeParam]
      : undefined);
    const visitKey = params.get("visit");
    const notes = visitKey && VISIT_LABELS[visitKey]
      ? `I'd like to book ${VISIT_LABELS[visitKey]}.`
      : undefined;
    return type || statePrefill?.date || notes ? { type, date: statePrefill?.date, notes } : undefined;
  }, [location.state, params]);

  const validType = initial?.type && SHOOT_TYPES.some((s) => s.key === initial.type);

  return (
    <Page
      title="Enquire for a Shoot · The Courtyard Stories, Delhi"
      description={`Book a shoot day at ${STUDIO.name}, ${STUDIO.addressShort}. Two-minute conditional enquiry with instant WhatsApp handoff — shoot type, dates, crew and kit.`}
      schema={[localBusiness()]}
    >
      <div ref={reveal}>
        <section className="page-hero">
          <span className="ghost-num" aria-hidden="true">07</span>
          <div className="container">
            <p className="eyebrow reveal">The enquiry</p>
            <h1 className="h1 reveal">
              Two minutes, <span className="serif-italic">then the studio desk</span>
            </h1>
            <p className="lead reveal" style={{ marginTop: "var(--s-5)", maxWidth: "46ch" }}>
              Four steps: what you're making, when, who's on set, and how to reach you.
              If the form hits a snag, your details hand off to WhatsApp intact —
              nothing gets lost.
            </p>
          </div>
        </section>

        <section className="section" aria-label="Enquiry form">
          <div className="container" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "clamp(32px,5vw,80px)", alignItems: "start" }}>
            <div className="card reveal" style={{ padding: "clamp(24px,4vw,48px)" }}>
              <EnquiryForm initial={validType || initial?.date ? initial : undefined} />
            </div>

            <aside style={{ display: "grid", gap: "var(--s-5)", position: "sticky", top: "calc(var(--topbar-h) + var(--s-5))" }}>
              <div className="card reveal" style={{ padding: "var(--s-5)" }}>
                <span className="card-index">What happens next</span>
                <ol style={{ marginTop: "var(--s-4)", display: "grid", gap: 12, fontSize: "var(--t-small)", color: "var(--ink-soft)", lineHeight: 1.7 }}>
                  <li><strong style={{ color: "var(--ink)" }}>Day 0.</strong> A producer — not a mailbox — reads your enquiry and holds the date you asked for, 48 hours.</li>
                  <li><strong style={{ color: "var(--ink)" }}>Within 1 working day.</strong> A call or WhatsApp with the floor plan, crew and a written quote.</li>
                  <li><strong style={{ color: "var(--ink)" }}>Before the shoot.</strong> Moodboard pass and shot list — the grade follows your references, not ours.</li>
                </ol>
              </div>

              <div className="card reveal" style={{ padding: "var(--s-5)" }}>
                <span className="card-index">Or just call</span>
                <p style={{ marginTop: "var(--s-4)", fontSize: "var(--t-small)", color: "var(--ink-soft)", lineHeight: 1.7 }}>
                  {STUDIO.hours}. The line rings at the studio desk, not a phone tree.
                </p>
                <div style={{ marginTop: "var(--s-4)", display: "grid", gap: 10 }}>
                  <a className="btn btn-ghost" style={{ justifyContent: "flex-start" }} href={STUDIO.phoneHref}>
                    {STUDIO.phone}
                  </a>
                  <a
                    className="btn btn-wa"
                    style={{ justifyContent: "flex-start" }}
                    href={waLink("Hi — I'd like to plan a shoot with The Courtyard Stories.")}
                    target="_blank"
                    rel="noreferrer"
                  >
                    WhatsApp the desk
                  </a>
                </div>
              </div>

              <div className="card reveal" style={{ padding: "var(--s-5)" }}>
                <span className="card-index">Still deciding</span>
                <p style={{ marginTop: "var(--s-4)", fontSize: "var(--t-small)", color: "var(--ink-soft)", lineHeight: 1.7 }}>
                  Start with the work instead —{" "}
                  <Link to="/work" style={{ textDecoration: "underline" }}>
                    the archive
                  </Link>{" "}
                  or{" "}
                  <Link to="/services" style={{ textDecoration: "underline" }}>
                    service inclusions
                  </Link>{" "}
                  — then come back with the brief in hand.
                </p>
              </div>
            </aside>
          </div>
        </section>

        {/* ————— estate location & Google Map embed ————— */}
        <section className="section-tight" aria-label="Estate location and map">
          <div className="container">
            <div className="card reveal" style={{ padding: "clamp(24px, 3.5vw, 40px)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "clamp(24px, 4vw, 48px)", alignItems: "center" }}>
                <div>
                  <p className="eyebrow" style={{ color: "var(--accent-deep)" }}>Estate Location &amp; Recce</p>
                  <h2 className="h2" style={{ fontSize: "clamp(1.4rem, 2vw, 1.8rem)", margin: "8px 0 12px" }}>
                    The Courtyard Stories <span className="serif-italic">· Kapashera</span>
                  </h2>
                  <p className="muted" style={{ lineHeight: 1.7, fontSize: "var(--t-small)" }}>
                    {STUDIO.address}
                  </p>
                  <div style={{ marginTop: "var(--s-4)", display: "flex", flexDirection: "column", gap: 10, fontSize: "var(--t-small)", color: "var(--ink-soft)" }}>
                    <div><strong style={{ color: "var(--ink)" }}>Metro connectivity:</strong> {STUDIO.metroNote}</div>
                    <div><strong style={{ color: "var(--ink)" }}>Production Logistics:</strong> Private gated driveway with dedicated parking for 25+ crew vehicles &amp; vanity vans</div>
                    <div><strong style={{ color: "var(--ink)" }}>Power &amp; Genset:</strong> 3-phase industrial power tie-ins &amp; silent generator hookup bays</div>
                  </div>
                  <div style={{ marginTop: "var(--s-5)", display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <a
                      href={STUDIO.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                    >
                      Open in Google Maps
                    </a>
                    <a
                      href={waLink("Hi, I would like directions and location coordinates for The Courtyard Stories.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-wa"
                    >
                      WhatsApp Directions
                    </a>
                  </div>
                </div>

                <div style={{ position: "relative", width: "100%", height: "340px", borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--line-soft)" }}>
                  <iframe
                    title="The Courtyard Stories Estate Location Map"
                    src={STUDIO.mapsEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-tight" aria-label="Quick answers">
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 1, background: "var(--line-soft)", border: "1px solid var(--line-soft)" }}>
              {SITE_FAQS.slice(2, 5).map((f) => (
                <div key={f.q} className="card" style={{ padding: "var(--s-5)" }}>
                  <h3 className="h3" style={{ fontSize: "var(--t-body)", fontWeight: 500 }}>
                    {f.q}
                  </h3>
                  <p style={{ marginTop: 8, fontSize: "var(--t-small)", color: "var(--ink-soft)", lineHeight: 1.7 }}>{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Page>
  );
}
