import { useEffect } from "react";
import { initRevealSystem } from "../../lib/reveal";
import { prefersReducedMotion } from "../../lib/motion";
import { CounterRails } from "./CounterRails";
import { HeroStatement } from "./HeroStatement";
import { LandingClose } from "./LandingClose";
import { MarqueeBand } from "./MarqueeBand";
import { PinnedRail } from "./PinnedRail";
import { ServiceList } from "./ServiceList";
import { SetOfTheMonth } from "./SetOfTheMonth";
import { StatementBlock } from "./StatementBlock";

export function LandingHome() {
  useEffect(() => {
    if (prefersReducedMotion()) document.body.classList.add("landing-reduced-motion");
    document.documentElement.style.setProperty("--bg", "var(--bg)");
    initRevealSystem();
    return () => document.body.classList.remove("landing-reduced-motion");
  }, []);

  return (
    <div className="landing">
      <HeroStatement />
      <PinnedRail />
      <SetOfTheMonth />
      <CounterRails />
      <MarqueeBand />
      <StatementBlock />
      <ServiceList />
      <LandingClose />
    </div>
  );
}