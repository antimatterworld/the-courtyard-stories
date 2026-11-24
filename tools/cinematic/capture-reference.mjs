#!/usr/bin/env node
/**
 * capture-reference.mjs
 * Measures what a scroll-driven Three.js site ACTUALLY does, so it can be replicated from data.
 *
 * Usage:
 *   npm i -D playwright && npx playwright install chromium
 *   HEADED=1 node capture-reference.mjs [url] [outDir]
 *
 *   url     default https://the-courtyard-studio.vercel.app/
 *   outDir  default ./reference-capture
 * Env:
 *   HEADED=1        use a visible browser (recommended: real GPU, truer frame timing)
 *   STEPS=120       number of scroll samples (default 120)
 *   PROFILES=desktop,mobile
 *   VIRTUAL_TOTAL   total wheel px when the page is NOT natively scrollable (default 12000)
 *
 * What it records (per profile):
 *   detect.json            what tech the page uses (three? gsap? lenis? video? canvas?)
 *   camera-down.json       scroll -> camera (pos, fwd, quat, fov, fog, bg, exposure, draw calls) scrolling DOWN
 *   camera-up.json         same, scrolling UP (reveals hysteresis / damping direction)
 *   timeseries.json        per-frame scrollY + camera during continuous scrolling (reveals easing/damping)
 *   mouse-parallax.json    does the pointer move the camera?
 *   scene-dump.json        lights, renderer settings, object counts, material types
 *   layout.json            world-space bounding boxes of scene groups (where buildings actually sit)
 *   overlays-down.json     every visible text/media element per scroll step (position, opacity, transform, font)
 *   camera-keyframes.json  simplified keyframes derived from camera-down.json
 *   assets.json / libs.json  network assets + library fingerprints
 *   shots/*.jpg, loading/*.jpg, video/*.webm
 *   SUMMARY.md
 *
 * Only OBSERVES behaviour. Do not use it to copy someone else's models/textures/code without rights.
 */
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const URL_ = process.argv[2] || 'https://the-courtyard-studio.vercel.app/';
const OUT = path.resolve(process.argv[3] || 'reference-capture');
const STEPS = Number(process.env.STEPS || 120);
const VIRTUAL_TOTAL = Number(process.env.VIRTUAL_TOTAL || 12000);
const WANT = (process.env.PROFILES || 'desktop,mobile').split(',').map((s) => s.trim());
const ALL_PROFILES = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  'tablet-portrait': { viewport: { width: 820, height: 1180 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  'tablet-landscape': { viewport: { width: 1180, height: 820 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pad = (n, w = 3) => String(n).padStart(w, '0');
const writeJson = (file, data) => fs.writeFile(file, JSON.stringify(data, null, 1));

/* ------------------------------------------------------------------ *
 * Runs in the page BEFORE any site script. three.js announces every
 * Scene/WebGLRenderer it creates to window.__THREE_DEVTOOLS__ (the same
 * hook the official three.js devtools extension uses).
 * ------------------------------------------------------------------ */
function initScript() {
  const cap = { renderers: [], scenes: [], lastScene: null, lastCamera: null, frames: 0, threeSeen: false, series: null };
  window.__CAP = cap;
  const hook = new EventTarget();
  window.__THREE_DEVTOOLS__ = hook;
  hook.addEventListener('observe', (e) => {
    const o = e.detail;
    cap.threeSeen = true;
    if (o && o.isWebGLRenderer) {
      cap.renderers.push(o);
      const orig = o.render.bind(o);
      o.render = function (scene, camera) {
        cap.lastScene = scene;
        cap.lastCamera = camera;
        cap.frames++;
        return orig(scene, camera);
      };
    } else if (o && o.isScene) {
      cap.scenes.push(o);
    }
  });

  cap.snap = (light) => {
    const cam = cap.lastCamera;
    const sc = cap.lastScene;
    if (!cam) return null;
    cam.updateWorldMatrix(true, false);
    const e = cam.matrixWorld.elements;
    const wq = cam.getWorldQuaternion(new cam.quaternion.constructor());
    const out = {
      pos: [e[12], e[13], e[14]],
      fwd: [-e[8], -e[9], -e[10]],
      quat: [wq.x, wq.y, wq.z, wq.w],
      fov: cam.fov,
      zoom: cam.zoom,
      aspect: cam.aspect,
      near: cam.near,
      far: cam.far,
      ortho: !!cam.isOrthographicCamera,
    };
    if (!light && sc) {
      out.fog = sc.fog
        ? { type: sc.fog.isFogExp2 ? 'exp2' : 'linear', color: '#' + sc.fog.color.getHexString(), near: sc.fog.near, far: sc.fog.far, density: sc.fog.density }
        : null;
      const bg = sc.background;
      out.bg = bg ? (bg.isColor ? '#' + bg.getHexString() : 'texture') : null;
      const r = cap.renderers[0];
      if (r) {
        out.exposure = r.toneMappingExposure;
        out.toneMapping = r.toneMapping;
        out.dpr = r.getPixelRatio();
        out.info = {
          calls: r.info.render.calls,
          triangles: r.info.render.triangles,
          geometries: r.info.memory.geometries,
          textures: r.info.memory.textures,
        };
      }
      // scene-level light intensities (cheap): lets us see day/night changes
      const lights = [];
      sc.traverse((o) => {
        if (o.isLight && lights.length < 12) lights.push({ t: o.type, c: '#' + o.color.getHexString(), i: +o.intensity.toFixed(3) });
      });
      out.lights = lights;
    }
    return out;
  };

  cap.dump = () => {
    const sc = cap.lastScene;
    const r = cap.renderers[0];
    if (!sc) return null;
    const lights = [];
    const stats = { meshes: 0, instancedMeshes: 0, instances: 0, points: 0, skinned: 0, lines: 0, objects: 0 };
    const mats = {};
    sc.traverse((o) => {
      stats.objects++;
      if (o.isLight) {
        lights.push({
          type: o.type,
          color: '#' + o.color.getHexString(),
          intensity: o.intensity,
          castShadow: !!o.castShadow,
          shadowMapSize: o.shadow ? [o.shadow.mapSize.x, o.shadow.mapSize.y] : null,
          pos: o.getWorldPosition(new o.position.constructor()).toArray(),
        });
      }
      if (o.isMesh) {
        stats.meshes++;
        if (o.isInstancedMesh) { stats.instancedMeshes++; stats.instances += o.count; }
        if (o.isSkinnedMesh) stats.skinned++;
        const list = Array.isArray(o.material) ? o.material : [o.material];
        list.forEach((m) => {
          if (!m) return;
          const k = m.type + (m.isShaderMaterial ? ':shader' : '');
          mats[k] = (mats[k] || 0) + 1;
        });
      }
      if (o.isPoints) stats.points++;
      if (o.isLine) stats.lines++;
    });
    const out = { stats, materials: mats, lights, topLevel: sc.children.map((c) => ({ type: c.type, name: c.name, children: c.children.length })).slice(0, 80) };
    if (r) {
      let attrs = null;
      try { attrs = r.getContext().getContextAttributes(); } catch (e) { /* ignore */ }
      out.renderer = {
        toneMapping: r.toneMapping,
        exposure: r.toneMappingExposure,
        outputColorSpace: r.outputColorSpace,
        shadowMapEnabled: r.shadowMap && r.shadowMap.enabled,
        shadowMapType: r.shadowMap && r.shadowMap.type,
        pixelRatio: r.getPixelRatio(),
        contextAttributes: attrs,
        info: { memory: { ...r.info.memory }, render: { ...r.info.render } },
      };
    }
    out.fog = sc.fog ? { type: sc.fog.isFogExp2 ? 'exp2' : 'linear', color: '#' + sc.fog.color.getHexString(), near: sc.fog.near, far: sc.fog.far, density: sc.fog.density } : null;
    out.background = sc.background ? (sc.background.isColor ? '#' + sc.background.getHexString() : 'texture') : null;
    out.hasEnvironment = !!sc.environment;
    return out;
  };

  // World-space bounding boxes of scene groups: where things actually are.
  cap.layout = () => {
    const sc = cap.lastScene;
    if (!sc) return null;
    const bboxOf = (root) => {
      const mn = [1e9, 1e9, 1e9];
      const mx = [-1e9, -1e9, -1e9];
      let tris = 0;
      let meshes = 0;
      root.updateWorldMatrix(true, true);
      root.traverse((m) => {
        if (!m.isMesh || !m.geometry) return;
        meshes++;
        const g = m.geometry;
        if (!g.boundingBox) g.computeBoundingBox();
        const b = g.boundingBox;
        if (!b) return;
        const e = m.matrixWorld.elements;
        for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) {
          const wx = e[0] * x + e[4] * y + e[8] * z + e[12];
          const wy = e[1] * x + e[5] * y + e[9] * z + e[13];
          const wz = e[2] * x + e[6] * y + e[10] * z + e[14];
          if (wx < mn[0]) mn[0] = wx; if (wy < mn[1]) mn[1] = wy; if (wz < mn[2]) mn[2] = wz;
          if (wx > mx[0]) mx[0] = wx; if (wy > mx[1]) mx[1] = wy; if (wz > mx[2]) mx[2] = wz;
        }
        const c = g.index ? g.index.count / 3 : g.attributes.position ? g.attributes.position.count / 3 : 0;
        tris += c * (m.isInstancedMesh ? m.count : 1);
      });
      return meshes ? { min: mn, max: mx, size: [mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]], center: [(mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2], tris: Math.round(tris), meshes } : null;
    };
    const entry = (o, depth) => ({ name: o.name || '(unnamed)', type: o.type, depth, visible: o.visible, bbox: bboxOf(o) });
    const out = { scene: entry(sc, 0), groups: [] };
    sc.children.forEach((c) => {
      const e = entry(c, 1);
      if (!e.bbox) return;
      out.groups.push(e);
      if (c.children.length > 1 && out.groups.length < 150) {
        c.children.slice(0, 80).forEach((cc) => { const ee = entry(cc, 2); if (ee.bbox) out.groups.push(ee); });
      }
    });
    return out;
  };

  cap.startSeries = () => {
    cap.series = [];
    const t0 = performance.now();
    const tick = () => {
      if (!cap.series) return;
      cap.series.push({ t: Math.round(performance.now() - t0), y: window.scrollY, cam: cap.snap(true) });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  cap.stopSeries = () => { const s = cap.series; cap.series = null; return s; };
}

/* Visible text/media elements with their geometry, opacity and transform. */
function overlaySnapshot() {
  const vh = innerHeight;
  const vw = innerWidth;
  const out = [];
  const sel = 'h1,h2,h3,h4,p,a,button,video,img,canvas,nav,li,[role="dialog"]';
  document.querySelectorAll(sel).forEach((el) => {
    const b = el.getBoundingClientRect();
    if (b.width < 2 || b.height < 2) return;
    if (b.bottom < 0 || b.top > vh || b.right < 0 || b.left > vw) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') return;
    let op = 1;
    let n = el;
    while (n && n.nodeType === 1) { op *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; }
    if (op < 0.02) return;
    const cls = typeof el.className === 'string' ? el.className : '';
    out.push({
      tag: el.tagName.toLowerCase(),
      cls: cls.slice(0, 60),
      text: (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 80),
      x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height),
      op: +op.toFixed(2),
      tf: cs.transform === 'none' ? null : cs.transform,
      fs: cs.fontSize, ff: cs.fontFamily.slice(0, 40), color: cs.color,
      ...(el.tagName === 'VIDEO' ? { t: +el.currentTime.toFixed(2), paused: el.paused, src: (el.currentSrc || '').slice(-60) } : {}),
    });
  });
  return out.slice(0, 120);
}

function detectPage() {
  const cap = window.__CAP;
  return {
    title: document.title,
    scrollHeight: document.scrollingElement.scrollHeight,
    // Replica only: the scroll-driven story track (hero..exit). Close/footer after it are not part of the journey.
    storyTrack: (() => {
      const st = document.querySelector('[data-story-track], .story-track');
      return st ? { top: Math.round(st.getBoundingClientRect().top + window.scrollY), height: Math.round(st.getBoundingClientRect().height) } : null;
    })(),
    innerHeight, innerWidth,
    canvases: [...document.querySelectorAll('canvas')].map((c) => ({ w: c.width, h: c.height, cls: String(c.className).slice(0, 60), position: getComputedStyle(c).position })),
    videos: document.querySelectorAll('video').length,
    images: document.querySelectorAll('img').length,
    iframes: document.querySelectorAll('iframe').length,
    globals: {
      gsap: !!window.gsap, ScrollTrigger: !!window.ScrollTrigger,
      Lenis: !!(window.Lenis || window.lenis), THREE: !!window.THREE,
      locomotive: !!window.LocomotiveScroll,
    },
    customElements: ['spline-viewer', 'model-viewer'].filter((t) => document.querySelector(t)),
    threeSeen: cap.threeSeen, rendererCount: cap.renderers.length, sceneCount: cap.scenes.length, renderedFrames: cap.frames,
    htmlClass: document.documentElement.className, bodyClass: document.body.className,
    htmlOverflow: getComputedStyle(document.documentElement).overflow, bodyOverflow: getComputedStyle(document.body).overflow,
    fonts: [...new Set([...document.fonts].map((f) => f.family))],
  };
}

const r4 = (n) => Math.round(n * 1e4) / 1e4;

async function settle(page, { maxMs = 5000, quietMs = 450 } = {}) {
  const start = Date.now();
  let last = null;
  let since = Date.now();
  while (Date.now() - start < maxMs) {
    const cur = await page.evaluate(() => {
      const r = (n) => Math.round(n * 1e4) / 1e4;
      const s = window.__CAP.snap && window.__CAP.snap(true);
      return JSON.stringify([r(window.scrollY), s && s.pos.map(r), s && s.quat.map(r), s && r(s.fov)]);
    });
    if (cur !== last) { last = cur; since = Date.now(); }
    else if (Date.now() - since >= quietMs) return true;
    await sleep(60);
  }
  return false;
}

function angleDeg(a, b) {
  const d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const la = Math.hypot(...a);
  const lb = Math.hypot(...b);
  return (Math.acos(Math.max(-1, Math.min(1, d / (la * lb || 1)))) * 180) / Math.PI;
}

function simplifyKeyframes(track, diag) {
  const withCam = track.filter((s) => s.cam);
  if (!withCam.length) return [];
  const keep = [withCam[0]];
  withCam.forEach((s, i) => {
    const last = keep[keep.length - 1];
    const dp = Math.hypot(s.cam.pos[0] - last.cam.pos[0], s.cam.pos[1] - last.cam.pos[1], s.cam.pos[2] - last.cam.pos[2]);
    const da = angleDeg(s.cam.fwd, last.cam.fwd);
    const df = Math.abs(s.cam.fov - last.cam.fov);
    if (dp > 0.01 * diag || da > 1.5 || df > 0.75 || i === withCam.length - 1) keep.push(s);
  });
  return keep.map((s) => ({ p: s.p, y: s.y, pos: s.cam.pos.map(r4), fwd: s.cam.fwd.map(r4), quat: s.cam.quat.map(r4), fov: r4(s.cam.fov), fog: s.cam.fog, bg: s.cam.bg, exposure: s.cam.exposure }));
}

async function runProfile(browser, name, profile) {
  const dir = path.join(OUT, name);
  await fs.mkdir(path.join(dir, 'shots'), { recursive: true });
  await fs.mkdir(path.join(dir, 'loading'), { recursive: true });
  const ctx = await browser.newContext({
    ...profile,
    ...(process.env.NOVIDEO ? {} : { recordVideo: { dir: path.join(dir, 'video'), size: profile.viewport } }),
  });
  const page = await ctx.newPage();
  await page.addInitScript(initScript);

  const assets = [];
  const jsBodies = [];
  page.on('response', async (res) => {
    try {
      const h = res.headers();
      const ct = (h['content-type'] || '').split(';')[0];
      assets.push({ url: res.url(), status: res.status(), type: ct, bytes: Number(h['content-length'] || 0) });
      if (/javascript/.test(ct) && jsBodies.length < 60) {
        const body = await res.text();
        if (body.length < 8e6) jsBodies.push({ url: res.url(), body });
      }
    } catch (e) { /* ignore */ }
  });

  console.log(`[${name}] loading ${URL_}`);
  const t0 = Date.now();
  await page.goto(URL_, { waitUntil: 'domcontentloaded' });
  for (const ms of [500, 1500, 3000, 6000]) {
    const wait = ms - (Date.now() - t0);
    if (wait > 0) await sleep(wait);
    await page.screenshot({ path: path.join(dir, 'loading', `t${pad(ms, 5)}ms.jpg`), type: 'jpeg', quality: 70 });
  }
  try { await page.waitForLoadState('networkidle', { timeout: 20000 }); } catch (e) { /* still fine */ }
  await sleep(3000);

  const detect = await page.evaluate(detectPage);
  const mode = detect.renderedFrames > 0 ? 'three' : detect.canvases.length ? 'canvas-unknown' : detect.videos ? 'video' : 'dom/other';
  detect.mode = mode;
  await writeJson(path.join(dir, 'detect.json'), detect);
  console.log(`[${name}] mode=${mode} scrollHeight=${detect.scrollHeight} three=${detect.threeSeen}`);

  await writeJson(path.join(dir, 'scene-dump.json'), await page.evaluate(() => window.__CAP.dump()));
  await writeJson(path.join(dir, 'layout.json'), await page.evaluate(() => window.__CAP.layout()));

  // --- scroll geometry -------------------------------------------------
  const scrollable = detect.scrollHeight > detect.innerHeight * 1.5;
  // If a story track exists (replica), progress is measured across the TRACK only: p=0 at its top, p=1 when its bottom meets the viewport bottom.
  const off = detect.storyTrack ? detect.storyTrack.top : 0;
  const total = detect.storyTrack ? detect.storyTrack.height - detect.innerHeight : scrollable ? detect.scrollHeight - detect.innerHeight : VIRTUAL_TOTAL;
  const cx = profile.viewport.width / 2;
  const cy = profile.viewport.height / 2;
  await page.mouse.move(cx, cy);
  let virtualY = 0;

  const readY = async () => (scrollable ? page.evaluate(() => window.scrollY) : virtualY);
  async function goTo(target) {
    const cur = await readY();
    const delta = target - cur;
    if (Math.abs(delta) < 1) return;
    await page.mouse.wheel(0, delta);
    if (!scrollable) virtualY += delta;
    await settle(page);
    if (scrollable) {
      const after = await readY();
      if (Math.abs(after - target) > 3) { await page.mouse.wheel(0, target - after); await settle(page); }
    }
  }

  async function pass(direction) {
    const track = [];
    const overlays = [];
    const shotEvery = Math.max(1, Math.round(STEPS / 20));
    for (let k = 0; k <= STEPS; k++) {
      const i = direction === 'down' ? k : STEPS - k;
      const target = off + (i / STEPS) * total;
      await goTo(target);
      const y = await readY();
      const cam = await page.evaluate(() => window.__CAP.snap(false));
      const videos = await page.evaluate(() => [...document.querySelectorAll('video')].map((v) => ({ t: +v.currentTime.toFixed(2), paused: v.paused })));
      track.push({ i, p: r4((y - off) / total), y: r4(y), cam, videos });
      if (direction === 'down') overlays.push({ i, p: r4((y - off) / total), items: await page.evaluate(overlaySnapshot) });
      if (direction === 'down' && k % shotEvery === 0) {
        await page.screenshot({ path: path.join(dir, 'shots', `down-${pad(k)}-p${pad(Math.round(((y - off) / total) * 100))}.jpg`), type: 'jpeg', quality: 72 });
      }
      if (k % 10 === 0) console.log(`[${name}] ${direction} ${k}/${STEPS}`);
    }
    return { track, overlays };
  }

  const down = await pass('down');
  await writeJson(path.join(dir, 'camera-down.json'), down.track);
  await writeJson(path.join(dir, 'overlays-down.json'), down.overlays);
  const up = await pass('up');
  await writeJson(path.join(dir, 'camera-up.json'), up.track);

  // --- keyframes ------------------------------------------------------------
  let diag = 1;
  try {
    const lay = JSON.parse(await fs.readFile(path.join(dir, 'layout.json'), 'utf8'));
    const s = lay && lay.scene && lay.scene.bbox && lay.scene.bbox.size;
    if (s) diag = Math.hypot(...s) || 1;
  } catch (e) { /* ignore */ }
  const keyframes = simplifyKeyframes(down.track, diag);
  await writeJson(path.join(dir, 'camera-keyframes.json'), { sceneDiagonal: diag, count: keyframes.length, keyframes });

  // --- continuous scroll: reveals damping / easing -----------------------------
  await goTo(off);
  await page.evaluate(() => window.__CAP.startSeries());
  const events = 600;
  const per = total / events;
  for (let k = 0; k < events; k++) {
    await page.mouse.wheel(0, per);
    if (!scrollable) virtualY += per;
    await sleep(16);
  }
  await settle(page, { maxMs: 6000 });
  const series = await page.evaluate(() => window.__CAP.stopSeries());
  await writeJson(path.join(dir, 'timeseries.json'), { eventsSent: events, pxPerEvent: per, sleepMs: 16, samples: series });

  // --- pointer influence ----------------------------------------------------------
  await goTo(off);
  const parallax = [];
  const W = profile.viewport.width;
  const H = profile.viewport.height;
  for (const [label, x, y] of [['center', W / 2, H / 2], ['topLeft', 5, 5], ['topRight', W - 5, 5], ['bottomLeft', 5, H - 5], ['bottomRight', W - 5, H - 5]]) {
    await page.mouse.move(x, y, { steps: 12 });
    await settle(page, { maxMs: 2500, quietMs: 300 });
    parallax.push({ label, cam: await page.evaluate(() => window.__CAP.snap(true)) });
  }
  await writeJson(path.join(dir, 'mouse-parallax.json'), parallax);

  // --- network / libs ---------------------------------------------------------------
  await writeJson(path.join(dir, 'assets.json'), assets);
  const fp = {
    three: /isWebGLRenderer|WebGLRenderer/, gsap: /gsap/i, ScrollTrigger: /ScrollTrigger/, lenis: /lenis/i, locomotive: /locomotive/i,
    GLTFLoader: /GLTFLoader/, DRACOLoader: /DRACOLoader|draco/i, KTX2Loader: /KTX2|basis_transcoder/i,
    EffectComposer: /EffectComposer/, Bloom: /UnrealBloom|BloomPass|bloom/i, DepthOfField: /BokehPass|DepthOfField|TiltShift|tilt-?shift/i,
    reactThreeFiber: /@react-three\/fiber|react-three-fiber/, drei: /@react-three\/drei/, theatre: /theatre/i, spline: /spline/i,
    CatmullRom: /CatmullRomCurve3/, framerMotion: /framer-motion/, lottie: /lottie/i,
  };
  const libs = {};
  for (const [k, re] of Object.entries(fp)) libs[k] = jsBodies.filter((j) => re.test(j.body)).map((j) => j.url.split('/').pop());
  const rev = jsBodies.map((j) => j.body.match(/REVISION[^"']{0,20}["'](\d{2,3})["']/)).find(Boolean);
  libs.threeRevisionGuess = rev ? rev[1] : null;
  await writeJson(path.join(dir, 'libs.json'), libs);

  await ctx.close(); // flushes the .webm recording
  return { name, detect, mode, scrollable, total, keyframes: keyframes.length, libs, assets: assets.length };
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const launchOpts = {
    headless: !process.env.HEADED,
    args: ['--ignore-gpu-blocklist', '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'].filter(
      (a) => !process.env.HEADED || !/swiftshader|use-gl|use-angle/.test(a),
    ),
  };
  const browser = await chromium.launch(launchOpts).catch(() => chromium.launch({ ...launchOpts, channel: "chrome" }));
  const results = [];
  for (const name of WANT) {
    if (!ALL_PROFILES[name]) continue;
    try { results.push(await runProfile(browser, name, ALL_PROFILES[name])); }
    catch (e) { console.error(`[${name}] FAILED`, e); results.push({ name, error: String(e) }); }
  }
  await browser.close();

  const lines = [`# Capture summary`, ``, `URL: ${URL_}`, `Captured: ${new Date().toISOString()}`, ``];
  for (const r of results) {
    if (r.error) { lines.push(`## ${r.name}: FAILED`, r.error, ''); continue; }
    lines.push(
      `## ${r.name}`,
      `- mode: **${r.mode}** (three.js seen: ${r.detect.threeSeen}, frames rendered: ${r.detect.renderedFrames})`,
      `- scroll: ${r.scrollable ? 'native document scroll' : 'VIRTUAL (wheel-hijacked)'}; ${r.detect.storyTrack ? 'STORY TRACK ' + (r.detect.storyTrack.height / r.detect.innerHeight).toFixed(2) + ' viewport heights (document ' + (r.detect.scrollHeight / r.detect.innerHeight).toFixed(2) + ')' : 'length ' + (r.detect.scrollHeight / r.detect.innerHeight).toFixed(2) + ' viewport heights'}`,
      `- canvases: ${r.detect.canvases.length}, videos: ${r.detect.videos}, images: ${r.detect.images}`,
      `- gsap: ${r.detect.globals.gsap}, ScrollTrigger: ${r.detect.globals.ScrollTrigger}, Lenis: ${r.detect.globals.Lenis}`,
      `- camera keyframes after simplification: ${r.keyframes}`,
      `- libs: ${Object.entries(r.libs).filter(([, v]) => (Array.isArray(v) ? v.length : v)).map(([k]) => k).join(', ') || 'none detected'}`,
      `- network assets: ${r.assets}`,
      '',
    );
    if (r.mode !== 'three') lines.push(`> **No three.js camera was captured.** The page may use pre-rendered video/frame scrubbing, Spline, a bundled/obfuscated renderer, or a canvas library. Check detect.json, libs.json, video/*.webm and shots/ and report back.`, '');
  }
  await fs.writeFile(path.join(OUT, 'SUMMARY.md'), lines.join('\n'));
  console.log(`\nDone -> ${OUT}\nZip the folder (or drop it in your repo at docs/cinematic/reference-capture) and hand it to Cursor.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
