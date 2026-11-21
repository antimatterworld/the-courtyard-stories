import { Page } from "../components/Chrome";
import { StudioExplorer } from "../components/studio/StudioExplorer";
import { localBusiness } from "../lib/schema";
import { STUDIO } from "../data/content";

export default function Studio() {
  return (
    <Page
      title="The Estate & Architectural Sets — Kapashera · The Courtyard Stories"
      description={`A 12,000+ sq ft architectural production estate in Kapashera: 5 heritage world sets, 360° drone flight clearance, daylight to night gala rigs. Hours ${STUDIO.hours}.`}
      schema={[localBusiness()]}
    >
      <StudioExplorer />
    </Page>
  );
}