import { lazy, Suspense, useState } from "react";
import { Page } from "../components/Chrome";
import { LandingHome } from "../components/home/LandingHome";
import { cinematicEnabled } from "../cinematic/runtime/capability";
import { faqJSONLD, localBusiness } from "../lib/schema";
import { SITE_FAQS } from "../data/content";

const CinematicHome = lazy(() => import("../cinematic/CinematicHome"));

export default function Home() {
  const [cinematic] = useState(() => cinematicEnabled());
  return (
    <Page
      title="The Courtyard Stories — Heritage Architecture & Cinematic Production Venue in Delhi"
      description="Double-story Rajasthani haveli, carved terracotta Mughal colonnade, cobalt Moroccan arches, and night gala courtyards across 12,000+ sq ft in Kapashera. Enquire for a shoot day."
      schema={[localBusiness(), faqJSONLD(SITE_FAQS)]}
    >
      {cinematic ? (
        <Suspense fallback={<LandingHome />}>
          <CinematicHome />
        </Suspense>
      ) : (
        <LandingHome />
      )}
    </Page>
  );
}