/** Gate for the story shell. WebGL tiers arrive in a later phase. */
export function cinematicEnabled() {
  if (typeof window === "undefined") return false;
  const query = new URLSearchParams(window.location.search).get("cinematic");
  if (query === "0") return false;
  if (query === "1") return true;
  if (import.meta.env.VITE_CINEMATIC === "0") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    const canvas = document.createElement("canvas");
    if (!canvas.getContext("webgl2") && !canvas.getContext("webgl")) return false;
  } catch {
    return false;
  }
  return true;
}
