// Does the desktop 3D start without a hitch, and does a weak computer end on the stills?
//   npm run build && node scripts/with-server.mjs node scripts/3d-smooth.mjs [normal|cpu4|cpu4-late]
//   normal     this PC as it is
//   cpu4       4x CPU slowdown from the first byte (a weak laptop)
//   cpu4-late  4x slowdown switched on once the 3D gate has passed, so the scene's own two-second
//              frame check is what has to catch it
// Real Chrome, headless, on the real GPU. Logs when each canvas faded in, the 3D marks, frame gaps
// at the top, while scrolling and at the swatch, and which scenes are still live at the end.
// SHOT=<path prefix> also saves a screenshot at the swatch.
import { chromium } from "playwright";

const base = process.env.URL ?? "http://localhost:4250";
const modes = process.argv.slice(2).length ? process.argv.slice(2) : ["normal", "cpu4", "cpu4-late"];

const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });

for (const mode of modes) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    const w = window;
    w.__gaps = [];
    w.__fades = [];
    let prev = 0;
    const tick = (t) => {
      if (prev) w.__gaps.push([Math.round(prev), +(t - prev).toFixed(1)]);
      prev = t;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    const seen = new Map();
    new MutationObserver(() => {
      document.querySelectorAll("canvas").forEach((c, i) => {
        const on = c.className.includes("opacity-100");
        if (seen.get(c) !== on) {
          seen.set(c, on);
          w.__fades.push({ i, on, t: Math.round(performance.now()) });
        }
      });
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ["class"], childList: true });
  });
  const cdp = await ctx.newCDPSession(page);
  if (mode === "cpu4") await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.goto(base + "/", { waitUntil: "load" });
  const gpu = await page.evaluate(() => {
    const gl = document.createElement("canvas").getContext("webgl2");
    const i = gl?.getExtension("WEBGL_debug_renderer_info");
    return gl ? String(gl.getParameter(i ? i.UNMASKED_RENDERER_WEBGL : gl.RENDERER)) : "no webgl";
  });
  await page.mouse.move(900, 450);
  if (mode === "cpu4-late") {
    await page.waitForFunction(() => performance.getEntriesByName("3d:gate").length > 0, null, { timeout: 15000 }).catch(() => {});
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  }
  // untouched at the top: the hero builds, fades in, is timed; the swatch warms in idle time
  await page.waitForTimeout(mode === "normal" ? 8000 : 14000);
  const topEnd = await page.evaluate(() => performance.now());
  // a real wheel scroll down to the swatch (Lenis drives it on desktop)
  const target = await page.evaluate(() => {
    const cs = [...document.querySelectorAll("canvas")];
    const c = cs[cs.length - 1];
    return c ? c.getBoundingClientRect().top + window.scrollY - 150 : 0;
  });
  for (let y = 0; y < target; y += 120) {
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(40);
  }
  const scrollEnd = await page.evaluate(() => performance.now());
  await page.mouse.move(700, 500);
  await page.waitForTimeout(5000);
  if (process.env.SHOT) await page.screenshot({ path: `${process.env.SHOT}-${mode}.png` });
  const r = await page.evaluate(
    ([topEnd, scrollEnd]) => {
      const stat = (a, b) => {
        const g = window.__gaps.filter(([t]) => t >= a && t < b).map(([, d]) => d);
        if (!g.length) return null;
        const s = [...g].sort((x, y) => x - y);
        const span = g.reduce((x, y) => x + y, 0);
        return { frames: g.length, fps: Math.round((g.length * 1000) / span), p95: s[Math.floor(s.length * 0.95)], max: s[s.length - 1], over50: g.filter((d) => d > 50).length };
      };
      const nav = performance.getEntriesByType("navigation")[0];
      return {
        load: Math.round(nav.loadEventEnd),
        marks: performance.getEntriesByType("mark").filter((m) => m.name.startsWith("3d")).map((m) => ({ name: m.name, at: Math.round(m.startTime), ...m.detail })),
        fades: window.__fades,
        off: sessionStorage.getItem("ordova-3d-off"),
        liveAtEnd: [...document.querySelectorAll("canvas")].map((c) => c.className.includes("opacity-100")),
        top: stat(0, topEnd),
        scroll: stat(topEnd, scrollEnd),
        swatch: stat(scrollEnd, performance.now()),
        hitches: window.__gaps.filter(([, d]) => d > 34),
        build: performance.getEntriesByType("measure").filter((m) => m.name.startsWith("cs:")).map((m) => [m.name.slice(3), Math.round(m.startTime), Math.round(m.duration)]),
        threeLoaded: performance.getEntriesByType("resource").some((e) => /ClothScene|three/i.test(e.name)) || performance.getEntriesByType("mark").some((m) => m.name.endsWith(":ready")),
      };
    },
    [topEnd, scrollEnd],
  );
  console.log(JSON.stringify({ mode, gpu, ...r, errors }, null, 1));
  await ctx.close();
}
await browser.close();
