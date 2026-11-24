import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome" });

async function open(page, url, width, height) {
  await page.setViewportSize({ width, height });
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".courtyard-loader", { state: "detached", timeout: 20000 }).catch(() => {});
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });
}

function readHud(page) {
  return page.locator(".story-debug").innerText();
}

const desk = await browser.newPage();
await open(desk, "http://localhost:5173/?cinematic=1&debug=cam", 1440, 900);
const deskLen = await desk.evaluate(() => {
  const track = document.querySelector(".story-track");
  return {
    trackVh: track.offsetHeight / window.innerHeight,
    docVh: document.documentElement.scrollHeight / window.innerHeight,
  };
});
console.log("desktop length", JSON.stringify(deskLen));

async function gotoP(page, p) {
  await page.evaluate((progress) => {
    const track = document.querySelector(".story-track");
    const total = track.offsetHeight - window.innerHeight;
    const top = track.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + total * progress);
  }, p);
  await page.waitForTimeout(80);
}

const down = {};
for (const p of [0.2, 0.5, 0.8]) {
  await gotoP(desk, p);
  down[p] = await readHud(desk);
}
const up = {};
for (const p of [0.8, 0.5, 0.2]) {
  await gotoP(desk, p);
  up[p] = await readHud(desk);
}
for (const p of [0.2, 0.5, 0.8]) {
  const line = (text, key) => text.split("\n").find((l) => l.startsWith(key));
  const same = line(down[p], "pos") === line(up[p], "pos");
  console.log("retrace", p, same ? "same" : "DIFF", "down", line(down[p], "p"), line(down[p], "pos"), "up", line(up[p], "p"), line(up[p], "pos"));
}

const before = await desk.evaluate(() => window.__storyRenders ?? 0);
await desk.evaluate(async () => {
  const track = document.querySelector(".story-track");
  const total = track.offsetHeight - window.innerHeight;
  const top = track.getBoundingClientRect().top + window.scrollY;
  for (let i = 0; i <= 40; i++) {
    window.scrollTo(0, top + (total * i) / 40);
    await new Promise((r) => requestAnimationFrame(r));
  }
});
const after = await desk.evaluate(() => window.__storyRenders ?? 0);
console.log("StoryTrack renders during 41 scroll steps", after - before);

await desk.close();

for (const [label, w, h] of [
  ["phone", 390, 844],
  ["portrait-wide", 820, 1180],
  ["landscape-tablet", 1024, 700],
]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await open(page, "http://localhost:5173/?cinematic=1&debug=cam", w, h);
  await gotoP(page, 0.15);
  const hud = await readHud(page);
  const fov = hud.split("\n").find((l) => l.startsWith("fov"));
  const len = await page.evaluate(() => ({
    trackVh: document.querySelector(".story-track").offsetHeight / window.innerHeight,
    docVh: document.documentElement.scrollHeight / window.innerHeight,
  }));
  console.log(label, fov, JSON.stringify(len));
  await page.close();
}

const plain = await browser.newPage();
await open(plain, "http://localhost:5173/?cinematic=0", 1440, 900);
console.log("cinematic=0 story", await plain.locator(".story-track").count(), "hero", await plain.getByText("Plan a shoot").count());
await plain.close();

const reduced = await browser.newPage();
await reduced.emulateMedia({ reducedMotion: "reduce" });
await open(reduced, "http://localhost:5173/", 1440, 900);
console.log("reduced-motion story", await reduced.locator(".story-track").count(), "hero", await reduced.getByText("Plan a shoot").count());
await reduced.close();

const noGl = await chromium.launch({ channel: "chrome", args: ["--disable-webgl", "--disable-3d-apis"] });
const glPage = await noGl.newPage({ viewport: { width: 1440, height: 900 } });
await open(glPage, "http://localhost:5173/", 1440, 900);
const glState = await glPage.evaluate(() => {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
  return { webgl: Boolean(gl), story: document.querySelectorAll(".story-track").length, plan: document.body.innerText.includes("Plan a shoot") };
});
console.log("webgl-disabled", JSON.stringify(glState));
await noGl.close();
await browser.close();
