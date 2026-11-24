import {
  ARCHITECTURAL_SETS,
  PORTFOLIO,
  SERVICES,
  STUDIO,
  STUDIO_FACTS,
  STUDIO_FEATURES,
} from "../../data/content";

export type StudioTile = {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  img?: string;
  kind: "set" | "service" | "location" | "work" | "action" | "fact" | "light";
  body: string;
  href?: string;
};

const LIGHT_SNIPPET =
  "Dawn haveli · midday jali · golden thatch · night gala rigs — the estate is lit for every hour.";

const SET_IMGS = ARCHITECTURAL_SETS.map((s) => s.img);
const POOL = [
  ...SET_IMGS,
  ...PORTFOLIO.map((p) => p.img),
  ...SERVICES.map((s) => s.img),
  "/assets/real/space-panoramic-estate.webp",
];

function tileImage(id: string, img?: string): string {
  if (img) return img;
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return POOL[Math.abs(h) % POOL.length] ?? SET_IMGS[0]!;
}

const STUDIO_TILE_DEFS_RAW: StudioTile[] = [
  ...ARCHITECTURAL_SETS.map((s) => ({
    id: `set-${s.id}`,
    title: s.name.split("·")[0]?.trim() ?? s.name,
    subtitle: "Set",
    accent: s.palette.accent,
    img: s.img,
    kind: "set" as const,
    body: s.short,
    href: `/enquire?set=${s.id}`,
  })),
  ...SERVICES.map((s) => ({
    id: `svc-${s.slug}`,
    title: s.name,
    subtitle: "Service",
    accent: "var(--accent)",
    img: s.img,
    kind: "service" as const,
    body: s.short,
    href: `/services/${s.slug}`,
  })),
  {
    id: "loc-kapashera",
    title: "Kapashera",
    subtitle: "Location",
    accent: "var(--accent)",
    img: "/assets/real/space-panoramic-estate.webp",
    kind: "location",
    body: `${STUDIO.address}. Metro: ${STUDIO.metroNote}`,
    href: STUDIO.mapsUrl,
  },
  {
    id: "act-visit",
    title: "Visit",
    subtitle: "Plan",
    accent: "var(--accent)",
    img: "/assets/real/studio-still.webp",
    kind: "action",
    body: `Book a recce. ${STUDIO.hours}`,
    href: "/visit",
  },
  {
    id: "act-enquire",
    title: "Enquire",
    subtitle: "Plan",
    accent: "var(--accent)",
    img: "/assets/real/events-still.webp",
    kind: "action",
    body: "Four-step shoot planner with WhatsApp handoff.",
    href: "/enquire",
  },
  ...PORTFOLIO.slice(0, 6).map((p) => ({
    id: `work-${p.id}`,
    title: p.title,
    subtitle: "Reel",
    accent: "var(--accent)",
    img: p.img,
    kind: "work" as const,
    body: p.blurb,
    href: "/work",
  })),
  ...STUDIO_FEATURES.slice(0, 3).map((f, i) => ({
    id: `amen-${i}`,
    title: f.title,
    subtitle: "Amenity",
    accent: "var(--accent)",
    img: SET_IMGS[i % SET_IMGS.length],
    kind: "fact" as const,
    body: f.body,
  })),
  ...STUDIO_FACTS.slice(0, 2).map((f, i) => ({
    id: `stat-${f.label}`,
    title: f.stat,
    subtitle: f.label,
    accent: "var(--accent)",
    img: ["/assets/real/space-panoramic-estate.webp", SET_IMGS[1]!][i],
    kind: "fact" as const,
    body: f.note,
  })),
  {
    id: "light-hour",
    title: "Light by hour",
    subtitle: "Timeline",
    accent: "var(--accent)",
    img: "/assets/real/flythrough-05-nightgala.webp",
    kind: "light",
    body: LIGHT_SNIPPET,
  },
];

export const STUDIO_TILE_DEFS: StudioTile[] = STUDIO_TILE_DEFS_RAW.map((tile) => ({
  ...tile,
  img: tileImage(tile.id, tile.img),
}));