"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { gsap, useIdleGSAP, prefersReducedMotion, isPhone } from "@/lib/gsap";
import { cv } from "@/lib/cv";
import { useClothScene } from "@/lib/use-cloth-scene";
import type { ClothScene } from "@/components/fx/cloth/ClothScene";
import { FABRICS, type FabricId } from "@/content/fabrics";

/**
 * Scene 6 — fabric in motion. A cloth film plays behind two marquee rows
 * whose speed and skew follow your scroll velocity; below, the swatch table:
 * on desktop a real swatch on two clips that re-hangs as linen, wool, denim
 * or knit (its own weight, stiffness and stretch) and can be pulled; phones
 * get the four cloths as photos with the same words.
 */
export function FabricReel({ cloth3D = true }: { cloth3D?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);

  // Only fetch the film when the section approaches, and never on phones (they keep the poster).
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion() || isPhone()) return;
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
      el.querySelectorAll("[data-pick]"),
      { opacity: 0, x: 40 },
      { opacity: 1, x: 0, duration: 1.1, stagger: 0.08, scrollTrigger: { trigger: el.querySelector("[data-swatches]"), start: "top 75%", once: true } },
    );
    return () => {
      gsap.ticker.remove(tick);
      st.kill();
    };
  }, root);

  const row = "LINEN · WOOL · SELVEDGE DENIM · MERINO · SUEDE · POPLIN · CANVAS · ";

  return (
    <section ref={root} {...cv("fabric")} className="theme-char relative overflow-hidden" aria-labelledby="fabric-title">
      <div className="relative aspect-[4/5] overflow-hidden md:aspect-auto md:h-[100svh] md:min-h-[32rem]">
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
            ( 06 ) Cloth first
          </h2>
          <p className="mt-2 max-w-md text-bone/90">We buy fabric before we design. If a cloth doesn&apos;t get better with ten years of wear, it doesn&apos;t make the table.</p>
        </div>
      </div>
      <div data-swatches className="container-x py-16 md:py-24">
        <SwatchTable cloth3D={cloth3D} />
        {/* phones and tablets: the four cloths as photos, same words */}
        <h3 className="mb-6 font-display text-3xl font-extrabold uppercase leading-[0.9] tracking-[-0.03em] lg:hidden">Feel the cloth</h3>
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 lg:hidden">
          {FABRICS.map((f) => (
            <figure key={f.id}>
              <div className="media aspect-square overflow-hidden rounded-[2px]">
                <Image src={f.img} alt={`${f.t} fabric close-up`} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
              </div>
              <figcaption className="mt-3">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-display text-xl font-bold uppercase">{f.t}</span>
                  <span className="t-mono text-[0.68rem] text-mist">{f.weight}</span>
                </span>
                <span className="mt-1 block text-sm text-mist">{f.o}</span>
                <span className="mt-1 block text-sm text-bone/80">{f.feel}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

const still = (base: string, ext: string) => `${base}-800.${ext} 800w, ${base}-1200.${ext} 1200w`;

/** Desktop: one swatch on two clips. Pick a cloth and it re-hangs with its own weight; pull it. */
function SwatchTable({ cloth3D }: { cloth3D: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [fabric, setFabric] = useState<FabricId>("linen");
  const [grabbing, setGrabbing] = useState(false);
  const picked = useRef(fabric);
  const active = FABRICS.find((f) => f.id === fabric)!;

  const { scene, live } = useClothScene({
    mode: "swatch",
    enabled: cloth3D,
    canvas,
    host,
    fabric: () => picked.current,
    attach: (s: ClothScene) => {
      const cv = canvas.current!;
      const at = (e: PointerEvent) => {
        const r = cv.getBoundingClientRect();
        return [((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1] as const;
      };
      let held = false;
      const down = (e: PointerEvent) => {
        if (e.button !== 0) return;
        const [x, y] = at(e);
        if (!s.grab(x, y)) return;
        held = true;
        setGrabbing(true);
        cv.setPointerCapture(e.pointerId);
      };
      const move = (e: PointerEvent) => {
        const [x, y] = at(e);
        if (held) s.drag(x, y);
        else s.setPointer(x, y, true);
      };
      const up = () => {
        if (!held) return;
        held = false;
        setGrabbing(false);
        s.release();
      };
      const leave = () => !held && s.setPointer(0, 0, false);
      cv.addEventListener("pointerdown", down);
      cv.addEventListener("pointermove", move, { passive: true });
      cv.addEventListener("pointerup", up);
      cv.addEventListener("pointercancel", up);
      cv.addEventListener("pointerleave", leave);
      // scrolled into view: the swatch is tossed once, so you see how it moves
      const io = new IntersectionObserver(
        ([en]) => {
          if (!en.isIntersecting) return;
          s.wake();
          io.disconnect();
        },
        { threshold: 0.5 },
      );
      io.observe(cv);
      return () => {
        io.disconnect();
        cv.removeEventListener("pointerdown", down);
        cv.removeEventListener("pointermove", move);
        cv.removeEventListener("pointerup", up);
        cv.removeEventListener("pointercancel", up);
        cv.removeEventListener("pointerleave", leave);
      };
    },
  });

  const pick = (id: FabricId) => {
    picked.current = id;
    setFabric(id);
    scene.current?.setFabric(id);
  };

  return (
    <div className="hidden grid-cols-12 items-center gap-12 lg:grid">
      <div ref={host} className="relative col-span-7 aspect-[6/5] [mask-image:radial-gradient(ellipse_50%_52%_at_50%_47%,#000_58%,transparent_100%)]">
        <picture key={fabric}>
          <source type="image/avif" srcSet={still(active.still, "avif")} sizes="58vw" />
          <img
            src={`${active.still}-800.webp`}
            srcSet={still(active.still, "webp")}
            sizes="58vw"
            alt={`A swatch of ${active.t.toLowerCase()} hanging from two brass clips`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
        {cloth3D && (
          <canvas
            ref={canvas}
            aria-hidden="true"
            data-cursor={grabbing ? undefined : "Pull"}
            className={clsx("absolute inset-0 h-full w-full touch-none transition-opacity duration-[1400ms]", live ? "opacity-100" : "opacity-0", grabbing ? "cursor-grabbing" : "cursor-grab")}
          />
        )}
      </div>
      <div className="col-span-5">
        <h3 className="font-display text-[clamp(2rem,3.4vw,3.25rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.03em]">Feel the cloth</h3>
        <p className="mt-4 max-w-sm text-bone/80">
          {live ? "Pick a cloth: the swatch re-hangs with its real weight, stiffness and stretch. Then take hold of it and pull." : "Four cloths we cut every season. Pick one to see how it hangs."}
        </p>
        <ul className="mt-8 border-t border-line-lt" role="radiogroup" aria-label="Cloth">
          {FABRICS.map((f) => {
            const on = f.id === fabric;
            return (
              <li key={f.id} data-pick className="border-b border-line-lt">
                <button
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => pick(f.id)}
                  className={clsx("grid w-full grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-5 text-left transition-colors duration-300", on ? "text-bone" : "text-bone/55 hover:text-bone/85")}
                >
                  <span className="flex items-baseline gap-3 font-display text-[clamp(1.5rem,2.2vw,2.1rem)] font-extrabold uppercase leading-none tracking-[-0.02em]">
                    <span className={clsx("inline-block h-2.5 w-2.5 -translate-y-1 rounded-full transition-[background-color,transform] duration-500", on ? "scale-100 bg-cobalt" : "scale-50 bg-bone/30")} aria-hidden="true" />
                    {f.t}
                  </span>
                  <span className="t-mono text-[0.7rem] text-mist">{f.weight}</span>
                  <span className="col-span-2 pl-[1.4rem] text-sm text-mist">{f.o}</span>
                  <span className={clsx("col-span-2 pl-[1.4rem] text-sm transition-colors duration-500", on ? "text-bone/85" : "text-mist/70")}>{f.feel}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
