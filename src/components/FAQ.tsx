import { useRef, type CSSProperties } from "react";

export function FAQAccordion({
  title = "Straight answers",
  faqs,
}: {
  title?: string;
  faqs: { q: string; a: string }[];
}) {
  const openFirst = useRef(faqs.length > 0);

  return (
    <div>
      <h2 className="h2 reveal" style={{ marginBottom: "var(--s-6)" }}>
        {title} <span className="serif-italic">from the studio desk</span>
      </h2>
      {faqs.map((f, i) => (
        <details
          key={f.q}
          className="faq-item reveal"
          open={i === 0 && openFirst.current}
          style={{ ["--reveal-delay" as string]: `${i * 60}ms` } as CSSProperties}
        >
          <summary>
            <span>{f.q}</span>
            <span className="plus" aria-hidden="true">+</span>
          </summary>
          <p className="faq-a">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
