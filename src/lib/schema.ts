import { SERVICES, SITE_FAQS, STUDIO, PORTFOLIO } from "../data/content";

export type JSONLD = Record<string, unknown>;

const SITE = "https://thecourtyard-stories.com";

/* — LocalBusiness / PhotographyStudio (all pages) — */
export function localBusiness(): JSONLD {
  return {
    "@context": "https://schema.org",
    "@type": "PhotographyStudio",
    "@id": `${SITE}/#studio`,
    name: STUDIO.name,
    url: SITE,
    logo: `${SITE}/assets/og/og-courtyard.jpg`,
    image: SERVICES.map((s) => `${SITE}${s.img}`),
    telephone: STUDIO.phone,
    email: STUDIO.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: STUDIO.streetAddress,
      addressLocality: "New Delhi",
      addressRegion: "Delhi",
      postalCode: STUDIO.postalCode,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: STUDIO.latitude,
      longitude: STUDIO.longitude,
    },
    hasMap: STUDIO.mapsUrl,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "08:00",
        closes: "21:00",
      },
    ],
    priceRange: "₹₹₹",
    areaServed: "Delhi NCR",
    description:
      "The Courtyard Stories is an authentic 12,000+ sq ft architectural production estate in Kapashera, Palam Farms, New Delhi — featuring 5 heritage sets (Rajasthani Haveli, Mughal Terracotta Colonnade, Chefchaouen Moroccan Suite, Thatched Village Set, and Night Gala Rig), 360° drone clearance, fashion lookbooks, commercial films, and luxury event production.",
    sameAs: [`https://instagram.com/${STUDIO.instagram.replace("@", "")}`],
    foundingDate: String(STUDIO.est),
    knowsAbout: ["architectural sets", "drone cinematography", "fashion lookbooks", "commercial films", "location hire", "luxury gala events"],
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
