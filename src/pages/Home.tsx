import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Page } from "../components/Chrome";
import { HeroScene } from "../components/HeroScene";
import { WorkGallery } from "../components/Work";
import { FAQAccordion } from "../components/FAQ";
import { useReveal } from "../lib/hooks";
import { faqJSONLD, localBusiness } from "../lib/schema";
import { SERVICES, SITE_FAQS, STUDIO, waLink } from "../data/content";

const TRUST = [
  { stat: "480+", label: "shoots delivered", note: "across fashion, commercial, product and podcast" },
  { stat: "62", label: "brands & houses", note: "from debut labels to national campaigns" },
  { stat: "8", label: "years in Delhi", note: "the studio has been on this Saket lane since 2018" },
  { stat: "48h", label: "rush turnaround", note: "on fashion and product stills, when the deadline is real" },
] as const;

export default function Home() {
  const reveal = useReveal<HTMLDivElement>();

  return (
    <Page
      title="The Courtyard Stories — Photography & Video Production Studio in Delhi"
      description="High-end fashion editorials, commercial campaigns, product cinematography and podcast sets, shot on a natural-light cyclorama in Saket, New Delhi. Enquire for a shoot day."
      schema={[localBusiness(), faqJSONLD(SITE_FAQS)]}
    >
      <div ref={reveal}>
        {/* ————— showpiece hero ————— */}
        <section className="hero" aria-label="Studio introduction">
          <HeroScene poster="/assets/flow/hero.jpg" />
          <div className="hero-veil" aria-hidden="true" />
          <div className="hero-content">
            <div className="container">
              <p className="hero-index">Est. {STUDIO.est} · Saket, New Delhi · one frame at a time</p>
              <h1 className="h-display">
                The story your brand tells, <span className="serif-italic">shot on film grain</span>
              </h1>
              <p className="lead hero-lead reveal">
                Fashion editorials, commercial campaigns, product film and podcast sets —
                produced in one sun-lit courtyard studio on the North side of Delhi,
                by a crew that treats every shoot day like a set you'll live with for years.
              </p>
              <div className="hero-ctas reveal">
                <Link to="/enquire" className="btn btn-primary">
                  Enquire for a shoot
                </Link>
                <Link to="/work" className="btn btn-ghost">
                  See the reel
                </Link>
              </div>
              <div className="hero-meta reveal">
                <div>
                  <b>{STUDIO.addressShort}</b>
                  <span>Studio address</span>
                </div>
                <div>
                  <b>Mon – Sat</b>
                  <span>09:00 – 21:00 IST</span>
                </div>
                <div>
                  <b>40 min</b>
                  <span>From Saket metro</span>
                </div>
              </div>
            </div>
          </div>
          <span className="scroll-hint">Scroll</span>
        </section>

        {/* ————— marquee ————— */}
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {Array.from({ length: 2 }).map((_, half) => (
              <span key={half} style={{ display: "inline-flex", gap: "var(--s-8)" }}>
                Fashion <em>·</em> Commercial <em>·</em> Product Film <em>·</em> Podcast
                <em>·</em> Runway <em>·</em> E-commerce <em>·</em> Brand Stories <em>·</em>
              </span>
            ))}
          </div>
        </div>

        {/* ————— work reel (filtered) ————— */}
        <WorkGallery embedded />

        {/* ————— service overview ————— */}
        <section className="section" id="services">
          <div className="container">
            <div className="reveal" style={{ maxWidth: "52ch", marginBottom: "var(--s-8)" }}>
              <p className="eyebrow">What we shoot</p>
              <h2 className="h1">
                Four crafts, <span className="serif-italic">one courtyard</span>
              </h2>
              <p className="lead" style={{ marginTop: "var(--s-5)" }}>
                Every service runs through the same pipeline — moodboard, set, shoot, grade —
                so a fashion client and a podcast producer get the same finish.
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
              <p className="eyebrow">Two-minute enquiry</p>
              <h2 className="h1">
                Book the <span className="serif-italic">courtyard</span>
              </h2>
              <p className="lead" style={{ marginTop: "var(--s-5)" }}>
                Tell us what you're making, when you're thinking of shooting, and how big
                the crew is. The enquiry walks step by step — shoot type, dates, kit —
                and hands off straight to WhatsApp if you'd rather talk it through.
              </p>
              <ul style={{ marginTop: "var(--s-6)", display: "grid", gap: "var(--s-3)", fontSize: "var(--t-small)", color: "var(--ink-soft)" }}>
                <li>· Replies from a producer, not a mailbox</li>
                <li>· Dates held for 48 hours after confirmation</li>
                <li>· No obligation — the quote is yours to keep</li>
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
              <p className="eyebrow">Before you write</p>
              <h2 className="h2">
                Asked on every enquiry, <span className="serif-italic">answered up front</span>
              </h2>
              <p className="muted" style={{ marginTop: "var(--s-4)", fontSize: "var(--t-small)", maxWidth: "36ch" }}>
                The four questions that reach the studio desk most — with the answers we
                actually give, no sales layer.
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
                Studio desk · {STUDIO.hours}
              </p>
              <h2 className="h1" style={{ margin: "var(--s-5) auto 0", maxWidth: "18ch" }}>
                The courtyard is <span style={{ fontStyle: "italic", fontWeight: 300 }}>open</span>
              </h2>
              <p style={{ margin: "var(--s-5) auto 0", maxWidth: "44ch", opacity: 0.75, fontSize: "var(--t-small)" }}>
                Bring the brief. We'll bring the light, the crew, and the grade that makes
                it hold up on a billboard.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: "var(--s-6)" }}>
                <Link to="/enquire" className="btn" style={{ border: "1px solid var(--bg)", color: "var(--bg)" }}>
                  Start the enquiry
                </Link>
                <a
                  className="btn btn-wa"
                  href={waLink("Hi — we'd like to plan a shoot at the studio.")}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp the desk
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Page>
  );
}

/* — compact teaser on the homepage: picks shoot type + rough date,
     then hands to the full multi-step form (with prefill) or WhatsApp — */
function QuickEnquiry() {
  const [type, setType] = useState("");
  const [date, setDate] = useState("");

  const waMsg = waLink(
    `Hi — planning a ${type ? type.replace(" ", "-") : "studio"} shoot${date ? ` around ${date}` : ""}. Could we talk dates?`,
  );

  return (
    <div className="card" style={{ padding: "var(--s-6)" }}>
      <div style={{ display: "grid", gap: "var(--s-5)" }}>
        <div className="field">
          <label htmlFor="q-type">What are we making?</label>
          <select id="q-type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Pick one</option>
            <option value="fashion editorial">A fashion editorial</option>
            <option value="commercial film">A commercial film</option>
            <option value="product shoot">A product shoot</option>
            <option value="podcast season">A podcast season</option>
            <option value="just the space">Just the space</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="q-date">When, roughly?</label>
          <input id="q-date" placeholder="e.g. late February, or flexible" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link
            to="/enquire"
            state={{ prefill: { type, date } }}
            className="btn btn-primary"
            style={!type ? { opacity: 0.55 } : undefined}
          >
            Open the full enquiry
          </Link>
          <a className="btn btn-ghost" href={waMsg} target="_blank" rel="noreferrer">
            WhatsApp instead
          </a>
        </div>
        <p className="muted" style={{ fontSize: "var(--t-micro)", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Prefills the form automatically · nothing is stored until you send
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
