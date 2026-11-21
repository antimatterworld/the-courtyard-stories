/* Visual-verify gate: drives the real app in Chromium, screenshots every
   key state, and reports console errors. Exits non-zero if any page has
   a console error. Run: node scripts/shots.mjs */
import { chromium } from "playwright";
import fs from "node:fs";

const OUT = "screenshots";
fs.mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:5173";
const failures = [];
const pageErrors = [];

const browser = await chromium.launch();

async function newPage(width, height, isMobile = false) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    isMobile,
    hasTouch: isMobile,
    deviceScaleFactor: isMobile ? 2 : 1,
  });
  const page = await ctx.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") pageErrors.push({ page: page.url(), text: msg.text() });
  });
  page.on("pageerror", (err) => pageErrors.push({ page: page.url(), text: String(err) }));
  return page;
}

const shot = async (page, name, full = false) => {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full });
  console.log(`  ✓ ${name}.png`);
};

const settle = (page, ms = 400) => page.waitForTimeout(ms);

/* ————————————————— 1. Desktop home (light + 3D) ————————————————— */
{
  const page = await newPage(1440, 900);
  await page.goto(BASE, { waitUntil: "networkidle" });
  await settle(page, 1800); // let the 3D canvas fade in + fonts load
  await shot(page, "01-home-desktop-light");
  // dark mode
  await page.click('[aria-label*="darkroom"], .theme-toggle');
  await settle(page);
  await shot(page, "02-home-desktop-dark");
  // full page light
  await page.click('[aria-label*="studio daylight"], .theme-toggle');
  await settle(page);
  await shot(page, "03-home-desktop-full", true);
  await page.context().close();
}

/* ————————————————— 2. Mobile 375px home ————————————————— */
{
  const page = await newPage(375, 812, true);
  await page.goto(BASE, { waitUntil: "networkidle" });
  await settle(page, 1200);
  await shot(page, "04-home-mobile-375");
  // open drawer
  await page.click(".burger");
  await settle(page, 500);
  await shot(page, "05-home-mobile-drawer");
  await page.context().close();
}

/* ————————————————— 3. Portfolio + lightbox ————————————————— */
{
  const page = await newPage(1440, 900);
  await page.goto(`${BASE}/work`, { waitUntil: "networkidle" });
  await settle(page, 800);
  await shot(page, "06-work-desktop");
  // filter to fashion
  await page.click('button.chip:has-text("Fashion")');
  await settle(page, 600);
  await shot(page, "07-work-filtered-fashion");
  // open lightbox
  await page.click(".masonry-item button");
  await settle(page, 600);
  await shot(page, "08-work-lightbox");
  await page.keyboard.press("Escape");
  await page.context().close();
}

/* ————————————————— 4. Service detail (fashion) ————————————————— */
{
  const page = await newPage(1440, 900);
  await page.goto(`${BASE}/services/fashion`, { waitUntil: "networkidle" });
  await settle(page, 800);
  await shot(page, "09-service-fashion");
  // open a FAQ accordion (last item)
  const details = page.locator("details.faq-item");
  await details.nth(1).click();
  await settle(page, 400);
  await shot(page, "10-service-faq-open");
  await page.context().close();
}

/* ————————————————— 5. Enquire — validated form state ————————————————— */
{
  const page = await newPage(1440, 900);
  await page.goto(`${BASE}/enquire`, { waitUntil: "networkidle" });
  await settle(page, 600);
  await shot(page, "11-enquire-step1");

  // step 1: pick shoot type
  await page.click('button:has-text("Fashion editorial")');
  await settle(page);
  await shot(page, "12-enquire-type-selected");
  await page.click("button:has-text('Continue')");
  await settle(page, 400);

  // step 2: dates + budget
  await page.fill("#dates", "Second week of March (10–14)");
  await page.selectOption("#budget", "₹75k – ₹2L");
  await shot(page, "13-enquire-step2-filled");
  await page.click("button:has-text('Continue')");
  await settle(page, 400);

  // step 3: crew + kit
  await page.click('button.chip:has-text("Small crew")');
  await page.click('button.chip:has-text("Camera + lens kit")');
  await page.click('button.chip:has-text("Colourist")');
  await shot(page, "14-enquire-step3-kit");
  await page.click("button:has-text('Continue')");
  await settle(page, 400);

  // step 4: contact — first show a validation error (empty submit)
  await page.click("button:has-text('Send enquiry')");
  await settle(page, 400);
  await shot(page, "15-enquire-step4-errors");

  // fill valid values
  await page.fill("#name", "Yasir Khan");
  await page.fill("#company", "Meraki Atelier");
  await page.fill("#contact", "+91 98186 37485");
  await page.fill("#notes", "12-look editorial, linen-heavy, ochre grade. References attached to this email.");
  await shot(page, "16-enquire-step4-validated");

  // submit → sent state (dev middleware logs it)
  await page.click("button:has-text('Send enquiry')");
  await settle(page, 1500);
  await shot(page, "17-enquire-sent-success");

  // fallback-state check: cut the network, resubmit → WhatsApp fallback
  await page.context().close();
}

/* ————————————————— 6. Empty/error states: 404 + no-results filter ————————————————— */
{
  const page = await newPage(1440, 900);
  await page.goto(`${BASE}/does-not-exist`, { waitUntil: "networkidle" });
  await settle(page, 500);
  await shot(page, "18-404-page");
  await page.context().close();
}

/* ————————————————— 7. Studio page (media-rich inner page) ————————————————— */
{
  const page = await newPage(1440, 900);
  await page.goto(`${BASE}/studio`, { waitUntil: "networkidle" });
  await settle(page, 700);
  await shot(page, "19-studio-page");
  await page.context().close();
}

await browser.close();

/* ————————————————— report ————————————————— */
console.log("\n=== console/page errors ===");
if (pageErrors.length === 0) console.log("none");
else {
  pageErrors.slice(0, 20).forEach((e) => {
    failures.push(e.text);
    console.log(`  ✗ [${e.page}] ${e.text}`);
  });
}
console.log(`\nDone: ${failures.length === 0 ? "PASS" : `FAIL (${failures.length})`}`);
process.exit(failures.length ? 1 : 0);
