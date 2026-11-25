// Walks the landing page at phone and laptop sizes and reports layout problems.
// Usage: node tools/cinematic/audit-mobile.mjs [baseUrl] [outDir]
import { chromium } from "playwright";
import fs from "node:fs";

const base = process.argv[2] ?? "http://localhost:5173/";
const out = process.argv[3] ?? "screenshots/mobile-audit";
fs.mkdirSync(out, { recursive: true });

const ALL_PROFILES = [
  { name: "m390", width: 390, height: 844, mobile: true },
  { name: "m360", width: 360, height: 740, mobile: true },
  { name: "tablet", width: 820, height: 1180, mobile: true },
  { name: "land", width: 844, height: 390, mobile: true },
  { name: "desktop", width: 1440, height: 900, mobile: false },
];
const only = (process.env.PROFILES ?? "").split(",").filter(Boolean);
const PROFILES = only.length ? ALL_PROFILES.filter((p) => only.includes(p.name)) : ALL_PROFILES;

const SECTIONS = [
  [".recent-shoots", "shoots"],
  [".landing-set-month", "setmonth"],
  [".landing-band-statement", "statement"],
  [".shoot-accordion", "services"],
  [".book-invite", "book"],
  [".faq-desk", "faq"],
  [".footer", "footer"],
];

const measure = () => {
  const vw = document.documentElement.clientWidth;
  const offenders = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    if (r.right <= vw + 1 && r.left >= -1) continue;
    let node = el.parentElement;
    let clipped = false;
    while (node && node !== document.body) {
      const o = getComputedStyle(node).overflowX;
      if (o === "hidden" || o === "clip" || o === "auto" || o === "scroll") {
        clipped = true;
        break;
      }
      node = node.parentElement;
    }
    if (!clipped) {
      offenders.push({
        el: el.tagName + "." + String(el.className).slice(0, 40),
        left: Math.round(r.left),
        right: Math.round(r.right),
      });
    }
  }
  return {
    vw,
    inner: window.innerWidth,
    scrollW: document.documentElement.scrollWidth,
    offenders: offenders.slice(0, 8),
  };
};

const browser = await chromium.launch({ channel: "chrome" });
const report = [];

for (const profile of PROFILES) {
  const context = await browser.newContext({
    viewport: { width: profile.width, height: profile.height },
    deviceScaleFactor: profile.mobile ? 2 : 1,
    isMobile: profile.mobile,
    hasTouch: profile.mobile,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 240)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text().slice(0, 240));
  });

  await page.goto(base, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector(".story-track", { timeout: 20000 });
  await page.waitForSelector(".courtyard-loader", { state: "detached", timeout: 25000 }).catch(() => {});
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });
  await page.waitForTimeout(700);

  const entry = { profile: profile.name, errors, steps: [] };
  const shot = async (label) => {
    await page.screenshot({ path: `${out}/${profile.name}-${label}.png` });
    entry.steps.push({ label, ...(await page.evaluate(measure)) });
  };

  const hero = await page.evaluate(() => {
    const rect = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right) };
    };
    return {
      h1: rect(".story-chapter[data-kind=hero] h1"),
      lede: rect(".story-chapter[data-kind=hero] .hero-mobile-lede"),
      actions: rect(".story-chapter[data-kind=hero] .landing-hero-actions"),
      cue: rect(".story-chapter[data-kind=hero] .landing-hero-scroll-cue"),
      navReveal: rect(".nav-reveal"),
      fab: rect(".wa-fab"),
      namesShowing: [...document.querySelectorAll(".zone-label")].filter((n) => {
        const cs = getComputedStyle(n);
        return cs && cs.visibility !== "hidden" && cs.display !== "none" && Number(cs.opacity) > 0.5;
      }).length,
      vh: window.innerHeight,
    };
  });
  entry.hero = hero;
  await shot("00-hero");

  for (const p of [0.04, 0.12, 0.25, 0.4, 0.6, 0.8, 1]) {
    await page.evaluate((progress) => {
      const track = document.querySelector(".story-track");
      const total = track.offsetHeight - window.innerHeight;
      const top = track.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top + total * progress);
    }, p);
    await page.waitForTimeout(450);
    await shot(`track-${String(p).replace(".", "")}`);
  }

  // Labels and tap targets while the aerial view is held.
  await page.evaluate(() => {
    const track = document.querySelector(".story-track");
    const total = track.offsetHeight - window.innerHeight;
    const top = track.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + total * 0.7);
  });
  await page.waitForTimeout(600);
  // From the air every yard name should be on screen and take a tap at its centre.
  entry.targets = await page.evaluate(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return [...document.querySelectorAll(".zone-label")].map((n) => {
      const r = n.getBoundingClientRect();
      const wrap = n.closest(".zone-label-wrap");
      const cs = wrap ? getComputedStyle(wrap) : getComputedStyle(n);
      const shown = cs.display !== "none" && cs.visibility !== "hidden" && r.width > 0;
      const onScreen = shown && r.left >= 0 && r.right <= vw && r.top >= 0 && r.bottom <= vh;
      const hit = onScreen ? document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) : null;
      return {
        t: (n.getAttribute("aria-label") || "").trim(),
        onScreen,
        tappable: !!hit && (hit === n || n.contains(hit)),
        w: Math.round(r.width),
        h: Math.round(r.height),
        x: Math.round(r.left),
        y: Math.round(r.top),
      };
    });
  });
  await shot("aerial");

  // Open a yard from its pinned name, the same way on every screen.
  const opener = page.locator('.zone-label[aria-label="Thatched Lookout"]');
  let reveal = { opened: false };
  if (await opener.count()) {
    await opener.first().click({ timeout: 5000 }).catch((e) => {
      reveal.clickError = String(e).slice(0, 160);
    });
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${out}/${profile.name}-fly.png` });
    const opened = await page.waitForSelector("#zone-reveal-title", { timeout: 6000 }).catch(() => null);
    if (opened) {
      await page.waitForTimeout(1300);
      reveal = {
        ...reveal,
        opened: true,
        ...(await page.evaluate(() => {
          const card = document.querySelector(".zone-reveal-card").getBoundingClientRect();
          const stage = document.querySelector(".zone-reveal-stage").getBoundingClientRect();
          const copy = document.querySelector(".zone-reveal-copy").getBoundingClientRect();
          const actions = document.querySelector(".zone-reveal-actions").getBoundingClientRect();
          const el = document.querySelector(".zone-reveal-card");
          return {
            card: { top: Math.round(card.top), bottom: Math.round(card.bottom), left: Math.round(card.left), right: Math.round(card.right) },
            stageH: Math.round(stage.height),
            copyTop: Math.round(copy.top),
            actionsBottom: Math.round(actions.bottom),
            scrolls: el.scrollHeight > el.clientHeight + 1,
            vh: window.innerHeight,
            vw: window.innerWidth,
          };
        })),
      };
      await shot("reveal");
      await page.getByRole("button", { name: "Back to the map" }).click();
      await page.waitForSelector(".zone-reveal", { state: "detached", timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(1300);
      await shot("after-reveal");
    }
  }
  entry.reveal = reveal;

  // Navigation toggle.
  const toggle = page.locator(".nav-reveal");
  if (await toggle.count()) {
    await toggle.click();
    await page.waitForTimeout(600);
    await shot("nav-open");
    await toggle.click();
    await page.waitForTimeout(500);
  }

  for (const [selector, label] of SECTIONS) {
    const found = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, Math.max(0, top - 8));
      return true;
    }, selector);
    if (!found) {
      entry.steps.push({ label, missing: true });
      continue;
    }
    await page.waitForTimeout(700);
    await shot(`sec-${label}`);
  }

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(500);
  await shot("end");

  // Touch behaviour: things a mouse does by hovering have to work by tapping.
  if (profile.mobile) {
    const touch = {};
    const top = (sel) =>
      page.evaluate((s) => {
        const el = document.querySelector(s);
        const y = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, Math.max(0, y - 90));
      }, sel);

    await top(".shoot-accordion-row");
    await page.waitForTimeout(400);
    const strips = await page.evaluate(() =>
      [...document.querySelectorAll(".shoot-accordion-row a")].map((a) => Math.round(a.getBoundingClientRect().height)),
    );
    const closed = page.locator('.shoot-accordion-row a[aria-expanded="false"]').last();
    const label = (await closed.innerText()).split("\n")[0];
    await closed.tap();
    await page.waitForTimeout(800);
    touch.services = {
      heights: strips,
      tapped: label,
      opened: await page.evaluate(
        () => document.querySelector('.shoot-accordion-row a[aria-expanded="true"] strong')?.textContent,
      ),
      stayedOnPage: new URL(page.url()).pathname === "/",
    };
    await page.screenshot({ path: `${out}/${profile.name}-touch-services.png` });

    await top(".faq-desk ol");
    await page.waitForTimeout(300);
    await page.locator(".faq-desk ol button").nth(2).tap();
    await page.waitForTimeout(600);
    touch.faq = await page.evaluate(() => {
      const note = [...document.querySelectorAll(".faq-desk-inline, .faq-desk article")].find(
        (n) => getComputedStyle(n).display !== "none",
      );
      if (!note) return { shown: false };
      const r = note.getBoundingClientRect();
      return {
        shown: true,
        inView: r.top >= 0 && r.top < window.innerHeight - 60,
        text: note.textContent.trim().slice(0, 40),
      };
    });
    await page.screenshot({ path: `${out}/${profile.name}-touch-faq.png` });

    await top(".recent-shoots-viewport");
    await page.waitForTimeout(300);
    const box = await page.locator(".recent-shoots-viewport").boundingBox();
    await page.touchscreen.tap(box.x + box.width / 2, box.y + 120);
    await page.waitForTimeout(900);
    touch.shoots = await page.evaluate(() => ({
      held: document.querySelector(".recent-shoots-viewport").classList.contains("is-held"),
      playing: [...document.querySelectorAll(".recent-shoot-card video")].filter((v) => !v.paused).length,
    }));
    await page.touchscreen.tap(box.x + box.width / 2, box.y + 120);
    await page.waitForTimeout(500);
    touch.shootsAfterSecondTap = await page.evaluate(() => ({
      held: document.querySelector(".recent-shoots-viewport").classList.contains("is-held"),
      playing: [...document.querySelectorAll(".recent-shoot-card video")].filter((v) => !v.paused).length,
    }));
    entry.touch = touch;
  }

  // Turning the phone must redraw the courtyard, not leave an empty canvas.
  if (profile.name === "m390") {
    await page.evaluate(() => {
      const track = document.querySelector(".story-track");
      const total = track.offsetHeight - window.innerHeight;
      window.scrollTo(0, track.getBoundingClientRect().top + window.scrollY + total * 0.7);
    });
    await page.waitForTimeout(400);
    await page.setViewportSize({ width: profile.height, height: profile.width });
    await page.waitForTimeout(900);
    entry.rotated = await page.evaluate(() => {
      const canvas = document.querySelector(".story-canvas canvas");
      // The drawing buffer is not readable after a frame, so the picture is judged from the screenshot.
      return { size: [canvas.width, canvas.height] };
    });
    await page.screenshot({ path: `${out}/${profile.name}-rotated.png` });
    await page.setViewportSize({ width: profile.width, height: profile.height });
    await page.waitForTimeout(600);
  }

  entry.page = await page.evaluate(() => ({
    height: document.documentElement.scrollHeight,
    screens: Math.round((document.documentElement.scrollHeight / window.innerHeight) * 10) / 10,
  }));

  report.push(entry);
  await context.close();
}

fs.writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2));
for (const entry of report) {
  console.log(`\n== ${entry.profile} ==`);
  console.log("errors", JSON.stringify(entry.errors.slice(0, 6)));
  console.log("hero", JSON.stringify(entry.hero));
  console.log("targets", JSON.stringify(entry.targets));
  console.log("reveal", JSON.stringify(entry.reveal));
  if (entry.touch) console.log("touch", JSON.stringify(entry.touch));
  if (entry.rotated) console.log("rotated", JSON.stringify(entry.rotated));
  console.log("page", JSON.stringify(entry.page));
  for (const step of entry.steps) {
    const bad = step.missing || step.scrollW > step.vw + 1 || (step.offenders && step.offenders.length);
    console.log(`${bad ? "!!" : "ok"} ${step.label}`, bad ? JSON.stringify(step) : "");
  }
}
await browser.close();
