import react from "@vitejs/plugin-react";
import { defineConfig, type Connect, type ViteDevServer } from "vite";

/* Dev-only stand-in for the Cloudflare /api/enquiry function:
   accepts the same JSON payload, validates the two required
   fields, logs it, returns 200 — so the form's resilient path
   (sent vs. WhatsApp fallback) is testable end-to-end locally. */
function devEnquiryApi() {
  const middleware: Connect.NextHandleFunction = (req, _res, next) => {
    if (req.method !== "POST" || req.url?.split("?")[0] !== "/api/enquiry") return next();
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try {
        const p = JSON.parse(raw || "{}");
        if (!p.name || !p.contact) {
          _res.writeHead(400, { "Content-Type": "application/json" });
          _res.end(JSON.stringify({ ok: false, error: "missing-fields" }));
          return;
        }
        console.log("[enquiry]", p.shootTypeLabel ?? p.shootType, "·", p.name, "·", p.contact);
        _res.writeHead(200, { "Content-Type": "application/json" });
        _res.end(JSON.stringify({ ok: true }));
      } catch {
        _res.writeHead(400, { "Content-Type": "application/json" });
        _res.end(JSON.stringify({ ok: false, error: "invalid-json" }));
      }
    });
  };
  return {
    name: "dev-enquiry-api",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig({
  plugins: [react(), devEnquiryApi()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string): string | undefined {
          if (id.includes("node_modules")) {
            if (id.includes("/three/")) return "three";
            if (id.includes("react-router")) return "router";
            if (id.includes("/react/") || id.includes("react-dom")) return "react";
          }
          return undefined;
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});
