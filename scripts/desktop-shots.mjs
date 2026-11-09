// Desktop screenshots of the production build in real Chrome (GPU), scrolling the home page.
//   node scripts/with-server.mjs node scripts/desktop-shots.mjs <outDir> [route]
// Waits for the 3D hero to be live, logs the 3D performance marks and console errors.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const base = process.env.URL ?? "http://localhost:4250";
const [out = "shots", route = "/"] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(base + route, { waitUntil: "load" });
await page.mouse.move(900, 450);
await page.waitForTimeout(5000);
const shot = async (name) => page.screenshot({ path: path.join(out, name + ".png") });
await shot("00-top");
// brush the cloth with the cursor
for (let i = 0; i < 20; i++) await page.mouse.move(700 + i * 15, 400 + Math.sin(i / 3) * 40, { steps: 2 });
await page.waitForTimeout(250);
await shot("01-brush");
const H = await page.evaluate(() => document.documentElement.scrollHeight);
const stops = JSON.parse(process.env.STOPS ?? "null") ?? [0.25, 0.5, 0.75, 1, 1.4, 2.4];
let i = 2;
for (const s of stops) {
  await page.mouse.wheel(0, 0);
  await page.evaluate((y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y)), s * 900);
  await page.waitForTimeout(1600);
  await shot(String(i++).padStart(2, "0") + "-" + s);
}
const marks = await page.evaluate(() => performance.getEntriesByType("mark").filter((m) => m.name.startsWith("3d")).map((m) => `${m.name} ${JSON.stringify(m.detail)} @${Math.round(m.startTime)}`));
console.log(JSON.stringify({ H, marks, errors }, null, 1));
await browser.close();
