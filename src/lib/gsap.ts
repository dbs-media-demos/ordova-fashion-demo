"use client";

import { useEffect } from "react";

/** Phones and tablets: below 768 px or a touch screen. Same test as the phone block in globals.css. */
export const PHONE_QUERY = "(max-width: 767px), (pointer: coarse)";

export const isPhone = () => typeof window !== "undefined" && window.matchMedia(PHONE_QUERY).matches;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isCoarse = () => typeof window !== "undefined" && window.matchMedia("(hover: none), (pointer: coarse)").matches;

/** Element starts below the fold → safe to hide it for a JS reveal. */
export const belowFold = (el: Element) => el.getBoundingClientRect().top > window.innerHeight * 0.92;

/**
 * GSAP arrives in its own chunk, never in a phone's first load. These live bindings are filled in by
 * loadGsap(): only touch them inside useIdleGSAP, withGsap, or after loadGsap() has resolved.
 */
export let gsap: typeof import("gsap").gsap;
export let ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;

let loading: Promise<void> | undefined;
export const loadGsap = () =>
  (loading ??= import("./gsap-core").then((m) => {
    gsap = m.gsap;
    ScrollTrigger = m.ScrollTrigger;
  }));

/** Run `cb` with GSAP: right away when it has loaded, otherwise as soon as it has. */
export function withGsap(cb: () => void) {
  if (gsap) cb();
  else void loadGsap().then(cb);
}

/** Run `cb` once the browser is idle (falls back to a short timeout). */
export function onIdle(cb: () => void, timeout = 1200) {
  const ric = window.requestIdleCallback ?? ((f: () => void) => window.setTimeout(f, 200));
  const cancel = window.cancelIdleCallback ?? window.clearTimeout;
  const id = ric(cb, { timeout });
  return () => cancel(id as number);
}

if (typeof window !== "undefined") {
  if (!isPhone()) void loadGsap();
  else {
    // Phones: only once the page has loaded and settled, so a tap-driven flourish (fly-to-bag) is ready.
    const later = () => onIdle(() => void loadGsap(), 4000);
    if (document.readyState === "complete") later();
    else window.addEventListener("load", later, { once: true });
  }
}

/** SplitText is only needed once a headline scrolls into view — load it on demand. */
export const loadSplitText = () =>
  loadGsap()
    .then(() => import("gsap/SplitText"))
    .then(({ SplitText }) => {
      gsap.registerPlugin(SplitText);
      return SplitText;
    });

/** Flip powers the animated filter/sort grid. Loaded lazily on shop pages. */
export const loadFlip = () =>
  loadGsap()
    .then(() => import("gsap/Flip"))
    .then(({ Flip }) => {
      gsap.registerPlugin(Flip);
      return Flip;
    });

/**
 * Desktop animation wiring: runs in a gsap.context once GSAP has loaded and the browser is idle
 * (lower TBT). Reverted on unmount and when `deps` change. Phones skip it entirely: they get the
 * static, stacked page.
 */
export function useIdleGSAP(setup: () => void | (() => void), scope: React.RefObject<Element | null>, deps: unknown[] = []) {
  useEffect(() => {
    if (isPhone()) return;
    let dead = false;
    let cancel: (() => void) | undefined;
    let cleanup: void | (() => void);
    let ctx: { revert: () => void } | undefined;
    void loadGsap().then(() => {
      if (dead) return;
      cancel = onIdle(() => {
        if (dead) return;
        ctx = gsap.context(() => {
          cleanup = setup();
        }, scope.current ?? undefined);
      });
    });
    return () => {
      dead = true;
      cancel?.();
      cleanup?.();
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
