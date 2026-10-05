"use client";

import { useEffect, useRef, useState, ViewTransition, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import clsx from "clsx";
import { gsap, ScrollTrigger, prefersReducedMotion, isCoarse } from "@/lib/gsap";
import { agencyUrl } from "@/lib/site";
import { openStatus } from "@/lib/hours";
import { useUi, useMounted } from "@/lib/store";

/** Lenis smooth scrolling driven by GSAP's ticker. Off on touch and for reduced motion. */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion() || isCoarse()) return;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, anchors: { offset: -90 } });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  useEffect(() => {
    window.__lenis?.resize();
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}

/**
 * Page transition: each route enters with a curtain wipe and the old page
 * sinks away (see ::view-transition rules in globals.css). Keyed by path so
 * filter/search-param changes on the same page don't trigger it.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <ViewTransition key={pathname} enter="page-in" exit="page-out" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}

/** Desktop cursor: a dot that grows into a label over [data-cursor] targets ("View", "Drag"). */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (isCoarse() || prefersReducedMotion()) return;
    const el = dot.current!;
    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });
    let last: string | null = null;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      setActive(true);
      xTo(e.clientX);
      yTo(e.clientY);
      const t = (e.target as Element | null)?.closest?.("[data-cursor]");
      const next = t?.getAttribute("data-cursor") ?? null;
      if (next !== last) {
        last = next;
        setLabel(next);
      }
    };
    const leave = () => setActive(false);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div
      ref={dot}
      aria-hidden="true"
      className={clsx(
        "pointer-events-none fixed left-0 top-0 z-[500] hidden md:block",
        "transition-opacity duration-300",
        active ? "opacity-100" : "opacity-0",
      )}
    >
      <div
        className={clsx(
          "t-mono -translate-x-1/2 -translate-y-1/2 grid place-items-center rounded-full text-[0.62rem] transition-[width,height,background-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          label ? "h-[4.75rem] w-[4.75rem] bg-cobalt text-bone" : "h-2.5 w-2.5 bg-cobalt",
        )}
      >
        <span className={clsx("transition-opacity duration-300", label ? "opacity-100" : "opacity-0")}>{label}</span>
      </div>
    </div>
  );
}

/** Polite live region for cart announcements. */
export function LiveRegion() {
  const { announce } = useUi();
  return (
    <div role="status" aria-live="polite" className="sr-only">
      {announce}
    </div>
  );
}

/** "Concept site by Scale by Noon" pill (dismissible). */
export function DemoBadge() {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <div className="fixed bottom-[4.6rem] left-3 z-[90] flex items-center gap-1 rounded-full bg-char/90 py-1 pl-4 pr-1 text-bone shadow-lg backdrop-blur md:bottom-4 md:left-auto md:right-4">
      <a href={agencyUrl} target="_blank" rel="noopener" className="t-mono py-2 text-[0.62rem] hover:text-cobalt-lt">
        Concept site by Scale by Noon ↗
      </a>
      <button type="button" onClick={() => setHidden(true)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10" aria-label="Dismiss demo notice">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  );
}

/** Live "Open now · until 8 pm" pill (Dallas time). Client-only to avoid hydration drift. */
export function OpenBadge({ className, dark }: { className?: string; dark?: boolean }) {
  const mounted = useMounted();
  const [, tick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);
  const s = mounted ? openStatus() : null;
  return (
    <span className={clsx("t-mono inline-flex items-center gap-2 rounded-full border px-3 py-1.5", dark ? "border-line-lt" : "border-line", className)}>
      <span
        className={clsx("h-2 w-2 rounded-full", s?.open ? "bg-[#3f9b52]" : "bg-stone")}
        style={s?.open ? { animation: "pulse-dot 2s infinite" } : undefined}
      />
      <span className="min-w-[13ch]">{s ? s.label : "Hours · Bishop Arts"}</span>
    </span>
  );
}
