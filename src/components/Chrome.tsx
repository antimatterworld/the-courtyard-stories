import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { STUDIO, waLink } from "../data/content";
import type { JSONLD } from "../lib/schema";

export const NAV_LINKS = [
  { to: "/work", label: "Work" },
  { to: "/sets", label: "All sets" },
  { to: "/services", label: "Services" },
  { to: "/studio", label: "Studio" },
  { to: "/visit", label: "Visit" },
];

function BrandMark() {
  return (
    <svg className="brand-mark" width="20" height="26" viewBox="0 0 20 26" aria-hidden="true">
      <path
        d="M2 24V12C2 6.5 5.5 2 10 2s8 4.5 8 10v12"
        fill="none"
        stroke="var(--marigold)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M4.5 14c2.2-2.8 4.8-4.2 5.5-4.2S13.2 11.2 15.5 14"
        fill="none"
        stroke="var(--marigold)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}

/* ——————————————————————————————
   Page wrapper: sets per-route meta
   and injects JSON-LD schema blocks.
   —————————————————————————————— */

export function Page({
  title,
  description,
  schema,
  children,
}: {
  title: string;
  description?: string;
  schema?: JSONLD[];
  children: ReactNode;
}) {
  const location = useLocation();

  useEffect(() => {
    document.title = title;
    if (description) {
      const m = document.querySelector('meta[name="description"]');
      if (m) m.setAttribute("content", description);
      const og = document.querySelector('meta[property="og:description"]');
      if (og) og.setAttribute("content", description);
      const ogT = document.querySelector('meta[property="og:title"]');
      if (ogT) ogT.setAttribute("content", title);
    }
  }, [title, description]);

  useEffect(() => {
    document.querySelectorAll("script[data-tcs-schema]").forEach((s) => s.remove());
    schema?.forEach((block) => {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.setAttribute("data-tcs-schema", "true");
      s.textContent = JSON.stringify(block);
      document.head.appendChild(s);
    });
  }, [location.pathname]);

  return <>{children}</>;
}

/* ——————————————————————————————
   Top bar
   —————————————————————————————— */

export function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (y < 80) {
        setHidden(false);
      } else if (delta > 6) {
        setHidden(true);
      } else if (delta < -6) {
        setHidden(false);
      }
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className={`topbar${hidden ? " topbar--hidden" : ""}`}>
        <div className="topbar-inner">
          <Link to="/" className="brand" aria-label="Courtyard Stories — home">
            <BrandMark />
            <span className="brand-name">Courtyard Stories</span>
          </Link>

          <nav className="nav topbar-nav-desktop" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === "/work"}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="topbar-actions">
            <Link to="/enquire" className="btn btn-primary nav-enquire-desktop">
              Enquire
            </Link>
            <button
              type="button"
              className="topbar-menu-btn"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      <nav className={`menu-overlay${menuOpen ? " open" : ""}`} aria-hidden={!menuOpen}>
        {NAV_LINKS.map((l) => (
          <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}>
            {l.label}
          </Link>
        ))}
        <Link to="/enquire" className="menu-overlay-enquire" onClick={() => setMenuOpen(false)}>
          Enquire for a shoot
        </Link>
      </nav>
    </>
  );
}

/* ——————————————————————————————
   Footer
   —————————————————————————————— */

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand">
              <span className="brand-name" style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem" }}>
                The Courtyard Stories
              </span>
              <span className="brand-sub">
                Photography &amp; video production studio · {STUDIO.city}
              </span>
            </div>
            <p style={{ marginTop: "var(--s-5)", maxWidth: "38ch", color: "var(--footer-ink-soft)", fontSize: "var(--t-small)", lineHeight: 1.7 }}>
              High-end fashion editorials, commercial campaigns, product
              cinematography and podcast production — shot on film-grain craft
              and delivered with a colourist's eye.
            </p>
          </div>

          <div>
            <h4>Studio</h4>
            <ul style={{ gap: "6px" }}>
              {NAV_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} style={{ minHeight: "32px" }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Services</h4>
            <ul style={{ gap: "6px" }}>
              {[
                { to: "/services/fashion", label: "Fashion" },
                { to: "/services/commercial", label: "Commercial" },
                { to: "/services/product", label: "Product" },
                { to: "/services/podcast", label: "Podcast & Video" },
                { to: "/services", label: "All services" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} style={{ minHeight: "32px" }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Visit the studio</h4>
            <address style={{ fontSize: "var(--t-small)", fontStyle: "normal", color: "var(--footer-ink-soft)", lineHeight: 1.9 }}>
              {STUDIO.address}
              <br />
              {STUDIO.hours}
              <br />
              <a href={STUDIO.phoneHref}>{STUDIO.phone}</a>
              <br />
              <a href={`mailto:${STUDIO.email}`}>{STUDIO.email}</a>
            </address>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} The Courtyard Stories · All rights reserved</span>
          <span>
            <a href={`https://instagram.com/${STUDIO.instagram.replace("@", "")}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", minHeight: "32px" }}>
              {STUDIO.instagram}
            </a>
            &nbsp;·&nbsp; Shot in Delhi, made on the North
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ——————————————————————————————
   Floating WhatsApp action
   —————————————————————————————— */

export function WhatsAppFab() {
  return (
    <a
      className="wa-fab"
      href={waLink("Hi The Courtyard Studios team — I found you on the website and I'd like to plan a shoot.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat on WhatsApp"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.76.46 3.45 1.34 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.23c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.83 14.2c-.25.7-1.45 1.34-1.99 1.41-.55.07-1.02.32-3.46-.65-2.93-1.13-4.8-4.1-4.94-4.3-.14-.2-1.2-1.57-1.2-2.98 0-1.41.73-2.11.99-2.41.26-.3.57-.34.76-.34l.55.01c.18 0 .42-.07.65.49.25.6.84 2.06.91 2.21.07.15.11.32.01.52-.11.2-.15.32-.31.5-.16.17-.33.38-.41.49-.16.16-.33.34-.16.66.16.32.71 1.22 1.52 1.98 1.04.99 1.91 1.29 2.22 1.44.31.15.49.13.67-.07.18-.2.76-.87.96-1.17.2-.3.4-.25.67-.15.27.1 1.72.81 2.02.96.3.15.5.22.57.34.07.12.07.71-.18 1.41Z" />
      </svg>
    </a>
  );
}

export function GrainOverlay() {
  return <div className="grain" aria-hidden="true" />;
}