// The /v2 homepage on desktop: zero three.js, the hero moving in its first seconds, the scroll scene.
//   node scripts/with-server.mjs node scripts/v2-check.mjs <outDir> [route] [width] [height]
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const base = process.env.URL ?? "http://localhost:4250";
const [out = "shots-v2", route = "/v2", W = "1440", H = "900"] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: +W, height: +H }, reducedMotion: process.env.REDUCED ? "reduce" : "no-preference" });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(e.message));
let three = 0;
const threeFiles = [];
const js = [];
let webgl = false;
page.on("response", async (r) => {
  const url = r.url();
  if (!/\.js(\?|$)/.test(url)) return;
  try {
    const text = await r.text();
    js.push(url.split("/").pop());
    if (/WebGLRenderer|WebGLShadowMap|PMREMGenerator|three\.module/.test(text)) {
      three += text.length;
      threeFiles.push(url);
    }
  } catch {}
});
await page.addInitScript(() => {
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (t, ...a) {
    if (/webgl/i.test(t)) window.__webgl = true;
    return orig.call(this, t, ...a);
  };
});
const shot = (name) => page.screenshot({ path: path.join(out, name + ".png") });
const t0 = Date.now();
await page.goto(base + route, { waitUntil: "commit" });
for (const at of [400, 1300, 2400, 4600]) {
  await page.waitForTimeout(Math.max(0, at - (Date.now() - t0)));
  await shot(`t${String(at).padStart(4, "0")}`);
}
await page.mouse.move(1100, 420, { steps: 8 });
await page.waitForTimeout(900);
await shot("hover");
const stops = JSON.parse(process.env.STOPS ?? "null") ?? [0.25, 0.55, 0.85, 1.3, 1.9, 2.6];
for (const s of stops) {
  await page.evaluate((y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y)), s * +H);
  await page.waitForTimeout(1300);
  await shot(`scroll-${s}`);
}
await page.waitForTimeout(2500);
webgl = await page.evaluate(() => !!window.__webgl);
const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
console.log(JSON.stringify({ route, three, threeFiles, webgl, overflowX, jsFiles: js.length, errors }, null, 1));
await browser.close();
