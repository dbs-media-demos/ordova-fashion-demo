"use client";

import { useRef } from "react";
import Image from "next/image";
import clsx from "clsx";
import { gsap, ScrollTrigger, useIdleGSAP, prefersReducedMotion } from "@/lib/gsap";

type Step = { n: string; t: string; d: string; img: string; extra?: string };

/**
 * Pinned, scrubbed sequence: the photos stack up like cards dealt on a table
 * (each new one slides up and the one beneath sinks and dims) while the step
 * number rolls and the text swaps. Studio page: sketch → pattern → cut → sew → tag.
 */
export function StackSequence({ steps, label }: { steps: Step[]; label: string }) {
  const root = useRef<HTMLElement>(null);

  useIdleGSAP(() => {
    const sec = root.current;
    if (!sec || prefersReducedMotion()) return;
    const cards = gsap.utils.toArray<HTMLElement>("[data-card]", sec);
    const texts = gsap.utils.toArray<HTMLElement>("[data-text]", sec);
    const roll = sec.querySelector<HTMLElement>("[data-roll]");
    gsap.set(cards.slice(1), { yPercent: 110 });
    gsap.set(texts.slice(1), { opacity: 0, y: 40 });
    const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.7 } });
    cards.forEach((c, i) => {
      if (i === 0) return;
      const at = i - 1;
      tl.to(c, { yPercent: 0, duration: 1, ease: "power2.inOut" }, at)
        .to(cards[i - 1], { scale: 0.88, opacity: 0.35, duration: 1, ease: "power2.inOut" }, at)
        .to(texts[i - 1], { opacity: 0, y: -40, duration: 0.4 }, at + 0.1)
        .to(texts[i], { opacity: 1, y: 0, duration: 0.5 }, at + 0.5)
        .to(roll, { yPercent: (-100 * i) / steps.length, duration: 0.8, ease: "power3.inOut" }, at + 0.2);
    });
    tl.to({}, { duration: 0.4 });
    ScrollTrigger.refresh();
  }, root);

  return (
    <section ref={root} className="relative motion-safe:h-[500svh]" aria-label={label}>
      <div className="theme-char overflow-hidden motion-safe:sticky motion-safe:top-0 motion-safe:h-[100svh]">
        <div className="container-x grid h-full gap-10 py-24 md:grid-cols-12 md:items-center md:py-0">
          <div className="relative md:col-span-5">
            <div className="flex items-start gap-4">
              <div className="h-[clamp(5rem,13vw,12rem)] overflow-hidden" aria-hidden="true">
                <div data-roll className="font-display text-[clamp(5rem,13vw,12rem)] font-extrabold leading-none tracking-[-0.05em] text-cobalt-lt">
                  {steps.map((s) => (
                    <div key={s.n} className="h-[clamp(5rem,13vw,12rem)]">
                      {s.n}
                    </div>
                  ))}
                </div>
              </div>
              <span className="t-mono mt-3 text-bone/70">/ {String(steps.length).padStart(2, "0")}</span>
            </div>
            <div className="relative mt-6 min-h-[15rem]">
              {steps.map((s, i) => (
                <div key={s.t} data-text className={clsx("motion-safe:absolute motion-safe:inset-x-0 motion-safe:top-0", i > 0 && "mt-10 motion-safe:mt-0")}>
                  <h3 className="font-display text-[clamp(2.4rem,5vw,4.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.03em]">{s.t}</h3>
                  <p className="mt-4 max-w-md text-bone/85">{s.d}</p>
                  {s.extra && <p className="t-mono mt-4 text-bone/60">{s.extra}</p>}
                </div>
              ))}
            </div>
          </div>
          <div className="relative h-[52vh] md:col-span-6 md:col-start-7 md:h-[78vh]">
            {steps.map((s, i) => (
              <div key={s.t} data-card className="absolute inset-0 overflow-hidden rounded-[3px] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.7)]" style={{ zIndex: i + 1 }}>
                <Image src={s.img} alt={`${s.t} — ${s.d}`} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

type Moment = { y: string; t: string; d: string; img?: string };

/** Horizontal timeline driven by vertical scroll (desktop); a vertical list on touch. */
export function Timeline({ items, label }: { items: Moment[]; label: string }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);

  useIdleGSAP(() => {
    const sec = root.current;
    const tr = track.current;
    if (!sec || !tr || prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const dist = () => tr.scrollWidth - window.innerWidth + 80;
      const setH = () => (sec.style.height = `${dist() + window.innerHeight}px`);
      setH();
      const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true, onRefreshInit: setH } });
      tl.to(tr, { x: () => -dist(), duration: 1 }, 0).fromTo(sec.querySelector("[data-progress]"), { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0);
      ScrollTrigger.refresh();
      return () => (sec.style.height = "");
    });
    return () => mm.revert();
  }, root);

  return (
    <section ref={root} className="relative bg-sand" aria-label={label}>
      <div className="lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:flex-col lg:justify-center lg:overflow-hidden">
        <div className="container-x py-16 lg:py-0">
          <p className="t-mono text-muted">{label}</p>
          <div className="mt-6 hidden h-px bg-line lg:block">
            <div data-progress className="h-px origin-left scale-x-0 bg-char" />
          </div>
        </div>
        <ol ref={track} className="container-x flex flex-col gap-12 pb-20 lg:mt-10 lg:flex-row lg:gap-16 lg:pb-0">
          {items.map((m) => (
            <li key={m.y} className="lg:w-[30rem] lg:shrink-0">
              <p className="font-display text-[clamp(3.5rem,8vw,7rem)] font-extrabold leading-none tracking-[-0.05em]">{m.y}</p>
              {m.img && (
                <div className="media relative mt-5 aspect-[16/10] overflow-hidden rounded-[2px]">
                  <Image src={m.img} alt="" fill sizes="(min-width: 1024px) 30rem, 100vw" className="object-cover" />
                </div>
              )}
              <h3 className="t-h3 mt-5">{m.t}</h3>
              <p className="mt-2 max-w-md text-muted">{m.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Zoom-through: a framed photo grows until it fills the screen, with a line of text riding on top. */
export function ZoomFrame({ img, alt, kicker, line }: { img: string; alt: string; kicker: string; line: string }) {
  const root = useRef<HTMLElement>(null);
  useIdleGSAP(() => {
    const sec = root.current;
    if (!sec || prefersReducedMotion()) return;
    const st = sec.querySelector<HTMLElement>("[data-stage]")!;
    const ins = () => {
      const w = st.clientWidth;
      const h = st.clientHeight;
      const x = w < 768 ? w * 0.14 : w * 0.32;
      const y = w < 768 ? h * 0.24 : h * 0.22;
      return `inset(${y}px ${x}px ${y}px ${x}px round 999px)`;
    };
    gsap
      .timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.7, invalidateOnRefresh: true } })
      .fromTo(sec.querySelector("[data-img]"), { clipPath: ins }, { clipPath: "inset(0px 0px 0px 0px round 0px)", duration: 1, ease: "power2.inOut" }, 0)
      .fromTo(sec.querySelector("[data-img] img"), { scale: 1.4 }, { scale: 1, duration: 1 }, 0)
      .fromTo(sec.querySelector("[data-line]"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3 }, 0.65);
  }, root);
  return (
    <section ref={root} className="relative motion-safe:h-[220svh]">
      <div data-stage className="theme-char relative h-[100svh] overflow-hidden motion-safe:sticky motion-safe:top-0">
        <div data-img className="absolute inset-0">
          <Image src={img} alt={alt} fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(21_21_19/0.75),transparent_55%)]" />
        </div>
        <div data-line className="container-x absolute inset-x-0 bottom-0 pb-24 md:pb-14">
          <p className="t-mono text-bone/80">{kicker}</p>
          <p className="mt-3 max-w-[20ch] font-display text-[clamp(2.2rem,5.5vw,5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-bone">{line}</p>
        </div>
      </div>
    </section>
  );
}
