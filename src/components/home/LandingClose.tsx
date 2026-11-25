import { useState } from "react";
import { Link } from "react-router-dom";
import { SITE_FAQS, STUDIO } from "../../data/content";

const FAQS = SITE_FAQS.slice(0, 4);

export function LandingClose() {
  const [open, setOpen] = useState(0);
  const answer = FAQS[open] ?? FAQS[0]!;

  return (
    <>
      <section className="book-invite" aria-label="Book a shoot">
        <div className="book-invite-copy">
          <p className="book-invite-kicker">{STUDIO.addressShort}</p>
          <h2>
            Book the
            <span>courtyard.</span>
          </h2>
          <p>A private estate for fashion, film, and evening gatherings. Walk the sets before you lock a date.</p>
        </div>
        <Link to="/enquire" className="book-card">
          <svg viewBox="0 0 280 90" aria-hidden="true">
            <path d="M20 78 V42 C20 18 70 8 140 8 C210 8 260 18 260 42 V78" />
          </svg>
          <span>Call sheet</span>
          <strong>Plan a shoot</strong>
          <em>
            {STUDIO.hours}
            <br />
            {STUDIO.phone}
          </em>
        </Link>
      </section>

      <section className="faq-desk" id="faq" aria-label="Location FAQs">
        <header>
          <p>From the studio desk</p>
          <h2>Location FAQs</h2>
        </header>
        <div className="faq-desk-grid">
          <ol>
            {FAQS.map((item, index) => (
              <li key={item.q}>
                <button type="button" aria-expanded={open === index} onClick={() => setOpen(index)}>
                  <i>0{index + 1}</i>
                  {item.q}
                </button>
                {/* Phones show the answer here; laptops show it on the note beside the list. */}
                {open === index ? <p className="faq-desk-inline">{item.a}</p> : null}
              </li>
            ))}
          </ol>
          <article key={answer.q}>
            <p>{answer.a}</p>
          </article>
        </div>
      </section>
    </>
  );
}
