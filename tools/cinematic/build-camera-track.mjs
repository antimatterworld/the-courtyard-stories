import fs from "node:fs";
import path from "node:path";

const root = path.resolve("docs/cinematic/reference-capture");
const outDir = path.resolve("src/cinematic/story");
fs.mkdirSync(outDir, { recursive: true });

function copySamples(samples) {
  return samples.map((sample) => ({
    p: sample.p,
    pos: sample.cam.pos,
    fwd: sample.cam.fwd,
    quat: sample.cam.quat,
    fov: sample.cam.fov,
    fog: sample.cam.fog,
    bg: sample.cam.bg,
    exposure: sample.cam.exposure,
  }));
}

for (const profile of ["desktop", "mobile"]) {
  const samples = JSON.parse(fs.readFileSync(path.join(root, profile, "camera-down.json"), "utf8"));
  const track = copySamples(samples);
  const file = path.join(outDir, `camera-track.${profile}.generated.json`);
  fs.writeFileSync(file, JSON.stringify(track));
  console.log(profile, samples.length, "->", track.length, file);
}
