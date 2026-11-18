// Frame times on the /v2 hero (no 3D): the intro's first 4 s, then a slow scroll through the scene.
//   node scripts/with-server.mjs node scripts/v2-fps.mjs [route] [cpuRate]
import { chromium } from "playwright";

const base = process.env.URL ?? "http://localhost:4250";
const [route = "/v2", rate = "4"] = process.argv.slice(2);
const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const cdp = await page.context().newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: +rate });
await page.addInitScript(() => {
  window.__f = [];
  let last = 0;
  const tick = (t) => {
    if (last) window.__f.push(t - last);
    last = t;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
await page.goto(base + route, { waitUntil: "load" });
await page.waitForTimeout(4000);
const stat = (f) => {
  const s = [...f].sort((a, b) => a - b);
  const avg = f.reduce((a, b) => a + b, 0) / f.length;
  return { frames: f.length, fps: +(1000 / avg).toFixed(1), p95: +s[Math.floor(s.length * 0.95)].toFixed(1), worst: +s.at(-1).toFixed(1), over50: f.filter((x) => x > 50).length };
};
const intro = await page.evaluate(() => window.__f.splice(0));
await page.mouse.move(1000, 450);
for (let i = 0; i < 60; i++) {
  await page.mouse.wheel(0, 30);
  await page.waitForTimeout(40);
}
await page.waitForTimeout(800);
const scroll = await page.evaluate(() => window.__f.splice(0));
console.log(JSON.stringify({ route, cpu: rate, intro: stat(intro.slice(10)), scroll: stat(scroll) }));
await browser.close();
