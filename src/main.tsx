import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import "./styles.css";
import { Footer, GrainOverlay, TopBar, WhatsAppFab } from "./components/Chrome";
import Home from "./pages/Home";
import ServicesHub from "./pages/ServicesHub";
import ServiceDetail from "./pages/ServiceDetail";
import WorkPage from "./pages/WorkPage";
import Studio from "./pages/Studio";
import Visit from "./pages/Visit";
import Enquire from "./pages/Enquire";
import NotFound from "./pages/NotFound";

function ScrollToTop() {
  useLocation();
  window.scrollTo(0, 0);
  return null;
}

function AppShell() {
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
          background: "var(--ink)",
          color: "var(--bg)",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          transition: "top 120ms",
        }}
      >
        Skip to content
      </a>
      <TopBar />
      <main id="main" style={{ minHeight: "100svh" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<WorkPage />} />
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
      <GrainOverlay />
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <AppShell />
    </BrowserRouter>
  </StrictMode>,
);
