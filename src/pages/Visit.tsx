import { Page } from "../components/Chrome";
import { SplitCard } from "../components/SplitCard";
import { useReveal } from "../lib/hooks";
import { localBusiness } from "../lib/schema";
import { STUDIO, waLink } from "../data/content";

const VISIT_TYPES = [
  {
    key: "walkthrough",
    label: "Estate walkthrough",
    desc: "30 minutes on the floor: all five sets, sun angles, and drone sightlines.",
    img: "/assets/real/flythrough-02-haveli.webp",
  },
  {
    key: "quote",
    label: "Production scoping",
    desc: "Bring the brief—we align shot lists, crew size, and day or night lighting.",
    img: "/assets/real/space-panoramic-estate.webp",
  },
  {
    key: "recce",
    label: "Director & DP recce",
    desc: "Tracks, drone takeoff points, power tie-ins, and grip logistics on site.",
    img: "/assets/real/flythrough-03-colonnade.webp",
  },
  {
    key: "event",
    label: "Event walkthrough",
    desc: "Evening gala layouts, guest flow, sound limits, and valet staging.",
    img: "/assets/real/portfolio-night-banquet.webp",
  },
] as const;

export default function Visit() {
  const reveal = useReveal<HTMLDivElement>();

  return (
    <Page
      title="Visit the Estate & Book a Walkthrough · The Courtyard Stories, South Delhi"
      description={`Estate walkthroughs, production recces and technical scoping at ${STUDIO.addressShort}. ${STUDIO.hours}. Book online or WhatsApp the studio desk.`}
      schema={[localBusiness()]}
    >
      <div ref={reveal}>
        <section className="page-hero">
          <span className="ghost-num" aria-hidden="true">
            06
          </span>
          <div className="container">
            <p className="eyebrow reveal">Visit &amp; recce</p>
            <h1 className="h1 reveal">
              Come walk the sets <span className="serif-italic">before you shoot</span>
            </h1>
            <p className="lead reveal" style={{ marginTop: "var(--s-5)", maxWidth: "50ch" }}>
              Most productions begin with an estate walkthrough — standing in the Royal Haveli,
              testing drone sightlines, and watching the sun hit the terracotta jali beats a pitch deck every time.
            </p>
          </div>
        </section>

        <section className="section" aria-label="Visit types">
          <div className="container">
            <div className="visit-split-grid">
              {VISIT_TYPES.map((v) => (
                <SplitCard
                  key={v.key}
                  className="visit-split-card reveal"
                  image={v.img}
                  title={v.label}
                  description={v.desc}
                  href={`/enquire?visit=${v.key}`}
                  linkLabel="Book this visit"
                  accent="var(--marigold)"
                />
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
                  The desk, <span className="serif-italic">not a ticketing queue</span>
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
                    href={waLink("Hi — I'd like to book an estate walkthrough at The Courtyard Stories.")}
                    target="_blank"
                    rel="noreferrer"
                    style={{ justifyContent: "flex-start" }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.76.46 3.45 1.34 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.23c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Z" /></svg>
                    WhatsApp the estate desk
                  </a>
                </div>
              </div>

              <div className="reveal">
                <p className="eyebrow">Location &amp; Access</p>
                <div className="card" style={{ padding: "var(--s-6)" }}>
                  <img
                    src="/assets/real/space-panoramic-estate.webp"
                    alt="The Courtyard Stories 12,000 sq ft production estate in South Delhi"
                    style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: "var(--radius)", marginBottom: "var(--s-5)" }}
                  />
                  <h3 className="h3">Getting here &amp; logistics</h3>
                  <ul style={{ marginTop: "var(--s-4)", display: "grid", gap: 10, fontSize: "var(--t-small)", color: "var(--ink-soft)" }}>
                    <li>· {STUDIO.metroNote}</li>
                    <li>· Dedicated on-site parking for up to 25 production vehicles &amp; vanity vans</li>
                    <li>· Drive-in equipment unloading directly adjacent to architectural sets</li>
                    <li>· 3-phase industrial power tie-ins &amp; silent generator parking</li>
                  </ul>
                  <p style={{ marginTop: "var(--s-4)", fontSize: "var(--t-small)", color: "var(--ink-soft)", lineHeight: 1.7 }}>
                    Exact gate directions and access codes are shared immediately upon booking confirmation to ensure complete privacy for active productions.
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
