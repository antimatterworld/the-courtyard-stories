type Kind = "arrow" | "star" | "loop" | "sun" | "pin" | "spark";

const PATHS: Record<Kind, string> = {
  arrow: "M4 20 C14 18 22 12 30 6 M22 5 H31 V14 M6 28 C16 22 24 24 34 16",
  star: "M20 4 L23 14 L34 14 L25 21 L28 32 L20 25 L12 32 L15 21 L6 14 L17 14 Z",
  loop: "M8 22 C8 10 32 8 32 20 C32 30 12 32 10 22 C8 14 22 12 26 18",
  sun: "M20 12 a8 8 0 1 0 0.1 0 M20 3 V7 M20 33 V37 M3 20 H7 M33 20 H37 M8 8 L11 11 M29 29 L32 32 M32 8 L29 11 M11 29 L8 32",
  pin: "M20 4 C14 4 10 9 10 15 C10 24 20 36 20 36 C20 36 30 24 30 15 C30 9 26 4 20 4 Z M20 12 a3 3 0 1 0 0.1 0",
  spark: "M20 4 V14 M20 26 V36 M6 20 H16 M24 20 H34 M10 10 L16 16 M24 24 L30 30 M30 10 L24 16 M16 24 L10 30",
};

export function SectionDoodle({ kind }: { kind: Kind }) {
  return (
    <svg className="section-doodle" viewBox="0 0 40 40" aria-hidden="true">
      <path d={PATHS[kind]} />
    </svg>
  );
}
