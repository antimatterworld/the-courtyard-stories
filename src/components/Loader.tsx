import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useWorldProgress } from "../lib/world-progress";

const SESSION_KEY = "tcs-loader-seen";

const LOADER_LINES = ["The", "Courtyard", "Stories"] as const;
const LOADER_STAGGER_MS = 72;
const LOADER_BASE_DELAY_MS = 900;
const LOADER_LETTER_ANIM_MS = 2000;
const HOLD_AT_100_MS = 300;
/** Time for arch stroke fade + fill settle before overlay fade. */
const ARCH_SETTLE_MS = 700;
const FADE_OUT_MS = 650;

function loaderLetterCount(): number {
  return LOADER_LINES.reduce((n, line) => n + line.length, 0);
}

function loaderLettersDoneMs(): number {
  const lastIndex = loaderLetterCount() - 1;
  return LOADER_BASE_DELAY_MS + lastIndex * LOADER_STAGGER_MS + LOADER_LETTER_ANIM_MS;
}

export function Loader() {
  const { loaderRatio, setLoaderDone, registerLoaderWeight, reportLoaderItem } = useWorldProgress();
  const [phase, setPhase] = useState<"run" | "hold" | "finishing" | "exit" | "off">("run");
  const [displayPct, setDisplayPct] = useState(0);
  const fillRef = useRef<SVGRectElement>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    registerLoaderWeight("fonts", 0.45);
    registerLoaderWeight("heroPoster", 0.55);
    void document.fonts.ready.then(() => reportLoaderItem("fonts", true));
    const img = new Image();
    img.onload = () => reportLoaderItem("heroPoster", true);
    img.onerror = () => reportLoaderItem("heroPoster", true);
    img.src = "/assets/real/flythrough-02-haveli.webp";
  }, [registerLoaderWeight, reportLoaderItem]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fast = sessionStorage.getItem(SESSION_KEY) === "1" && !reduce;
    const lettersDoneMs = loaderLettersDoneMs();
    const minMs = reduce ? 900 : fast ? Math.max(lettersDoneMs + 400, 3200) : lettersDoneMs + 1200;
    const maxMs = Math.max(16000, minMs + 3000);
    document.body.style.overflow = "hidden";
    const t0 = performance.now();
    let raf = 0;

    const finish = () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setDisplayPct(100);
      setPhase("hold");
      sessionStorage.setItem(SESSION_KEY, "1");
      const settle = reduce ? 200 : ARCH_SETTLE_MS;
      const fade = reduce ? 180 : FADE_OUT_MS;
      window.setTimeout(() => {
        setPhase("finishing");
        window.setTimeout(() => {
          setPhase("exit");
          window.setTimeout(() => {
            setPhase("off");
            setLoaderDone(true);
            document.body.style.overflow = "";
            window.dispatchEvent(new Event("tcs:loader-done"));
          }, fade);
        }, settle);
      }, reduce ? 80 : HOLD_AT_100_MS);
    };

    const tick = (now: number) => {
      const elapsed = now - t0;
      const timeP = Math.min(1, elapsed / minMs);
      const combined = Math.min(1, timeP * 0.5 + loaderRatio * 0.5);
      const eased = combined < 0.5 ? 4 * combined ** 3 : 1 - (-2 * combined + 2) ** 3 / 2;
      const lettersUp = elapsed >= lettersDoneMs;
      const pct = lettersUp ? Math.round(eased * 100) : Math.min(96, Math.round(eased * 96));
      setDisplayPct(pct);
      fillRef.current?.setAttribute("transform", `translate(0 ${(300 * (1 - eased)).toFixed(1)})`);
      const ready = loaderRatio >= 0.99 && elapsed >= minMs && lettersUp;
      if (ready) finish();
      else if (elapsed >= maxMs) finish();
      else raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, [loaderRatio, setLoaderDone]);

  if (phase === "off") return null;

  const lines = LOADER_LINES;
  let charIndex = 0;

  const archDone = phase === "finishing" || phase === "exit";
  const fading = phase === "exit";

  return (
    <div
      className={`courtyard-loader${archDone ? " done" : ""}${fading ? " exit-fade" : ""}`}
      style={
        {
          "--loader-stagger": `${LOADER_STAGGER_MS}ms`,
          "--loader-base": `${LOADER_BASE_DELAY_MS}ms`,
          "--loader-letter-dur": `${LOADER_LETTER_ANIM_MS}ms`,
        } as CSSProperties
      }
      role="status"
      aria-live="polite"
      aria-label={`Loading The Courtyard Stories, ${displayPct} percent`}
    >
      <svg className="courtyard-loader-arch" viewBox="0 0 200 300" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
        <defs>
          <clipPath id="loader-arch-clip">
            <path d="M20 300V130C20 72 78 44 100 6c22 38 80 66 80 124v170z" />
          </clipPath>
          <linearGradient id="loader-arch-grad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#D6336C" />
            <stop offset="0.55" stopColor="#FF9F1C" />
            <stop offset="1" stopColor="#FFD58A" />
          </linearGradient>
        </defs>
        <g clipPath="url(#loader-arch-clip)">
          <rect ref={fillRef} width="200" height="300" fill="url(#loader-arch-grad)" transform="translate(0 300)" />
        </g>
        <path
          className="courtyard-loader-stroke"
          pathLength={1}
          fill="none"
          stroke="#F3EBDD"
          strokeWidth="1.4"
          d="M20 300V130C20 72 78 44 100 6c22 38 80 66 80 124v170"
        />
      </svg>

      <h1 className="courtyard-loader-title" aria-label="The Courtyard Stories">
        {lines.map((line) => (
          <span key={line} className="courtyard-loader-line-wrap" aria-hidden="true">
            {line.split("").map((ch) => {
              const i = charIndex++;
              return (
                <span
                  key={`${line}-${i}`}
                  className={ch === " " ? "courtyard-loader-sp" : "courtyard-loader-ch"}
                  style={{ ["--i" as string]: i } as CSSProperties}
                >
                  {ch === " " ? "" : ch}
                </span>
              );
            })}
          </span>
        ))}
      </h1>

      <p className="courtyard-loader-hi" lang="hi">
        द कोर्टयार्ड स्टोरीज़
      </p>
      <div className="courtyard-loader-count" aria-hidden="true">
        {displayPct}
      </div>
    </div>
  );
}