/* ============================================================
   THE COURTYARD STORIES — studio content
   Single source of truth for every page.
   100% verified against real estate assets and drone footage.
   ============================================================ */

export const STUDIO = {
  name: "The Courtyard Stories",
  tagline: "Heritage Architecture & Cinematic Production Venue",
  city: "Delhi",
  address:
    "Farm No. 3, The Courtyard Stories, behind FIMT College, Kapashera, Palam Farms, New Delhi, Delhi 110037, India",
  addressShort: "Kapashera, New Delhi 110037",
  streetAddress: "Farm No. 3, The Courtyard Stories, behind FIMT College, Kapashera, Palam Farms",
  postalCode: "110037",
  coordinates: "28.5269° N, 77.1858° E",
  latitude: 28.526851,
  longitude: 77.185752,
  plusCode: "G3FC+VC New Delhi",
  mapsUrl:
    "https://www.google.com/maps/place/The+Courtyard+Stories/@28.526851,77.185752,17z/data=!4m6!3m5!1s0x390d865b4a3cbb57:0xb5ba7cfac4097493!8m2!3d28.526851!4d77.185752!16s%2Fg%2F11t8w9xqht",
  mapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.46!2d77.185752!3d28.526851!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d865b4a3cbb57%3A0xb5ba7cfac4097493!2sThe%20Courtyard%20Stories!5e0!3m2!1sen!2sin!4v1732185600000!5m2!1sen!2sin",
  metroNote:
    "Approx. 15–20 min from Dwarka Sector 21 Metro (Blue Line); on the Kapashera–Palam Farms lane behind FIMT College",
  phone: "+91-98186-37485",
  phoneHref: "tel:+919818637485",
  whatsapp: "919818637485",
  email: "studio@thecourtyard-stories.com",
  hours: "Mon – Sat · 08:00 – 22:00 IST",
  hoursNote: "Shoots & location walkthroughs by appointment",
  est: 2018,
  instagram: "@courtyard.stories",
} as const;

/** Build a wa.me deep link with a prefilled, URL-encoded message. */
export function waLink(message: string): string {
  return `https://wa.me/${STUDIO.whatsapp}?text=${encodeURIComponent(message)}`;
}

/* ——————————————————————————————————————————————
   Architectural Zones & Sets (from real drone footage)
   ———————————————————————————————————————————————— */

export type ArchitecturalSet = {
  id: string;
  name: string;
  tag: string;
  short: string;
  description: string;
  features: string[];
  bestFor: string[];
  lighting: string;
  img: string;
  video: string;
  palette: {
    accent: string;
    accentLight: string;
    bgTint: string;
    borderTint: string;
    name: string;
  };
};

export const ARCHITECTURAL_SETS: ArchitecturalSet[] = [
  {
    id: "royal-haveli",
    name: "The Royal Ochre Haveli & Courtyard",
    tag: "Zone 01 · Heritage Haveli",
    short: "Double-story Rajasthani facade with carved jharokhas, handpainted floral niches, traditional wooden doors, and central terracotta courtyard.",
    description: "Built with authentic Rajasthani heritage architectural details: ochre yellow lime-wash walls, double-story arched jharokha balconies, traditional black floral doors, central terracotta patio with a woven charpai and moodha chairs, and an exterior stone staircase connecting both levels.",
    features: [
      "Double-story arched balconies & jharokhas",
      "Hand-painted floral alcoves & traditional carved doors",
      "Terracotta paved inner courtyard with authentic daybed",
      "Architectural exterior staircase for high-angle fashion framing",
    ],
    bestFor: ["Haute Couture Lookbooks", "Bridal & Heritage Campaigns", "Period Commercials", "Fashion Stills"],
    lighting: "Direct morning sunlight through 12:00; soft ambient courtyard shadows afternoon; lantern-lit night.",
    img: "/assets/real/flythrough-02-haveli.webp",
    video: "/assets/real/flythrough-02-haveli.mp4",
    palette: {
      accent: "var(--accent)",
      accentLight: "var(--accent)",
      bgTint: "rgba(194, 139, 56, 0.10)",
      borderTint: "rgba(194, 139, 56, 0.35)",
      name: "Ochre Sandstone",
    },
  },
  {
    id: "mughal-colonnade",
    name: "The Grand Mughal Terracotta Pavilion",
    tag: "Zone 02 · Mughal Colonnade",
    short: "Carved geometric terracotta jalis, Moroccan hanging brass lanterns, and patterned tile verandas creating rhythmic light-and-shadow play.",
    description: "An expansive terracotta pavilion featuring intricately carved geometric jali screens on rhythmic arches. The latticework filters harsh Indian sunlight into delicate lace shadows on the stone tile floor. Accentuated with vintage hanging brass Moroccan lanterns and tropical potted foliage.",
    features: [
      "Full-height geometric terracotta jali screens",
      "Authentic brass Moroccan filigree hanging lanterns",
      "Patterned ceramic and stone veranda flooring",
      "Shaded colonnade corridor with natural breeze and light filtering",
    ],
    bestFor: ["High-Fashion Editorials", "Luxury Jewellery & Accessories", "Music Videos", "Cinematic Dialogues"],
    lighting: "Dramatically raking sunbeams through jalis at morning & golden hour.",
    img: "/assets/real/flythrough-03-colonnade.webp",
    video: "/assets/real/flythrough-03-colonnade.mp4",
    palette: {
      accent: "var(--accent)",
      accentLight: "var(--accent)",
      bgTint: "rgba(200, 98, 68, 0.10)",
      borderTint: "rgba(200, 98, 68, 0.35)",
      name: "Terracotta Jali",
    },
  },
  {
    id: "chefchaouen-suite",
    name: "The Chefchaouen Moroccan Suite",
    tag: "Zone 03 · Mediterranean Arches",
    short: "Vibrant cobalt blue surfaces, delicate white horseshoe jalis, ceramic plate wall features, and mosaic tile courtyards.",
    description: "A striking Mediterranean and Moroccan enclave with rich cobalt blue and ochre walls, delicate white horseshoe arches with arabesque latticework, artisanal ceramic wall plates, and mosaic patterned stone paving. Designed for high-contrast fashion and vibrant editorial palettes.",
    features: [
      "Vivid cobalt blue walls with mustard orange contrast accents",
      "Delicate white horseshoe arch latticework screens",
      "Traditional ceramic plate wall decor and cobalt pillars",
      "Intricate mosaic floor pattern for dramatic wide shots",
    ],
    bestFor: ["Contemporary Fashion & Resort Wear", "Footwear & Eyewear Campaigns", "D2C Brand Stories", "Editorial Reels"],
    lighting: "Even, high-saturation daylight with crisp architectural contrast.",
    img: "/assets/real/flythrough-04-mediterranean.webp",
    video: "/assets/real/flythrough-04-mediterranean.mp4",
    palette: {
      accent: "var(--accent)",
      accentLight: "var(--accent)",
      bgTint: "rgba(30, 75, 148, 0.10)",
      borderTint: "rgba(30, 75, 148, 0.35)",
      name: "Moroccan Cobalt",
    },
  },
  {
    id: "rustic-village",
    name: "The Thatched Lookout & Rustic Heritage Set",
    tag: "Zone 04 · Earth & Thatch",
    short: "Natural reed thatch roof, wooden lookout deck, mud plaster textures, jute sacks, and organic rural textures.",
    description: "An organic rustic enclave offering natural reed thatch pavilions, raised wooden lookout platforms, handcrafted rope ladders, mud plaster wall finishes, and authentic rural props (jute grain sacks, earthen pots, charpai). Offers grounded organic warmth.",
    features: [
      "Natural woven reed thatched canopy structure",
      "Raised wooden lookout deck and timber railings",
      "Earthy mud-wash textures and clay finishes",
      "Artisan jute sacks, charpai, and rural props",
    ],
    bestFor: ["Organic & Sustainable Brand Campaigns", "Folk & Acoustic Music Videos", "Textile & Handloom Storytelling"],
    lighting: "Warm golden tones, filtered light under reed thatch.",
    img: "/assets/real/portfolio-thatched-tower.webp",
    video: "/assets/real/portfolio-thatched-tower.mp4",
    palette: {
      accent: "var(--accent)",
      accentLight: "var(--accent)",
      bgTint: "rgba(139, 111, 71, 0.10)",
      borderTint: "rgba(139, 111, 71, 0.35)",
      name: "Natural Thatch & Jute",
    },
  },
  {
    id: "night-gala",
    name: "The Grand Courtyard Gala & Night Set",
    tag: "Zone 05 · Evening & Gala",
    short: "Warm string light canopies, glowing brass lanterns, candlelit banquet tables, velvet draped arches, and illuminated cocktail bar.",
    description: "As night falls, The Courtyard Stories transforms into a magical illuminated haven. Strings of warm fairy lights stretch across the open sky, brass wall lanterns glow against royal arches, banquet tables are dressed in deep burgundy velvet with gold chiavari chairs, and ambient uplighting bathes the architecture.",
    features: [
      "Full courtyard overhead fairy light canopy network",
      "Warm tungsten brass lanterns and architectural uplights",
      "Luxury banquet tables with velvet drapery and chiavari seating",
      "Illuminated cocktail bar and lounge configuration",
    ],
    bestFor: ["Luxury Festive & Diwali Campaigns", "Night Soirées & Brand Launches", "Celebrity Afterparties", "Intimate Receptions"],
    lighting: "Golden 2700K tungsten practicals, fairy lights, candlelit ambiance.",
    img: "/assets/real/flythrough-05-nightgala.webp",
    video: "/assets/real/flythrough-05-nightgala.mp4",
    palette: {
      accent: "var(--accent)",
      accentLight: "var(--accent)",
      bgTint: "rgba(217, 155, 38, 0.10)",
      borderTint: "rgba(217, 155, 38, 0.35)",
      name: "Tungsten Amber & Brass",
    },
  },
];

/* ——————————————————————————————————————————————
   Services
   ———————————————————————————————————————————————— */

export type Service = {
  slug: string;
  index: string;
  name: string;
  short: string;
  intro: string;
  motif: "fashion" | "commercial" | "studio" | "events";
  what: string[];
  inclusions: string[];
  equipment: string[];
  faqs: { q: string; a: string }[];
  turnaround: string;
  from: string;
  duration: string;
  img: string;
  video: string;
};

export const SERVICES: Service[] = [
  {
    slug: "fashion",
    index: "01",
    name: "Fashion Editorials & Couture Lookbooks",
    short:
      "Haute couture, bridal, and contemporary designer campaigns set against authentic Rajasthani haveli arches, terracotta jalis, and Moroccan colonnades.",
    intro:
      "Our estate was sculpted to provide fashion designers, stylists, and luxury labels with an authentic architectural playground. With natural morning sun sweeping through jharokhas, dramatic stone staircases, and 5 distinct contiguous sets, your lookbook moves from royal heritage to vibrant contemporary resort wear in a single shoot day.",
    motif: "fashion",
    what: [
      "Haute couture & bridal lookbooks",
      "Editorial campaigns for print & digital",
      "Jewellery, accessories & luxury footwear",
      "High-speed cinematic vertical reels",
    ],
    inclusions: [
      "Full location access across all 5 architectural zones",
      "Pre-shoot lighting roadmap & shot-list consultation",
      "Spacious air-conditioned vanity & green rooms with mirrors",
      "3-phase industrial power for high-output HMI & strobe rigs",
      "On-set production assistants and continuous support",
      "4K colour-graded previews & full resolution delivery",
    ],
    equipment: [
      "DJI Air 3S 4K 50fps dual-camera drone with licensed pilot",
      "Full-frame cinema rigs with cine-prime lenses (24mm, 50mm, 85mm)",
      "High-output Aputure / Nanlite continuous daylight rigs",
      "Diffusers, 12x12 scrims, flags, and C-stands for natural light shaping",
    ],
    faqs: [
      {
        q: "How many outfits or styled looks can we shoot in one day?",
        a: "With 5 modular architectural sets located within steps of each other, crews routinely complete 15–25 styled looks in a single day without wasting hours traveling between different locations.",
      },
      {
        q: "Are changing rooms and makeup setups available on site?",
        a: "Yes. We offer fully air-conditioned green rooms equipped with dedicated vanity stations, illuminated Hollywood mirrors, multiple clothing racks, and steaming facilities.",
      },
      {
        q: "Can we fly drones during our shoot?",
        a: "Yes! The Courtyard Stories has clear open-sky clearance for drone aerials, crane shots, and high-altitude establishing sweeps. Drone packages can be added with our in-house pilot or your own crew.",
      },
      {
        q: "What lighting conditions exist naturally in the courtyard?",
        a: "The main haveli receives crisp morning light that rakes across the ochre facades until midday, followed by soft diffused ambient shade in the afternoon. Golden hour hits the upper terraces with warm amber tones, followed by our full night gala fairy light rig.",
      },
    ],
    turnaround: "Proofs within 48h · Final masters in 5 working days",
    from: "From ₹45,000 / shoot day",
    duration: "Full day: 08:00 – 18:00 (10 hours)",
    img: "/assets/real/fashion-still.webp",
    video: "/assets/real/fashion-reel.mp4",
  },
  {
    slug: "commercial",
    index: "02",
    name: "Commercials & Cinematic Brand Films",
    short:
      "Broadcast-grade TV commercials, D2C brand films, music videos, and digital ad campaigns shot across grand architectural scales.",
    intro:
      "We produce commercial films that demand cinematic grandeur: scripted narratives, sweeping drone flythroughs, multi-level camera moves, and period or contemporary production design. The Courtyard Stories provides a complete backlot feel with zero external street noise, dedicated generator backup, and complete creative privacy.",
    motif: "commercial",
    what: [
      "Brand films & broadcast commercials (30s – 3 min)",
      "High-altitude drone establishing & tracking shots",
      "Music videos & narrative period pieces",
      "Social-first cinematic campaign suites (16:9 & 9:16)",
    ],
    inclusions: [
      "Complete exclusive venue buyout for uninterrupted sound recording",
      "Licensed drone operator for high-altitude & tracking passes",
      "Heavy power access for 18K HMIs, generator tie-in, and night lighting",
      "Client monitoring lounge with 4K calibrated OLED review feeds",
      "Secure prop storage, vehicle access right up to sets, and craft catering setup",
      "Full picture-lock, colour grade, and sound delivery in multi-ratio specs",
    ],
    equipment: [
      "DJI Air 3S 4K 50fps dual-telephoto drone package",
      "6K/8K Cinema camera packages on Ronin 2 / Steadicam rigs",
      "Heavy-duty carbon jib, track & dolly systems",
      "Complete tungsten practicals, sky panel arrays, and haze generators",
    ],
    faqs: [
      {
        q: "Is the location quiet enough for clean live dialogue audio?",
        a: "Yes. The venue is enclosed in an expansive private green enclave with heavy tree buffers that insulate the courtyards from main road traffic noise, enabling clean boom and lavalier recording.",
      },
      {
        q: "Can we install custom set elements or paint temporary surfaces?",
        a: "Yes. Our sets are built modularly. With advance notice during pre-production, temporary flooring, floral installations, fabric drapery, or branded props can be mounted with our approval.",
      },
      {
        q: "What is the power capacity for heavy film lighting rigs?",
        a: "We provide high-amperage 3-phase industrial power connections plus dedicated space and routing for external silent generator trucks (up to 125 kVA) for heavy night shoots.",
      },
      {
        q: "What revisions and deliverable formats are included?",
        a: "Standard delivery includes master ProRes 422 HQ exports, web-optimized MP4s in 16:9 widescreen, 9:16 vertical reels, and 1:1 square, with 2 full rounds of creative grading tweaks.",
      },
    ],
    turnaround: "Pre-production to delivery: 2–3 weeks",
    from: "From ₹1,25,000 / project",
    duration: "1–2 shoot days + post-production",
    img: "/assets/real/commercial-still.webp",
    video: "/assets/real/commercial-reel.mp4",
  },
  {
    slug: "studio",
    index: "03",
    name: "Architectural Sets & Location Hire",
    short:
      "Exclusive venue rental for production houses, external directors, still photographers, and creative agencies requiring authentic architectural sets.",
    intro:
      "For independent directors, production houses, and agency teams who bring their own crew and gear, The Courtyard Stories is available on a full or half-day location rental basis. Gain unrestricted access to 5 ready-to-shoot heritage and Mediterranean architectural sets with complete operational peace of mind.",
    motif: "studio",
    what: [
      "Full estate location hire (half-day or full-day)",
      "Exclusive single-zone bookings for compact crews",
      "360° drone flight clearance across the entire property",
      "Night lighting & practicals rental package",
    ],
    inclusions: [
      "Access to booked architectural zones and open courtyards",
      "Air-conditioned green rooms, private restrooms, and makeup stations",
      "Standard studio electrical power and WiFi",
      "On-site venue manager to assist with facility access",
      "Dedicated parking for up to 25 production vehicles and vanity vans",
    ],
    equipment: [
      "Basic grip package: C-stands, sandbags, apple boxes on request",
      "High-power industrial extension cables and distribution boxes",
      "Stepladders, reflector frames, and clothing racks",
    ],
    faqs: [
      {
        q: "Can we book only one specific set (e.g. Haveli or Moroccan Suite)?",
        a: "Yes. For compact crews (under 8 people), single-zone half-day bookings are available on weekdays. Full-day weekend shoots require an exclusive estate booking to ensure complete privacy.",
      },
      {
        q: "What are the standard shoot timings?",
        a: "Full-day bookings run 08:00 to 18:00 (10 hours). Extended night hours (18:00 to 22:00) with our full fairy light and lantern rig can be added on request.",
      },
      {
        q: "Can we do a recce or location walkthrough before booking?",
        a: "Absolutely! We encourage directors and DPs to visit. You can schedule a 30-minute walkthrough through our visit page or WhatsApp us to coordinate a slot.",
      },
      {
        q: "What is required to lock a date?",
        a: "A 40% advance payment confirms your reservation on our studio calendar, with the remaining 60% due on the morning of call-time.",
      },
    ],
    turnaround: "Instant booking confirmation within 4 business hours",
    from: "From ₹35,000 / half day",
    duration: "Half day (5 hrs) or Full day (10 hrs)",
    img: "/assets/real/studio-still.webp",
    video: "/assets/real/studio-reel.mp4",
  },
  {
    slug: "events",
    index: "04",
    name: "Brand Launches, Celebrations & VIP Receptions",
    short:
      "Exclusive intimate soirées, festive celebrations, luxury brand previews, and cultural gatherings under string-lit courtyards.",
    intro:
      "When an event demands an unforgettable soul, The Courtyard Stories offers an intimate open-air palace atmosphere right in South Delhi. From festive Diwali galas and luxury product unveilings to cocktail receptions and curated acoustic nights, the lit-up courtyards, velvet-draped arches, and starlit skies create timeless memories.",
    motif: "events",
    what: [
      "Curated brand launch experiences & press previews",
      "Festive Diwali, holiday & New Year soirées",
      "Intimate bridal sangeet & cocktail receptions",
      "Acoustic performances, film screenings & cultural salons",
    ],
    inclusions: [
      "Exclusive evening venue hire with full courtyard ambient lighting rig",
      "Fairy light canopies, brass lanterns, and warm architectural uplighting",
      "Illuminated cocktail bar and banquet dining setup",
      "Sound system routing for acoustic or ambient lounge sets",
      "Valet parking management and private security support",
      "Clean-up crew and dedicated event liaison",
    ],
    equipment: [
      "Integrated 2700K warm string light and wash rig",
      "PA audio system suitable for live acoustic and background playback",
      "Catering staging area with running water and power connections",
    ],
    faqs: [
      {
        q: "What is the guest capacity for evening events?",
        a: "The central courtyard comfortably accommodates 80–120 seated guests for banquet dining, or up to 250 guests in an open cocktail-reception format across the courtyards and lawn.",
      },
      {
        q: "Can we bring our own caterer and decor vendors?",
        a: "Yes. You may bring your preferred catering and decor teams. We also maintain a curated list of trusted Delhi partners who know the property's logistics intimately.",
      },
      {
        q: "Until what time can music play outdoors?",
        a: "In compliance with local guidelines, outdoor amplified sound operates until 22:00 IST, after which acoustic and ambient background sound can continue inside the shaded suites.",
      },
      {
        q: "Is on-site valet parking available?",
        a: "Yes. The property features dedicated vehicle ingress and valet staging that accommodates 25+ vehicles comfortably.",
      },
    ],
    turnaround: "Custom proposal within 24 hours of inquiry",
    from: "From ₹85,000 / evening event",
    duration: "Evening: 17:00 – 23:00 (6 hours)",
    img: "/assets/real/events-still.webp",
    video: "/assets/real/events-reel.mp4",
  },
];

/* ——————————————————————————————————————————————
   Portfolio (100% verified real assets)
   ———————————————————————————————————————————————— */

export type PortfolioItem = {
  id: string;
  title: string;
  category: "fashion" | "commercial" | "studio" | "events";
  type: "Still" | "Reel";
  year: string;
  credit: string;
  blurb: string;
  aspect: string; // css aspect-ratio for the media box
  img: string;
  video?: string; // seamless live motion video loop
  motif: "fashion" | "commercial" | "studio" | "events";
};

export const PORTFOLIO: PortfolioItem[] = [
  {
    id: "haveli-staircase-editorial",
    title: "Royal Haveli & Grand Staircase",
    category: "fashion",
    type: "Reel",
    year: "2026",
    credit: "Haute Couture Editorial · 4K 50fps",
    blurb:
      "Grand architectural framing on the exterior stone staircase of the Royal Haveli. High-angle drone reveal gliding over Rajasthani jharokhas and handpainted floral niches.",
    aspect: "16/9",
    img: "/assets/real/portfolio-haveli-staircase.webp",
    video: "/assets/real/portfolio-haveli-staircase.mp4",
    motif: "fashion",
  },
  {
    id: "diwali-courtyard-gala",
    title: "Diwali at The Courtyard Gala",
    category: "events",
    type: "Reel",
    year: "2026",
    credit: "Evening Festive Soirée · DaVinci Resolve Master",
    blurb:
      "A magical evening celebration in the main courtyard: overhead fairy light canopy, candlelit velvet banquet tables, illuminated royal arches, and live cocktail bar.",
    aspect: "9/16",
    img: "/assets/real/portfolio-night-banquet.webp",
    video: "/assets/real/portfolio-night-banquet.mp4",
    motif: "events",
  },
  {
    id: "mughal-terracotta-campaign",
    title: "Mughal Terracotta Pavilion",
    category: "commercial",
    type: "Still",
    year: "2026",
    credit: "Brand Campaign · 50fps Aerial Track",
    blurb:
      "Geometric terracotta jali screens filtering natural morning sunbeams onto patterned veranda floors, accented with hanging brass Moroccan lanterns.",
    aspect: "16/9",
    img: "/assets/real/portfolio-terracotta-jali.webp",
    video: "/assets/real/portfolio-terracotta-jali.mp4",
    motif: "commercial",
  },
  {
    id: "chefchaouen-blue-arches",
    title: "Chefchaouen Arches Fashion Suite",
    category: "fashion",
    type: "Reel",
    year: "2026",
    credit: "Contemporary Resort Wear · Drone Pan",
    blurb:
      "Vivid cobalt blue walls and delicate white horseshoe jalis with mosaic stone flooring. High-contrast Mediterranean aesthetic creating striking editorial color pops.",
    aspect: "16/9",
    img: "/assets/real/portfolio-blue-arches.webp",
    video: "/assets/real/portfolio-blue-arches.mp4",
    motif: "fashion",
  },
  {
    id: "courtyard-birdseye-geometry",
    title: "Geometric Terracotta & Cane Patio",
    category: "studio",
    type: "Still",
    year: "2026",
    credit: "90° Birds-Eye Drone Aerial",
    blurb:
      "Direct top-down 90-degree perspective over the central courtyard: traditional woven cane moodha chairs, tea table, and black-and-white woven charpai on terracotta paving.",
    aspect: "16/9",
    img: "/assets/real/portfolio-birdseye-cane.webp",
    video: "/assets/real/portfolio-birdseye-cane.mp4",
    motif: "studio",
  },
  {
    id: "thatched-village-tower",
    title: "Thatched Lookout & Rustic Set",
    category: "studio",
    type: "Still",
    year: "2026",
    credit: "Rustic Heritage Production · 4K Drone Sweep",
    blurb:
      "Elevated view of the rustic village set: natural reed thatched canopy, timber observation deck, mud wash walls, and handcrafted jute props.",
    aspect: "16/9",
    img: "/assets/real/portfolio-thatched-tower.webp",
    video: "/assets/real/portfolio-thatched-tower.mp4",
    motif: "studio",
  },
  {
    id: "brass-lantern-entrance",
    title: "Mughal Lanterns & Arch Glide",
    category: "commercial",
    type: "Reel",
    year: "2026",
    credit: "Cinematic Tracking Pass · Eye-Level 4K",
    blurb:
      "Smooth glide through the grand terracotta arch flanked by antique brass filigree lanterns and lush banana foliage, capturing architectural depth.",
    aspect: "16/9",
    img: "/assets/real/portfolio-brass-lanterns.webp",
    video: "/assets/real/portfolio-brass-lanterns.mp4",
    motif: "commercial",
  },
  {
    id: "vip-festive-gathering",
    title: "Celebrity Gala & Evening Reception",
    category: "events",
    type: "Reel",
    year: "2026",
    credit: "VIP Gathering · DaVinci Resolve Master",
    blurb:
      "High-profile festive celebration at The Courtyard Stories: guests in regal ethnic attire, glowing courtyard lamps, and warm starlit ambiance.",
    aspect: "9/16",
    img: "/assets/real/portfolio-festive-gathering.webp",
    video: "/assets/real/portfolio-festive-gathering.mp4",
    motif: "events",
  },
];

export const CATEGORIES = [
  { key: "all", label: "All sets & reels" },
  { key: "fashion", label: "Fashion & Lookbooks" },
  { key: "commercial", label: "Commercials & Aerials" },
  { key: "studio", label: "Architectural Sets" },
  { key: "events", label: "Night Galas & Events" },
] as const;

/* ——————————————————————————————————————————————
   Studio space & amenities (Real Facts)
   ———————————————————————————————————————————————— */

export const STUDIO_FACTS = [
  {
    stat: "12,000+",
    label: "sq ft production estate",
    note: "Spanning 5 modular architectural zones and open courtyards",
  },
  {
    stat: "5",
    label: "distinct world sets",
    note: "Rajasthani Haveli, Mughal Colonnade, Chefchaouen Suite, Thatched Tower, and Night Gala",
  },
  {
    stat: "360°",
    label: "drone flight clearance",
    note: "Clear open-sky airspace for sweeps, crane tracks, and aerial establishing passes",
  },
  {
    stat: "Day to Night",
    label: "lighting versatility",
    note: "From crisp morning sunbeams to full overhead fairy light and lantern rig",
  },
];

export const STUDIO_FEATURES = [
  {
    title: "Double-Story Royal Haveli",
    body: "An authentic Rajasthani heritage palace facade with double-height jharokha balconies, handpainted floral alcoves, authentic carved wooden doors, and an exterior stone staircase.",
  },
  {
    title: "Grand Mughal Terracotta Pavilion",
    body: "Full-height carved terracotta jali screens, Moroccan brass hanging lanterns, and rhythmic shaded arches that create hypnotic geometric shadow patterns throughout the day.",
  },
  {
    title: "Chefchaouen Moroccan Suite",
    body: "Vivid cobalt blue walls with mustard contrast, white horseshoe arch latticework screens, artisanal ceramic plate wall decor, and mosaic tile courtyards for striking color pops.",
  },
  {
    title: "Rustic Thatched Lookout & Village Set",
    body: "Natural reed thatch roof, wooden observation platform, mud plaster textures, jute grain sacks, and organic rural textures for earthy, grounded visual storytelling.",
  },
  {
    title: "Overhead Fairy Light & Night Gala Rig",
    body: "A permanent overhead matrix of warm fairy lights, architectural uplights, and glowing brass wall lanterns that transforms the courtyard into an illuminated wonderland after dusk.",
  },
  {
    title: "Vanity Suites & Production Logistics",
    body: "Air-conditioned green rooms with illuminated makeup vanity stations, clothing racks, private restrooms, 3-phase industrial power, and dedicated on-site parking for 25+ vehicles.",
  },
];

/* ——————————————————————————————————————————————
   Global FAQ
   ———————————————————————————————————————————————— */

export const SITE_FAQS = [
  {
    q: "Where is The Courtyard Stories located in Delhi?",
    a: "We are at Farm No. 3, The Courtyard Stories, behind FIMT College, Kapashera, Palam Farms, New Delhi 110037 (see Google Maps). The estate is about 15–20 minutes from Dwarka Sector 21 Metro (Blue Line), with secure on-site parking for up to 25 production vehicles and vanity vans.",
  },
  {
    q: "Can we shoot both photo and video simultaneously across the sets?",
    a: "Yes! Because the estate encompasses 5 distinct contiguous sets across 12,000+ sq ft, multiple camera units can operate in parallel (e.g. still lookbook in the Haveli while video reels shoot in the Mughal Colonnade) without interfering with each other.",
  },
  {
    q: "Are drones allowed to fly over the sets?",
    a: "Yes. The Courtyard Stories has clear open-sky clearance for drone aerials, crane shots, and high-altitude establishing sweeps. We have in-house DJI drone setups with 4K 50fps capability, or you can bring your own certified pilot.",
  },
  {
    q: "What is the policy for evening and night shoots?",
    a: "We are fully equipped for night shoots! Our permanent overhead fairy light canopy, brass lanterns, and warm architectural uplights illuminate the courtyards automatically, creating a breathtaking night gala set for celebrations, lookbooks, and commercials.",
  },
  {
    q: "How do we book a shoot or schedule a location walkthrough?",
    a: "You can book directly via our Enquire form or WhatsApp our Studio Director at +91-98186-37485. We welcome creative directors, stylists, and DPs for a complimentary 30-minute location walkthrough before confirming dates.",
  },
  {
    q: "What are the payment and deposit terms?",
    a: "A 40% advance payment reserves your date exclusively on our calendar. The remaining 60% balance is payable on the shoot day upon arrival. We accept UPI, bank transfers (NEFT/RTGS), and major cards.",
  },
];

/* ——————————————————————————————————————————————
   Enquiry form config
   ———————————————————————————————————————————————— */

export const ENQUIRY_STEPS = [
  { key: "shoot", label: "Shoot type" },
  { key: "date", label: "Dates & scale" },
  { key: "needs", label: "Sets & kit" },
  { key: "contact", label: "Your details" },
] as const;

export const SHOOT_TYPES = [
  { key: "fashion", label: "Fashion & Couture Lookbook", desc: "Haute couture, bridal, contemporary apparel" },
  { key: "commercial", label: "Commercial / Brand Film", desc: "TVCs, D2C films, digital ads, music videos" },
  { key: "studio", label: "Location / Set Rental", desc: "Exclusive venue hire for external crews" },
  { key: "events", label: "Brand Launch / Night Gala", desc: "Festive soirées, receptions, intimate events" },
  { key: "drone", label: "Drone & Aerial Production", desc: "High-altitude architectural & tracking sweeps" },
  { key: "other", label: "Custom Production", desc: "Tell us about your unique creative concept" },
] as const;

export const CREW_SIZES = [
  { key: "1-5", label: "Compact crew (1–5 people)" },
  { key: "6-15", label: "Standard production (6–15 people)" },
  { key: "16-30", label: "Full commercial unit (16–30 people)" },
  { key: "30+", label: "Large cast & crew / Event (30+ people)" },
] as const;

export const KIT_NEEDS = [
  { key: "drone", label: "DJI 4K Drone + Pilot" },
  { key: "lighting", label: "High-Output Lighting & Grip" },
  { key: "greenroom", label: "AC Vanity / Green Rooms" },
  { key: "nightrig", label: "Fairy Lights & Night Gala Rig" },
  { key: "sound", label: "Audio & PA System" },
  { key: "generator", label: "Silent Generator Tie-in" },
] as const;
