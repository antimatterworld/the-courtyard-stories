import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Page } from "../components/Chrome";
import { ARCHITECTURAL_SETS } from "../data/content";

const GROUPS = [
  { id: "all", label: "All sets" },
  { id: "heritage", label: "Royal & traditional", ids: ["royal-haveli", "rustic-village"] },
  { id: "mughal", label: "Mughal", ids: ["mughal-colonnade"] },
  { id: "colour", label: "Colour courtyards", ids: ["chefchaouen-suite"] },
  { id: "evening", label: "Evening", ids: ["night-gala"] },
] as const;

export default function AllSets() {
  const [group, setGroup] = useState<(typeof GROUPS)[number]["id"]>("all");
  const active = GROUPS.find((g) => g.id === group) ?? GROUPS[0];
  const sets = useMemo(
    () =>
      active.id === "all"
        ? ARCHITECTURAL_SETS
        : ARCHITECTURAL_SETS.filter((set) => "ids" in active && active.ids.includes(set.id)),
    [active],
  );

  return (
    <Page title="All sets — The Courtyard Stories" description="The five architectural worlds on the Kapashera estate.">
      <section className="sets-page">
        <header className="sets-head">
          <p>The estate</p>
          <h1>All sets</h1>
        </header>
        <div className="sets-filters" role="tablist" aria-label="Set groups">
          {GROUPS.map((g) => {
            const count = g.id === "all" ? ARCHITECTURAL_SETS.length : g.ids.length;
            return (
              <button
                key={g.id}
                type="button"
                role="tab"
                aria-selected={group === g.id}
                className={group === g.id ? "is-active" : undefined}
                onClick={() => setGroup(g.id)}
              >
                {g.label}
                <span>{count}</span>
              </button>
            );
          })}
        </div>
        <ul className="sets-grid">
          {sets.map((set) => (
            <li key={set.id}>
              <article className="sets-card">
                <video src={set.video} poster={set.img} muted loop playsInline autoPlay />
                <div>
                  <p style={{ color: set.palette.accent }}>{set.tag}</p>
                  <h2>{set.name}</h2>
                  <p>{set.short}</p>
                  <Link to="/studio">Explore this set</Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </Page>
  );
}
