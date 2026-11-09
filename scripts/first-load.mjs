// First-load JS of a route from the production build: every <script src> in its HTML, gzip-compressed.
// nomodule polyfills are left out (every modern browser skips them).
//   npm run build && node scripts/first-load.mjs [route]   (route = file under .next/server/app, e.g. index, shop, products/marfa-shirt-dress)
import fs from "node:fs";
import zlib from "node:zlib";

const route = process.argv[2] ?? "index";
const html = fs.readFileSync(`.next/server/app/${route}.html`, "utf8");
const tags = [...html.matchAll(/<script\b[^>]*>/g)].map((m) => m[0]);
const srcs = [
  ...new Set(
    tags
      .filter((t) => !/\bnomodule\b/i.test(t))
      .map((t) => t.match(/src="(\/_next\/static\/chunks\/[^"]+\.js)"/)?.[1])
      .filter(Boolean),
  ),
];
let total = 0;
for (const s of srcs) {
  const buf = fs.readFileSync(".next" + s.replace("/_next", ""));
  const gz = zlib.gzipSync(buf, { level: 9 }).length;
  total += gz;
  const three = /WebGLRenderer|PMREMGenerator/.test(buf) ? " THREE!" : "";
  const gsap = /ScrollTrigger/.test(buf) && /_gsap|GreenSock/.test(buf) ? " gsap" : "";
  console.log(`${(gz / 1024).toFixed(1).padStart(6)} KB  ${s}${three}${gsap}`);
}
console.log(`${(total / 1024).toFixed(1).padStart(6)} KB  total (${srcs.length} files)`);
