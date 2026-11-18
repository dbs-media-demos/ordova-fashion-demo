"use client";

import { onIdle } from "./idle";

/**
 * The only door to three.js. Nothing imports a 3D module statically: callers run `after3DGate`
 * in an effect, and the `import()` happens inside its callback, so phones, tablets, reduced
 * motion and Save-Data never download a byte of it.
 */
export const DESKTOP_3D_QUERY = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";

const OFF_KEY = "ordova-3d-off";
const SLOW_KEY = "ordova-3d-slow";
const SLOW_LIMIT = 2;
// This page load ran slow: the scenes after it on this page stay stills too (counted once per load)
let slowHere = false;
const OFF_EVENT = "ordova:3d-off";

export function can3D() {
  if (typeof window === "undefined") return false;
  if (is3DOff()) return false;
  if (!window.matchMedia(DESKTOP_3D_QUERY).matches) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return false;
  return typeof WebGL2RenderingContext !== "undefined";
}

/**
 * How long the main thread was blocked while this page loaded and hydrated: every long task's time
 * past 50 ms, up to the first gate. A desktop that blocks for over 300 ms just loading the page
 * (~60 ms on a normal one) would hitch through building a scene too, so it keeps the stills and
 * never fetches three.js. Slow graphics with a fast CPU are caught by the scene's own frame check.
 */
const BUSY_LIMIT = 300;
let blocked = 0;
let longTasks: PerformanceObserver | null = null;
const addLong = (l: PerformanceEntryList) => l.forEach((e) => (blocked += Math.max(0, e.duration - 50)));
if (typeof window !== "undefined" && window.matchMedia(DESKTOP_3D_QUERY).matches && PerformanceObserver?.supportedEntryTypes?.includes("longtask")) {
  longTasks = new PerformanceObserver((l) => addLong(l.getEntries()));
  longTasks.observe({ type: "longtask", buffered: true });
}
function loadBlocked() {
  if (longTasks) {
    addLong(longTasks.takeRecords());
    longTasks.disconnect();
    longTasks = null;
    performance.mark("3d:gate", { detail: { blocked: Math.round(blocked) } });
  }
  return blocked;
}

/**
 * After the page has loaded (and the browser has had a breath), call `yes` on a big screen with a
 * mouse and a CPU that loaded the page without strain, otherwise `no`. Returns a cancel function.
 */
export function after3DGate(yes: () => void, no?: () => void) {
  let cancelled = false;
  let cancelIdle = () => {};
  const run = () => {
    if (cancelled) return;
    if (!can3D()) return no?.();
    if (loadBlocked() > BUSY_LIMIT) {
      mark3DOff("slow", `busy CPU: ${Math.round(blocked)} ms blocked while loading`);
      return no?.();
    }
    yes();
  };
  const onLoad = () => {
    cancelIdle = onIdle(run, { timeout: 600, fallbackMs: 120 });
  };
  if (document.readyState === "complete") onLoad();
  else window.addEventListener("load", onLoad, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener("load", onLoad);
    // the matching cancel: an idle id given to clearTimeout could cancel an unrelated timer
    cancelIdle();
  };
}

function is3DOff() {
  if (slowHere) return true;
  try {
    // only "gpu" counts under the old key: a tab's old "1" (one slow start) doesn't hold any more
    return sessionStorage.getItem(OFF_KEY) === "gpu" || Number(sessionStorage.getItem(SLOW_KEY) || 0) >= SLOW_LIMIT;
  } catch {
    return false;
  }
}

/**
 * A scene couldn't run here: every scene on this page goes back to its still. No real GPU
 * (`"gpu"`) keeps the rest of the visit on stills at once. Running slow (`"slow"`: under ~45 fps
 * in a scene's first two seconds, a slow cloth step, a strained page load) is counted once per
 * page load and keeps the visit on stills only after 2 slow loads: on 18 Nov one slow start on a
 * refresh (the GPU's first draw) kept a fast PC on the stills for the whole tab.
 */
export function mark3DOff(why: "gpu" | "slow", reason: string) {
  try {
    if (why === "gpu") sessionStorage.setItem(OFF_KEY, "gpu");
    else if (!slowHere) sessionStorage.setItem(SLOW_KEY, String(Number(sessionStorage.getItem(SLOW_KEY) || 0) + 1));
  } catch {}
  if (why === "slow") slowHere = true;
  window.dispatchEvent(new CustomEvent(OFF_EVENT, { detail: reason }));
}

export function on3DOff(cb: () => void) {
  window.addEventListener(OFF_EVENT, cb);
  return () => window.removeEventListener(OFF_EVENT, cb);
}

/**
 * One scene warms up at a time, each in the browser's idle time, in the order they were queued
 * (the page order: hero first). A task resolves when its scene is compiled and has drawn a frame,
 * so the next build never lands on top of the hero's first seconds.
 */
let queue: Promise<unknown> = Promise.resolve();
const idle = () =>
  new Promise<void>((r) => (typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(() => r(), { timeout: 1500 }) : window.setTimeout(r, 120)));

export function warm3D(task: () => Promise<unknown>) {
  queue = queue.then(idle).then(() => (can3D() ? task() : undefined)).catch(() => {});
}

/** Let the browser breathe between the heavy steps of building a scene; resolves with the idle time it got. */
export const yieldIdle = () =>
  new Promise<IdleDeadline | undefined>((r) =>
    typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(r, { timeout: 120 }) : window.setTimeout(() => r(undefined), 0),
  );
