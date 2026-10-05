"use client";

import { useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import clsx from "clsx";
import { gsap, ScrollTrigger, useIdleGSAP, loadSplitText, prefersReducedMotion, belowFold, isCoarse } from "@/lib/gsap";

/*
 * Scroll-driven reveals.
 * Content is visible in the HTML. `immediate` variants (top of the page) use
 * CSS only. Everything else is hidden by JS only while below the fold, and
 * only via opacity/transform — never visibility/display.
 */

const delayStyle = (d: number) => ({ "--d": `${d}s` }) as CSSProperties;

type SplitProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
  id?: string;
  /** "lines" rises line-by-line; "chars" assembles letter by letter */
  by?: "lines" | "chars";
};

/** Headline that rises out of a mask (lines) or assembles letter by letter (chars). */
export function SplitReveal({ children, as: Tag = "h2", className, delay = 0, stagger, id, by = "lines" }: SplitProps) {
  const ref = useRef<HTMLElement>(null);

  useIdleGSAP(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !belowFold(el)) return;
    gsap.set(el, { opacity: 0 });
    let split: { revert: () => void } | null = null;
    let dead = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        Promise.all([loadSplitText(), document.fonts.ready]).then(([SplitText]) => {
          if (dead) return;
          split = SplitText.create(el, {
            type: by === "chars" ? "lines,chars" : "lines",
            mask: "lines",
            linesClass: "split-line",
            autoSplit: true,
            onSplit(self) {
              gsap.set(el, { opacity: 1 });
              if (by === "chars")
                return gsap.from(self.chars, { yPercent: 110, rotate: 6, duration: 1.1, stagger: stagger ?? 0.025, delay, ease: "expo.out" });
              return gsap.from(self.lines, { yPercent: 118, rotate: 2, duration: 1.25, stagger: stagger ?? 0.09, delay, ease: "expo.out" });
            },
          });
        });
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => {
      dead = true;
      io.disconnect();
      split?.revert();
    };
  }, ref);

  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}

/** CSS-only masked headline for the top of a page (paints immediately — LCP-safe). */
export function IntroTitle({ lines, as: Tag = "h1", className, delay = 0 }: { lines: ReactNode[]; as?: ElementType; className?: string; delay?: number }) {
  return (
    <Tag className={className}>
      {lines.map((l, i) => (
        <span key={i} className="anim-mask">
          <span style={delayStyle(delay + i * 0.08)}>{l}</span>
        </span>
      ))}
    </Tag>
  );
}

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  y?: number;
  stagger?: number;
  immediate?: boolean;
  id?: string;
  style?: CSSProperties;
};

/** Fade + rise when scrolled into view (optionally staggering direct children). */
export function Reveal({ children, as: Tag = "div", className, delay = 0, y = 36, stagger, immediate, id, style }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useIdleGSAP(() => {
    const el = ref.current;
    if (!el || immediate || prefersReducedMotion() || !belowFold(el)) return;
    const targets = stagger ? Array.from(el.children) : [el];
    gsap.set(targets, { opacity: 0, y });
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => gsap.to(targets, { opacity: 1, y: 0, duration: 1.2, delay, stagger: stagger ?? 0, ease: "expo.out", clearProps: "transform" }),
    });
  }, ref);

  return (
    <Tag ref={ref} id={id} className={clsx(immediate && "anim-fade", className)} style={immediate ? { ...style, ...delayStyle(delay) } : style}>
      {children}
    </Tag>
  );
}

/** Paragraph whose words brighten one by one as you scroll through it. */
export function ScrubWords({ text, className, as: Tag = "p", dim = 0.5 }: { text: string; className?: string; as?: ElementType; dim?: number }) {
  const ref = useRef<HTMLElement>(null);

  useIdleGSAP(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const words = el.querySelectorAll<HTMLElement>("[data-w]");
    gsap.fromTo(
      words,
      { opacity: (_: number, el: Element) => (el.classList.contains("text-cobalt") ? 0.9 : dim) },
      { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: 0.6 } },
    );
  }, ref);

  return (
    <Tag ref={ref} className={className}>
      {text.split(" ").map((w, i) => (
        <span key={i} data-w className={clsx("inline", w.startsWith("*") && "text-cobalt")}>
          {w.replace(/^\*/, "")}{" "}
        </span>
      ))}
    </Tag>
  );
}

/**
 * Image frame: wipes open from the bottom when it enters, then drifts with
 * scroll (parallax). The first child should be the media (fills the frame).
 */
export function Parallax({
  children,
  className,
  amount = 12,
  reveal = true,
  style,
  from = "bottom",
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
  reveal?: boolean;
  style?: CSSProperties;
  from?: "bottom" | "left" | "center";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useIdleGSAP(() => {
    const el = ref.current;
    const inner = el?.firstElementChild as HTMLElement | null;
    if (!el || !inner || prefersReducedMotion()) return;
    if (amount) {
      gsap.set(inner, { scale: 1 + amount / 100 });
      gsap.fromTo(
        inner,
        { yPercent: -amount / 2 },
        { yPercent: amount / 2, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
      );
    }
    if (reveal && belowFold(el)) {
      const start =
        from === "left" ? "inset(0% 100% 0% 0%)" : from === "center" ? "inset(30% 30% 30% 30%)" : "inset(100% 0% 0% 0%)";
      gsap.fromTo(
        el,
        { clipPath: start },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut", clearProps: "clipPath", scrollTrigger: { trigger: el, start: "top 88%", once: true } },
      );
    }
  }, ref);

  return (
    <div ref={ref} className={clsx("overflow-hidden", !/(^| )(absolute|fixed)( |$)/.test(className ?? "") && "relative", className)} style={style}>
      {children}
    </div>
  );
}

/** Number that counts up when it enters the viewport. */
export function Counter({ value, decimals = 0, suffix = "", prefix = "", className }: { value: number; decimals?: number; suffix?: string; prefix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useIdleGSAP(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !belowFold(el)) return;
    const obj = { v: 0 };
    const render = () => (el.textContent = `${prefix}${obj.v.toFixed(decimals)}${suffix}`);
    render();
    gsap.to(obj, { v: value, duration: 2, ease: "power3.out", onUpdate: render, scrollTrigger: { trigger: el, start: "top 90%", once: true } });
  }, ref);
  return (
    <span ref={ref} className={clsx("tabular-nums", className)}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/** Wrapper that pulls its child toward the pointer (desktop only). */
export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useIdleGSAP(() => {
    const el = ref.current;
    if (!el || isCoarse() || prefersReducedMotion()) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, ref);
  return (
    <span ref={ref} className={clsx("inline-block will-change-transform", className)}>
      {children}
    </span>
  );
}

/** Infinite marquee. Children are rendered twice; the copy is hidden from AT. */
export function Marquee({ children, className, duration = 40, reverse }: { children: ReactNode; className?: string; duration?: number; reverse?: boolean }) {
  return (
    <div className={clsx("overflow-hidden", className)}>
      <div className="marquee" style={{ "--dur": `${duration}s`, animationDirection: reverse ? "reverse" : undefined } as CSSProperties}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true" inert>
          {children}
        </div>
      </div>
    </div>
  );
}
