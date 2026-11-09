/**
 * Renders the phone + fallback stills in public/images/3d from the live three.js cloth scene
 * (src/components/fx/cloth), so phones see exactly what desktops see, without the 3D.
 * Re-run after changing the scene, a camera, a cloth or its feel.
 *
 *   npm i --no-save esbuild playwright   # tools only, not site dependencies
 *   node _src/stills/render.mjs [filter] [--preview DIR]   # e.g. "hero", "swatch"
 *
 * Uses the installed Google Chrome (real GPU) via Playwright's "chrome" channel. The stills are
 * taken after the same settle the live scene does before it fades in, so the swap is seamless.
 */
import { build } from "esbuild";
import { chromium } from "playwright";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const here = path.dirname(url.fileURLToPath(import.meta.url));
const OUT = path.join(here, "../../public/images/3d");
const tmp = fs.mkdtempSync(path.join(fs.realpathSync(process.env.TEMP || "/tmp"), "cloth3d-"));
const args = process.argv.slice(2);
const pi = args.indexOf("--preview");
const preview = pi >= 0 ? args.splice(pi, 2)[1] : null;
const filter = args[0];

const jobs = [
  // desktop still under the live canvas (and the no-3D fallback): the canvas's own framing
  { name: "hero-cloth", q: "mode=hero", w: 2400, h: 1350, framing: "wide", sizes: [2400, 1600, 1100], avif: 50, webp: 68 },
  // phones: a 4:5 portrait of the same studio, cloth centred
  { name: "hero-cloth-phone", q: "mode=hero", w: 1000, h: 1250, framing: "portrait", sizes: [1000, 750], avif: 52, webp: 70 },
  ...["linen", "wool", "denim", "knit"].map((f) => ({ name: `swatch-${f}`, q: `mode=swatch&fabric=${f}`, w: 1200, h: 1000, framing: "wide", sizes: [1200, 800], avif: 52, webp: 72 })),
];

await build({ entryPoints: [path.join(here, "entry.mjs")], bundle: true, format: "iife", outfile: path.join(tmp, "scene.js"), logLevel: "warning", alias: { "@": path.join(here, "../../src") } });
fs.writeFileSync(path.join(tmp, "index.html"), '<!doctype html><body style="margin:0"><canvas></canvas><script src="scene.js"></script></body>');

const browser = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
try {
  for (const j of jobs) {
    if (filter && !j.name.includes(filter)) continue;
    const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
    page.on("console", (m) => m.type() === "error" && console.error("page:", m.text()));
    await page.goto(url.pathToFileURL(path.join(tmp, "index.html")).href + "?" + j.q);
    await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 90000 });
    const err = await page.evaluate(() => window.__error);
    if (err) throw new Error(err);
    const data = await page.evaluate(([w, h, f]) => window.__scene.snapshot(w, h, f), [j.w, j.h, j.framing]);
    await page.close();
    const png = Buffer.from(data.split(",")[1], "base64");
    if (preview) {
      fs.mkdirSync(preview, { recursive: true });
      await sharp(png).resize({ width: Math.min(j.w, 2400) }).png().toFile(path.join(preview, j.name + ".png"));
      console.log("preview", j.name);
      continue;
    }
    for (const w of j.sizes) {
      const file = path.join(OUT, `${j.name}-${w}`);
      fs.mkdirSync(OUT, { recursive: true });
      const img = sharp(png).resize({ width: w });
      await img.clone().avif({ quality: j.avif, effort: 6 }).toFile(file + ".avif");
      await img.clone().webp({ quality: j.webp, effort: 6 }).toFile(file + ".webp");
      console.log(path.relative(OUT, file), `${(fs.statSync(file + ".avif").size / 1024).toFixed(1)} KB avif, ${(fs.statSync(file + ".webp").size / 1024).toFixed(1)} KB webp`);
    }
  }
} finally {
  await browser.close();
  fs.rmSync(tmp, { recursive: true, force: true });
}
