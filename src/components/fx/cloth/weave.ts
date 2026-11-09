/**
 * Painted, tileable cloth and plaster: a height field per weave (yarns that really go over and
 * under), turned into a colour map and a normal map. No image files to download, and every swatch
 * is the true structure of its cloth: linen plain weave with slubs, wool 2/2 twill, denim 3/1 twill
 * (indigo warp over an ecru weft), and a jersey knit's V loops.
 */
export type WeaveKind = "linen" | "wool" | "denim" | "knit" | "plaster";

export type Painted = { color: ImageData; normal: ImageData; size: number };

type Pal = { a: string; b?: string };

const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/** Smooth, tileable 1D noise per thread (yarn thickness along its length). */
function threadNoise(count: number, knots: number, seed: number) {
  const r = rng(seed);
  const t = Array.from({ length: count }, () => Array.from({ length: knots }, () => r()));
  return (thread: number, along: number) => {
    const row = t[((thread % count) + count) % count];
    const x = along * knots;
    const i = Math.floor(x);
    const f = x - i;
    const s = f * f * (3 - 2 * f);
    return row[i % knots] * (1 - s) + row[(i + 1) % knots] * s;
  };
}

/** Tileable value-noise fbm on a grid of `cells` (yields after every row). */
function* fbm(size: number, cells: number, octaves: number, seed: number) {
  const out = new Float32Array(size * size);
  let amp = 1,
    total = 0,
    c = cells;
  const r = rng(seed);
  for (let o = 0; o < octaves; o++) {
    const g = Float32Array.from({ length: c * c }, () => r());
    for (let y = 0; y < size; y++, yield)
      for (let x = 0; x < size; x++) {
        const fx = (x / size) * c,
          fy = (y / size) * c;
        const ix = Math.floor(fx),
          iy = Math.floor(fy);
        let tx = fx - ix,
          ty = fy - iy;
        tx = tx * tx * (3 - 2 * tx);
        ty = ty * ty * (3 - 2 * ty);
        const a = g[(iy % c) * c + (ix % c)],
          b = g[(iy % c) * c + ((ix + 1) % c)],
          d = g[((iy + 1) % c) * c + (ix % c)],
          e = g[((iy + 1) % c) * c + ((ix + 1) % c)];
        out[y * size + x] += amp * ((a * (1 - tx) + b * tx) * (1 - ty) + (d * (1 - tx) + e * tx) * ty);
      }
    total += amp;
    amp *= 0.5;
    c *= 2;
  }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}

const PALETTES: Record<WeaveKind, Pal> = {
  linen: { a: "#ffffff" },
  wool: { a: "#ffffff" },
  denim: { a: "#1f3866", b: "#9e9686" },
  knit: { a: "#ffffff" },
  plaster: { a: "#ffffff" },
};

/**
 * Paint one tile. `threads` is how many yarns cross the tile each way. Colour maps are mostly
 * near-white (the material colour tints them) except denim, whose two yarn colours are the look.
 */
export function paint(kind: WeaveKind, size = 512, threads = 48, seed = 7): Painted {
  const g = painting(kind, size, threads, seed);
  for (;;) {
    const r = g.next();
    if (r.done) return r.value;
  }
}

/** `paint`, a row at a time: each `next()` is a fraction of a millisecond, so it can run in idle slices. */
export function* painting(kind: WeaveKind, size = 512, threads = 48, seed = 7): Generator<void, Painted> {
  const H = new Float32Array(size * size);
  const C = new Float32Array(size * size * 3);
  const pal = PALETTES[kind];
  const A = hex(pal.a).map((v) => v / 255),
    B = hex(pal.b ?? pal.a).map((v) => v / 255);
  const warpN = threadNoise(threads, 6, seed),
    weftN = threadNoise(threads, 6, seed + 1);
  const fine = kind === "plaster" || kind === "wool" ? yield* fbm(size, 16, 4, seed + 2) : null;
  const broad = kind === "plaster" ? yield* fbm(size, 4, 4, seed + 3) : null;
  const r = rng(seed + 9);
  const fuzz = Float32Array.from({ length: size * size }, () => r());
  const prof = (f: number) => Math.sqrt(Math.max(0, 1 - (2 * f - 1) ** 2));

  for (let y = 0; y < size; y++, yield)
    for (let x = 0; x < size; x++) {
      const p = y * size + x;
      const u = (x / size) * threads,
        v = (y / size) * threads;
      const ci = Math.floor(u),
        cj = Math.floor(v);
      const fu = u - ci,
        fv = v - cj;
      let h = 0,
        col = A,
        tone = 1;
      if (kind === "plaster") {
        h = broad![p] * 0.6 + fine![p] * 0.4 + fuzz[p] * 0.05;
        tone = 0.86 + broad![p] * 0.22 + fine![p] * 0.06;
      } else if (kind === "knit") {
        // jersey: columns of V loops, each leg a tilted yarn
        const lean = (fv - 0.5) * 0.36;
        const l = prof(Math.min(1, Math.max(0, (fu - 0.06 - (0.21 + lean)) / 0.42 + 0.5)));
        const rr = prof(Math.min(1, Math.max(0, (fu - 0.06 - (0.73 - lean)) / 0.42 + 0.5)));
        const leg = Math.max(l, rr) * (0.75 + 0.25 * prof(fv));
        h = leg * (0.85 + 0.15 * warpN(ci, v / threads));
        tone = 0.8 + 0.2 * leg + (fuzz[p] - 0.5) * 0.05;
      } else {
        // woven: which yarn is on top in this cell
        const n = kind === "linen" ? 2 : 4;
        const over = kind === "denim" ? 3 : kind === "linen" ? 1 : 2;
        const warpTop = ((ci + cj) % n + n) % n < over;
        const slubW = warpN(ci, v / threads),
          slubF = weftN(cj, u / threads);
        const thickW = kind === "linen" ? 0.55 + 0.7 * slubW ** 2 : 0.85 + 0.2 * slubW;
        const thickF = kind === "linen" ? 0.55 + 0.7 * slubF ** 2 : 0.85 + 0.2 * slubF;
        const wH = prof(Math.min(1, Math.max(0, (fu - 0.5) / Math.min(1, 0.92 * thickW) + 0.5))) * thickW;
        const fH = prof(Math.min(1, Math.max(0, (fv - 0.5) / Math.min(1, 0.92 * thickF) + 0.5))) * thickF;
        // the top yarn arches over the cell, the one beneath dips
        const archW = 0.6 + 0.4 * prof(fv),
          archF = 0.6 + 0.4 * prof(fu);
        const top = warpTop ? wH * archW : fH * archF;
        const under = (warpTop ? fH : wH) * 0.45;
        h = Math.max(top, under);
        const onWarp = warpTop ? wH * archW >= under : !(fH * archF >= under);
        if (kind === "denim") {
          col = onWarp ? A : B;
          // rope-dyed indigo: lighter at the yarn's crown
          tone = onWarp ? 0.7 + 0.42 * h + (slubW - 0.5) * 0.4 : 0.62 + 0.15 * h;
        } else {
          tone = 0.72 + 0.28 * h + (kind === "linen" ? (onWarp ? slubW : slubF) * 0.12 - 0.06 : 0);
          if (fine) tone += (fine[p] - 0.5) * 0.18 + (fuzz[p] - 0.5) * 0.08; // wool's heather
        }
      }
      H[p] = h;
      C[p * 3] = col[0] * tone;
      C[p * 3 + 1] = col[1] * tone;
      C[p * 3 + 2] = col[2] * tone;
    }

  const color = new ImageData(size, size);
  const normal = new ImageData(size, size);
  const k = kind === "plaster" ? 2.2 : kind === "knit" ? 3.2 : 4.5;
  for (let y = 0; y < size; y++, yield)
    for (let x = 0; x < size; x++) {
      const p = y * size + x;
      const l = H[y * size + ((x - 1 + size) % size)],
        rt = H[y * size + ((x + 1) % size)];
      const up = H[((y - 1 + size) % size) * size + x],
        dn = H[((y + 1) % size) * size + x];
      let nx = (l - rt) * k,
        ny = (up - dn) * k, // DataTexture rows run up the v axis
        nz = 1;
      const len = Math.hypot(nx, ny, nz);
      nx /= len;
      ny /= len;
      nz /= len;
      const o = p * 4;
      normal.data[o] = (nx * 0.5 + 0.5) * 255;
      normal.data[o + 1] = (ny * 0.5 + 0.5) * 255;
      normal.data[o + 2] = (nz * 0.5 + 0.5) * 255;
      normal.data[o + 3] = 255;
      color.data[o] = Math.min(255, C[p * 3] * 255);
      color.data[o + 1] = Math.min(255, C[p * 3 + 1] * 255);
      color.data[o + 2] = Math.min(255, C[p * 3 + 2] * 255);
      color.data[o + 3] = 255;
    }
  return { color, normal, size };
}
