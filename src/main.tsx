import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { initRevealSystem } from "./lib/reveal";
import "./styles.css";
import "./styles/cinematic.css";
import "./styles/home-landing.css";
import "./styles/studio-explorer.css";
import { Footer, TopBar, WhatsAppFab } from "./components/Chrome";
import { Loader } from "./components/Loader";
import { WorldProgressProvider } from "./lib/world-progress";
import Home from "./pages/Home";
import ServicesHub from "./pages/ServicesHub";
import ServiceDetail from "./pages/ServiceDetail";
import WorkPage from "./pages/WorkPage";
import Studio from "./pages/Studio";
import AllSets from "./pages/AllSets";
import Visit from "./pages/Visit";
import Enquire from "./pages/Enquire";
import NotFound from "./pages/NotFound";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function RouteEffects() {
  const { pathname } = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    const onStudio = pathname === "/studio";
    root.classList.toggle("studio-route", onStudio);
    if (onStudio) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    initRevealSystem();
    requestAnimationFrame(() => {
      const main = document.getElementById("main");
      main?.focus({ preventScroll: true });
    });
    return () => {
      if (!onStudio) document.body.style.overflow = "";
    };
  }, [pathname]);

  return null;
}

function AppShell() {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "night");
    document.documentElement.style.setProperty("--bg", "var(--bg)");
    document.documentElement.style.overflowX = "clip";
  }, []);

  return (
    <>
      <a
        href="#main"
        className="skip-link"
        onFocus={(e) => (e.currentTarget.style.top = "8px")}
        onBlur={(e) => (e.currentTarget.style.top = "-40px")}
        style={{
          position: "absolute",
          top: -40,
          left: 16,
          zIndex: 5000,
          padding: "10px 16px",
          background: "var(--accent)",
          color: "var(--night)",
          fontFamily: "var(--font-body)",
          fontSize: 12,
          borderRadius: "999px",
          transition: "top 120ms",
        }}
      >
        Skip to content
      </a>
      <div className="app-layer">
        <TopBar />
        <main id="main" tabIndex={-1} className="main-focus" style={{ minHeight: "100svh" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/work" element={<WorkPage />} />
            <Route path="/sets" element={<AllSets />} />
            <Route path="/services" element={<ServicesHub />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/visit" element={<Visit />} />
            <Route path="/enquire" element={<Enquire />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <WhatsAppFab />
      </div>
      <Loader />
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <WorldProgressProvider>
        <ScrollToTop />
        <RouteEffects />
        <AppShell />
      </WorldProgressProvider>
    </BrowserRouter>
  </StrictMode>,
);