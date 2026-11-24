import fs from "node:fs";
import path from "node:path";

const file = path.resolve("docs/cinematic/reference-capture/desktop/timeseries.json");
const rows = JSON.parse(fs.readFileSync(file, "utf8"));
const points = Array.isArray(rows) ? rows : rows.samples ?? rows.frames ?? [];

let tau = null;
if (points.length > 5 && points[0].target && points[0].pos) {
  const lags = [];
  for (let i = 1; i < points.length; i++) {
    const dt = (points[i].t ?? i) - (points[i - 1].t ?? i - 1);
    if (dt <= 0) continue;
    const err = Math.hypot(
      points[i].target[0] - points[i].pos[0],
      points[i].target[1] - points[i].pos[1],
      points[i].target[2] - points[i].pos[2],
    );
    const prev = Math.hypot(
      points[i - 1].target[0] - points[i - 1].pos[0],
      points[i - 1].target[1] - points[i - 1].pos[1],
      points[i - 1].target[2] - points[i - 1].pos[2],
    );
    if (prev > 1e-4 && err < prev) lags.push(-dt / Math.log(err / prev));
  }
  if (lags.length) {
    lags.sort((a, b) => a - b);
    tau = lags[Math.floor(lags.length / 2)];
  }
}

const result = {
  source: "docs/cinematic/reference-capture/desktop/timeseries.json",
  samples: points.length,
  tauSeconds: tau,
  note: tau == null
    ? "OBSERVED: timeseries has no target/pos pair, so no exponential lag was fitted. Native scroll, Lenis false."
    : "OBSERVED median exponential time constant.",
};
const out = path.resolve("docs/cinematic/damping.json");
fs.writeFileSync(out, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
