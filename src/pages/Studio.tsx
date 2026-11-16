import { type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Page } from "../components/Chrome";
import { StudioImage } from "../components/StudioImage";
import { useReveal } from "../lib/hooks";
import { localBusiness } from "../lib/schema";
import { STUDIO_FACTS, STUDIO_FEATURES, STUDIO } from "../data/content";

const LIGHT_STORY = [
  {
    time: "08:00",
    title: "First light hits the cyclorama",
    body: "The north-facing window wall opens to soft, shadowless light — the same key, every morning, no strobe needed. Most fashion clients book the early slot for exactly this.",
  },
  {
    time: "11:00",
    title: "Peak window, hard sun",
    body: "The sun climbs and the key gets harder and warmer. That's the hour for product work: glass, liquid and steel all read best under a tight, directional source.",
  },
  {
    time: "15:00",
    title: "Afternoon grade on the floor",
    body: "Light turns golden and the room reads like a film set even before a frame is made. Podcast sessions live here — the tungsten practicals blend with the window for a moody, warm grade.",
  },
  {
    time: "19:00",
    title: "The darkroom takes over",
    body: "Windows close, HMI and LED rigs come up, and the cyclorama becomes whatever world the shoot needs. Night blocks run to 21:00, six days a week.",
  },
];

export default function Studio() {
  const reveal = useReveal<HTMLDivElement>();

  return (
    <Page
      title="The Studio — Saket, New Delhi · The Courtyard Stories"
      description={`A 1,800 sq ft natural-light studio on Saket's north side: 30 ft cyclorama, podcast suite, grade bay. Hours ${STUDIO.hours}.`}
      schema={[localBusiness()]}
    >
      <div ref={reveal}>
        <section className="page-hero">
          <span className="ghost-num" aria-hidden="true">
            05
          </span>
          <div className="container">
            <p className="eyebrow reveal">The studio · {STUDIO.addressShort}</p>
            <h1 className="h1 reveal">
              A courtyard on the North that <span className="serif-italic">behaves like a film set</span>
            </h1>
            <p className="lead reveal" style={{ marginTop: "var(--s-5)", maxWidth: "52ch" }}>
              1,800 square feet split across a cyclorama bay and a podcast suite, built
              around one idea: the best key light in Delhi is the sun, and it arrives
              on time every morning at 11.
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
                src="/assets/flow/hero.jpg"
                alt="The cyclorama bay at The Courtyard Stories, lit by window light"
                motif="studio"
                eager
                tag="The cyclorama bay"
              />
            </div>
            <div>
              <p className="eyebrow reveal">The floor</p>
              <h2 className="h2 reveal">
                One bay, <span className="serif-italic">three ways to light it</span>
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

        <section className="section" aria-label="Light through the day">
          <div className="container">
            <div className="reveal" style={{ maxWidth: "52ch", marginBottom: "var(--s-8)" }}>
              <p className="eyebrow">Light, by the hour</p>
              <h2 className="h2">
                How the room <span className="serif-italic">reads across a day</span>
              </h2>
              <p className="lead" style={{ marginTop: "var(--s-4)" }}>
                The window wall is the studio's first camera. Here's what it does —
                and what we book into each hour because of it.
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
                <p className="eyebrow">Finding the lane</p>
                <h2 className="h2">
                  A 40-minute drive <span className="serif-italic">from Saket metro</span>
                </h2>
                <p className="muted" style={{ marginTop: "var(--s-4)", lineHeight: 1.7, maxWidth: "44ch" }}>
                  The studio sits on a quiet lane off the main Saket stretch — two on-site
                  car spaces, a lot next door for the rest of the crew, and a 10-minute
                  walk from a 24-hour pharmacy if the shoot runs past midnight and the
                  gaffer needs coffee.
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
                <h3 className="h3">Studio visits</h3>
                <p className="muted" style={{ marginTop: 8, fontSize: "var(--t-small)", lineHeight: 1.7 }}>
                  {STUDIO.hoursNote}. A 20-minute walkthrough — cyclorama, podcast suite,
                  grade bay — is how most bookings start. Bring the brief; we'll tell you
                  what the floor can do with it.
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
