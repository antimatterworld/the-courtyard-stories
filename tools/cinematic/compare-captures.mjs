#!/usr/bin/env node
/**
 * compare-captures.mjs — fidelity check between the REFERENCE capture and the REPLICA capture.
 *
 * 1) Capture the replica with the SAME script:
 *      HEADED=1 node capture-reference.mjs http://localhost:5173/ replica-capture
 * 2) Compare:
 *      node compare-captures.mjs reference-capture replica-capture [desktop|mobile]
 *
 * Outputs <replica>/compare-<profile>.json, compare-<profile>.md and contact-<profile>.html
 * (side-by-side screenshots for eyeballing).
 *
 * IMPORTANT: camera numbers are only comparable when the replica uses the same world scale/layout
 * (use reference layout.json to place things). Pass --normalize to compare camera paths after
 * normalising each by its own scene diagonal (shape-of-the-journey match, scale-independent).
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const [refDir, repDir, profile = 'desktop'] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const NORMALIZE = process.argv.includes('--normalize');
if (!refDir || !repDir) { console.error('usage: node compare-captures.mjs <referenceDir> <replicaDir> [desktop|mobile] [--normalize]'); process.exit(1); }

const load = async (d, f) => JSON.parse(await fs.readFile(path.join(d, profile, f), 'utf8'));
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const angle = (a, b) => {
  const d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  return (Math.acos(Math.max(-1, Math.min(1, d / ((Math.hypot(...a) * Math.hypot(...b)) || 1)))) * 180) / Math.PI;
};
const sceneDiag = async (d) => {
  try {
    const l = await load(d, 'layout.json');
    const s = l.scene.bbox.size;
    return Math.hypot(...s) || 1;
  } catch { return 1; }
};
// linear interpolation of a track at normalised progress p
function sampleAt(track, p) {
  const t = track.filter((s) => s.cam);
  if (!t.length) return null;
  if (p <= t[0].p) return t[0].cam;
  for (let i = 1; i < t.length; i++) {
    if (p <= t[i].p) {
      const a = t[i - 1], b = t[i];
      const k = (p - a.p) / ((b.p - a.p) || 1);
      const lerp = (x, y) => x + (y - x) * k;
      return {
        pos: a.cam.pos.map((v, j) => lerp(v, b.cam.pos[j])),
        fwd: a.cam.fwd.map((v, j) => lerp(v, b.cam.fwd[j])),
        fov: lerp(a.cam.fov, b.cam.fov),
      };
    }
  }
  return t[t.length - 1].cam;
}

const refTrack = await load(refDir, 'camera-down.json');
const repTrack = await load(repDir, 'camera-down.json');
const dRef = await sceneDiag(refDir);
const dRep = await sceneDiag(repDir);
const norm = (v, d) => v.map((x) => x / d);

const rows = [];
for (let i = 0; i <= 40; i++) {
  const p = i / 40;
  const a = sampleAt(refTrack, p);
  const b = sampleAt(repTrack, p);
  if (!a || !b) continue;
  // Same layout: raw distance as a fraction of the REFERENCE scene diagonal.
  // --normalize: each path divided by its own scene diagonal (scale-independent shape check).
  const posErr = NORMALIZE ? dist(norm(a.pos, dRef), norm(b.pos, dRep)) : dist(a.pos, b.pos) / dRef;
  rows.push({ p, posErr: +posErr.toFixed(4), lookErrDeg: +angle(a.fwd, b.fwd).toFixed(2), fovErr: +Math.abs(a.fov - b.fov).toFixed(2) });
}
const max = (k) => Math.max(...rows.map((r) => r[k]));
const mean = (k) => rows.reduce((s, r) => s + r[k], 0) / (rows.length || 1);

// scroll length parity (in viewport heights)
const detRef = await load(refDir, 'detect.json');
const detRep = await load(repDir, 'detect.json');
// Reference has no extra content after its journey; the replica has close/footer AFTER the story track, so use the track height when present.
const lenRef = (detRef.storyTrack ? detRef.storyTrack.height : detRef.scrollHeight) / detRef.innerHeight;
const lenRep = (detRep.storyTrack ? detRep.storyTrack.height : detRep.scrollHeight) / detRep.innerHeight;

// overlay parity: which texts are visible at the same progress
const ovRef = await load(refDir, 'overlays-down.json');
const ovRep = await load(repDir, 'overlays-down.json');
const textsAt = (ov, p) => {
  const s = ov.reduce((best, c) => (Math.abs(c.p - p) < Math.abs(best.p - p) ? c : best), ov[0]);
  return new Set(s.items.filter((x) => x.text && /^h[1-4]$/.test(x.tag)).map((x) => x.text.toLowerCase()));
};

const POS_TOL = NORMALIZE ? 0.03 : 0.02; // fraction of scene diagonal — tune with the owner
const result = {
  profile, normalized: NORMALIZE, sceneDiagonal: { reference: +dRef.toFixed(1), replica: +dRep.toFixed(1) },
  scrollLengthViewportHeights: { reference: +lenRef.toFixed(2), replica: +lenRep.toFixed(2), replicaMeasuredOn: detRep.storyTrack ? 'story track' : 'whole document (no [data-story-track] found!)' },
  camera: { meanPosErr: +mean('posErr').toFixed(4), maxPosErr: max('posErr'), meanLookErrDeg: +mean('lookErrDeg').toFixed(2), maxLookErrDeg: max('lookErrDeg'), maxFovErr: max('fovErr') },
  thresholds: { posErr: POS_TOL, lookErrDeg: 3, fovErr: 2, scrollLengthRatio: [0.95, 1.05] },
  rows,
  headingsAtProgress: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map((p) => ({ p, reference: [...textsAt(ovRef, p)], replica: [...textsAt(ovRep, p)] })),
};
result.pass =
  result.camera.maxPosErr <= POS_TOL && result.camera.maxLookErrDeg <= 3 && result.camera.maxFovErr <= 2 &&
  lenRep / lenRef >= 0.95 && lenRep / lenRef <= 1.05;

await fs.writeFile(path.join(repDir, `compare-${profile}.json`), JSON.stringify(result, null, 1));
const md = [
  `# Fidelity report (${profile}${NORMALIZE ? ', normalised' : ''}) — ${result.pass ? 'PASS' : 'FAIL'}`, '',
  `- scroll length (viewport heights): reference ${result.scrollLengthViewportHeights.reference} vs replica ${result.scrollLengthViewportHeights.replica} (replica measured on: ${result.scrollLengthViewportHeights.replicaMeasuredOn})`,
  `- scene diagonal: reference ${result.sceneDiagonal.reference} vs replica ${result.sceneDiagonal.replica}${Math.abs(dRef - dRep) / dRef > 0.03 ? '  ⚠ differs >3%: footprints do not match, consider --normalize' : ''}`,
  `- camera position error (fraction of scene diagonal): mean ${result.camera.meanPosErr}, max ${result.camera.maxPosErr} (tolerance ${POS_TOL})`,
  `- look direction error: mean ${result.camera.meanLookErrDeg}°, max ${result.camera.maxLookErrDeg}° (tolerance 3°)`,
  `- FOV error: max ${result.camera.maxFovErr}° (tolerance 2°)`, '',
  '## Worst progress points (fix these first)',
  ...[...rows].sort((a, b) => b.posErr - a.posErr).slice(0, 5).map((r) => `- p=${r.p.toFixed(3)}: pos ${r.posErr}, look ${r.lookErrDeg}°, fov ${r.fovErr}°`),
  '', '## Headings visible at the same progress',
  ...result.headingsAtProgress.map((h) => `- p=${h.p}: ref [${h.reference.join(' | ')}] / replica [${h.replica.join(' | ')}]`),
];
await fs.writeFile(path.join(repDir, `compare-${profile}.md`), md.join('\n'));

// contact sheet
const list = async (d) => (await fs.readdir(path.join(d, profile, 'shots')).catch(() => [])).filter((f) => f.startsWith('down-')).sort();
const A = await list(refDir), B = await list(repDir);
const rel = (from, to) => path.relative(from, to).split(path.sep).join('/');
const cells = A.map((f, i) => `<tr><td>${f}</td><td><img src="${rel(repDir, path.join(refDir, profile, 'shots', f))}"></td><td>${B[i] ? `<img src="${rel(repDir, path.join(repDir, profile, 'shots', B[i]))}">` : '—'}</td></tr>`).join('');
await fs.writeFile(path.join(repDir, `contact-${profile}.html`), `<!doctype html><meta charset=utf-8><title>Reference vs replica</title><style>body{font:14px system-ui;background:#111;color:#eee}img{max-width:46vw}td{vertical-align:top;padding:4px}</style><h1>Reference (left) vs replica (right) — ${profile}</h1><table>${cells}</table>`);

console.log(md.join('\n'));
process.exit(result.pass ? 0 : 2);
