import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Page } from "../components/Chrome";
import { DroneFlythrough } from "../components/DroneFlythrough";
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
  const [activeSetId, setActiveSetId] = useState(ARCHITECTURAL_SETS[0].id);

  return (
    <Page
      title="The Courtyard Stories — Heritage Architecture & Cinematic Production Venue in Delhi"
      description="Double-story Rajasthani haveli, carved terracotta Mughal colonnade, cobalt Moroccan arches, and night gala courtyards across 12,000+ sq ft in South Delhi. Enquire for a shoot day."
      schema={[localBusiness(), faqJSONLD(SITE_FAQS)]}
    >
      <div ref={reveal}>
        {/* ————— showpiece hero ————— */}
        <section className="hero" aria-label="Studio introduction">
          <video
            className="hero-ambient-video"
            src="/assets/real/hero-drone-loop.mp4"
            poster="/assets/real/hero-drone-poster.webp"
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
          />
          <div className="hero-veil" aria-hidden="true" />
          <div className="hero-content">
            <div className="container">
              <p className="hero-index">
                Est. {STUDIO.est} · {STUDIO.addressShort} · 12,000+ Sq Ft Heritage Production Estate
              </p>
              <h1 className="h-display">
                Where heritage architecture <span className="serif-italic">meets cinematic storytelling</span>
              </h1>
              <p className="lead hero-lead reveal">
                Double-story Rajasthani haveli, carved terracotta Mughal colonnade, cobalt Moroccan arches,
                and open sunlit courtyards — custom-sculpted in South Delhi for high-fashion lookbooks,
                commercial brand campaigns, and luxury evening celebrations.
              </p>
              <div className="hero-ctas reveal">
                <Link to="/enquire" className="btn btn-primary">
                  Enquire for a shoot
                </Link>
                <Link to="/work" className="btn btn-ghost">
                  See the reel
                </Link>
                <a 
                  href={waLink("Hi, I'd like to plan a shoot at The Courtyard Stories.")}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-wa"
                >
                  WhatsApp Studio Director
                </a>
              </div>
              <div className="hero-meta reveal">
                <div>
                  <b>{STUDIO.addressShort}</b>
                  <span>Location enclave</span>
                </div>
                <div>
                  <b>Mon – Sat</b>
                  <span>{STUDIO.hours}</span>
                </div>
                <div>
                  <b>360° Clearance</b>
                  <span>Drone & Crane Ready</span>
                </div>
              </div>
            </div>
          </div>
          <span className="scroll-hint">Scroll to fly through</span>
        </section>

        {/* ————— marquee ————— */}
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {Array.from({ length: 2 }).map((_, half) => (
              <span key={half} style={{ display: "inline-flex", gap: "var(--s-8)" }}>
                Royal Haveli <em>·</em> Mughal Colonnade <em>·</em> Moroccan Suite <em>·</em> Thatched Tower
                <em>·</em> 4K Drone Aerials <em>·</em> Night Gala Rig <em>·</em> Fashion Lookbooks <em>·</em> Commercial Films <em>·</em>
              </span>
            ))}
          </div>
        </div>

        {/* ————— SIGNATURE SCROLLYTELLING: AERIAL DRONE FLYTHROUGH ————— */}
        <DroneFlythrough />

        {/* ————— interactive set architecture zones ————— */}
        <section className="section" id="sets" aria-label="Architectural sets and zones">
          <div className="container">
            <div className="reveal" style={{ maxWidth: "58ch", marginBottom: "var(--s-8)" }}>
              <p className="eyebrow">The 5 Architectural Worlds</p>
              <h2 className="h1">
                Five contiguous sets, <span className="serif-italic">zero travel between scenes</span>
              </h2>
              <p className="lead" style={{ marginTop: "var(--s-5)" }}>
                Every zone is purpose-built as a 360-degree photography and film location. Move your crew
                from royal Rajasthani arches to vivid Moroccan cobalt walls in 30 seconds.
              </p>
            </div>

            {/* Set Tabs */}
            <div className="work-filter-tabs" role="tablist" aria-label="Architectural zones">
              {ARCHITECTURAL_SETS.map((set) => (
                <button
                  key={set.id}
                  role="tab"
                  aria-selected={activeSetId === set.id}
                  className={`chip ${activeSetId === set.id ? "active" : ""}`}
                  onClick={() => setActiveSetId(set.id)}
                >
                  {set.name.split("—")[0].replace("The ", "")}
                </button>
              ))}
            </div>

            {/* Active Set Spotlight */}
            {(() => {
              const currentSet = ARCHITECTURAL_SETS.find((s) => s.id === activeSetId) || ARCHITECTURAL_SETS[0];
              return (
                <div className="card reveal" style={{ padding: 0, overflow: "hidden", marginTop: "var(--s-6)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
                    <div style={{ position: "relative", minHeight: 380, background: "#000" }}>
                      <video
                        src={currentSet.video}
                        poster={currentSet.img}
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <span 
                        style={{
                          position: "absolute",
                          top: 16,
                          left: 16,
                          background: "rgba(18,15,12,0.8)",
                          backdropFilter: "blur(10px)",
                          color: "#f7ca7d",
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          letterSpacing: "0.12em",
                          padding: "4px 12px",
                          borderRadius: "var(--radius-round)",
                          border: "1px solid rgba(255,255,255,0.15)",
                        }}
                      >
                        {currentSet.tag}
                      </span>
                    </div>

                    <div style={{ padding: "clamp(24px, 4vw, 48px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <p className="eyebrow" style={{ color: "var(--accent-deep)" }}>Set Showcase</p>
                      <h3 className="h2" style={{ margin: "var(--s-2) 0 var(--s-4)" }}>{currentSet.name}</h3>
                      <p style={{ lineHeight: 1.7, color: "var(--ink-soft)", marginBottom: "var(--s-5)" }}>
                        {currentSet.description}
                      </p>

                      <div style={{ marginBottom: "var(--s-5)" }}>
                        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 8 }}>
                          Architectural Features
                        </h4>
                        <ul style={{ display: "grid", gap: 6, fontSize: "var(--t-small)", color: "var(--ink)" }}>
                          {currentSet.features.map((feat) => (
                            <li key={feat} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                              <span style={{ color: "var(--accent-deep)" }}>▸</span> {feat}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div style={{ borderTop: "1px solid var(--line-soft)", paddingTop: "var(--s-4)", marginBottom: "var(--s-6)" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent-deep)" }}>
                          NATURAL LIGHTING ROADMAP:
                        </span>
                        <p style={{ fontSize: "var(--t-small)", color: "var(--ink-soft)", marginTop: 4 }}>
                          {currentSet.lighting}
                        </p>
                      </div>

                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <Link to={`/enquire?set=${currentSet.id}`} className="btn btn-primary">
                          Book This Set
                        </Link>
                        <a 
                          href={waLink(`Hi, I'd like to check availability for ${currentSet.name} at The Courtyard Stories.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-wa"
                        >
                          WhatsApp Walkthrough
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
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

        {/* ————— trust badges ————— */}
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
