"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, useIdleGSAP, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";
import { IconArrow } from "@/components/ui/Icons";
import { STEPS } from "@/content/studio";
import { cv } from "@/lib/cv";
import { useBiz } from "@/components/preview/BizContext";

/** The studio's lines: a preview keeps the story but drops the concept store's street. */
function useStudio() {
  const biz = useBiz();
  if (!biz.preview) return { label: "Studio · 2nd floor, Bishop Arts", roomAlt: "The Ordova studio upstairs: a long cutting table, pattern rails and tall windows", steps: STEPS };
  return {
    label: "Studio · upstairs from the shop",
    roomAlt: `The ${biz.shortName} studio upstairs: a long cutting table, pattern rails and tall windows`,
    steps: STEPS.map((s) => ({ ...s, d: s.d.replace(" on Bishop Ave", " in the shop") })),
  };
}

/**
 * Scene 5 — zoom through a window into the studio, then a scrubbed
 * sketch → pattern → cut → sew → tag sequence inside.
 */
export function StudioWindow() {
  const { label, roomAlt, steps: STEPS } = useStudio();
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useIdleGSAP(() => {
    const sec = root.current;
    const st = stage.current;
    if (!sec || !st || prefersReducedMotion()) return;
    const win = st.querySelector<HTMLElement>("[data-window]")!;
    const wall = st.querySelector<HTMLElement>("[data-wall]")!;
    const frame = st.querySelector<HTMLElement>("[data-frame]")!;
    const steps = gsap.utils.toArray<HTMLElement>("[data-step]", st);
    const texts = gsap.utils.toArray<HTMLElement>("[data-step-text]", st);
    const dots = gsap.utils.toArray<HTMLElement>("[data-dot]", st);

    const insets = () => {
      const w = st.clientWidth;
      const h = st.clientHeight;
      const ww = w < 768 ? w * 0.62 : w * 0.3;
      const wh = w < 768 ? h * 0.42 : h * 0.5;
      return { x: (w - ww) / 2, y: (h - wh) / 2 };
    };

    gsap.set(texts, { opacity: 0, y: 30 });
    gsap.set(steps, { clipPath: "inset(100% 0% 0% 0%)" });

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.7, invalidateOnRefresh: true },
    });
    tl.fromTo(
      win,
      { clipPath: () => `inset(${insets().y}px ${insets().x}px ${insets().y}px ${insets().x}px round 4px)` },
      { clipPath: "inset(0px 0px 0px 0px round 0px)", duration: 1, ease: "power2.inOut" },
      0,
    )
      .fromTo(frame, { scale: 1, opacity: 1 }, { scale: () => st.clientWidth / (st.clientWidth * (st.clientWidth < 768 ? 0.62 : 0.3)), opacity: 0, duration: 1, ease: "power2.inOut" }, 0)
      .fromTo(wall, { scale: 1, opacity: 1 }, { scale: 2.6, opacity: 0, duration: 0.9, ease: "power2.in" }, 0)
      .fromTo(st.querySelector("[data-room] img"), { scale: 1.3 }, { scale: 1, duration: 1.1 }, 0);

    // The sequence: one step per beat.
    const beat = 1;
    steps.forEach((s, i) => {
      const at = 1.1 + i * beat;
      tl.to(s, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "power3.inOut" }, at - 0.25);
      tl.fromTo(s.querySelector("img"), { scale: 1.2 }, { scale: 1, duration: 0.9 }, at - 0.25);
      tl.to(texts[i], { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, at);
      tl.to(dots[i], { scaleX: 1, duration: beat * 0.9 }, at);
      if (i < steps.length - 1) tl.to(texts[i], { opacity: 0, y: -30, duration: 0.25, ease: "power2.in" }, at + beat * 0.7);
    });
    tl.to({}, { duration: 0.4 });

    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(st);
    return () => ro.disconnect();
  }, root);

  return (
    <>
    <PhoneStudio />
    <section ref={root} className="relative ph:hidden desk:h-[520svh]" aria-labelledby="studio-title">
      <div ref={stage} className="theme-sand grain relative overflow-hidden desk:sticky desk:top-0 desk:h-[100svh]">
        {/* the wall */}
        <div data-wall className="pointer-events-none absolute inset-0 hidden flex-col items-center justify-between py-[12vh] desk:flex">
          <p className="font-display text-[clamp(1.9rem,8.4vw,8.5rem)] font-extrabold uppercase leading-none tracking-[-0.04em]">Step into</p>
          <p className="font-display text-[clamp(1.9rem,8.4vw,8.5rem)] font-extrabold uppercase leading-none tracking-[-0.04em]">the studio</p>
        </div>
        <div data-frame className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[42%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-[4px] outline outline-1 outline-offset-[10px] outline-char/40 desk:block md:h-[50%] md:w-[30%]">
          <span className="t-mono absolute -bottom-9 left-0 whitespace-nowrap text-muted">{label}</span>
        </div>

        {/* the window → full-bleed sequence */}
        <div data-window className="theme-char relative h-[100svh] desk:absolute desk:inset-0 desk:h-auto">
          <div data-room className="absolute inset-0 overflow-hidden">
            <Image src="/images/ed/studio-room.jpg" alt={roomAlt} fill sizes="100vw" className="object-cover" />
          </div>
          {STEPS.map((s) => (
            <div key={s.t} data-step className="absolute inset-0 overflow-hidden">
              <Image src={s.img} alt={`${s.t}: ${s.d}`} fill sizes="100vw" className="object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(21_21_19/0.72),rgb(21_21_19/0.1)_60%)]" />
            </div>
          ))}
          <div className="container-x absolute inset-0 flex flex-col justify-between pb-24 pt-[calc(var(--header-h)+2rem)] md:pb-14">
            <div className="flex items-start justify-between gap-6">
              <h2 id="studio-title" className="t-mono text-bone/85">
                ( 05 ) How it&apos;s made — the studio
              </h2>
              <Link href="/studio" className="btn btn-light btn-sm hidden shrink-0 sm:inline-flex">
                Visit the studio page <IconArrow size={14} />
              </Link>
            </div>
            <div className="relative min-h-[16rem]">
              {STEPS.map((s, i) => (
                <div key={s.t} data-step-text className={i === 0 ? "absolute bottom-0 left-0" : "absolute bottom-0 left-0 opacity-0"}>
                  <p className="t-mono text-cobalt-lt">Step {s.n} / 05</p>
                  <h3 className="mt-2 font-display text-[clamp(2.6rem,10vw,9.5rem)] font-extrabold uppercase leading-[0.82] tracking-[-0.04em]">{s.t}</h3>
                  <p className="mt-4 max-w-md text-bone/90">{s.d}</p>
                </div>
              ))}
            </div>
            <ol className="grid grid-cols-5 gap-2" aria-label="Steps">
              {STEPS.map((s) => (
                <li key={s.t} className="t-mono text-[0.6rem] text-bone/80">
                  <span className="mb-2 block h-px bg-line-lt">
                    <span data-dot className="block h-px origin-left scale-x-0 bg-bone" />
                  </span>
                  {s.t}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}

/** Phones and touch tablets: the same five steps as a swipe rail (no pinned zoom-through). */
function PhoneStudio() {
  const { label, roomAlt, steps: STEPS } = useStudio();
  return (
    <section {...cv("studio")} className="theme-char hidden py-16 ph:block" aria-labelledby="studio-title-ph">
      <div className="container-x flex items-end justify-between gap-4">
        <div>
          <h2 id="studio-title-ph" className="t-mono text-bone/85">
            ( 05 ) How it&apos;s made — the studio
          </h2>
          <p className="mt-3 font-display text-[2.4rem] font-extrabold uppercase leading-[0.86] tracking-[-0.035em]">
            Step into
            <br />
            the studio
          </p>
        </div>
      </div>
      <ol className="rail mt-8" aria-label="Steps">
        <li className="w-[78vw] max-w-[22rem]">
          <div className="media relative aspect-[4/5] overflow-hidden rounded-[3px]">
            <Image src="/images/ed/studio-room.jpg" alt={roomAlt} fill sizes="(min-width: 640px) 22rem, 78vw" className="object-cover" />
          </div>
          <p className="t-mono mt-4 text-bone/70">{label}</p>
        </li>
        {STEPS.map((s) => (
          <li key={s.t} className="w-[78vw] max-w-[22rem]">
            <div className="media relative aspect-[4/5] overflow-hidden rounded-[3px]">
              <Image src={s.img} alt={`${s.t}: ${s.d}`} fill sizes="(min-width: 640px) 22rem, 78vw" className="object-cover" />
            </div>
            <p className="t-mono mt-4 text-cobalt-lt">Step {s.n} / 05</p>
            <h3 className="mt-1 font-display text-[2rem] font-extrabold uppercase leading-[0.9] tracking-[-0.03em]">{s.t}</h3>
            <p className="mt-2 text-[0.95rem] text-bone/85">{s.d}</p>
          </li>
        ))}
      </ol>
      <div className="container-x mt-8">
        <Link href="/studio" className="btn btn-light">
          Visit the studio page <IconArrow size={14} />
        </Link>
      </div>
    </section>
  );
}
