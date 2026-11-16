/* ============================================================
   THE COURTYARD STORIES — studio content
   Single source of truth for every page.
   ============================================================ */

export const STUDIO = {
  name: "The Courtyard Stories",
  tagline: "Photography & video production studio",
  city: "Delhi",
  address: "B-14, Studio Lane, Saket, New Delhi 110017, India",
  addressShort: "Saket, New Delhi 110017",
  phone: "+91-98110-44320",
  phoneHref: "tel:+919811044320",
  whatsapp: "919811044320",
  email: "studio@courtyardstories.in",
  hours: "Mon – Sat · 09:00 – 21:00 IST",
  hoursNote: "Studio visits by appointment",
  est: 2018,
  instagram: "@courtyard.stories",
} as const;

/** Build a wa.me deep link with a prefilled, URL-encoded message. */
export function waLink(message: string): string {
  return `https://wa.me/${STUDIO.whatsapp}?text=${encodeURIComponent(message)}`;
}

/* ——————————————————————————————————————————————
   Services
   ———————————————————————————————————————————————— */

export type Service = {
  slug: string;
  index: string;
  name: string;
  short: string;
  intro: string;
  motif: "fashion" | "commercial" | "product" | "podcast" | "hero" | "crew" | "lens" | "studio";
  what: string[];
  inclusions: string[];
  equipment: string[];
  faqs: { q: string; a: string }[];
  turnaround: string;
  from: string;
  duration: string;
};

export const SERVICES: Service[] = [
  {
    slug: "fashion",
    index: "01",
    name: "Fashion Editorials & Lookbooks",
    short:
      "Editorial and campaign photography for designers, stylists and labels — full styling pipelines, retouching and print-ready deliverables.",
    intro:
      "From a single-look editorial to a season's full lookbook, we build the shoot around the story the clothes need to tell. Natural window light for softness, strobes for drama, and a colour-graded finish that holds up on a magazine spread, a runway show page, or a campaign billboard.",
    motif: "fashion",
    what: [
      "Editorial & campaign stills",
      "Runway & show coverage",
      "E-commerce lookbooks",
      "Designer brand identity shoots",
    ],
    inclusions: [
      "Shot list and moodboard session before the shoot",
      "Full crew: director, camera operator, gaffer, stylist support",
      "Natural-light and strobe setups on the cyclorama",
      "On-set monitor review with the client",
      "Colour-graded, retouched stills in 5 working days",
      "Print resolution (300 DPI, CMYK) on request",
    ],
    equipment: [
      "Full-frame mirrorless and medium-format bodies",
      "50mm, 85mm, 135mm prime lenses",
      "850W strobes with modifiers: softboxes, beauty dishes, snoots",
      "White seamless cyclorama with natural-light window wall",
    ],
    faqs: [
      {
        q: "How many looks can we shoot in one day at the studio?",
        a: "With our standard crew and a prepared set, we typically complete 12–18 styled looks in a full shoot day, including setups and retouching-graded handover the same evening. Rush turnaround of 48 hours is available.",
      },
      {
        q: "Do you work with external stylists and makeup artists?",
        a: "Yes — most of our fashion clients bring their own creative team. We host up to 6 on-set personnel comfortably and brief the whole crew on the shot plan beforehand so no time is lost on set.",
      },
      {
        q: "What does 'retouched' mean in your deliverables?",
        a: "Every deliverable goes through skin tone correction, garment clean-up, background polish and a film-emulsion colour grade matched to your moodboard. We don't do airbrushing that erases texture — the grain stays, the noise goes.",
      },
      {
        q: "Can we book just the studio space without a crew?",
        a: "Yes. The cyclorama and light rig are available on a space-only rate for 4-hour blocks, Monday to Saturday. The booking page walks you through it — pick 'Space only' and we'll send the access briefing.",
      },
    ],
    turnaround: "5 working days · 48h rush available",
    from: "From ₹45,000 / shoot day",
    duration: "Full day: 10:00 – 18:00 (8 hours)",
  },
  {
    slug: "commercial",
    index: "02",
    name: "Commercial Campaigns",
    short:
      "Cinematic campaign and brand film production for agencies, D2C and consumer goods — pre-visualisation, on-set crew and finished post.",
    intro:
      "We produce brand films that behave like broadcast: scripted, pre-visualised, shot on cinema glass, and graded to spec. Whether it's a 60-second masterpiece for YouTube or a family of 6s cuts for social, the pipeline is the same — story first, craft second, never the other way around.",
    motif: "commercial",
    what: [
      "Brand films (30s – 5 min)",
      "Product & catalogue films",
      "TV & OTT commercial production",
      "Social cutdowns & teaser edits",
    ],
    inclusions: [
      "Script and shot-list development with your brief",
      "Pre-visualisation board for key sequences",
      "Cinema camera package with prime glass set",
      "On-set director, DP, gaffer and sound",
      "Picture-lock edit, colour grade and audio mix",
      "Delivery in all requested specs (16:9, 9:16, 1:1)",
    ],
    equipment: [
      "6K/8K cinema bodies with 17–50mm prime sets",
      "Carbon tracks, sliders and jib for move shots",
      "HMI and LED panel rigs for controlled daylight looks",
      "Wireless audio and boom for location work",
    ],
    faqs: [
      {
        q: "How long does a full campaign take from brief to final video?",
        a: "A single hero film with 3 social cutdowns typically runs 4–6 weeks: 1 week pre-production, a shoot day (or two), then 2–4 weeks of edit, grade and revision rounds. Timelines are fixed in the proposal before we start.",
      },
      {
        q: "Do you shoot outside the studio, at location?",
        a: "We do. Around a third of our commercial work is location-based — across Delhi NCR and day-trips to Agra or Shimla. Locations are scoped in pre-prod; permits and logistics are handled by our production team.",
      },
      {
        q: "What revisions are included?",
        a: "Two full revision rounds on the cut are standard. Grade tweaks within the same look are included; a new creative direction is scoped separately. Most clients lock the film inside round two.",
      },
      {
        q: "Can you adapt our existing brand kit (fonts, colours, logo)?",
        a: "Absolutely — the grade, type and end-card templates are built around your kit. Send us your brand guidelines and we mirror them in the final masters.",
      },
    ],
    turnaround: "4–6 weeks incl. post · weekly check-ins",
    from: "From ₹1,20,000 / project",
    duration: "1–3 shoot days + post",
  },
  {
    slug: "product",
    index: "03",
    name: "Product Cinematography",
    short:
      "Macro stills and motion for D2C, F&B and luxury goods — shot and finished for e-commerce, campaigns and launch content.",
    intro:
      "Product work is about patience: the light has to sit on the glass exactly, the steam has to hit the frame, the turntable has to roll at the right speed. We build the set around the product's material — glass, metal, matte, liquid — and shoot stills and motion on the same day so your launch content is visually one family.",
    motif: "product",
    what: [
      "Macro still photography",
      "Motion & launch films",
      "Turntable and stop-motion",
      "Lifestyle context shots",
    ],
    inclusions: [
      "Material-specific lighting plan (glass / liquid / metal)",
      "Still + motion in one shoot day",
      "Set styling: props, surfaces and backdrops",
      "High-res stills (print-ready) and 4K/6K masters",
      "Square, vertical and 16:9 versions for each asset",
      "Usage-ready files with watermarked previews",
    ],
    equipment: [
      "Macro and 100mm prime lenses",
      "Turntables and micro gimbals",
      "HMI continuous rigs for liquid and glass work",
      "Light tables and fibre-optic setups",
    ],
    faqs: [
      {
        q: "How far in advance should we send products to the studio?",
        a: "Ideally 3 days before the shoot so the team can plan the lighting per material. Fragile or liquid products can be hand-carried on the day — we'll brief you on what to bring.",
      },
      {
        q: "How many products can we photograph in a day?",
        a: "For hero shots with full set-ups: 8–12. For a faster catalogue flow with simpler backdrops: 20–30. We'll scope the exact count against your list before you book.",
      },
      {
        q: "Do you shoot on our existing product website's style?",
        a: "Send 3–5 images you love (or don't) and we match the look in pre-prod. Consistency with your existing catalogue matters — we don't make your feed look like two different brands.",
      },
      {
        q: "Is motion included with every product shoot?",
        a: "Yes — stills and motion on the same day is our standard offering. If you only need stills, we'll quote it slightly lighter.",
      },
    ],
    turnaround: "3 working days · same-day proofs",
    from: "From ₹28,000 / product set",
    duration: "Half or full day",
  },
  {
    slug: "podcast",
    index: "04",
    name: "Podcasts & Reel Production",
    short:
      "Multi-cam podcast sets, long-form video and vertical cutdowns for shows, creators and brands that publish on audio and video.",
    intro:
      "Our podcast suite is built for shows that look as good as they sound: three locked-off cinema cameras, individual mix-minus audio feeds, warm tungsten practicals, and an on-set editor who cuts your first vertical reel while you're still recording. By the time you wrap, your episode is ready to publish.",
    motif: "podcast",
    what: [
      "Multi-cam podcast recording",
      "Episodes & long-form video",
      "Vertical cutdowns & teasers",
      "Captions & show branding",
    ],
    inclusions: [
      "Dedicated podcast room with acoustic treatment",
      "3 cinema cameras, locked off on a director feed",
      "Individual mix-minus audio per host",
      "On-set vertical reel cut of the episode",
      "Burned captions and episode chapter markers",
      "Delivered masters: 4K video, 16-bit WAV stems",
    ],
    equipment: [
      "Large-diaphragm studio mics on individual feeds",
      "6K/8K cinema bodies on locked-off heads",
      "Monitor wall for host checks",
      "Tungsten practicals and soft key rig",
    ],
    faqs: [
      {
        q: "How many guests can the podcast room host?",
        a: "Comfortably up to 4 on a two-host layout, or 6 in a round-table layout with two additional cameras. Audio feeds scale per guest — no shared mics.",
      },
      {
        q: "Do you provide the editing of the full episode?",
        a: "Yes. The full-episode edit, captions and one vertical cutdown are included in every recording package. Additional cutdowns (say, 5 for a 4-episode drop) are quoted per reel.",
      },
      {
        q: "Can we record our own music or voiceover in the room?",
        a: "The acoustic treatment is built for dialogue, not music. For music sessions we'll point you to a partner room in our production house; same crew, better acoustics.",
      },
      {
        q: "How fast do we get the cutdown?",
        a: "The first vertical reel is delivered within 48 hours of recording. The full episode edit and captions follow in 5 working days.",
      },
    ],
    turnaround: "Reels in 48h · full episode in 5 days",
    from: "From ₹35,000 / recording day",
    duration: "Half or full day",
  },
];

/* ——————————————————————————————————————————————
   Portfolio
   ———————————————————————————————————————————————— */

export type PortfolioItem = {
  id: string;
  title: string;
  category: "fashion" | "commercial" | "product" | "podcast";
  type: "Still" | "Reel";
  year: string;
  credit: string;
  blurb: string;
  aspect: string; // css aspect-ratio for the media box
  img: string;
  motif:
    | "hero"
    | "fashion"
    | "product"
    | "podcast"
    | "commercial"
    | "crew"
    | "lens"
    | "studio";
};

/**
 * Media paths — filled in from Flow-generated assets in
 * `partner-asset-manifest.md`. `aspect` is pre-declared so the
 * masonry layout has zero layout shift before images load.
 */
export const PORTFOLIO: PortfolioItem[] = [
  {
    id: "atelier-meraki",
    title: "Atelier Meraki — Autumn Lookbook",
    category: "fashion",
    type: "Still",
    year: "2026",
    credit: "Editorial · 24 looks",
    blurb:
      "A 24-look autumn lookbook shot over two days on the cyclorama. Window light for the linen looks, hard strobes for the structured tailoring. Grade matched to the brand's ochre-and-bone palette.",
    aspect: "4/5",
    img: "/assets/flow/fashion.jpg",
    motif: "fashion",
  },
  {
    id: "sundara-campaign",
    title: "Sundara — 'Slow Mornings' Campaign",
    category: "commercial",
    type: "Reel",
    year: "2026",
    credit: "60s hero + 3 cutdowns",
    blurb:
      "A 60-second hero film for a coffee brand: single-continuous takes, steam as the third character, and a family of vertical cuts for launch week. Shot on 6K with 17mm prime glass.",
    aspect: "21/9",
    img: "/assets/flow/commercial.jpg",
    motif: "commercial",
  },
  {
    id: "lumen-skincare",
    title: "Lumen — Skincare Launch Kit",
    category: "product",
    type: "Still",
    year: "2025",
    credit: "12 products · still + motion",
    blurb:
      "The full launch kit for a glass-bottle skincare range: macro stills, hero motion loops and lifestyle context shots, all lit through a single light-table build so the feed reads as one family.",
    aspect: "1/1",
    img: "/assets/flow/product.jpg",
    motif: "product",
  },
  {
    id: "field-notes-show",
    title: "Field Notes — Season Two Set",
    category: "podcast",
    type: "Reel",
    year: "2026",
    credit: "Multi-cam + on-set reel",
    blurb:
      "Three-camera podcast set for a long-form interview show. Individual mix-minus per guest, warm tungsten practicals, and the first vertical cutdown delivered same-evening while the crew was still packing.",
    aspect: "16/9",
    img: "/assets/flow/podcast.jpg",
    motif: "podcast",
  },
  {
    id: "dhara-runway",
    title: "Dhara — Couture Show Coverage",
    category: "fashion",
    type: "Reel",
    year: "2025",
    credit: "Runway · 18 looks",
    blurb:
      "On-floor runway coverage with a synced second camera: walk, head-turn, and detail frames cut to the house music. Delivered the morning after the show for the brand's announcement post.",
    aspect: "3/2",
    img: "/assets/flow/crew.jpg",
    motif: "crew",
  },
  {
    id: "barista-co",
    title: "Barista Co — Barista Tools Line",
    category: "product",
    type: "Still",
    year: "2025",
    credit: "Steel & wood · 9 SKUs",
    blurb:
      "A nine-piece pour-over line shot for both the brand site and a retailer listing. Macro detail passes for the burr, the spout and the wood grain, on a shared stone-and-linen set.",
    aspect: "4/5",
    img: "/assets/flow/lens.jpg",
    motif: "lens",
  },
  {
    id: "kites-ott",
    title: "Kites Films — OTT Series Promo",
    category: "commercial",
    type: "Reel",
    year: "2026",
    credit: "45s + social suite",
    blurb:
      "Promo suite for a streaming series: one 45-second hero and six 6s social cuts, graded to the show's teal-and-amber LUT with the episode titles typeset on-brand.",
    aspect: "21/9",
    img: "/assets/flow/hero.jpg",
    motif: "commercial",
  },
  {
    id: "amara-portrait",
    title: "Amara — Founder Portrait Series",
    category: "fashion",
    type: "Still",
    year: "2026",
    credit: "8 portraits · window light",
    blurb:
      "Eight founder portraits across two studio days, all window light, all one grade. Shot tight on the face and wide on the desk — the two frames used as a pair in the company profile.",
    aspect: "3/4",
    img: "/assets/flow/hero.jpg",
    motif: "fashion",
  },
];

export const CATEGORIES = [
  { key: "all", label: "All work" },
  { key: "fashion", label: "Fashion" },
  { key: "commercial", label: "Commercial" },
  { key: "product", label: "Product" },
  { key: "podcast", label: "Podcast & Video" },
] as const;

/* ——————————————————————————————————————————————
   Studio space & amenities
   ———————————————————————————————————————————————— */

export const STUDIO_FACTS = [
  {
    stat: "1,800",
    label: "sq ft studio floor",
    note: "Split across the cyclorama bay and the podcast suite",
  },
  {
    stat: "30 ft",
    label: "cyclorama wall",
    note: "Seamless white, curved to floor — built for fashion and product",
  },
  {
    stat: "11 am",
    label: "peak window light",
    note: "North-facing window wall for soft, shadowless key light",
  },
  {
    stat: "6",
    label: "on-set crew max",
    note: "Casting, styling and second units comfortably hosted",
  },
];

export const STUDIO_FEATURES = [
  {
    title: "Natural-light cyclorama",
    body: "A 30-foot seamless cyclorama sits behind a north-facing window wall. The morning sun gives you a soft key that costs nothing in strobes — most fashion clients book 10 am to 1 pm for this reason.",
  },
  {
    title: "Podcast & voice suite",
    body: "Acoustically treated room with three locked-off cinema cameras, individual mix-minus feeds per guest, and a monitor wall. We run it as our own podcast floor and rent it by the half-day.",
  },
  {
    title: "Green room & cast area",
    body: "Dressing room with mirrors, makeup counter, hair stations and a full wardrobe rack. Cast, models and external stylists have a proper space that isn't the corridor.",
  },
  {
    title: "Colour grade bay",
    body: "A calibrated grading suite with a reference monitor. Clients can sit in the room and approve the grade with us before files are delivered — no blind email round-trips.",
  },
];

/* ——————————————————————————————————————————————
   Global FAQ (services pages have their own)
   ———————————————————————————————————————————————— */

export const SITE_FAQS = [
  {
    q: "Where is the studio and how do we get there?",
    a: "The studio is on Saket, New Delhi — a 15-minute drive from Saket metro. There's on-site parking for two cars; the rest of the team can park in the lot next door. We'll share the pin on confirmation.",
  },
  {
    q: "Do we have to come to Delhi, or can the shoot happen at our location?",
    a: "Both. Studio shoots happen at Saket; we also produce location shoots across Delhi NCR and day-trip destinations. Location adds travel and logistics time to the quote — it's always scoped before you book.",
  },
  {
    q: "How do we pay, and what's the advance?",
    a: "A 40% advance confirms the date; the balance is due on delivery. UPI, NEFT and cards are all accepted. The booking link walks you through both steps.",
  },
  {
    q: "What's your policy on rush turnaround?",
    a: "48-hour rush is available on fashion and product stills. Commercial and podcast work has a fixed post pipeline — we'll tell you what's actually achievable when you ask, not promise the impossible.",
  },
  {
    q: "Can we use the work for paid media?",
    a: "Yes. Everything delivered is cleared for paid use, social and print. Model releases and music licences are part of the delivery — we flag anything that needs attention before it ships.",
  },
  {
    q: "Do you shoot for brands outside fashion and D2C?",
    a: "We're strongest in fashion, commercial, product and podcast work. We've produced for F&B, tech, real estate and education — if the brief is visual-first, we're the right studio.",
  },
];

/* ——————————————————————————————————————————————
   Enquiry form config
   ———————————————————————————————————————————————— */

export const ENQUIRY_STEPS = [
  { key: "shoot", label: "Shoot type" },
  { key: "date", label: "Dates & scale" },
  { key: "needs", label: "Crew & kit" },
  { key: "contact", label: "Your details" },
] as const;

export const SHOOT_TYPES = [
  { key: "fashion", label: "Fashion editorial", desc: "Lookbooks, campaigns, runway" },
  { key: "commercial", label: "Commercial / brand film", desc: "Hero film, cutdowns, ads" },
  { key: "product", label: "Product photography", desc: "Still + motion, e-commerce" },
  { key: "podcast", label: "Podcast / video", desc: "Episodes, multi-cam sets" },
  { key: "space", label: "Space only", desc: "Cyclorama, podcast room" },
  { key: "other", label: "Something else", desc: "Tell us in the notes" },
] as const;

export const CREW_SIZES = [
  { key: "1-2", label: "Just us (1–2)" },
  { key: "3-5", label: "Small crew (3–5)" },
  { key: "6-10", label: "Full team (6–10)" },
  { key: "10+", label: "Large cast (10+)" },
] as const;

export const KIT_NEEDS = [
  { key: "camera", label: "Camera + lens kit" },
  { key: "lighting", label: "Lighting rig" },
  { key: "styling", label: "Styling / set design" },
  { key: "audio", label: "Audio recording" },
  { key: "colorist", label: "Colourist" },
  { key: "editing", label: "Video editor" },
] as const;
