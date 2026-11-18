import { type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Page } from "../components/Chrome";
import { StudioImage } from "../components/StudioImage";
import { useReveal } from "../lib/hooks";
import { localBusiness } from "../lib/schema";
import { STUDIO_FACTS, STUDIO_FEATURES, STUDIO, ARCHITECTURAL_SETS } from "../data/content";

const LIGHT_STORY = [
  {
    time: "07:30",
    title: "Dawn on the Royal Haveli",
    body: "Soft horizontal morning light washes across the ochre Rajasthani facade, carved wooden portals and jharokha balconies. Gentle, shadowless architectural tones ideal for bridal couture and slow tracking passes.",
  },
  {
    time: "11:30",
    title: "Mughal Terracotta Jali Shadows",
    body: "As the Delhi sun climbs directly overhead, the carved terracotta pavilion filters the sunlight into hypnotic, geometric lace-like shadows across patterned veranda stone. Crisp contrast for luxury commercial and eyewear shoots.",
  },
  {
    time: "16:30",
    title: "Golden Hour on Thatched Lookout",
    body: "Amber late-afternoon sun rakes the elevated timber observation deck, woven reed thatch, and central courtyard patio. Natural 3200K warmth across every angle without the need for artificial booster heads.",
  },
  {
    time: "19:00",
    title: "Night Gala Transformation",
    body: "As twilight sets in, the overhead matrix of warm fairy lights, antique brass wall lanterns, and architectural ground uplights illuminate the courtyards, transforming the estate into a regal evening wonderland.",
  },
];

export default function Studio() {
  const reveal = useReveal<HTMLDivElement>();

  return (
    <Page
      title="The Estate & Architectural Sets — South Delhi · The Courtyard Stories"
      description={`A 12,000+ sq ft architectural production estate in South Delhi: 5 heritage world sets, 360° drone flight clearance, daylight to night gala rigs. Hours ${STUDIO.hours}.`}
      schema={[localBusiness()]}
    >
      <div ref={reveal}>
        <section className="page-hero">
          <span className="ghost-num" aria-hidden="true">
            05
          </span>
          <div className="container">
            <p className="eyebrow reveal">The production estate · {STUDIO.addressShort}</p>
            <h1 className="h1 reveal">
              An authentic heritage estate that <span className="serif-italic">behaves like a live film set</span>
            </h1>
            <p className="lead reveal" style={{ marginTop: "var(--s-5)", maxWidth: "54ch" }}>
              12,000+ square feet encompassing 5 distinct architectural worlds — from a double-story
              Rajasthani Haveli to a Mughal Terracotta Colonnade, Chefchaouen Moroccan Suite, and Rustic
              Thatched Lookout — built specifically for fashion lookbooks, commercial films, and cinematic drone cinematography.
            </p>
          </div>
        </section>

        <section className="section-tight" aria-label="Studio facts">
          <div className="container">
            <div className="stats reveal">
              {STUDIO_FACTS.map((f) => (
                <div key={f.label}>
                  <b>{f.stat}</b>
                  <span>{f.label}</span>
                  <p className="muted" style={{ marginTop: 8, fontSize: "var(--t-micro)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>
                    {f.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section studio-band" aria-label="The floor">
          <div className="container split">
            <div className="split-media reveal">
              <StudioImage
                className="plate-media"
                src="/assets/real/space-panoramic-estate.webp"
                alt="The Courtyard Stories 12,000 sq ft architectural estate in South Delhi"
                motif="studio"
                eager
                tag="12,000+ sq ft estate"
              />
              <video
                className="plate-video is-active"
                src="/assets/real/studio-reel.mp4"
                poster="/assets/real/space-panoramic-estate.webp"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
            <div>
              <p className="eyebrow reveal">The architecture</p>
              <h2 className="h2 reveal">
                Five heritage worlds, <span className="serif-italic">360° drone clearance</span>
              </h2>
              {STUDIO_FEATURES.map((f) => (
                <div key={f.title} style={{ marginTop: "var(--s-6)" }} className="reveal">
                  <h3 className="h3">{f.title}</h3>
                  <p className="muted" style={{ marginTop: 8, lineHeight: 1.7, fontSize: "var(--t-small)" }}>
                    {f.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" aria-label="Architectural sets">
          <div className="container">
            <div className="reveal" style={{ maxWidth: "56ch", marginBottom: "var(--s-8)" }}>
              <p className="eyebrow">Five contiguous worlds</p>
              <h2 className="h2">
                The architectural sets <span className="serif-italic">built for the camera</span>
              </h2>
              <p className="lead" style={{ marginTop: "var(--s-4)" }}>
                Each zone is constructed with authentic tactile materials, deep architectural relief, and deliberate sun path orientation. Multiple camera units can shoot in parallel across the estate.
              </p>
            </div>
            <div className="card-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
              {ARCHITECTURAL_SETS.map((set) => (
                <article key={set.id} className="card reveal" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{ position: "relative", width: "100%", aspectRatio: "16/10", overflow: "hidden" }}>
                    <img
                      src={set.img}
                      alt={set.name}
                      loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        background: "rgba(20, 18, 16, 0.75)",
                        backdropFilter: "blur(6px)",
                        color: "var(--gold-soft, #D8AE72)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.72rem",
                        padding: "3px 8px",
                        borderRadius: "2px",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {set.tag}
                    </span>
                  </div>
                  <div style={{ padding: "var(--s-6)", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                    <h3 className="h3" style={{ fontSize: "1.2rem" }}>{set.name}</h3>
                    <p className="muted" style={{ marginTop: 8, fontSize: "var(--t-small)", lineHeight: 1.6, flexGrow: 1 }}>
                      {set.short}
                    </p>
                    <div style={{ marginTop: "var(--s-4)", paddingTop: "var(--s-4)", borderTop: "1px solid var(--line-soft)" }}>
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-micro)", color: "var(--accent-deep)", letterSpacing: "0.08em" }}>
                        BEST FOR
                      </p>
                      <p className="muted" style={{ marginTop: 4, fontSize: "0.8rem", lineHeight: 1.5 }}>
                        {set.bestFor.join(" · ")}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" aria-label="Light through the day">
          <div className="container">
            <div className="reveal" style={{ maxWidth: "52ch", marginBottom: "var(--s-8)" }}>
              <p className="eyebrow">Natural light &amp; sun path</p>
              <h2 className="h2">
                How the estate <span className="serif-italic">reads across a day</span>
              </h2>
              <p className="lead" style={{ marginTop: "var(--s-4)" }}>
                From morning haveli sunbeams to high-noon geometric jali patterns, amber golden hours on the lookout tower, and full starlit fairy light night transformations.
              </p>
            </div>
            <div style={{ display: "grid", gap: "1px", background: "var(--line-soft)", border: "1px solid var(--line-soft)" }}>
              {LIGHT_STORY.map((l, i) => (
                <div
                  key={l.time}
                  className="reveal"
                  style={{
                    background: "var(--bg)",
                    display: "grid",
                    gridTemplateColumns: "90px 1fr 2fr",
                    gap: "var(--s-5)",
                    padding: "var(--s-6)",
                    alignItems: "baseline",
                    ["--reveal-delay" as string]: `${i * 80}ms`,
                  } as CSSProperties}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-small)", color: "var(--accent-deep)", letterSpacing: "0.1em" }}>
                    {l.time}
                  </span>
                  <h3 className="h3" style={{ fontSize: "var(--t-h3)" }}>{l.title}</h3>
                  <p className="muted" style={{ fontSize: "var(--t-small)", lineHeight: 1.7 }}>{l.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" aria-label="Visit">
          <div className="container">
            <div className="reveal" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(32px,5vw,80px)" }}>
              <div>
                <p className="eyebrow">Finding the location</p>
                <h2 className="h2">
                  A tranquil private estate <span className="serif-italic">in South Delhi</span>
                </h2>
                <p className="muted" style={{ marginTop: "var(--s-4)", lineHeight: 1.7, maxWidth: "44ch" }}>
                  The estate sits on a secluded private green lane near Saket &amp; Sultanpur — insulated from city noise, with dedicated parking for up to 25 production vehicles, vanity vans, and equipment trucks.
                </p>
                <address style={{ marginTop: "var(--s-6)", fontSize: "var(--t-small)", lineHeight: 2, fontStyle: "normal", color: "var(--ink-soft)" }}>
                  <strong style={{ color: "var(--ink)" }}>{STUDIO.name}</strong>
                  <br />
                  {STUDIO.address}
                  <br />
                  <a href={STUDIO.phoneHref} style={{ color: "var(--accent-deep)" }}>{STUDIO.phone}</a>
                </address>
              </div>
              <div className="card" style={{ padding: "var(--s-6)" }}>
                <h3 className="h3">Location Walkthroughs &amp; Recces</h3>
                <p className="muted" style={{ marginTop: 8, fontSize: "var(--t-small)", lineHeight: 1.7 }}>
                  {STUDIO.hoursNote}. A 30-minute location recce across the Royal Haveli, Mughal Colonnade, Moroccan Suite, Thatched Tower, and open courtyard is how most bookings begin. Bring your DP and director; walk the sets and test camera angles.
                </p>
                <div style={{ marginTop: "var(--s-5)", display: "flex", flexWrap: "wrap", gap: 12 }}>
                  <Link to="/visit" className="btn btn-primary">
                    Book a walkthrough
                  </Link>
                  <Link to="/enquire" className="btn btn-ghost">
                    Or enquire first
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Page>
  );
}
