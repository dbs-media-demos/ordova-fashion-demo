import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Cloth, type Feel } from "./sim";
import { paint, painting, type Painted, type WeaveKind } from "./weave";
import type { FabricId } from "@/content/fabrics";

/**
 * Ordova's cloth, in real time. Desktop only: imported through lib/three-gate and nowhere else.
 *
 *  - "hero": two lengths of FW26 cloth (Caliche clay linen in front, moss wool behind) hang from
 *    brass rails in a plaster studio under one soft spotlight. A breeze keeps them breathing, the
 *    cursor is a hand of moving air, and the scroll pushes the camera in while a draught lifts them.
 *  - "swatch": one swatch on two clips. Pick linen, wool, denim or knit and it re-hangs with that
 *    cloth's own weight, stiffness and stretch; grab it and pull.
 *
 * Builds in idle-time steps, refuses software rendering, compiles every shader and draws a hidden
 * frame before the caller fades the canvas in. Its first two seconds on screen are timed; a slow
 * computer gets `onSlow` and the loop stops (the still stays).
 */
export type Mode = "hero" | "swatch";
export type Framing = "wide" | "portrait";

export type ClothScene = {
  setProgress: (p: number) => void;
  /** Pointer over the canvas in -1…1 (x right, y up); `inside` false when it leaves. */
  setPointer: (nx: number, ny: number, inside: boolean) => void;
  /** Swatch: take hold of the nearest point of the cloth under the pointer, pull it, let go. */
  grab: (nx: number, ny: number) => boolean;
  drag: (nx: number, ny: number) => void;
  release: () => void;
  setFabric: (id: FabricId) => void;
  setVisible: (v: boolean) => void;
  resize: () => void;
  /** Start the "alive" moment: a draught through the studio (hero) or a toss (swatch). */
  wake: () => void;
  warm: (seconds: number) => void;
  snapshot: (w: number, h: number, framing?: Framing) => string;
  probed: Promise<boolean>;
  dispose: () => void;
};

export type Opts = {
  mode: Mode;
  fabric?: FabricId;
  /** Wait for the browser's idle time; the deadline (if any) says how much of it there is. */
  pause?: () => Promise<IdleDeadline | void | undefined>;
  onSlow?: (fps: number, worst: number, work: number) => void;
};

export class NoGpuError extends Error {}
/** The CPU can't fit a simulation step and a draw into a 60 Hz frame: found while settling, before anyone sees a frame. */
export class SlowCpuError extends Error {}

const SOFTWARE_GL = /swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic/i;
const PROBE_MS = 2000;
const PROBE_FPS = 45;
const PROBE_WORST = 100;
const PROBE_WORK = 9;
/** A settle step slower than this (ms, after warm-up) can't hold 60 fps: the build stops and the still stays. */
const SLOW_STEP = 12;
const STEP = 1 / 60;
/** The longest the build holds the main thread at once while the still is up (ms). */
const SLICE_MS = 8;
/** Simulated seconds before the first frame, so the folds have settled (and match the still). */
const SETTLE = 4;

const damp = (a: number, b: number, k: number, dt: number) => a + (b - a) * (1 - Math.exp(-k * dt));
const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

/** How each cloth moves. Gravity is the same for all; drag is air over areal weight. */
const FEEL: Record<FabricId, Feel & { iterations: number }> = {
  linen: { stretch: 1, shear: 0.9, bend: 0.6, keep: 0.993, drag: 1.5, gravity: 9.8, give: 1.01, iterations: 14 },
  wool: { stretch: 1, shear: 0.75, bend: 0.22, keep: 0.986, drag: 0.85, gravity: 9.8, give: 1.02, iterations: 14 },
  denim: { stretch: 1, shear: 1, bend: 1, keep: 0.99, drag: 0.5, gravity: 9.8, give: 1, iterations: 22 },
  knit: { stretch: 0.55, shear: 0.6, bend: 0.2, keep: 0.982, drag: 0.8, gravity: 9.8, give: 1.16, iterations: 14 },
};

/** How each cloth looks. Threads are drawn a little larger than life so the weave reads. */
const LOOK: Record<FabricId, { weave: WeaveKind; color: string; rough: number; sheen: number; sheenRough: number; sheenColor: string; repeat: number; normal: number }> = {
  linen: { weave: "linen", color: "#d6c6aa", rough: 0.9, sheen: 0.55, sheenRough: 0.55, sheenColor: "#fff1dc", repeat: 10, normal: 0.8 },
  wool: { weave: "wool", color: "#62654a", rough: 0.95, sheen: 1, sheenRough: 0.45, sheenColor: "#c9c6a4", repeat: 11, normal: 0.6 },
  denim: { weave: "denim", color: "#7684a8", rough: 0.85, sheen: 0.25, sheenRough: 0.7, sheenColor: "#6a7ca6", repeat: 13, normal: 0.9 },
  knit: { weave: "knit", color: "#c3a88c", rough: 0.92, sheen: 1, sheenRough: 0.35, sheenColor: "#f6dcc4", repeat: 15, normal: 1.4 },
};

function gpuRenderer(canvas: HTMLCanvasElement) {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance", failIfMajorPerformanceCaveat: true });
  } catch {
    throw new NoGpuError("no hardware WebGL");
  }
  const gl = renderer.getContext();
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const name = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? "");
  if (SOFTWARE_GL.test(name)) {
    renderer.dispose();
    renderer.forceContextLoss();
    throw new NoGpuError(`software rendering: ${name}`);
  }
  return renderer;
}

/**
 * The soft room the brass and the sheen reflect, as an environment map. PMREMGenerator compiles
 * its shaders on the main thread the moment it draws (~300 ms in one block), so a dry run first
 * hands every draw to compileAsync, the GPU links them in parallel, and the real run finds them
 * all ready. Same programs, same map.
 */
async function roomEnvironment(renderer: THREE.WebGLRenderer) {
  const pm = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const render = renderer.render;
  const linking: Promise<unknown>[] = [];
  renderer.render = (s, c) => void linking.push(renderer.compileAsync(s, c));
  try {
    pm.fromScene(room, 0.04).dispose();
  } finally {
    renderer.render = render;
  }
  await Promise.all(linking);
  const env = pm.fromScene(room, 0.04).texture;
  room.dispose();
  pm.dispose();
  return env;
}

/** Painted maps are shared by every scene on the page (hero and swatch both use linen and wool). */
const painted = new Map<string, { color: THREE.DataTexture; normal: THREE.DataTexture; users: number }>();
const tile = (kind: WeaveKind) => [kind, kind === "plaster" ? 512 : 256, kind === "plaster" ? 1 : 24, kind.length * 7 + 3] as const;
/** Tiles painted ahead in idle time, waiting for `maps` to turn them into textures. */
const prepainted = new Map<WeaveKind, Painted>();
function maps(kind: WeaveKind, aniso: number) {
  let m = painted.get(kind);
  if (!m) {
    const p = prepainted.get(kind) ?? paint(...tile(kind));
    prepainted.delete(kind);
    const tex = (d: ImageData, srgb: boolean) => {
      const t = new THREE.DataTexture(d.data, p.size, p.size);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.generateMipmaps = true;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.anisotropy = aniso;
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      t.needsUpdate = true;
      return t;
    };
    m = { color: tex(p.color, true), normal: tex(p.normal, false), users: 0 };
    painted.set(kind, m);
  }
  m.users++;
  return m;
}
function releaseMaps(kind: WeaveKind) {
  const m = painted.get(kind);
  if (m && --m.users <= 0) {
    m.color.dispose();
    m.normal.dispose();
    painted.delete(kind);
  }
}

function clothMaterial(id: FabricId, aniso: number, scale = 1) {
  const L = { ...LOOK[id] };
  L.repeat *= scale;
  const m = maps(L.weave, aniso);
  const color = m.color.clone();
  const normal = m.normal.clone();
  color.repeat.set(L.repeat, L.repeat);
  normal.repeat.set(L.repeat, L.repeat);
  const mat = new THREE.MeshPhysicalMaterial({
    color: L.color,
    map: color,
    normalMap: normal,
    normalScale: new THREE.Vector2(L.normal, L.normal),
    roughness: L.rough,
    sheen: L.sheen,
    sheenRoughness: L.sheenRough,
    sheenColor: new THREE.Color(L.sheenColor),
    vertexColors: true,
    side: THREE.DoubleSide,
    shadowSide: THREE.DoubleSide,
  });
  mat.userData.weave = L.weave;
  return mat;
}

/** A cloth's mesh: the simulation's own arrays are the vertex buffers. */
function clothMesh(c: Cloth, mat: THREE.Material, w: number, h: number) {
  const g = new THREE.BufferGeometry();
  const pos = new THREE.BufferAttribute(c.pos, 3);
  const nrm = new THREE.BufferAttribute(c.nrm, 3);
  pos.setUsage(THREE.DynamicDrawUsage);
  nrm.setUsage(THREE.DynamicDrawUsage);
  g.setAttribute("position", pos);
  g.setAttribute("normal", nrm);
  const col = new THREE.BufferAttribute(new Float32Array(c.n * 3).fill(1), 3);
  col.setUsage(THREE.DynamicDrawUsage);
  g.setAttribute("color", col);
  const uv = new Float32Array(c.n * 2);
  for (let j = 0; j < c.rows; j++)
    for (let i = 0; i < c.cols; i++) {
      const q = j * c.cols + i;
      uv[q * 2] = (i / (c.cols - 1)) * w;
      uv[q * 2 + 1] = (1 - j / (c.rows - 1)) * h;
    }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  const idx: number[] = [];
  for (let j = 0; j < c.rows - 1; j++)
    for (let i = 0; i < c.cols - 1; i++) {
      const a = j * c.cols + i,
        b = a + 1,
        d = a + c.cols,
        e = d + 1;
      idx.push(a, d, b, b, d, e);
    }
  g.setIndex(idx);
  const mesh = new THREE.Mesh(g, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  const sync = () => {
    pos.needsUpdate = true;
    nrm.needsUpdate = true;
    const a = col.array as Float32Array;
    for (let q = 0; q < c.n; q++) {
      const s = c.shade[q];
      a[q * 3] = a[q * 3 + 1] = a[q * 3 + 2] = s;
    }
    col.needsUpdate = true;
  };
  sync();
  return { mesh, sync };
}

/**
 * A length of cloth held by a few clips that sit closer together than the cloth is wide, so the
 * top falls into soft cowls and the folds run diagonally from each clip, the way a drape is shown
 * in an atelier window. `clips` are the clip positions along the top edge (0–1) and `at` where each
 * clip hangs (x, metres). It starts flat and settles under gravity, so every fold is real.
 */
function clipped(o: { cols: number; rows: number; width: number; height: number; x: number; y: number; z: number; clips: number[]; at: number[]; feel: FabricId; floor?: number; wall?: number; seed: number }) {
  const f = FEEL[o.feel];
  const topX = (u: number) => {
    for (let k = 0; k < o.clips.length - 1; k++)
      if (u <= o.clips[k + 1]) return o.at[k] + ((u - o.clips[k]) / (o.clips[k + 1] - o.clips[k])) * (o.at[k + 1] - o.at[k]);
    return o.at[o.at.length - 1];
  };
  const c = new Cloth({
    cols: o.cols,
    rows: o.rows,
    width: o.width,
    height: o.height,
    feel: { ...f },
    iterations: f.iterations,
    floor: o.floor,
    wall: o.wall,
    init: (i, j, u, v, out) => {
      // the slack between clips bows forward, so each cowl falls towards the light
      const bow = Math.sin(Math.PI * u * (o.clips.length - 1)) ** 2;
      out[0] = o.x + topX(u) * (1 - Math.min(1, v * 2)) + (u - 0.5) * o.width * 0.8 * Math.min(1, v * 2);
      out[1] = o.y - v * o.height * 0.9;
      // seeds for the long folds the spare width falls into below the clips
      const seed = Math.sin(u * Math.PI * (3 + o.seed) + o.seed) * 0.05 * Math.min(1, v * 2.5);
      out[2] = o.z + bow * 0.12 * (1 - v) + seed + Math.sin(o.seed + j * 0.37 + i * 0.11) * 0.003;
    },
  });
  for (let k = 0; k < o.clips.length; k++) c.pinAt(Math.round(o.clips[k] * (o.cols - 1)), 0, o.x + o.at[k], o.y, o.z);
  return c;
}

export async function createClothScene(canvas: HTMLCanvasElement, opts: Opts): Promise<ClothScene> {
  const { mode } = opts;
  const pause = opts.pause ?? (() => Promise.resolve());
  const t0 = performance.now();
  /** Run a job's steps in the browser's idle time: as many as fit, never more than SLICE_MS at once. */
  const idleRun = async <T>(g: Generator<unknown, T>) => {
    let until = 0;
    let cost = 0;
    for (;;) {
      if (performance.now() + cost > until) {
        const d = await pause();
        until = performance.now() + Math.min(SLICE_MS, d ? d.timeRemaining() - 1 : SLICE_MS);
      }
      const a = performance.now();
      const r = g.next();
      cost = performance.now() - a;
      if (r.done) return r.value;
    }
  };
  const renderer = gpuRenderer(canvas);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = mode === "hero" ? 1.05 : 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  const maxDpr = 1.5;
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const scene = new THREE.Scene();
  const bg = new THREE.Color(mode === "hero" ? "#2a241f" : "#151513");
  scene.background = bg;
  const camera = new THREE.PerspectiveCamera(mode === "hero" ? 27 : 28, 2, 0.1, 60);

  // a soft room for the brass and the sheen to reflect, very low
  const env = await roomEnvironment(renderer);
  scene.environment = env;
  // the weaves this scene needs, painted a row at a time (the textures are made from them below)
  const kinds: WeaveKind[] = mode === "hero" ? ["plaster", "linen", "wool"] : ["plaster", "linen", "wool", "denim", "knit"];
  for (const k of kinds) if (!painted.has(k) && !prepainted.has(k)) prepainted.set(k, await idleRun(painting(...tile(k))));
  scene.environmentIntensity = mode === "hero" ? 0.18 : 0.22;
  await pause();

  const disposables: { dispose: () => void }[] = [];
  const own = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x);
  const weaves: WeaveKind[] = [];
  const brass = own(new THREE.MeshStandardMaterial({ color: "#b8925a", metalness: 1, roughness: 0.32, envMapIntensity: 2.2 }));

  // ---- the studio: plaster wall and floor, one soft spotlight, a warm rim from behind
  const plaster = maps("plaster", aniso);
  weaves.push("plaster");
  const plasterMat = (color: string, rough: number, repeat: number) => {
    const map = own(plaster.color.clone());
    const nm = own(plaster.normal.clone());
    map.repeat.set(repeat, repeat);
    nm.repeat.set(repeat, repeat);
    return own(new THREE.MeshStandardMaterial({ color, map, normalMap: nm, normalScale: new THREE.Vector2(0.5, 0.5), roughness: rough }));
  };

  const H = mode === "hero";
  const wallZ = H ? -1.25 : -0.42;
  const wall = new THREE.Mesh(own(new THREE.PlaneGeometry(40, 16)), plasterMat(H ? "#54473c" : "#2e2924", 0.96, H ? 7 : 5));
  wall.position.set(0, H ? 7 : 1, wallZ);
  wall.receiveShadow = true;
  scene.add(wall);
  if (H) {
    const floor = new THREE.Mesh(own(new THREE.PlaneGeometry(40, 24)), plasterMat("#4a4038", 0.62, 9));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 8);
    floor.receiveShadow = true;
    scene.add(floor);
    // a plaster skirting where wall meets floor
    const skirt = new THREE.Mesh(own(new THREE.BoxGeometry(40, 0.09, 0.04)), plasterMat("#54483d", 0.9, 9));
    skirt.position.set(0, 0.045, wallZ + 0.02);
    skirt.receiveShadow = true;
    scene.add(skirt);
  }

  const key = new THREE.SpotLight("#ffe7c7", H ? 520 : 70, 0, H ? 0.38 : 0.5, 0.95, 1.7);
  key.position.set(H ? -4.2 : -1.6, H ? 6.6 : 2.9, H ? 5.2 : 2.6);
  key.target.position.set(H ? 0.7 : 0.05, H ? 1.5 : 0.6, wallZ);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.radius = H ? 12 : 8;
  key.shadow.blurSamples = 20;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  key.shadow.camera.near = 2;
  key.shadow.camera.far = 20;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight("#ffcf9a", H ? 1.6 : 1.1);
  rim.position.set(H ? 4 : 1.5, H ? 4.5 : 2, -3);
  scene.add(rim);
  const fill = new THREE.HemisphereLight("#efe0cc", "#2a221c", H ? 0.55 : 0.4);
  scene.add(fill);
  await pause();

  // ---- the cloth
  type Hung = { cloth: Cloth; mesh: THREE.Mesh; sync: () => void; mat: THREE.MeshPhysicalMaterial };
  const hung: Hung[] = [];
  const hang = (cloth: Cloth, id: FabricId, uw: number, uh: number, scale = 1) => {
    // the long-range attachments carry the hero's length, so fewer solver passes do (~30% less work)
    cloth.iterations = 10;
    const mat = own(clothMaterial(id, aniso, scale));
    weaves.push(LOOK[id].weave);
    const { mesh, sync } = clothMesh(cloth, mat, uw, uh);
    scene.add(mesh);
    own(mesh.geometry);
    const h = { cloth, mesh, sync, mat };
    hung.push(h);
    return h;
  };

  const railGeo = own(new THREE.CylinderGeometry(1, 1, 1, 20));
    const knob = own(new THREE.SphereGeometry(1, 20, 14));
  const rod = (x0: number, x1: number, y: number, z: number, r: number) => {
    const m = new THREE.Mesh(railGeo, brass);
    m.scale.set(r, x1 - x0, r);
    m.rotation.z = Math.PI / 2;
    m.position.set((x0 + x1) / 2, y, z);
    m.castShadow = true;
    scene.add(m);
    for (const x of [x0, x1]) {
      const k = new THREE.Mesh(knob, brass);
      k.scale.setScalar(r * 2);
      k.position.set(x, y, z);
      k.castShadow = true;
      scene.add(k);
    }
  };
  const drop = (x: number, y0: number, z: number) => {
    const m = new THREE.Mesh(railGeo, brass);
    m.scale.set(0.006, 8, 0.006);
    m.position.set(x, y0 + 4, z);
    m.castShadow = true;
    scene.add(m);
  };
  const clipGeo = own(new THREE.BoxGeometry(1, 1, 1));
  /** Brass bulldog clips on short hooks from the rail. */
  const clipsOn = (xs: number[], y: number, railY: number, z: number) =>
    xs.forEach((x) => {
      const clip = new THREE.Mesh(clipGeo, brass);
      clip.scale.set(H ? 0.04 : 0.032, H ? 0.05 : 0.042, H ? 0.018 : 0.014);
      clip.position.set(x, y + (H ? 0.012 : 0.012), z);
      clip.castShadow = true;
      scene.add(clip);
      const hook = new THREE.Mesh(railGeo, brass);
      const len = railY - y - 0.02;
      hook.scale.set(0.0035, len, 0.0035);
      hook.position.set(x, y + 0.02 + len / 2, z);
      scene.add(hook);
    });

  let swatch: Hung | null = null;
  let fabric: FabricId = opts.fabric ?? "linen";
  const swatchMats = new Map<FabricId, THREE.MeshPhysicalMaterial>();

  if (H) {
    // front: Caliche clay linen, 1.6 m wide, on two clips a metre apart: one deep cowl
    const front = clipped({ cols: 44, rows: 70, width: 1.6, height: 3.12, x: 0, y: 3.24, z: 0, clips: [0, 1], at: [-0.5, 0.5], feel: "linen", floor: 0.012, wall: wallZ + 0.04, seed: 1 });
    const fm = hang(front, "linen", 4, 7.8, 1.2);
    fm.mat.color.set("#a8694a");
    // linen is matte: a soft, broad sheen at grazing angles, no satin streak
    fm.mat.sheen = 0.35;
    fm.mat.sheenRoughness = 0.8;
    fm.mat.roughness = 0.96;
    fm.mat.sheenColor.set("#e9b892");
    fm.mat.normalScale.set(0.4, 0.4);
    rod(-0.74, 0.74, 3.36, 0, 0.016);
    clipsOn([-0.5, 0.5], 3.24, 3.36, 0);
    drop(-0.62, 3.36, 0);
    drop(0.62, 3.36, 0);
    // behind and to the right: moss wool, heavier, on three clips nearer the wall
    const back = clipped({ cols: 32, rows: 62, width: 1.5, height: 3.44, x: 1.42, y: 3.5, z: -0.62, clips: [0, 0.5, 1], at: [-0.44, 0, 0.44], feel: "wool", floor: 0.012, wall: wallZ + 0.04, seed: 2 });
    const bm = hang(back, "wool", 3.8, 8.6, 1.2);
    bm.mat.color.set("#4b4c37");
    bm.mat.sheenColor.set("#9c9a7c");
    bm.mat.sheen = 0.7;
    bm.mat.sheenRoughness = 0.85; // brushed wool: a fuzzy glow, not a shine
    bm.mat.normalScale.set(0.22, 0.22);
    rod(0.74, 2.1, 3.62, -0.62, 0.014);
    clipsOn([0.98, 1.42, 1.86], 3.5, 3.62, -0.62);
    drop(0.86, 3.62, -0.62);
    drop(1.98, 3.62, -0.62);
  } else {
    // one swatch on two clips: wider than the clips are apart, so the top falls into a soft cowl
    const W = 0.62,
      Ht = 0.78,
      cols = 32,
      rows = 40;
    const c = clipped({ cols, rows, width: W, height: Ht, x: 0, y: 1.02, z: 0, clips: [0, 1], at: [-W * 0.4, W * 0.4], feel: fabric, wall: wallZ + 0.03, seed: 3 });
    for (const id of ["linen", "wool", "denim", "knit"] as FabricId[]) {
      const m = own(clothMaterial(id, aniso));
      weaves.push(LOOK[id].weave);
      swatchMats.set(id, m);
      await pause();
    }
    const { mesh, sync } = clothMesh(c, swatchMats.get(fabric)!, 1, 1.26);
    own(mesh.geometry);
    scene.add(mesh);
    swatch = { cloth: c, mesh, sync, mat: swatchMats.get(fabric)! };
    hung.push(swatch);
    // hanger bar and two bulldog clips
    rod(-0.36, 0.36, 1.13, 0, 0.007);
    clipsOn([-W * 0.4, W * 0.4], 1.02, 1.13, 0);
    drop(-0.3, 1.13, 0);
    drop(0.3, 1.13, 0);
  }
  await pause();

  // ---- air: a slow breeze that varies across the cloth, the draught on wake and on scroll
  let draught = 0; // 0…1, decays
  let scrollGust = 0;
  const gust = (x: number, y: number, z: number, t: number, out: [number, number, number]) => {
    const s = H ? 1 : 0.45;
    const b = 0.55 + 0.45 * Math.sin(t * 0.37 + x * 0.6);
    out[0] = s * (0.35 * Math.sin(t * 0.53 + y * 0.9 + x * 0.4) * b + draught * 0.9);
    out[1] = s * 0.12 * Math.sin(t * 0.71 + x * 1.7);
    out[2] = s * (-0.55 * b + 0.45 * Math.sin(t * 0.9 + x * 2.3 + y * 0.7)) - draught * 2.6 * (0.6 + 0.4 * Math.sin(t * 2.1 + y * 1.3)) - scrollGust;
  };
  hung.forEach((h) => (h.cloth.gust = gust));

  // ---- camera framing
  const look = { x: 0, y: 0, z: 0, tx: 0, ty: 0, fov: camera.fov };
  let framing: Framing = "wide";
  let progress = 0;
  const ptr = { x: 0, y: 0, tx: 0, ty: 0, wx: 0, wy: 0, pwx: NaN, pwy: NaN, inside: false, speed: 0 };
  const placeCamera = () => {
    const aspect = camera.aspect;
    if (H) {
      const p = ease(progress);
      const dist = (8.7 - p * 2.3) * (framing === "portrait" ? 1.1 : 1);
      const visW = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * aspect;
      // cloth group centred at x 0.55; on wide screens a little right of centre, clear of the copy in both corners
      const sx = framing === "portrait" || aspect < 1 ? 0.5 : 0.565;
      const cx = 0.55 - (sx - 0.5) * visW;
      look.x = cx + ptr.x * 0.22;
      // wide: the rail sits below the site header, which covers the top of the stage
      const lift = framing === "wide" && aspect >= 1 ? 0.2 : 0;
      look.y = 1.72 + lift + p * 0.25 + ptr.y * 0.08;
      look.z = dist;
      camera.position.set(look.x, look.y, look.z);
      camera.lookAt(cx + ptr.x * 0.05, 1.66 + lift + p * 0.3, 0);
    } else {
      camera.position.set(ptr.x * 0.06, 0.76 + ptr.y * 0.03, 2.45);
      camera.lookAt(0, 0.7, 0);
    }
  };

  // ---- the loop
  let raf = 0;
  let last = 0;
  let acc = 0;
  let visible = false;
  let ready = false;
  let disposed = false;
  let stopped = false;
  const probe = { on: true, n: 0, prev: 0, t0: 0, frames: 0, worst: 0, work: 0 };
  let settleProbe: (smooth: boolean) => void = () => {};
  const probed = new Promise<boolean>((r) => (settleProbe = r));
  const resetProbe = () => Object.assign(probe, { n: 0, prev: 0, t0: 0, frames: 0, worst: 0, work: 0 });
  const watch = (now: number, work: number) => {
    if (!probe.on) return;
    if (probe.prev) {
      const gap = now - probe.prev;
      probe.n++;
      if (probe.n === 3) probe.t0 = now;
      else if (probe.n > 3) {
        probe.frames++;
        probe.worst = Math.max(probe.worst, gap);
        probe.work += work;
      }
    }
    probe.prev = now;
    const span = probe.t0 ? now - probe.t0 : 0;
    const fps = span ? (probe.frames * 1000) / span : 60;
    if (probe.worst > PROBE_WORST || span >= PROBE_MS) {
      probe.on = false;
      const w = probe.work / Math.max(1, probe.frames);
      const smooth = fps >= PROBE_FPS && probe.worst <= PROBE_WORST && w <= PROBE_WORK;
      performance.mark(`3d:${mode}:probe`, { detail: { fps: Math.round(fps), worst: Math.round(probe.worst), work: +w.toFixed(2), smooth } });
      settleProbe(smooth);
      if (!smooth) {
        stopped = true;
        opts.onSlow?.(fps, probe.worst, w);
      }
    }
  };

  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();
  const toWorld = (nx: number, ny: number, z: number) => {
    ray.setFromCamera(new THREE.Vector2(nx, ny), camera);
    plane.constant = -z;
    return ray.ray.intersectPlane(plane, hit) ? hit : null;
  };
  const grabDepth = { x: 0, y: 0, z: 0 };

  const simulate = (dt: number) => {
    draught = Math.max(0, draught - dt * 0.33);
    scrollGust = damp(scrollGust, 0, 1.6, dt);
    for (const h of hung) {
      const hand = h.cloth.hand;
      hand.on = Math.min(1, ptr.speed * 0.6) * (ptr.inside ? 1 : 0);
      hand.x = ptr.wx;
      hand.y = ptr.wy;
      hand.z = h.cloth.pos[2];
      h.cloth.step(dt);
    }
  };

  const update = (dt: number) => {
    // pointer: smooth the camera lean, track the hand in world space
    ptr.x = damp(ptr.x, ptr.tx, 3, dt);
    ptr.y = damp(ptr.y, ptr.ty, 3, dt);
    placeCamera();
    if (ptr.inside && !(swatch && swatch.cloth.grab.i >= 0)) {
      const w = toWorld(ptr.tx, ptr.ty, H ? 0 : 0.02);
      if (w) {
        const vx = Number.isNaN(ptr.pwx) ? 0 : (w.x - ptr.pwx) / dt,
          vy = Number.isNaN(ptr.pwy) ? 0 : (w.y - ptr.pwy) / dt;
        ptr.pwx = ptr.wx = w.x;
        ptr.pwy = ptr.wy = w.y;
        const sp = Math.hypot(vx, vy);
        ptr.speed = damp(ptr.speed, Math.min(4, sp), 6, dt);
        for (const h of hung) {
          const hand = h.cloth.hand;
          hand.r = H ? 0.6 : 0.2;
          // the moving hand drags air with it and presses it into the cloth
          hand.vx = vx * 0.8;
          hand.vy = vy * 0.5;
          hand.vz = -(H ? 2.6 : 1.4) - sp * 0.5;
        }
      }
    } else ptr.speed = damp(ptr.speed, 0, 4, dt);
    acc = Math.min(acc + dt, STEP * 3);
    while (acc >= STEP) {
      simulate(STEP);
      acc -= STEP;
    }
    hung.forEach((h) => h.sync());
  };

  /** The hero's dive has filled the screen with the collection: nothing of the studio shows. */
  const covered = () => H && progress > 0.97;
  const frame = (now: number) => {
    raf = 0;
    if (disposed || stopped || !visible || document.hidden || !ready || covered()) return;
    const dt = Math.min((now - (last || now - 16)) / 1000, 1 / 20);
    last = now;
    const w0 = performance.now();
    update(dt);
    renderer.render(scene, camera);
    watch(now, performance.now() - w0);
    if (stopped) return;
    raf = requestAnimationFrame(frame);
  };
  const invalidate = () => {
    if (raf || disposed || stopped || !visible || !ready || document.hidden || covered()) return;
    raf = requestAnimationFrame(frame);
  };
  const onVis = () => {
    if (document.hidden) resetProbe();
    last = 0;
    invalidate();
  };
  document.addEventListener("visibilitychange", onVis);

  const free = () => {
    document.removeEventListener("visibilitychange", onVis);
    disposables.forEach((d) => d.dispose());
    weaves.forEach(releaseMaps);
    env.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  };

  const resize = () => {
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    placeCamera();
    if (ready && !raf) renderer.render(scene, camera);
  };

  // settle the folds before anyone sees them (same steps → same as the still), in idle slices so
  // the page around the still stays smooth
  // the same steps time the CPU: one that can't fit a step and a draw into a frame stops here
  const stepMs = await idleRun(
    (function* () {
      let spent = 0;
      for (let s = 0; s < SETTLE / STEP; s++) {
        const a = performance.now();
        for (const h of hung) h.cloth.step(STEP);
        if (s >= 5) spent += performance.now() - a;
        if (s === 24 && spent / 20 > SLOW_STEP) return spent / 20;
        yield;
      }
      return spent / (SETTLE / STEP - 5);
    })(),
  );
  performance.mark(`3d:${mode}:settled`, { detail: { stepMs: +stepMs.toFixed(2) } });
  if (stepMs > SLOW_STEP) {
    free();
    throw new SlowCpuError(`${mode}: ${stepMs.toFixed(1)} ms per cloth step`);
  }
  hung.forEach((h) => h.sync());
  resize();

  // every shader and texture before the first visible frame
  await renderer.compileAsync(scene, camera).catch(() => {});
  if (swatch) {
    for (const m of swatchMats.values()) {
      swatch.mesh.material = m;
      await renderer.compileAsync(swatch.mesh, camera, scene).catch(() => {});
    }
    swatch.mesh.material = swatch.mat;
  }
  const textures = new Set<THREE.Texture>();
  scene.traverse((o) => {
    const m = (o as THREE.Mesh).material;
    for (const mm of Array.isArray(m) ? m : m ? [m] : []) for (const v of Object.values(mm)) if (v instanceof THREE.Texture) textures.add(v);
  });
  for (const m of swatchMats.values()) for (const v of Object.values(m)) if (v instanceof THREE.Texture) textures.add(v);
  for (const t of textures) {
    renderer.initTexture(t);
    await pause();
  }
  renderer.render(scene, camera);
  await pause();
  ready = true;
  performance.mark(`3d:${mode}:ready`, { detail: { ms: Math.round(performance.now() - t0) } });

  const api: ClothScene = {
    setProgress(p) {
      const np = Math.min(1, Math.max(0, p));
      // scrolling in pushes air through the studio: the cloth lifts towards the wall
      scrollGust = Math.min(3.5, scrollGust + Math.abs(np - progress) * 26);
      progress = np;
      invalidate();
    },
    setPointer(nx, ny, inside) {
      ptr.tx = nx;
      ptr.ty = ny;
      if (!inside || !ptr.inside) ptr.pwx = ptr.pwy = NaN;
      ptr.inside = inside;
      invalidate();
    },
    grab(nx, ny) {
      if (!swatch) return false;
      // nearest point of the cloth on screen, within reach of the pointer
      const c = swatch.cloth;
      const v = new THREE.Vector3();
      let best = -1,
        bd = 0.09 ** 2;
      for (let q = 0; q < c.n; q++) {
        v.set(c.pos[q * 3], c.pos[q * 3 + 1], c.pos[q * 3 + 2]).project(camera);
        const d = (v.x - nx) ** 2 + ((v.y - ny) * 0.7) ** 2;
        if (d < bd && c.pin[q * 3] !== c.pin[q * 3]) {
          bd = d;
          best = q;
        }
      }
      if (best < 0) return false;
      grabDepth.x = c.pos[best * 3];
      grabDepth.y = c.pos[best * 3 + 1];
      grabDepth.z = c.pos[best * 3 + 2];
      c.hold(best, 2);
      api.drag(nx, ny);
      return true;
    },
    drag(nx, ny) {
      if (!swatch || swatch.cloth.grab.i < 0) return;
      const w = toWorld(nx, ny, grabDepth.z);
      if (!w) return;
      const g = swatch.cloth.grab;
      // a hand pulls cloth towards itself: a short reach, coming forward as it goes, so the
      // swatch tents out instead of folding through itself
      let dx = w.x - grabDepth.x,
        dy = w.y - grabDepth.y;
      const d = Math.hypot(dx, dy),
        reach = 0.15;
      if (d > reach) {
        dx *= reach / d;
        dy *= reach / d;
      }
      g.x = grabDepth.x + dx;
      g.y = grabDepth.y + dy;
      g.z = grabDepth.z + 0.05 + Math.min(d, reach) * 0.9;
      invalidate();
    },
    release() {
      if (swatch) swatch.cloth.grab.i = -1;
      invalidate();
    },
    setFabric(id) {
      if (!swatch || id === fabric) return;
      fabric = id;
      const m = swatchMats.get(id)!;
      swatch.mesh.material = m;
      swatch.mat = m;
      const f = FEEL[id];
      Object.assign(swatch.cloth.feel, f);
      swatch.cloth.iterations = f.iterations;
      swatch.cloth.impulse(0.4, 0.5, 1.2, STEP, 2);
      invalidate();
    },
    setVisible(v) {
      visible = v;
      if (v) invalidate();
      else {
        cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
        resetProbe();
      }
    },
    resize,
    wake() {
      if (H) draught = 1;
      else swatch?.cloth.impulse(0.3, 0.4, 1.6, STEP, 2);
      invalidate();
    },
    warm(seconds) {
      for (let t = 0; t < seconds; t += STEP) simulate(STEP);
      hung.forEach((h) => h.sync());
    },
    snapshot(w, h, fr = "wide") {
      framing = fr;
      ptr.x = ptr.y = ptr.tx = ptr.ty = 0;
      renderer.setPixelRatio(1);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      placeCamera();
      renderer.render(scene, camera);
      const url = canvas.toDataURL("image/png");
      framing = "wide";
      resize();
      return url;
    },
    probed,
    dispose() {
      disposed = true;
      settleProbe(true);
      cancelAnimationFrame(raf);
      free();
    },
  };
  return api;
}
