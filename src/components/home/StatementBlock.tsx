import { STUDIO_FACTS, ARCHITECTURAL_SETS } from "../../data/content";
import { SectionDoodle } from "./SectionDoodle";
import { ChillDoodle } from "./ChillDoodle";

const featured = ARCHITECTURAL_SETS[0]!;

export function StatementBlock() {
  return (
    <section className="landing-statement landing-band-statement" aria-label="Estate statement">
      <ChillDoodle kind="key" className="chill-doodle--tl" />
      <div className="landing-statement-inner">
        <div className="landing-statement-copy">
          <h2>
            <SectionDoodle kind="loop" />
            Five worlds behind
            <br />
            one gate.
          </h2>
          <p>One private estate in Kapashera—five camera-ready sets, drone clearance, and light from dawn to gala.</p>
        </div>
        <div className="landing-statement-visual">
          <img src={featured.img} alt="" loading="lazy" decoding="async" />
          <p className="landing-feature-caption">{featured.name.split("·")[0]?.trim() ?? featured.name}</p>
          <div className="landing-statement-stats">
            {STUDIO_FACTS.map((f) => (
              <div key={f.label}>
                <b>{f.stat}</b>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}