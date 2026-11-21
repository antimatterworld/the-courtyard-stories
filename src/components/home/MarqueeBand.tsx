import { ChillDoodle } from "./ChillDoodle";

const LABELS = ["Fashion", "Commercial", "Location hire", "Events", "Drone & aerial"] as const;

export function MarqueeBand() {
  const row = LABELS.join(" · ");
  return (
    <section className="landing-marquee" aria-hidden="true">
      <ChillDoodle kind="wave" className="chill-doodle--tr" />
      <div className="landing-marquee-track">
        <span>{row} · </span>
        <span>{row} · </span>
      </div>
    </section>
  );
}