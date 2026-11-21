import { ARCHITECTURAL_SETS } from "../../data/content";
import { SectionDoodle } from "./SectionDoodle";
import { ChillDoodle } from "./ChillDoodle";
import { LazyViewportVideo } from "../LazyViewportVideo";

const featured = ARCHITECTURAL_SETS[0]!;

export function SetOfTheMonth() {
  const title = featured.name.split("·")[0]?.trim() ?? featured.name;

  return (
    <section className="landing-set-month" aria-label="Set of the month">
      <ChillDoodle kind="ribbon" className="chill-doodle--tr" />
      <div className="landing-set-month-inner">
        <p className="landing-set-month-eyebrow section-pointer">
          <SectionDoodle kind="spark" />
          Set of the month
        </p>
        <div className="landing-hero-feature">
          <LazyViewportVideo
            src={featured.video}
            poster={featured.img}
            className="bento-set-video"
            playOnHover
          />
          <span className="landing-hero-feature-label">{title}</span>
        </div>
        <p className="landing-feature-caption">{title}</p>
      </div>
    </section>
  );
}