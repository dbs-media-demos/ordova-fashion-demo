// Screenshots of the production build: a phone page scrolled top to bottom (full page), and desktop
// frames at a few scroll positions.
//   npm run build && node scripts/with-server.mjs node scripts/shots.mjs <outDir> [route] [phone|desktop]
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const exe = path.join(process.env.LOCALAPPDATA, "ms-playwright/chromium-1234/chrome-win64/chrome.exe");
const base = process.env.URL ?? "http://localhost:4250";
const [out = "shots", route = "/", only] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const name = route === "/" ? "home" : route.replace(/\W+/g, "-").replace(/^-|-$/g, "");
const browser = await chromium.launch({ executablePath: exe });
const errors = [];

async function scrollThrough(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 400) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(800);
}

if (only !== "desktop") {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push("phone: " + e.message));
  page.on("console", (m) => m.type() === "error" && errors.push("phone: " + m.text()));
  await page.goto(base + route, { waitUntil: "load" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(out, `${name}-phone-first.png`) });
  await scrollThrough(page);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log(`phone ${route}: overflowX ${wide}px, page ${total}px = ${(total / 812).toFixed(1)} screens`);
  // one frame per screen (a full-page capture skips content-visibility sections), then a contact sheet
  const frames = [];
  for (let y = 0, i = 0; y < total; y += 812, i++) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(500);
    const f = path.join(out, `${name}-phone-${String(i).padStart(2, "0")}.png`);
    await page.screenshot({ path: f });
    frames.push(f);
  }
  await ctx.close();
  const sharp = (await import("sharp")).default;
  const cols = 6;
  const tw = 250;
  const th = Math.round((812 / 375) * tw);
  const tiles = await Promise.all(frames.map((f) => sharp(f).resize(tw, th).toBuffer()));
  for (let s = 0; s * cols < tiles.length; s++) {
    const part = tiles.slice(s * cols, s * cols + cols);
    await sharp({ create: { width: cols * (tw + 8), height: th, channels: 3, background: "#888" } })
      .composite(part.map((input, i) => ({ input, left: i * (tw + 8), top: 0 })))
      .png()
      .toFile(path.join(out, `${name}-phone-sheet-${s}.png`));
  }
}

if (only !== "phone") {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push("desktop: " + e.message));
  page.on("console", (m) => m.type() === "error" && errors.push("desktop: " + m.text()));
  await page.goto(base + route, { waitUntil: "load" });
  await page.waitForTimeout(2500);
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const stops = [0, 0.08, 0.16, 0.24, 0.32, 0.42, 0.52, 0.62, 0.72, 0.84, 0.95];
  for (const [i, f] of stops.entries()) {
    await page.mouse.wheel(0, 0);
    await page.evaluate((v) => (window.__lenis ? window.__lenis.scrollTo(v, { immediate: true }) : window.scrollTo(0, v)), Math.round(f * h));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(out, `${name}-desk-${String(i).padStart(2, "0")}.png`) });
  }
  console.log(`desktop ${route}: page ${h}px`);
  await ctx.close();
}
console.log(errors.length ? errors.join("\n") : "no console errors");
await browser.close();
