import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const out = path.resolve("docs/cinematic/phase2-shots");
fs.mkdirSync(out, { recursive: true });
const points = [0, 0.1, 0.22, 0.38, 0.45, 0.6, 0.8, 0.95, 1];
const views = [
  ["desktop", 1440, 900],
  ["mobile", 390, 844],
];

const browser = await chromium.launch({ channel: "chrome" });
for (const [name, width, height] of views) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto("http://localhost:5173/?cinematic=1&debug=cam", { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".courtyard-loader", { state: "detached", timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(600);
  const dom = await page.evaluate(() => {
    const canvas = document.querySelector(".story-canvas canvas");
    if (!canvas) return { canvas: false };
    const style = getComputedStyle(canvas);
    const box = canvas.getBoundingClientRect();
    return {
      canvas: true,
      width: box.width,
      height: box.height,
      z: style.zIndex,
      opacity: style.opacity,
      visibility: style.visibility,
      bg: style.backgroundColor,
    };
  });
  console.log(name, JSON.stringify(dom));
  for (const p of points) {
    await page.evaluate((progress) => {
      const track = document.querySelector(".story-track");
      if (!track) return;
      const total = track.offsetHeight - window.innerHeight;
      const top = track.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top + total * progress);
    }, p);
    await page.waitForTimeout(250);
    const chapter = await page.evaluate(() => document.querySelector(".story-chapter.is-active")?.textContent?.slice(0, 80) ?? "");
    console.log(name, p, chapter.replace(/\s+/g, " ").trim());
    await page.screenshot({ path: path.join(out, `${name}-p${String(p).replace(".", "")}.png`) });
  }
  await page.close();
}
await browser.close();
