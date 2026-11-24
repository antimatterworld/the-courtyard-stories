import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { STUDIO, STUDIO_FEATURES } from "../../data/content";
import { prefersReducedMotion } from "../../lib/motion";
import { STUDIO_TILE_DEFS, type StudioTile } from "./studioTiles";

const NAV_H = 72;
const COLS = 6;
const GAP = 14;

type PlacedTile = StudioTile & { x: number; y: number; w: number; h: number };

function layoutTiles(vw: number, vh: number): { tiles: PlacedTile[]; periodW: number; periodH: number } {
  const narrow = vw < 768;
  const cols = narrow ? 1 : COLS;
  const cellW = narrow ? Math.max(160, vw - 36) : Math.max(260, vw / 3.6);
  const cellH = narrow ? Math.min(300, Math.max(210, vh * 0.42)) : Math.max(300, (vh - NAV_H) / 2.2);
  const rows = Math.ceil(STUDIO_TILE_DEFS.length / cols);
  const tiles = STUDIO_TILE_DEFS.map((t, i) => {
    const col = i % cols;
    const row = (i / cols) | 0;
    const sizeVar = 1 + ((i % 5) - 2) * 0.03;
    const w = (cellW - GAP * 2) * sizeVar;
    const h = (cellH - GAP * 2) * sizeVar;
    return {
      ...t,
      x: col * cellW + (cellW - w) / 2,
      y: row * cellH + (cellH - h) / 2 + NAV_H + 24,
      w,
      h,
    };
  });
  return { tiles, periodW: cols * cellW, periodH: rows * cellH + NAV_H + 48 };
}

const LIGHT_STORY = [
  { time: "07:30", title: "Dawn on the Royal Haveli" },
  { time: "11:30", title: "Mughal terracotta jali" },
  { time: "16:30", title: "Golden hour on thatch" },
  { time: "19:00", title: "Night gala rigs" },
];

export function StudioExplorer() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const posX = useRef(0);
  const posY = useRef(0);
  const velX = useRef(0);
  const velY = useRef(0);
  const drag = useRef(false);
  const moved = useRef(0);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const loopOn = useRef(false);
  const periodW = useRef(1920);
  const periodH = useRef(1600);
  const hudX = useRef<HTMLSpanElement>(null);
  const hudY = useRef<HTMLSpanElement>(null);
  const clkRef = useRef<HTMLSpanElement>(null);
  const lastHudAt = useRef(0);
  const [detail, setDetail] = useState<StudioTile | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const placed = useRef<PlacedTile[]>([]);
  const lastFocus = useRef<HTMLButtonElement | null>(null);
  const buildTimer = useRef(0);
  const lastBuildW = useRef(0);
  const lastBuildH = useRef(0);

  const fmt = (n: number) => {
    const r = Math.round(n);
    return `${r < 0 ? "-" : "+"}${String(Math.abs(r)).padStart(4, "0")}`;
  };

  const paintHud = (force = false) => {
    const now = performance.now();
    if (!force && now - lastHudAt.current < 100) return;
    lastHudAt.current = now;
    if (hudX.current) hudX.current.textContent = fmt(posX.current);
    if (hudY.current) hudY.current.textContent = fmt(posY.current);
  };

  const paint = useCallback(() => {
    const plane = planeRef.current;
    if (!plane) return;
    const pw = periodW.current;
    const ph = periodH.current;
    const ox = ((posX.current % pw) + pw) % pw;
    const oy = ((posY.current % ph) + ph) % ph;
    plane.style.transform = `translate3d(${-ox}px, ${-oy}px, 0)`;
    paintHud();
  }, []);

  const loop = useCallback(() => {
    if (!drag.current) {
      posX.current += velX.current;
      posY.current += velY.current;
      velX.current *= 0.94;
      velY.current *= 0.94;
    }
    paint();
    if (drag.current || Math.abs(velX.current) > 0.1 || Math.abs(velY.current) > 0.1) {
      requestAnimationFrame(loop);
    } else {
      loopOn.current = false;
    }
  }, [paint]);

  const kick = useCallback(() => {
    if (!loopOn.current) {
      loopOn.current = true;
      requestAnimationFrame(loop);
    }
  }, [loop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduce = prefersReducedMotion();

    const createTile = (t: PlacedTile, ariaHidden: boolean) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "studio-tile";
      btn.style.left = `${t.x}px`;
      btn.style.top = `${t.y}px`;
      btn.style.width = `${t.w}px`;
      btn.style.height = `${t.h}px`;
      btn.dataset.tileId = t.id;
      if (ariaHidden) {
        btn.setAttribute("aria-hidden", "true");
        btn.tabIndex = -1;
      }
      const img = document.createElement("img");
      img.src = t.img ?? "/assets/real/flythrough-02-haveli.webp";
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.width = 480;
      img.height = Math.round((t.h / t.w) * 480);
      btn.appendChild(img);
      const copy = document.createElement("div");
      copy.className = "studio-tile-copy";
      copy.innerHTML = `<b>${t.title}</b><span>${t.subtitle}</span>`;
      btn.appendChild(copy);
      return btn;
    };

    const build = () => {
      const plane = planeRef.current;
      if (!plane) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const laid = layoutTiles(vw, vh);
      placed.current = laid.tiles;
      periodW.current = laid.periodW;
      periodH.current = laid.periodH;

      const frag = document.createDocumentFragment();
      let nodes = 0;
      for (const t of laid.tiles) {
        frag.appendChild(createTile(t, false));
        nodes++;
      }
      for (const t of laid.tiles) {
        if (nodes >= 100) break;
        frag.appendChild(createTile({ ...t, x: t.x + laid.periodW, y: t.y }, true));
        nodes++;
      }
      for (const t of laid.tiles) {
        if (nodes >= 100) break;
        frag.appendChild(createTile({ ...t, x: t.x, y: t.y + laid.periodH }, true));
        nodes++;
      }
      plane.replaceChildren(frag);
      paint();

      if (!reduce) {
        const visible = Array.from(plane.querySelectorAll<HTMLElement>(".studio-tile:not([aria-hidden])"));
        visible.forEach((el, i) => {
          window.setTimeout(() => {
            el.classList.add("in");
            window.setTimeout(() => el.classList.add("entrance-done"), 700);
          }, Math.min(i * 35, 800));
        });
      } else {
        plane.querySelectorAll(".studio-tile").forEach((el) => el.classList.add("in"));
      }
    };

    const scheduleBuild = () => {
      window.clearTimeout(buildTimer.current);
      buildTimer.current = window.setTimeout(() => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        if (Math.abs(vw - lastBuildW.current) < 2 && Math.abs(vh - lastBuildH.current) < 2) return;
        lastBuildW.current = vw;
        lastBuildH.current = vh;
        build();
        observeTiles();
      }, 180);
    };

    build();
    lastBuildW.current = window.innerWidth;
    lastBuildH.current = window.innerHeight;
    const ro = new ResizeObserver(scheduleBuild);
    ro.observe(canvas);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    const observeTiles = () => {
      planeRef.current?.querySelectorAll(".studio-tile").forEach((t) => {
        if (!t.classList.contains("in")) io.observe(t);
      });
    };
    observeTiles();

    const onDown = (e: PointerEvent) => {
      drag.current = true;
      canvas.classList.add("is-dragging");
      moved.current = 0;
      lastX.current = e.clientX;
      lastY.current = e.clientY;
      velX.current = velY.current = 0;
      kick();
    };
    const onMove = (e: PointerEvent) => {
      if (!drag.current) return;
      const dx = e.clientX - lastX.current;
      const dy = e.clientY - lastY.current;
      lastX.current = e.clientX;
      lastY.current = e.clientY;
      posX.current -= dx;
      posY.current -= dy;
      velX.current = -dx;
      velY.current = -dy;
      moved.current += Math.abs(dx) + Math.abs(dy);
      paintHud(true);
      kick();
    };
    const onUp = () => {
      drag.current = false;
      canvas.classList.remove("is-dragging");
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      posX.current += e.deltaX;
      posY.current += e.deltaY;
      velX.current = -e.deltaX * 0.25;
      velY.current = -e.deltaY * 0.25;
      paintHud(true);
      kick();
    };

    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    const onClick = (e: MouseEvent) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>(".studio-tile");
      if (!b || b.getAttribute("aria-hidden") === "true" || moved.current > 6) return;
      const id = b.dataset.tileId;
      const tile = STUDIO_TILE_DEFS.find((t) => t.id === id);
      if (tile) {
        lastFocus.current = b;
        setDetail(tile);
        setListOpen(false);
      }
    };
    canvas.addEventListener("click", onClick);

    const fmtTime = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const tickClk = () => {
      if (clkRef.current) clkRef.current.textContent = `IST ${fmtTime.format(new Date())}`;
    };
    tickClk();
    const clkId = window.setInterval(tickClk, 1000);

    return () => {
      window.clearTimeout(buildTimer.current);
      ro.disconnect();
      io.disconnect();
      canvas.classList.remove("is-dragging");
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("click", onClick);
      clearInterval(clkId);
    };
  }, [kick, paint]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && detail) {
        setDetail(null);
        lastFocus.current?.focus();
        return;
      }
      if (detail) return;
      if (e.key === "ArrowLeft") {
        velX.current = -22;
        kick();
      } else if (e.key === "ArrowRight") {
        velX.current = 22;
        kick();
      } else if (e.key === "ArrowUp") {
        velY.current = -22;
        kick();
      } else if (e.key === "ArrowDown") {
        velY.current = 22;
        kick();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detail, kick]);

  return (
    <div className="studio-explorer">
      <button
        type="button"
        className="studio-list-toggle"
        onClick={() => setListOpen((o) => !o)}
        aria-expanded={listOpen}
      >
        List view
      </button>
      <ul className={`studio-list-a11y${listOpen ? " open" : ""}`}>
        {STUDIO_TILE_DEFS.map((t) => (
          <li key={t.id}>
            {t.href ? (
              <Link to={t.href}>{t.title}</Link>
            ) : (
              <button type="button" onClick={() => setDetail(t)}>
                {t.title}
              </button>
            )}
            <span>{t.subtitle}</span>
          </li>
        ))}
        <li>
          <Link to="/visit">Visit</Link>
        </li>
        <li>
          <Link to="/enquire">Enquire</Link>
        </li>
        <li className="studio-detail-contact">
          {STUDIO.address}
          <br />
          <a href={STUDIO.phoneHref}>{STUDIO.phone}</a>
        </li>
      </ul>
      <p className="studio-hud-pill studio-hud-hint">
        <span className="studio-hint-wide">Drag · scroll · arrow keys</span>
        <span className="studio-hint-narrow">Swipe to explore</span>
      </p>
      <p className="studio-hud-pill studio-hud-coords">
        <span ref={clkRef}>IST 00:00:00</span>
        {" · "}
        X <b ref={hudX}>+0000</b> Y <b ref={hudY}>+0000</b>
      </p>
      <div id="studio-canvas" ref={canvasRef} className="studio-canvas">
        <div id="studio-plane" ref={planeRef} className="studio-plane" />
      </div>
      {detail && (
        <aside className="studio-detail" role="dialog" aria-modal="true" aria-labelledby="studio-detail-title">
          <h2 id="studio-detail-title">{detail.title}</h2>
          <p>{detail.subtitle}</p>
          <p className="studio-detail-body">{detail.body}</p>
          {detail.kind === "set" && (
            <ul>
              {STUDIO_FEATURES.slice(0, 2).map((f) => (
                <li key={f.title}>
                  <strong>{f.title}</strong> — {f.body.slice(0, 120)}…
                </li>
              ))}
            </ul>
          )}
          {detail.kind === "light" && (
            <ul>
              {LIGHT_STORY.map((l) => (
                <li key={l.time}>
                  <strong>{l.time}</strong> {l.title}
                </li>
              ))}
            </ul>
          )}
          <p className="studio-detail-contact">
            {STUDIO.addressShort} · <a href={`mailto:${STUDIO.email}`}>{STUDIO.email}</a>
          </p>
          {detail.href?.startsWith("http") ? (
            <a href={detail.href} className="btn btn-primary" target="_blank" rel="noreferrer">
              Open in Maps
            </a>
          ) : detail.href ? (
            <Link to={detail.href} className="btn btn-primary">
              Continue
            </Link>
          ) : null}
          <button type="button" className="btn btn-ghost" onClick={() => setDetail(null)}>
            Close ×
          </button>
        </aside>
      )}
    </div>
  );
}