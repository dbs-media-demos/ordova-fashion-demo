// Desktop: the Feel-the-cloth swatch — pick denim, then knit while pulling it. Real Chrome (GPU).
//   node scripts/with-server.mjs node scripts/swatch-shots.mjs <outDir>
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const base = process.env.URL ?? "http://localhost:4250";
const out = process.argv[2] ?? "shots";
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.goto(base + "/", { waitUntil: "load" });
await page.waitForTimeout(3500);
const y = await page.evaluate(() => {
  const el = document.querySelector('[role="radiogroup"]').parentElement.parentElement;
  return el.getBoundingClientRect().top + scrollY - 40;
});
await page.evaluate((y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y)), y);
await page.waitForTimeout(4500);
await page.screenshot({ path: path.join(out, "sw-1-linen.png") });
await page.getByRole("radio", { name: /Denim/ }).click();
await page.waitForTimeout(1800);
await page.screenshot({ path: path.join(out, "sw-2-denim.png") });
await page.getByRole("radio", { name: /Knit/ }).click();
await page.waitForTimeout(1500);
const box = await page.locator("canvas").nth(1).boundingBox();
const cx = box.x + box.width * 0.5,
  cy = box.y + box.height * 0.62;
await page.mouse.move(cx, cy);
await page.mouse.down();
await page.mouse.move(cx + 140, cy + 60, { steps: 12 });
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(out, "sw-3-knit-pull.png") });
await page.mouse.up();
const marks = await page.evaluate(() => performance.getEntriesByType("mark").filter((m) => m.name.startsWith("3d")).map((m) => `${m.name} ${JSON.stringify(m.detail)}`));
console.log(JSON.stringify({ marks, errors }, null, 1));
await browser.close();
