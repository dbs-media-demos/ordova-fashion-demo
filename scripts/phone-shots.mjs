// Phone screenshots of the production build: one per screen, top to bottom, at a given width.
//   node scripts/with-server.mjs node scripts/phone-shots.mjs <outDir> [route] [width] [screens]
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const exe = path.join(process.env.LOCALAPPDATA, "ms-playwright/chromium-1234/chrome-win64/chrome.exe");
const base = process.env.URL ?? "http://localhost:4250";
const [out = "shots", route = "/", width = "375", screens = "14"] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: exe });
const ctx = await browser.newContext({ viewport: { width: +width, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.goto(base + route, { waitUntil: "load" });
await page.waitForTimeout(1500);
const H = await page.evaluate(() => document.documentElement.scrollHeight);
for (let i = 0; i < +screens; i++) {
  const y = i * 700;
  if (y > H) break;
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(out, `p${String(i).padStart(2, "0")}.png`) });
}
const wide = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
console.log(JSON.stringify({ H, screens: Math.ceil(H / 812), overflowX: wide, errors }));
await browser.close();
