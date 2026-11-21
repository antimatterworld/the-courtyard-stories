import { Link } from "react-router-dom";
import { FAQAccordion } from "../FAQ";
import { SectionDoodle } from "./SectionDoodle";
import { ChillDoodle } from "./ChillDoodle";
import { SITE_FAQS } from "../../data/content";

export function LandingClose() {
  return (
    <>
      <section className="landing-close landing-band-cta" aria-label="Book a shoot">
        <ChillDoodle kind="pin" className="chill-doodle--tr" />
        <h2 className="section-pointer">
          <SectionDoodle kind="pin" />
          Book the courtyard.
        </h2>
        <Link to="/enquire" className="btn btn-primary landing-close-btn">
          Plan a shoot
        </Link>
      </section>
      <section className="landing-close-faq landing-band-faq" id="faq" aria-label="Location FAQs">
        <ChillDoodle kind="chat" className="chill-doodle--tr" />
        <h2 className="section-pointer">
          <SectionDoodle kind="loop" />
          Location FAQs
        </h2>
        <FAQAccordion faqs={SITE_FAQS.slice(0, 4)} title="" />
      </section>
    </>
  );
}