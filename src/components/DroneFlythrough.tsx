import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { waLink } from "../data/content";

interface FlythroughStage {
  id: string;
  zone: string;
  altitude: string;
  pitch: string;
  heading: string;
  speed: string;
  lighting: string;
  title: string;
  subtitle: string;
  tags: string[];
  video: string;
  poster: string;
  aspect?: string;
}

const STAGES: FlythroughStage[] = [
  {
    id: "stage-01",
    zone: "ZONE 01 · AERIAL SWEEP",
    altitude: "45.0 M",
    pitch: "-42°",
    heading: "142° SE",
    speed: "16.4 KTS",
    lighting: "Direct Natural Sunlight",
    title: "12,000+ Sq Ft Architectural Estate",
    subtitle: "A sweeping 360-degree aerial view across South Delhi's premier outdoor production venue. Purpose-built with 5 contiguous world sets, unobstructed sky clearance, and complete creative privacy.",
    tags: ["Full Drone Clearance", "5 Contiguous Sets", "Open Natural Sky"],
    video: "/assets/real/flythrough-01-aerial.mp4",
    poster: "/assets/real/flythrough-01-aerial.webp",
  },
  {
    id: "stage-02",
    zone: "ZONE 02 · ROYAL HAVELI",
    altitude: "18.5 M",
    pitch: "-28°",
    heading: "088° E",
    speed: "8.2 KTS",
    lighting: "Morning Sun / Soft Courtyard Shade",
    title: "The Royal Ochre Haveli & Courtyard",
    subtitle: "Double-story Rajasthani heritage palace facade with carved jharokha balconies, hand-painted floral niches, traditional wooden doors, central terracotta patio with daybed, and exterior stone staircase.",
    tags: ["Carved Jharokhas", "Handpainted Niches", "Stone Staircase", "Charpai Patio"],
    video: "/assets/real/flythrough-02-haveli.mp4",
    poster: "/assets/real/flythrough-02-haveli.webp",
  },
  {
    id: "stage-03",
    zone: "ZONE 03 · MUGHAL COLONNADE",
    altitude: "4.2 M",
    pitch: "-12°",
    heading: "210° SW",
    speed: "4.5 KTS",
    lighting: "Intricate Raking Jali Shadows",
    title: "The Mughal Terracotta Pavilion",
    subtitle: "Full-height carved terracotta geometric jali screens filtering sunlight into dramatic lace-like shadows, punctuated by antique brass Moroccan hanging lanterns and ornamental veranda floor tiles.",
    tags: ["Geometric Jali Screens", "Moroccan Brass Lanterns", "Patterned Tile Veranda"],
    video: "/assets/real/flythrough-03-colonnade.mp4",
    poster: "/assets/real/flythrough-03-colonnade.webp",
  },
  {
    id: "stage-04",
    zone: "ZONE 04 · MEDITERRANEAN SUITE",
    altitude: "3.0 M",
    pitch: "-05°",
    heading: "330° NW",
    speed: "3.8 KTS",
    lighting: "High Saturation Crisp Daylight",
    title: "The Chefchaouen Moroccan Suite",
    subtitle: "Vivid cobalt blue walls contrasted with white horseshoe arch latticework, artisanal ceramic wall decor, and mosaic stone flooring. Crafted for high-contrast fashion and vibrant editorial palettes.",
    tags: ["Cobalt Blue Walls", "Horseshoe Jali Arches", "Ceramic Plate Decor", "Mosaic Floor"],
    video: "/assets/real/flythrough-04-mediterranean.mp4",
    poster: "/assets/real/flythrough-04-mediterranean.webp",
  },
  {
    id: "stage-05",
    zone: "ZONE 05 · NIGHT GALA",
    altitude: "2.5 M",
    pitch: "+10°",
    heading: "180° S",
    speed: "2.1 KTS",
    lighting: "Overhead Fairy Light Rig (2700K)",
    title: "The Festive Courtyard Gala & Night Set",
    subtitle: "When dusk falls, the courtyard transforms with an overhead matrix of warm fairy lights, glowing lanterns, velvet-draped royal banquet tables, illuminated cocktail bar, and party atmosphere.",
    tags: ["Overhead String Light Rig", "Velvet Banquet Tables", "Illuminated Bar", "Golden Ambience"],
    video: "/assets/real/flythrough-05-nightgala.mp4",
    poster: "/assets/real/flythrough-05-nightgala.webp",
    aspect: "vertical",
  },
];

export function DroneFlythrough() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const totalScroll = rect.height - window.innerHeight;
          const currentScroll = -rect.top;
          
          if (totalScroll > 0) {
            const raw = Math.min(Math.max(currentScroll / totalScroll, 0), 1);
            setProgress(raw);
            
            // Map 0..1 to 0..4
            const stage = Math.min(Math.floor(raw * STAGES.length), STAGES.length - 1);
            setActiveStageIdx(stage);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Jump to specific stage
  const jumpToStage = (idx: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const containerTop = window.scrollY + rect.top;
    const totalScroll = rect.height - window.innerHeight;
    const targetScroll = containerTop + (idx / STAGES.length) * totalScroll + 20;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  const activeStage = STAGES[activeStageIdx];

  return (
    <section 
      ref={containerRef} 
      className="drone-flythrough-container"
      aria-label="Interactive Drone Flythrough through The Courtyard Stories"
    >
      <div className="drone-sticky-viewport">
        {/* ——— Video Layer Stack ——— */}
        <div className="drone-media-stack">
          {STAGES.map((stg, i) => {
            const isCurrent = i === activeStageIdx;
            return (
              <div
                key={stg.id}
                className={`drone-media-layer ${isCurrent ? "is-active" : ""}`}
                style={{ opacity: isCurrent ? 1 : 0 }}
                aria-hidden={!isCurrent}
              >
                <video
                  ref={(el) => { videoRefs.current[i] = el; }}
                  className={`drone-video ${stg.aspect === "vertical" ? "is-vertical" : ""}`}
                  src={stg.video}
                  poster={stg.poster}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
                <div className="drone-video-overlay" />
              </div>
            );
          })}
        </div>

        {/* ——— HUD Flight Telemetry Overlay ——— */}
        <div className="drone-hud" aria-hidden="true">
          {/* Top telemetry bar */}
          <div className="drone-hud-top">
            <div className="drone-hud-item">
              <span className="drone-hud-label">AIRSPACE</span>
              <span className="drone-hud-val">DELHI NCR · 28.5244°N 77.2066°E</span>
            </div>
            <div className="drone-hud-item">
              <span className="drone-hud-label">ALTITUDE</span>
              <span className="drone-hud-val drone-glow">{activeStage.altitude}</span>
            </div>
            <div className="drone-hud-item hide-mobile">
              <span className="drone-hud-label">GIMBAL PITCH</span>
              <span className="drone-hud-val">{activeStage.pitch}</span>
            </div>
            <div className="drone-hud-item hide-mobile">
              <span className="drone-hud-label">HEADING</span>
              <span className="drone-hud-val">{activeStage.heading}</span>
            </div>
            <div className="drone-hud-item">
              <span className="drone-hud-label">SENSOR</span>
              <span className="drone-hud-val">4K UHD · 50 FPS · 10-BIT</span>
            </div>
          </div>

          {/* Crosshairs & Flight Reticle */}
          <div className="drone-crosshair-wrap">
            <div className="drone-crosshair-center" />
            <div className="drone-horizon-line left" />
            <div className="drone-horizon-line right" />
            <div className="drone-bracket top-left" />
            <div className="drone-bracket top-right" />
            <div className="drone-bracket bottom-left" />
            <div className="drone-bracket bottom-right" />
          </div>

          {/* Scroller Progress Line */}
          <div className="drone-scrub-bar">
            <div 
              className="drone-scrub-fill" 
              style={{ width: `${Math.round(progress * 100)}%` }} 
            />
            {STAGES.map((_, idx) => (
              <div 
                key={idx}
                className={`drone-scrub-tick ${idx <= activeStageIdx ? "is-passed" : ""}`}
                style={{ left: `${(idx / (STAGES.length - 1)) * 100}%` }}
              />
            ))}
          </div>
        </div>

        {/* ——— Stage Selector Pills ——— */}
        <div className="drone-stage-nav" aria-label="Select architectural set to fly to">
          {STAGES.map((stg, idx) => (
            <button
              key={stg.id}
              type="button"
              className={`drone-nav-btn ${idx === activeStageIdx ? "is-active" : ""}`}
              onClick={() => jumpToStage(idx)}
              aria-label={`Jump to ${stg.title}`}
            >
              <span className="drone-nav-num">0{idx + 1}</span>
              <span className="drone-nav-text">{stg.title.split(" ")[1] || stg.title}</span>
            </button>
          ))}
        </div>

        {/* ——— Active Architectural Brief Glass Card ——— */}
        <div className="drone-brief-card" role="region" aria-label="Current Architectural Set Details">
          <div className="drone-card-glass">
            <div className="drone-card-header">
              <span className="drone-zone-tag">{activeStage.zone}</span>
              <span className="drone-step-count">0{activeStageIdx + 1} / 0{STAGES.length}</span>
            </div>
            
            <h3 className="drone-card-title">{activeStage.title}</h3>
            <p className="drone-card-desc">{activeStage.subtitle}</p>

            <div className="drone-tags-row">
              {activeStage.tags.map((t) => (
                <span key={t} className="drone-pill">{t}</span>
              ))}
            </div>

            <div className="drone-card-meta">
              <div className="drone-meta-item">
                <span className="meta-lbl">NATURAL LIGHTING:</span>
                <span className="meta-txt">{activeStage.lighting}</span>
              </div>
            </div>

            <div className="drone-card-actions">
              <Link to="/enquire" className="btn btn-primary btn-sm">
                Book This Set
              </Link>
              <a 
                href={waLink(`Hi, I'd like to book a walkthrough of ${activeStage.title} at The Courtyard Stories.`)}
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-wa btn-sm"
              >
                WhatsApp Recce
              </a>
            </div>
          </div>
        </div>

        {/* ——— Scroll Prompt Indicator ——— */}
        <div className="drone-scroll-hint" aria-hidden="true">
          <span className="scroll-hint-bar" />
          <span>SCROLL TO FLY THROUGH ARCHITECTURE</span>
        </div>
      </div>
    </section>
  );
}
