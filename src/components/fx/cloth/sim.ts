/**
 * Position-based cloth (Verlet + constraint projection) on a cols × rows grid, in metres.
 * Structural, shear and bending links with their own stiffness, so linen folds crisply, wool
 * hangs heavy, denim swings stiff and a knit stretches. Air is aerodynamic: each point is pushed
 * along its own normal by the wind it meets, so the cloth billows instead of sliding. Pure maths,
 * no three.js: the scene copies `pos` and `nrm` straight into its buffers.
 */
export type Feel = {
  /** 0–1: how hard the threads resist stretching (a knit gives, a denim does not). */
  stretch: number;
  /** 0–1: resistance to folding (linen crisp, denim stiff, knit fluid). */
  bend: number;
  shear: number;
  /** Velocity kept per step (air damping). */
  keep: number;
  /** How much the air moves it: light cloth catches more. */
  drag: number;
  gravity: number;
  /** How far past its length the cloth may hang from its pins (1 = not at all, a knit ~1.2). */
  give: number;
};

export type ClothOpts = {
  cols: number;
  rows: number;
  width: number;
  height: number;
  feel: Feel;
  iterations: number;
  /** Builds the starting shape (pinned row included); default: flat, hanging. */
  init?: (i: number, j: number, u: number, v: number, out: [number, number, number]) => void;
  /** Collision planes: y ≥ floor, z ≥ wall. */
  floor?: number;
  wall?: number;
  /**
   * 0–1: how much the bending links remember the starting shape (pressed pleats) instead of
   * lying flat. Remembered folds push and pull back, so gathered drapery keeps its pleats.
   */
  memory?: number;
};

const SHEAR = 1;
const BEND = 2;

export class Cloth {
  readonly cols: number;
  readonly rows: number;
  readonly n: number;
  readonly pos: Float32Array;
  readonly prev: Float32Array;
  readonly nrm: Float32Array;
  /** Per-vertex cavity shade (0 deep fold … 1 open), for soft occlusion in the folds. */
  readonly shade: Float32Array;
  readonly pin: Float32Array; // x, y, z of the pin target, NaN = free
  feel: Feel;
  iterations: number;
  floor: number;
  wall: number;
  private links: Int32Array;
  private rest: Float32Array;
  private kind: Uint8Array;
  private twoWay: boolean;
  private dx: number;
  private dy: number;
  /** Long-range attachments: for each pin, every point's true distance to it along the cloth. */
  private lra: { k: number; rest: Float32Array }[] = [];
  private acc: Float32Array;
  /** Uniform wind (m/s) plus a function for gusts that vary over the cloth. */
  wind = { x: 0, y: 0, z: 0 };
  gust: ((x: number, y: number, z: number, t: number, out: [number, number, number]) => void) | null = null;
  /** Hand: a soft sphere of moving air at a point (the cursor). */
  hand = { x: 0, y: 0, z: 0, r: 0.5, vx: 0, vy: 0, vz: 0, on: 0 };
  /** One grabbed point, dragged to a target (the swatch). */
  grab = { i: -1, x: 0, y: 0, z: 0 };
  time = 0;

  constructor(o: ClothOpts) {
    const { cols, rows, width, height } = o;
    this.cols = cols;
    this.rows = rows;
    this.n = cols * rows;
    this.feel = o.feel;
    this.iterations = o.iterations;
    this.floor = o.floor ?? -1e9;
    this.wall = o.wall ?? -1e9;
    this.pos = new Float32Array(this.n * 3);
    this.prev = new Float32Array(this.n * 3);
    this.nrm = new Float32Array(this.n * 3);
    this.shade = new Float32Array(this.n).fill(1);
    this.acc = new Float32Array(this.n * 3);
    this.pin = new Float32Array(this.n * 3).fill(NaN);

    const p: [number, number, number] = [0, 0, 0];
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const u = i / (cols - 1),
          v = j / (rows - 1);
        if (o.init) o.init(i, j, u, v, p);
        else p.splice(0, 3, (u - 0.5) * width, -v * height, 0);
        const k = (j * cols + i) * 3;
        this.pos[k] = this.prev[k] = p[0];
        this.pos[k + 1] = this.prev[k + 1] = p[1];
        this.pos[k + 2] = this.prev[k + 2] = p[2];
      }

    // links: structural (0), shear (1), bending over two (2); rest lengths from the flat cloth
    const dx = width / (cols - 1),
      dy = height / (rows - 1),
      dd = Math.hypot(dx, dy);
    this.dx = dx;
    this.dy = dy;
    const L: number[] = [],
      R: number[] = [],
      K: number[] = [];
    const add = (a: number, b: number, r: number, k: number) => (L.push(a, b), R.push(r), K.push(k));
    const id = (i: number, j: number) => j * cols + i;
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        if (i < cols - 1) add(id(i, j), id(i + 1, j), dx, 0);
        if (j < rows - 1) add(id(i, j), id(i, j + 1), dy, 0);
        if (i < cols - 1 && j < rows - 1) {
          add(id(i, j), id(i + 1, j + 1), dd, SHEAR);
          add(id(i + 1, j), id(i, j + 1), dd, SHEAR);
        }
        if (i < cols - 2) add(id(i, j), id(i + 2, j), dx * 2, BEND);
        if (j < rows - 2) add(id(i, j), id(i, j + 2), dy * 2, BEND);
      }
    this.links = Int32Array.from(L);
    this.rest = Float32Array.from(R);
    this.kind = Uint8Array.from(K);
    const mem = o.memory ?? 0;
    this.twoWay = mem > 0;
    if (mem > 0)
      for (let l = 0; l < this.rest.length; l++) {
        if (this.kind[l] !== BEND) continue;
        const a = this.links[l * 2] * 3,
          b = this.links[l * 2 + 1] * 3;
        const d = Math.hypot(this.pos[b] - this.pos[a], this.pos[b + 1] - this.pos[a + 1], this.pos[b + 2] - this.pos[a + 2]);
        this.rest[l] = this.rest[l] * (1 - mem) + d * mem;
      }
    this.normals();
  }

  pinAt(i: number, j: number, x: number, y: number, z: number) {
    const k = (j * this.cols + i) * 3;
    // the flat cloth's distance from this pin to every point: nothing may hang farther than that
    const rest = new Float32Array(this.n);
    for (let q = 0; q < this.n; q++) rest[q] = Math.hypot(((q % this.cols) - i) * this.dx, (Math.floor(q / this.cols) - j) * this.dy);
    this.lra.push({ k, rest });
    this.pin[k] = x;
    this.pin[k + 1] = y;
    this.pin[k + 2] = z;
    this.pos[k] = this.prev[k] = x;
    this.pos[k + 1] = this.prev[k + 1] = y;
    this.pos[k + 2] = this.prev[k + 2] = z;
  }

  /** Move a pin (the rail swaying, a clip lifting) without a jump. */
  movePin(i: number, j: number, x: number, y: number, z: number) {
    const k = (j * this.cols + i) * 3; // its attachment follows: it reads the pin each solve
    this.pin[k] = x;
    this.pin[k + 1] = y;
    this.pin[k + 2] = z;
  }

  /** Throw the whole cloth with a velocity (m/s) for one step — a toss, a shake. */
  impulse(vx: number, vy: number, vz: number, dt: number, from = 0) {
    const { prev, cols } = this;
    for (let q = from * cols; q < this.n; q++) {
      const w = (q / cols - from) / (this.rows - from);
      prev[q * 3] -= vx * dt * w;
      prev[q * 3 + 1] -= vy * dt * w;
      prev[q * 3 + 2] -= vz * dt * w;
    }
  }

  step(dt: number) {
    const { pos, prev, nrm, acc, n, feel, hand } = this;
    this.time += dt;
    const g: [number, number, number] = [0, 0, 0];
    const dt2 = dt * dt;
    const inv = 1 / dt;
    // forces: gravity + air along the normal (relative to the point's own velocity) + the hand
    for (let q = 0; q < n; q++) {
      const k = q * 3;
      const x = pos[k],
        y = pos[k + 1],
        z = pos[k + 2];
      let wx = this.wind.x,
        wy = this.wind.y,
        wz = this.wind.z;
      if (this.gust) {
        this.gust(x, y, z, this.time, g);
        wx += g[0];
        wy += g[1];
        wz += g[2];
      }
      if (hand.on > 0) {
        const hx = x - hand.x,
          hy = y - hand.y,
          hz = z - hand.z;
        const d2 = hx * hx + hy * hy + hz * hz * 0.25;
        const r2 = hand.r * hand.r;
        if (d2 < r2) {
          const f = hand.on * (1 - d2 / r2) ** 2;
          wx += hand.vx * f;
          wy += hand.vy * f;
          wz += hand.vz * f;
        }
      }
      const vx = (x - prev[k]) * inv,
        vy = (y - prev[k + 1]) * inv,
        vz = (z - prev[k + 2]) * inv;
      const nx = nrm[k],
        ny = nrm[k + 1],
        nz = nrm[k + 2];
      const rel = (wx - vx) * nx + (wy - vy) * ny + (wz - vz) * nz;
      const a = feel.drag * rel;
      acc[k] = a * nx;
      acc[k + 1] = a * ny - feel.gravity;
      acc[k + 2] = a * nz;
    }
    for (let q = 0; q < n; q++) {
      const k = q * 3;
      for (let c = 0; c < 3; c++) {
        const p = pos[k + c];
        pos[k + c] = p + (p - prev[k + c]) * feel.keep + acc[k + c] * dt2;
        prev[k + c] = p;
      }
    }
    this.solve();
    this.normals();
  }

  private solve() {
    const { pos, links, rest, kind, pin, n, feel, grab, floor, wall, twoWay } = this;
    const stiff = [feel.stretch, feel.shear, feel.bend];
    const m = links.length >> 1;
    for (let it = 0; it < this.iterations; it++) {
      for (let l = 0; l < m; l++) {
        const a = links[l * 2] * 3,
          b = links[l * 2 + 1] * 3;
        const dx = pos[b] - pos[a],
          dy = pos[b + 1] - pos[a + 1],
          dz = pos[b + 2] - pos[a + 2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
        const kd = kind[l];
        // bending links only push back when the cloth folds (shorter), never pull it flat
        if (kd === BEND && !twoWay && d > rest[l]) continue;
        const s = ((d - rest[l]) / d) * 0.5 * stiff[kd];
        const pa = pin[a] === pin[a] ? 0 : 1,
          pb = pin[b] === pin[b] ? 0 : 1;
        const w = pa + pb;
        if (!w) continue;
        const fa = (s * 2 * pa) / w,
          fb = (s * 2 * pb) / w;
        pos[a] += dx * fa;
        pos[a + 1] += dy * fa;
        pos[a + 2] += dz * fa;
        pos[b] -= dx * fb;
        pos[b + 1] -= dy * fb;
        pos[b + 2] -= dz * fb;
      }
      for (let q = 0; q < n; q++) {
        const k = q * 3;
        if (pin[k] === pin[k]) {
          pos[k] = pin[k];
          pos[k + 1] = pin[k + 1];
          pos[k + 2] = pin[k + 2];
        }
      }
      // long-range attachments keep a tall cloth from stretching like rubber under its own weight
      for (const { k: pk, rest: lr } of this.lra) {
        const px = pin[pk],
          py = pin[pk + 1],
          pz = pin[pk + 2];
        const give = feel.give;
        for (let q = 0; q < n; q++) {
          const k = q * 3;
          const dx = pos[k] - px,
            dy = pos[k + 1] - py,
            dz = pos[k + 2] - pz;
          const max = lr[q] * give;
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 > max * max) {
            const f = max / Math.sqrt(d2);
            pos[k] = px + dx * f;
            pos[k + 1] = py + dy * f;
            pos[k + 2] = pz + dz * f;
          }
        }
      }
      if (grab.i >= 0) {
        const k = grab.i * 3;
        pos[k] = grab.x;
        pos[k + 1] = grab.y;
        pos[k + 2] = grab.z;
      }
    }
    // the floor and the wall: stop, with a little friction
    for (let q = 0; q < n; q++) {
      const k = q * 3;
      if (pos[k + 1] < floor) {
        pos[k + 1] = floor;
        this.prev[k] = pos[k] - (pos[k] - this.prev[k]) * 0.6;
        this.prev[k + 2] = pos[k + 2] - (pos[k + 2] - this.prev[k + 2]) * 0.6;
      }
      if (pos[k + 2] < wall) pos[k + 2] = wall;
    }
  }

  /** Grid normals by central differences, plus a cavity term from the local curvature. */
  normals() {
    const { pos, nrm, shade, cols, rows } = this;
    for (let j = 0; j < rows; j++) {
      const j0 = Math.max(0, j - 1),
        j1 = Math.min(rows - 1, j + 1);
      for (let i = 0; i < cols; i++) {
        const i0 = Math.max(0, i - 1),
          i1 = Math.min(cols - 1, i + 1);
        const a = (j * cols + i0) * 3,
          b = (j * cols + i1) * 3,
          c = (j0 * cols + i) * 3,
          d = (j1 * cols + i) * 3;
        const ux = pos[b] - pos[a],
          uy = pos[b + 1] - pos[a + 1],
          uz = pos[b + 2] - pos[a + 2];
        const vx = pos[d] - pos[c],
          vy = pos[d + 1] - pos[c + 1],
          vz = pos[d + 2] - pos[c + 2];
        // u × v points out of the front face (towards +z for a cloth hanging in the xy plane)
        let nx = vy * uz - vz * uy,
          ny = vz * ux - vx * uz,
          nz = vx * uy - vy * ux;
        const l = Math.hypot(nx, ny, nz) || 1;
        nx /= l;
        ny /= l;
        nz /= l;
        const k = (j * cols + i) * 3;
        nrm[k] = nx;
        nrm[k + 1] = ny;
        nrm[k + 2] = nz;
        // Laplacian · normal: > 0 where the surface curls away (inside a fold seen from this side)
        const lx = (pos[a] + pos[b] + pos[c] + pos[d]) * 0.25 - pos[k],
          ly = (pos[a + 1] + pos[b + 1] + pos[c + 1] + pos[d + 1]) * 0.25 - pos[k + 1],
          lz = (pos[a + 2] + pos[b + 2] + pos[c + 2] + pos[d + 2]) * 0.25 - pos[k + 2];
        const span = Math.hypot(ux, uy, uz) + 1e-5;
        const curl = (lx * nx + ly * ny + lz * nz) / span;
        shade[j * cols + i] = 1 - Math.min(0.55, Math.max(0, curl * 3.2));
      }
    }
  }

  /** Nearest particle to a point (for grabbing). */
  nearest(x: number, y: number, z: number) {
    let best = -1,
      bd = Infinity;
    for (let q = 0; q < this.n; q++) {
      const k = q * 3;
      const d = (this.pos[k] - x) ** 2 + (this.pos[k + 1] - y) ** 2 + (this.pos[k + 2] - z) ** 2;
      if (d < bd) {
        bd = d;
        best = q;
      }
    }
    return { i: best, d: Math.sqrt(bd) };
  }
}
