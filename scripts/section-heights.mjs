// Measures the [data-cv] sections at phone widths, to set the heights content-visibility holds for them
// (src/lib/cv.ts). Prints each height and a fitted a + b·vw for 360–430 px.
//   npm run build && node scripts/with-server.mjs node scripts/section-heights.mjs [route]
import { chromium } from "playwright";
import path from "node:path";

const exe = path.join(process.env.LOCALAPPDATA, "ms-playwright/chromium-1234/chrome-win64/chrome.exe");
const base = process.env.URL ?? "http://localhost:4250";
const route = process.argv[2] ?? "/";
const widths = [320, 360, 375, 390, 412, 430];
const browser = await chromium.launch({ executablePath: exe });
const rows = {};
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(base + route, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  // never rendered yet (all but the first screen): their height is the held one
  const held = await page.evaluate(() => [...document.querySelectorAll("[data-cv]")].map((e) => e.getBoundingClientRect().height));
  await page.addStyleTag({ content: "[data-cv]{content-visibility:visible!important}" });
  await page.waitForTimeout(400);
  const hs = await page.evaluate(() => [...document.querySelectorAll("[data-cv]")].map((e) => [e.getAttribute("data-cv"), e.getBoundingClientRect().height]));
  hs.forEach(([k, h], i) => {
    (rows[k] ??= {})[w] = h;
    ((rows[k].held ??= {})[w] = held[i]);
  });
  await ctx.close();
}
await browser.close();
for (const [k, r] of Object.entries(rows)) {
  // least squares over 360–430: h = a + b·w
  const xs = widths.filter((w) => w >= 360);
  const n = xs.length;
  const mx = xs.reduce((s, x) => s + x, 0) / n;
  const my = xs.reduce((s, x) => s + r[x], 0) / n;
  const b = xs.reduce((s, x) => s + (x - mx) * (r[x] - my), 0) / xs.reduce((s, x) => s + (x - mx) ** 2, 0);
  const a = my - b * mx;
  const worst = Math.max(...xs.map((x) => Math.abs(a + b * x - r[x]) / r[x]));
  const fit = `calc(${a.toFixed(0)}px + ${(b * 100).toFixed(1)}vw)`;
  console.log(k.padEnd(10), widths.map((w) => `${w}:${Math.round(r[w])}`).join(" "), `→ ${fit} (worst ${(worst * 100).toFixed(1)}%)`);
  console.log("  held".padEnd(10), widths.map((w) => `${w}:${(((r.held[w] - r[w]) / r[w]) * 100).toFixed(1)}%`).join(" "));
}
