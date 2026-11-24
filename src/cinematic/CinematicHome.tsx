import { useEffect } from "react";
import { LandingClose } from "../components/home/LandingClose";
import { MarqueeBand } from "../components/home/MarqueeBand";
import { ServiceList } from "../components/home/ServiceList";
import { SetOfTheMonth } from "../components/home/SetOfTheMonth";
import { StatementBlock } from "../components/home/StatementBlock";
import { RecentShoots } from "./story/RecentShoots";
import { StoryTrack } from "./story/StoryTrack";
import "../styles/story.css";

export default function CinematicHome() {
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.overflowX;
    root.classList.add("cinematic-on");
    root.style.overflowX = "visible";
    return () => {
      root.classList.remove("cinematic-on");
      root.style.overflowX = previous;
    };
  }, []);

  return (
    <div className="cinematic-home">
      <StoryTrack />
      <div className="cinematic-after">
        <RecentShoots />
        <SetOfTheMonth />
        <MarqueeBand />
        <StatementBlock />
        <ServiceList />
        <LandingClose />
      </div>
    </div>
  );
}
