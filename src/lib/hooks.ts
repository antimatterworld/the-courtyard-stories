import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { initRevealSystem } from "./reveal";

/* ——————————————————————————————
   Theme (light default, dark = darkroom)
   Persisted in localStorage; reads system
   preference on first visit only.
   —————————————————————————————— */

const THEME_KEY = "tcs-theme";

export type Theme = "light" | "dark";

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    if (saved === "light" || saved === "dark") return saved;
    return "light"; // brand default = studio daylight
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }, []);

  return [theme, toggle];
}

/* ——————————————————————————————
   Reveal on scroll (IntersectionObserver)
   —————————————————————————————— */

export function useReveal<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    initRevealSystem(el);
  }, [ref]);

  return ref;
}

/* ——————————————————————————————
   Media queries
   —————————————————————————————— */

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    setMatches(mq.matches);
    return () => mq.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/* ——————————————————————————————
   Page <title> + per-route description
   —————————————————————————————— */

export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title;
    if (description) {
      const el = document.querySelector('meta[name="description"]');
      if (el) el.setAttribute("content", description);
    }
  }, [title, description]);
}
