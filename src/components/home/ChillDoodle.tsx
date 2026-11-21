type Kind =
  | "gate"
  | "frames"
  | "ribbon"
  | "camera"
  | "key"
  | "clapper"
  | "tree"
  | "pin"
  | "chat"
  | "wave";

const PATHS: Record<Kind, string> = {
  gate: "M8 34 V14 C8 8 32 8 32 14 V34 M14 34 V18 H26 V34 M20 8 V4",
  frames: "M6 10 H24 V28 H6 Z M16 14 H34 V32 H16 Z",
  ribbon: "M8 16 H32 L26 20 L32 24 H8 L14 20 Z",
  camera: "M8 14 H22 L26 10 H32 V28 H8 Z M16 21 a4 4 0 1 0 0.1 0",
  key: "M14 14 a6 6 0 1 0 0.1 0 M20 14 H34 V18 M28 18 V22",
  clapper: "M8 14 L32 8 V14 H8 Z M8 14 H32 V32 H8 Z M14 20 H26 M14 26 H22",
  tree: "M20 34 V20 M12 22 C12 12 28 12 28 22 Z M14 16 C14 8 26 8 26 16",
  pin: "M20 6 C15 6 12 10 12 15 C12 22 20 34 20 34 C20 34 28 22 28 15 C28 10 25 6 20 6 Z",
  chat: "M8 10 H30 V26 H16 L10 32 V26 H8 Z M14 16 H24 M14 21 H20",
  wave: "M4 22 C10 14 14 30 20 22 C26 14 30 30 36 22",
};

export function ChillDoodle({ kind, className = "" }: { kind: Kind; className?: string }) {
  return (
    <span className={`chill-doodle chill-doodle--${kind} ${className}`} aria-hidden="true">
      <svg viewBox="0 0 40 40">
        <path d={PATHS[kind]} />
      </svg>
    </span>
  );
}
