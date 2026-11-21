import { Link } from "react-router-dom";
import { Page } from "../components/Chrome";
import { WorkGallery } from "../components/Work";
import { useReveal } from "../lib/hooks";
import { localBusiness, portfolioJSONLD } from "../lib/schema";
import { STUDIO } from "../data/content";

export default function WorkPage() {
  const reveal = useReveal<HTMLDivElement>();

  return (
    <Page
      title="Selected Work — Stills & Reels · The Courtyard Stories, Delhi"
      description={`Filter the studio archive: fashion, commercial, product and podcast work shot at ${STUDIO.name}, ${STUDIO.addressShort}. Zero layout shift, every project opens full details.`}
      schema={[localBusiness(), portfolioJSONLD()]}
    >
      <div ref={reveal}>
        <section className="page-hero">
          <span className="ghost-num" aria-hidden="true">
            00
          </span>
          <div className="container">
            <p className="eyebrow reveal">The archive</p>
            <h1 className="h1 reveal">
              Stills, reels and the floors <span className="serif-italic">they came off</span>
            </h1>
            <p className="lead reveal" style={{ marginTop: "var(--s-5)", maxWidth: "48ch" }}>
              Eight projects from the last two seasons — the same eight that come up when
              a new client asks "what does a shoot day here actually look like?".
            </p>
            <div className="hero-ctas reveal">
              <Link to="/enquire" className="btn btn-primary">
                Put your project in the next reel
              </Link>
              <a
                className="btn btn-ghost"
                href={`https://instagram.com/${STUDIO.instagram.replace("@", "")}`}
                target="_blank"
                rel="noreferrer"
              >
                {STUDIO.instagram}
              </a>
            </div>
          </div>
        </section>

        <WorkGallery />

        <section className="section" aria-label="What to expect from a project">
          <div className="container">
            <div className="card-grid">
              {[
                {
                  n: "01",
                  t: "Moodboard before the floor",
                  d: "Every project opens with a reference pass. Three images you love, three you don't — the grade follows from that, not from habit.",
                },
                {
                  n: "02",
                  t: "On-set monitor, client present",
                  d: "You watch the frames as they're made. The call on set — hold, move, light again — is made together, not emailed later.",
                },
                {
                  n: "03",
                  t: "Delivered, not dumped",
                  d: "Files arrive organised by look, named for the platform, watermarked previews and clean masters apart. The feed never sees a raw frame.",
                },
              ].map((x) => (
                <div key={x.n} className="card">
                  <span className="card-index">{x.n}</span>
                  <h3 className="h3">{x.t}</h3>
                  <p>{x.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Page>
  );
}
