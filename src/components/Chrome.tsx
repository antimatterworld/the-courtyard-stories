import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTheme } from "../lib/hooks";
import { STUDIO, waLink } from "../data/content";
import type { JSONLD } from "../lib/schema";

export const NAV_LINKS = [
  { to: "/work", label: "Work" },
  { to: "/services", label: "Services" },
  { to: "/studio", label: "The Studio" },
  { to: "/visit", label: "Visit" },
  { to: "/enquire", label: "Enquire" },
];

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
  }, [location.pathname]); // re-inject on navigation, keyed to route

  return <>{children}</>;
}

/* ——————————————————————————————
   Top bar
   —————————————————————————————— */

export function TopBar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [theme, toggle] = useTheme();
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isHeroTransparent = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setDrawer(false), [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  const SunIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.2 2.2M16.9 16.9l2.2 2.2M19.1 4.9l-2.2 2.2M7.1 16.9l-2.2 2.2" />
    </svg>
  );
  const MoonIcon = (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5Z" />
    </svg>
  );

  return (
    <>
      <header className={`topbar ${scrolled ? "scrolled" : ""} ${isHeroTransparent ? "is-hero-transparent" : ""}`}>
        <div className="topbar-inner">
          <Link to="/" className="brand" aria-label="The Courtyard Stories — home">
            <span className="brand-name">The Courtyard Stories</span>
            <span className="brand-sub">Photo · Video · {STUDIO.city}</span>
          </Link>

          <nav className="nav" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === "/work"}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="topbar-actions">
            <button
              className="theme-toggle"
              onClick={toggle}
              aria-label={theme === "light" ? "Switch to darkroom mode" : "Switch to studio daylight mode"}
              title={theme === "light" ? "Darkroom mode" : "Daylight mode"}
            >
              {theme === "light" ? MoonIcon : SunIcon}
            </button>
            <Link to="/enquire" className="btn btn-primary">
              Enquire
            </Link>
            <button
              className="burger"
              aria-expanded={drawer}
              aria-label="Open menu"
              onClick={() => setDrawer((d) => !d)}
            >
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className={`drawer ${drawer ? "open" : ""}`} aria-hidden={!drawer}>
        <nav className="drawer-nav" aria-label="Menu">
          {NAV_LINKS.map((l, i) => (
            <Link key={l.to} to={l.to} onClick={() => setDrawer(false)}>
              {l.label}
              <i>0{i + 1}</i>
            </Link>
          ))}
          <Link to="/enquire" onClick={() => setDrawer(false)}>
            Enquire for a shoot <i>→</i>
          </Link>
        </nav>
        <div className="drawer-foot">
          <a className="btn btn-wa" href={waLink("Hi — I'm planning a shoot with The Courtyard Stories. Can we talk?")} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          <a className="btn btn-ghost" href={STUDIO.phoneHref}>
            {STUDIO.phone}
          </a>
        </div>
      </div>
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

/* ——————————————————————————————
   Global chrome: film grain overlay
   —————————————————————————————— */

export function GrainOverlay() {
  return <div className="grain" aria-hidden="true" />;
}
