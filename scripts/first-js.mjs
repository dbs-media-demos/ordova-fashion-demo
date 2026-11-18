// First-load JS of a route: the <script src> in its server HTML, gzip-compressed, in KB.
//   node scripts/with-server.mjs node scripts/first-js.mjs / /v2
import zlib from "node:zlib";
const base = process.env.URL ?? "http://localhost:4250";
for (const route of process.argv.slice(2)) {
  const html = await (await fetch(base + route)).text();
  const srcs = [...new Set([...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]))];
  let gz = 0;
  const rows = [];
  for (const s of srcs) {
    const buf = Buffer.from(await (await fetch(new URL(s, base))).arrayBuffer());
    const g = zlib.gzipSync(buf).length;
    gz += g;
    rows.push(`${s.split("/").pop()} ${(g / 1024).toFixed(1)}`);
  }
  console.log(route, `${srcs.length} scripts, ${(gz / 1024).toFixed(1)} KB gzip`, process.env.VERBOSE ? rows : "");
}
