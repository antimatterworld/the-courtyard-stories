import { SERVICES, SITE_FAQS, STUDIO, PORTFOLIO } from "../data/content";

export type JSONLD = Record<string, unknown>;

const SITE = "https://courtyardstories.in";

/* — LocalBusiness / PhotographyStudio (all pages) — */
export function localBusiness(): JSONLD {
  return {
    "@context": "https://schema.org",
    "@type": "PhotographyStudio",
    "@id": `${SITE}/#studio`,
    name: STUDIO.name,
    url: SITE,
    logo: `${SITE}/assets/og-studio.jpg`,
    image: SERVICES.map((s) => `${SITE}/assets/flow/${s.slug}.jpg`),
    telephone: STUDIO.phone,
    email: STUDIO.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "B-14, Studio Lane, Saket",
      addressLocality: "New Delhi",
      addressRegion: "Delhi",
      postalCode: "110017",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 28.5282,
      longitude: 77.2097,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "21:00",
      },
    ],
    priceRange: "₹₹₹",
    areaServed: "Delhi NCR",
    description:
      "The Courtyard Stories is a premium photography and video production studio in Saket, New Delhi — fashion editorials, commercial campaigns, product cinematography and podcast production on a natural-light cyclorama.",
    sameAs: [`https://instagram.com/${STUDIO.instagram.replace("@", "")}`],
    foundingDate: String(STUDIO.est),
    knowsAbout: ["fashion photography", "commercial film", "product cinematography", "podcast production"],
  };
}

/* — Service (per service landing page) — */
export function serviceJSONLD(slug: string): JSONLD | null {
  const s = SERVICES.find((x) => x.slug === slug);
  if (!s) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${s.name} — ${STUDIO.name}`,
    provider: { "@id": `${SITE}/#studio` },
    serviceType: s.name,
    description: s.intro,
    areaServed: "Delhi NCR",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${s.name} inclusions`,
      itemListElement: s.inclusions.map((i) => ({ "@type": "Offer", name: i })),
    },
  };
}

/* — FAQPage (per page that shows FAQs) — */
export function faqJSONLD(faqs: { q: string; a: string }[]): JSONLD {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/* — ItemList of services (services hub) — */
export function servicesListJSONLD(): JSONLD {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: SERVICES.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.name,
      url: `${SITE}/services/${s.slug}`,
      description: s.short,
    })),
  };
}

/* — CollectionPage for portfolio — */
export function portfolioJSONLD(): JSONLD {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Selected work — The Courtyard Stories",
    url: `${SITE}/work`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: PORTFOLIO.map((p, i) => ({
        "@type": "CreativeWork",
        position: i + 1,
        name: p.title,
        description: p.blurb,
        dateCreated: p.year,
      })),
    },
  };
}

/* — Breadcrumb helper — */
export function breadcrumbJSONLD(items: { name: string; url: string }[]): JSONLD {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export { SITE_FAQS };
