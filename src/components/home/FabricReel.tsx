"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap, useIdleGSAP, prefersReducedMotion } from "@/lib/gsap";

const FABRICS = [
  { t: "Linen", o: "Belgian flax, garment-washed", img: "/images/ed/fabric-linen.jpg" },
  { t: "Wool", o: "Tropical & double-faced, Biella", img: "/images/ed/fabric-wool.jpg" },
  { t: "Denim", o: "14 oz raw selvedge, shuttle loom", img: "/images/ed/fabric-denim.jpg" },
  { t: "Knit", o: "Merino & lambswool, knitted in LA", img: "/images/ed/fabric-knit.jpg" },
];

/**
 * Scene 6 — fabric in motion. A cloth film plays behind two marquee rows
 * whose speed and skew follow your scroll velocity; below, four swatches
 * open like shutters.
 */
export function FabricReel() {
  const root = useRef<HTMLElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);

  // Only fetch the film when the section approaches.
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setLoad(true);
        const v = vid.current;
        if (v && e.isIntersecting) v.play().catch(() => {});
        else if (v) v.pause();
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [load]);

  useIdleGSAP(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const rows = gsap.utils.toArray<HTMLElement>("[data-row]", el);
    const tweens = rows.map((r, i) =>
      gsap.to(r, { xPercent: i % 2 ? 0 : -50, startAt: { xPercent: i % 2 ? -50 : 0 }, duration: 28, ease: "none", repeat: -1 }),
    );
    let vel = 0;
    const st = gsap.timeline({ scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", onUpdate: (s) => (vel = s.getVelocity()) } });
    const skew = gsap.quickTo(rows, "skewX", { duration: 0.6, ease: "power3.out" });
    const tick = () => {
      const v = gsap.utils.clamp(-3000, 3000, vel);
      tweens.forEach((t) => t.timeScale(1 + Math.abs(v) / 400));
      skew(v / -300);
      vel *= 0.9;
    };
    gsap.ticker.add(tick);
    gsap.fromTo(
      el.querySelectorAll("[data-shutter]"),
      { clipPath: "inset(0% 50% 0% 50%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut", stagger: 0.12, scrollTrigger: { trigger: el.querySelector("[data-swatches]"), start: "top 85%", once: true } },
    );
    return () => {
      gsap.ticker.remove(tick);
      st.kill();
    };
  }, root);

  const row = "LINEN · WOOL · SELVEDGE DENIM · MERINO · SUEDE · POPLIN · CANVAS · ";

  return (
    <section ref={root} className="theme-char relative overflow-hidden" aria-labelledby="fabric-title">
      <div className="relative h-[80svh] min-h-[32rem] overflow-hidden md:h-[100svh]">
        <Image src="/video/fabric-poster.jpg" alt="" fill sizes="100vw" className="object-cover opacity-70" />
        {load && (
          <video ref={vid} className="absolute inset-0 h-full w-full object-cover opacity-70" src="/video/fabric.mp4" muted loop playsInline preload="none" poster="/video/fabric-poster.jpg" aria-hidden="true" />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(21_21_19/0.15),rgb(21_21_19/0.75))]" />
        <div className="absolute inset-0 flex flex-col justify-center gap-2 md:gap-4" aria-hidden="true">
          {[0, 1].map((i) => (
            <div key={i} className="overflow-hidden">
              <div data-row className="flex w-max whitespace-nowrap font-display text-[clamp(3.5rem,11vw,10rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.04em]">
                <span className={i ? "text-transparent [-webkit-text-stroke:1.5px_var(--color-bone)]" : ""}>{row}</span>
                <span className={i ? "text-transparent [-webkit-text-stroke:1.5px_var(--color-bone)]" : ""}>{row}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="container-x absolute inset-x-0 bottom-0 pb-10">
          <h2 id="fabric-title" className="t-mono text-bone/85">
            ( 05 ) Cloth first
          </h2>
          <p className="mt-2 max-w-md text-bone/90">We buy fabric before we design. If a cloth doesn&apos;t get better with ten years of wear, it doesn&apos;t make the table.</p>
        </div>
      </div>
      <div data-swatches className="container-x grid grid-cols-2 gap-3 py-16 md:grid-cols-4 md:py-24">
        {FABRICS.map((f) => (
          <figure key={f.t} className="group">
            <div data-shutter className="media aspect-square overflow-hidden rounded-[2px]">
              <Image src={f.img} alt={`${f.t} fabric close-up`} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-transform duration-[1.4s] group-hover:scale-110" />
            </div>
            <figcaption className="mt-3">
              <span className="font-display text-xl font-bold uppercase">{f.t}</span>
              <span className="mt-1 block text-sm text-mist">{f.o}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
