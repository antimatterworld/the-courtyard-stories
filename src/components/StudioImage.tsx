import { useState } from "react";

/* ————————————————————————————————————————————
   StudioImage — an art-directed "film plate" that stands in
   for a not-yet-rendered photo.

   Today: the studio's Flow-generated imagery is pending (the
   Flow MCP service was unavailable this session — see
   partner-asset-manifest.md). Rather than ship broken <img>
   tiles, every media slot renders a designed plate: warm
   cyclorama-light gradient, contact-sheet sprocket strips,
   film grain, and a subject motif. It is fully theme-aware
   and reads as intentional, not as a placeholder.

   Upgrade path (no code change): drop the rendered files at
   `public/assets/flow/<name>.jpg`. The hidden <img> fires
   onLoad and fades the photo over the plate; onError keeps
   the plate. Swapping assets is therefore a pure content
   update, never a build change.
   ———————————————————————————————————————————————— */

export type Motif =
  | "hero"
  | "fashion"
  | "product"
  | "podcast"
  | "commercial"
  | "crew"
  | "lens"
  | "events"
  | "studio";

const MOTIF_TINT: Record<Motif, [string, string]> = {
  hero: ["#1a2238", "#0a0f1f"],
  fashion: ["#2a1f18", "#1c1308"],
  product: ["#1f1828", "#12182c"],
  podcast: ["#1a1822", "#0a0f1f"],
  commercial: ["#241c14", "#14110a"],
  crew: ["#1c1820", "#0d1018"],
  lens: ["#14182a", "#07142e"],
  events: ["#1f1428", "#120c1a"],
  studio: ["#1a2338", "#0a0f1f"],
};

export function StudioImage({
  src,
  alt,
  motif = "studio",
  tag,
  className,
  eager = false,
}: {
  src?: string;
  alt: string;
  motif?: Motif;
  tag?: string;
  className?: string;
  eager?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [t0, t1] = MOTIF_TINT[motif];

  return (
    <div
      className={`plate ${className ?? ""}`}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      style={{
        background: `radial-gradient(120% 90% at 28% 18%, ${t0} 0%, transparent 55%),
          linear-gradient(150deg, var(--plate-a, ${t0}) 0%, var(--plate-b, ${t1}) 100%)`,
      }}
    >
      {/* sprocket contact-sheet strips */}
      <span className="plate-sprocket top" aria-hidden="true" />
      <span className="plate-sprocket bottom" aria-hidden="true" />

      {/* film grain */}
      <span className="plate-grain" aria-hidden="true" />

      {/* subject motif */}
      <span className="plate-motif" aria-hidden="true">
        <MotifGlyph motif={motif} />
      </span>

      {/* caption strip */}
      {tag && (
        <span className="plate-caption" aria-hidden="true">
          {tag}
        </span>
      )}

      {/* the real photo, once it exists — fades over the plate */}
      {src && (
        <img
          className={`plate-photo ${loaded ? "is-loaded" : ""}`}
          src={src}
          alt=""
          loading={eager ? "eager" : "lazy"}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(false)}
        />
      )}
    </div>
  );
}

function MotifGlyph({ motif }: { motif: Motif }) {
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (motif) {
    case "fashion":
      return (
        <svg viewBox="0 0 64 64" {...stroke}>
          <path d="M26 14 L32 20 L38 14 L46 20 L40 30 L42 50 L22 50 L24 30 L18 20 Z" />
          <path d="M32 20 L32 50" opacity="0.5" />
        </svg>
      );
    case "product":
      return (
        <svg viewBox="0 0 64 64" {...stroke}>
          <rect x="24" y="14" width="16" height="40" rx="4" />
          <rect x="28" y="8" width="8" height="6" rx="1.5" />
          <line x1="24" y1="30" x2="40" y2="30" opacity="0.5" />
          <circle cx="32" cy="38" r="4" opacity="0.5" />
        </svg>
      );
    case "podcast":
      return (
        <svg viewBox="0 0 64 64" {...stroke}>
          <rect x="26" y="10" width="12" height="22" rx="6" />
          <path d="M20 30 a12 12 0 0 0 24 0" />
          <line x1="32" y1="42" x2="32" y2="50" />
          <line x1="24" y1="50" x2="40" y2="50" />
        </svg>
      );
    case "commercial":
    case "crew":
      return (
        <svg viewBox="0 0 64 64" {...stroke}>
          <rect x="14" y="22" width="30" height="22" rx="3" />
          <path d="M44 30 l8 -5 v14 l-8 -5 Z" />
          <circle cx="26" cy="33" r="5" opacity="0.5" />
        </svg>
      );
    case "lens":
      return (
        <svg viewBox="0 0 64 64" {...stroke}>
          <circle cx="32" cy="32" r="18" />
          <circle cx="32" cy="32" r="10" opacity="0.6" />
          <circle cx="32" cy="32" r="3" />
          <path d="M32 14 v4 M32 46 v4 M14 32 h4 M46 32 h4" opacity="0.5" />
        </svg>
      );
    case "hero":
    case "studio":
    default:
      return (
        <svg viewBox="0 0 64 64" {...stroke}>
          <circle cx="32" cy="32" r="18" />
          <path d="M32 14 L32 26 M48 22 L39 30 M48 42 L39 34 M26 46 L35 38 M16 42 L25 34 M16 22 L25 30" opacity="0.55" />
          <circle cx="32" cy="32" r="6" />
        </svg>
      );
  }
}
