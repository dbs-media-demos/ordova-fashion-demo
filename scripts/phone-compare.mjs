// The phone version of two routes should match (/v2 is / on a phone): page height, text and first screens.
//   node scripts/with-server.mjs node scripts/phone-compare.mjs <outDir> / /v2
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const base = process.env.URL ?? "http://localhost:4250";
const [out = "shots", ...routes] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
for (const w of [320, 375, 430]) {
  const res = [];
  for (const route of routes) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto(base + route, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    const info = await page.evaluate(() => ({ h: document.documentElement.scrollHeight, over: document.documentElement.scrollWidth - innerWidth, text: document.querySelector("main").innerText.length }));
    if (w === 375) for (const [i, y] of [0, 700, 1400].entries()) {
      await page.evaluate((y) => window.scrollTo(0, y), y);
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(out, `${route.replace(/\W/g, "") || "home"}-${i}.png`) });
    }
    res.push({ route, ...info, errors });
    await ctx.close();
  }
  console.log(w, JSON.stringify(res));
}
await browser.close();
