import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Page } from "../components/Chrome";
import { FrameScrollScrubber } from "../components/FrameScrollScrubber";
import { WorkGallery } from "../components/Work";
import { FAQAccordion } from "../components/FAQ";
import { useReveal } from "../lib/hooks";
import { faqJSONLD, localBusiness } from "../lib/schema";
import { ARCHITECTURAL_SETS, SERVICES, SITE_FAQS, STUDIO, waLink } from "../data/content";

const TRUST = [
  { stat: "12,000+", label: "sq ft heritage estate", note: "across 5 contiguous architectural world sets" },
  { stat: "4K 50fps", label: "licensed drone aerials", note: "unobstructed 360° open-sky clearance for cinema sweeps" },
  { stat: "5 Worlds", label: "modular sets in one venue", note: "Haveli, Mughal Colonnade, Moroccan Suite, Thatched Tower & Gala" },
  { stat: "Day to Night", label: "lighting versatility", note: "from morning sunbeams to full overhead fairy light rig" },
] as const;

export default function Home() {
  const reveal = useReveal<HTMLDivElement>();

  return (
    <Page
      title="The Courtyard Stories — Heritage Architecture & Cinematic Production Venue in Delhi"
      description="Double-story Rajasthani haveli, carved terracotta Mughal colonnade, cobalt Moroccan arches, and night gala courtyards across 12,000+ sq ft in South Delhi. Enquire for a shoot day."
      schema={[localBusiness(), faqJSONLD(SITE_FAQS)]}
    >
      <div ref={reveal}>
        {/* ————— SCROLL-SCRUBBED FRAME-BY-FRAME DRONE FLYTHROUGH ————— */}
        <FrameScrollScrubber />

        {/* ————— EDITORIAL SETS SHOWCASE (Clean Light Aesthetic, Zero Black Boxes) ————— */}
        <section className="section" id="sets" aria-label="Architectural sets and zones">
          <div className="container">
            <div className="reveal" style={{ maxWidth: "58ch", marginBottom: "var(--s-8)" }}>
              <p className="eyebrow">The 5 Architectural Worlds</p>
              <h2 className="h1">
                Five contiguous sets, <span className="serif-italic">built for the camera</span>
              </h2>
              <p className="lead" style={{ marginTop: "var(--s-4)" }}>
                Each zone is constructed with authentic tactile materials, deep architectural relief, and deliberate sun path orientation across 12,000+ contiguous square feet in South Delhi.
              </p>
            </div>

            <div className="bento-sets-grid">
              {ARCHITECTURAL_SETS.map((set, idx) => (
                <article
                  key={set.id}
                  className={`bento-set-card bento-card-${set.id} reveal`}
                  style={{
                    ["--set-accent" as string]: set.palette.accent,
                    ["--set-accent-light" as string]: set.palette.accentLight,
                    ["--set-bg-tint" as string]: set.palette.bgTint,
                    ["--set-border-tint" as string]: set.palette.borderTint,
                  } as CSSProperties}
                >
                  <div className="bento-set-media">
                    <video
                      src={set.video}
                      poster={set.img}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="bento-set-video"
                    />
                    <span
                      className="bento-set-tag"
                      style={{
                        borderColor: set.palette.borderTint,
                        color: set.palette.accentLight,
                      }}
                    >
                      {set.tag}
                    </span>
                  </div>
                  <div className="bento-set-info">
                    <div className="bento-set-header">
                      <span
                        className="bento-set-num"
                        style={{ color: set.palette.accent }}
                      >
                        0{idx + 1}
                      </span>
                      <h3 className="bento-set-title">{set.name}</h3>
                    </div>
                    <p className="bento-set-desc">{set.short}</p>
                    <div className="bento-set-meta">
                      <span
                        className="meta-label"
                        style={{ color: set.palette.accent }}
                      >
                        NATURAL LIGHT:
                      </span>
                      <span className="meta-value">{set.lighting}</span>
                    </div>
                    <div className="bento-set-actions">
                      <Link
                        to={`/enquire?set=${set.id}`}
                        className="link-arrow"
                        style={{ color: set.palette.accent }}
                      >
                        Book this set <ArrowSvg />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ————— trust badges & estate numbers ————— */}
        <section className="section-tight" aria-label="Studio by the numbers">
          <div className="container">
            <div className="stats reveal">
              {TRUST.map((t) => (
                <div key={t.label}>
                  <b>{t.stat}</b>
                  <span>{t.label}</span>
                  <p className="muted" style={{ marginTop: 8, fontSize: "var(--t-micro)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>
                    {t.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ————— work reel (filtered real assets) ————— */}
        <WorkGallery embedded />

        {/* ————— service overview ————— */}
        <section className="section" id="services">
          <div className="container">
            <div className="reveal" style={{ maxWidth: "52ch", marginBottom: "var(--s-8)" }}>
              <p className="eyebrow">What we produce</p>
              <h2 className="h1">
                Four production disciplines, <span className="serif-italic">one heritage estate</span>
              </h2>
              <p className="lead" style={{ marginTop: "var(--s-5)" }}>
                From high-fashion couture lookbooks and period commercials to exclusive location buyouts and night gala soirées.
              </p>
            </div>

            <div className="card-grid">
              {SERVICES.map((s, i) => (
                <div
                  key={s.slug}
                  className="card reveal"
                  style={{ ["--reveal-delay" as string]: `${i * 70}ms` } as CSSProperties}
                >
                  <span className="card-index">{s.index}</span>
                  <h3 className="h3">{s.name}</h3>
                  <p>{s.short}</p>
                  <div className="card-meta">
                    <span>{s.turnaround}</span>
                    <span>{s.from}</span>
                  </div>
                  <div style={{ marginTop: "var(--s-5)" }}>
                    <Link to={`/services/${s.slug}`} className="link-arrow">
                      Explore {s.name.split(" ")[0].toLowerCase()} <ArrowSvg />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ————— conditional enquiry teaser ————— */}
        <section className="section" id="enquire">
          <div className="container split">
            <div className="reveal">
              <p className="eyebrow">Direct Shoot Booking</p>
              <h2 className="h1">
                Reserve the <span className="serif-italic">courtyard</span>
              </h2>
              <p className="lead" style={{ marginTop: "var(--s-5)" }}>
                Tell us your creative vision, desired shoot dates, and crew scale. The enquiry walks
                step by step — shoot type, set preference, drone requirements — and hands off straight to
                WhatsApp if you'd like an immediate location walkthrough.
              </p>
              <ul style={{ marginTop: "var(--s-6)", display: "grid", gap: "var(--s-3)", fontSize: "var(--t-small)", color: "var(--ink-soft)" }}>
                <li>· Direct confirmation with the Studio Director, no middlemen</li>
                <li>· Dates held for 48 hours following walkthrough</li>
                <li>· Transparent custom pricing with zero hidden venue charges</li>
              </ul>
            </div>
            <div className="reveal" style={{ ["--reveal-delay" as string]: "120ms" } as CSSProperties}>
              <QuickEnquiry />
            </div>
          </div>
        </section>

        {/* ————— FAQ + citation blocks ————— */}
        <section className="section-tight" id="faq">
          <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "clamp(32px,5vw,80px)" }}>
            <div className="reveal">
              <p className="eyebrow">Location FAQs</p>
              <h2 className="h2">
                Questions asked on every enquiry, <span className="serif-italic">answered up front</span>
              </h2>
              <p className="muted" style={{ marginTop: "var(--s-4)", fontSize: "var(--t-small)", maxWidth: "36ch" }}>
                Key logistics regarding drone permits, venue capacity, power hookups, and walkthrough visits.
              </p>
            </div>
            <FAQAccordion faqs={SITE_FAQS.slice(0, 4)} title="" />
          </div>
        </section>

        {/* ————— closing CTA band ————— */}
        <section className="section" aria-label="Get in touch">
          <div className="container">
            <div className="reveal" style={{ textAlign: "center", padding: "var(--s-9) var(--s-7)", background: "var(--ink)", color: "var(--bg)", borderRadius: "var(--radius)" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-micro)", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.6 }}>
                Studio desk · {STUDIO.hours} · {STUDIO.addressShort}
              </p>
              <h2 className="h1" style={{ margin: "var(--s-5) auto 0", maxWidth: "20ch" }}>
                The courtyard is <span style={{ fontStyle: "italic", fontWeight: 300 }}>ready for your camera</span>
              </h2>
              <p style={{ margin: "var(--s-5) auto 0", maxWidth: "50ch", opacity: 0.75, fontSize: "var(--t-small)" }}>
                Bring your talent and treatment. We provide 5 architectural worlds, pure natural light, and the space to craft something extraordinary.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: "var(--s-6)" }}>
                <Link to="/enquire" className="btn" style={{ border: "1px solid var(--bg)", color: "var(--bg)" }}>
                  Start Shoot Booking
                </Link>
                <a
                  className="btn btn-wa"
                  href={waLink("Hi — we would like to book a shoot at The Courtyard Stories.")}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp Studio Director
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Page>
  );
}

function QuickEnquiry() {
  const [type, setType] = useState("");
  const [date, setDate] = useState("");

  const waMsg = waLink(
    `Hi — planning a ${type ? type.replace(" ", "-") : "shoot"} at The Courtyard Stories${date ? ` around ${date}` : ""}. Could we talk dates and sets?`,
  );

  return (
    <div className="card" style={{ padding: "var(--s-6)" }}>
      <div style={{ display: "grid", gap: "var(--s-5)" }}>
        <div className="field">
          <label htmlFor="q-type">What are we producing?</label>
          <select id="q-type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Select production craft</option>
            <option value="fashion lookbook">Fashion / Couture Lookbook</option>
            <option value="commercial film">Commercial / TVC / Brand Film</option>
            <option value="location rental">Architectural Location Rental</option>
            <option value="night gala event">Brand Launch / Night Gala Event</option>
            <option value="drone production">Drone &amp; Aerial Production</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="q-date">Preferred dates or month?</label>
          <input id="q-date" placeholder="e.g. Next weekend, late November, or flexible" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link
            to="/enquire"
            state={{ prefill: { type, date } }}
            className="btn btn-primary"
            style={!type ? { opacity: 0.55 } : undefined}
          >
            Open Full Shoot Planner
          </Link>
          <a className="btn btn-ghost" href={waMsg} target="_blank" rel="noreferrer">
            WhatsApp Recce
          </a>
        </div>
        <p className="muted" style={{ fontSize: "var(--t-micro)", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Prefills the form automatically · instant WhatsApp handoff
        </p>
      </div>
    </div>
  );
}

function ArrowSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
