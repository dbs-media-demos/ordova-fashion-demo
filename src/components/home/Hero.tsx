"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { Ring } from "@/components/brand/Logo";
import { gsap, ScrollTrigger, useIdleGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useClothScene } from "@/lib/use-cloth-scene";
import type { ClothScene } from "@/components/fx/cloth/ClothScene";
import { IconArrow, IconPhone } from "@/components/ui/Icons";
import { Stars } from "@/components/ui/Stars";
import { useBiz } from "@/components/preview/BizContext";
import { telOf } from "@/lib/biz-core";
import { heroName } from "@/lib/hero-name";

/** Counter (inner) radius of the ring as a fraction of its box: r 38.5 − stroke 21/2 = 28 of 100. */
const COUNTER = 0.28;
const DESKTOP = "(min-width: 1024px)";

const STILL = "/images/3d/hero-cloth";
const set = (name: string, ws: number[], ext: string) => ws.map((w) => `${name}-${w}.${ext} ${w}w`).join(", ");
const WIDE_AVIF = set(STILL, [1100, 1600, 2400], "avif");
const WIDE_WEBP = set(STILL, [1100, 1600, 2400], "webp");
const PHONE_AVIF = set(`${STILL}-phone`, [750, 1000], "avif");
const PHONE_WEBP = set(`${STILL}-phone`, [750, 1000], "webp");

/**
 * Signature 1 — the Caliche cloth.
 * Two lengths of the FW26 cloth (clay linen, moss wool) hang from brass clips in the studio, in
 * real time on desktop: a breeze keeps them breathing, the cursor moves the air, and the scroll
 * pushes the camera in while a draught lifts them — then the dive goes through the first O of the
 * wordmark into the collection. Phones and every non-3D screen get a still rendered from the same
 * scene (and zero bytes of three.js), stacked: photo, name, rating, Shop and Call.
 */
export function Hero() {
  const biz = useBiz();
  const pf = biz.preview ? false : undefined;
  // A preview: the business's name in the wordmark's place, its town and the season without Texas
  const name = biz.preview ? heroName(biz.shortName) : null;
  const place = biz.preview ? [biz.area, biz.address.region].filter(Boolean).join(", ") : "Bishop Arts, Dallas · Est. 2019";
  const named = biz.preview ? "Named for pale earth" : "Named for the pale Texas earth";
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const word = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLSpanElement>(null);
  const win = useRef<HTMLDivElement>(null);
  const winImg = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const finale = useRef<HTMLDivElement>(null);

  const { live } = useClothScene({
    mode: "hero",
    canvas,
    host: root,
    holdQueue: true,
    attach: (s: ClothScene) => {
      const sec = root.current!;
      const st = stage.current!;
      const onScroll = () => {
        const span = sec.offsetHeight - window.innerHeight;
        s.setProgress(span > 0 ? (window.scrollY - sec.offsetTop) / span : 0);
      };
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        const r = st.getBoundingClientRect();
        s.setPointer(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1, true);
      };
      const onLeave = () => s.setPointer(0, 0, false);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      st.addEventListener("pointermove", onMove, { passive: true });
      st.addEventListener("pointerleave", onLeave);
      // the first seconds on screen: a draught through the studio
      const t = window.setTimeout(() => s.wake(), 250);
      return () => {
        window.clearTimeout(t);
        window.removeEventListener("scroll", onScroll);
        st.removeEventListener("pointermove", onMove);
        st.removeEventListener("pointerleave", onLeave);
      };
    },
  });

  // Desktop: the counter of the O blinks open into FW26, and the scroll dives through it.
  useIdleGSAP(() => {
    const sec = root.current;
    const w = word.current;
    const r = ring.current;
    const wn = win.current;
    const st = stage.current;
    if (!sec || !w || !r || !wn || !st || !window.matchMedia(DESKTOP).matches) return;
    const reduced = prefersReducedMotion();

    let geo = { cx: 0, cy: 0, r0: 0, ox: 0, oy: 0, S: 10, vw: 0, vh: 0 };
    const measure = () => {
      gsap.set(w, { clearProps: "transform" });
      const sr = st.getBoundingClientRect();
      const wr = w.getBoundingClientRect();
      const rr = r.getBoundingClientRect();
      const vw = sr.width;
      const vh = sr.height;
      const cx = rr.left - sr.left + rr.width / 2;
      const cy = rr.top - sr.top + rr.height / 2;
      const r0 = rr.width * COUNTER;
      const far = Math.hypot(vw / 2, vh / 2);
      geo = { cx, cy, r0, ox: rr.left - wr.left + rr.width / 2, oy: rr.top - wr.top + rr.height / 2, S: (far / r0) * 1.08, vw, vh };
      gsap.set(w, { transformOrigin: `${geo.ox}px ${geo.oy}px` });
    };
    measure();

    const state = { p: 0, open: 0 };
    const apply = () => {
      const { cx, cy, r0, S, vw, vh } = geo;
      const z = gsap.parseEase("power3.in")(state.p);
      const drift = gsap.parseEase("power2.inOut")(Math.min(1, state.p * 1.25));
      const s = 1 + (S - 1) * z;
      const dx = (vw / 2 - cx) * drift;
      const dy = (vh / 2 - cy) * drift;
      gsap.set(w, { x: dx, y: dy, scale: s });
      const rad = r0 * s * state.open;
      wn.style.clipPath = `circle(${rad.toFixed(1)}px at ${(cx + dx).toFixed(1)}px ${(cy + dy).toFixed(1)}px)`;
    };

    gsap.to(state, { open: 1, duration: reduced ? 0 : 1.4, ease: "expo.inOut", delay: reduced ? 0 : 0.2, onUpdate: apply });
    apply();
    gsap.set(wn, { autoAlpha: 1 });

    if (reduced) return;

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: sec,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.7,
        invalidateOnRefresh: true,
        onRefreshInit: measure,
        onRefresh: apply,
      },
    });
    tl.to(state, { p: 1, duration: 1, onUpdate: apply }, 0)
      .to(copy.current, { y: -60, opacity: 0, duration: 0.18 }, 0)
      .fromTo(winImg.current, { scale: 1.35 }, { scale: 1, duration: 1 }, 0)
      // y: 0 clears the server's translateY(120%), which GSAP would otherwise keep as a pixel offset
      .fromTo(finale.current!.querySelectorAll("[data-fin]"), { y: 0, yPercent: 120 }, { y: 0, yPercent: 0, stagger: 0.03, duration: 0.18, ease: "power2.out" }, 0.78)
      .fromTo(finale.current!.querySelectorAll("[data-fin-fade]"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.15 }, 0.85);

    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(st);
    return () => ro.disconnect();
  }, root);

  const rating = biz.rating && (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-bone/90">
      <Stars value={biz.rating.value} size={13} className="text-[#e9c46a]" />
      <span>
        <strong className="font-semibold text-bone">{biz.rating.value}</strong> · {biz.rating.count} Google reviews
      </span>
    </p>
  );

  return (
    <section ref={root} data-hero className="theme-char relative pt-[var(--header-h)] lg:pt-0 deskl:motion-safe:h-[250svh]" aria-labelledby="hero-title">
      <div ref={stage} className="relative lg:sticky lg:top-0 lg:h-[100svh] lg:overflow-hidden">
        {/* Layer 1 — the cloth: a still from the scene (the LCP image), the live canvas fades in over it on desktop */}
        <div className="relative h-[min(50svh,112vw)] overflow-hidden lg:absolute lg:inset-0 lg:h-auto">
          <link rel="preload" as="image" type="image/avif" imageSrcSet={PHONE_AVIF} imageSizes="100vw" media="(max-width: 1023px)" fetchPriority="high" />
          <link rel="preload" as="image" type="image/avif" imageSrcSet={WIDE_AVIF} imageSizes="100vw" media={DESKTOP} fetchPriority="high" />
          <picture>
            <source media={DESKTOP} type="image/avif" srcSet={WIDE_AVIF} sizes="100vw" />
            <source media={DESKTOP} type="image/webp" srcSet={WIDE_WEBP} sizes="100vw" />
            <source type="image/avif" srcSet={PHONE_AVIF} sizes="100vw" />
            <source type="image/webp" srcSet={PHONE_WEBP} sizes="100vw" />
            <img
              src={`${STILL}-phone-750.webp`}
              alt="FW26 Caliche cloth in the Ordova studio: clay linen and moss wool hanging from brass clips"
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-[50%_55%] lg:object-center"
            />
          </picture>
          <canvas
            ref={canvas}
            aria-hidden="true"
            className={clsx("absolute inset-0 hidden h-full w-full transition-opacity duration-[1400ms] ease-out lg:block", live ? "opacity-100" : "opacity-0")}
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(21_21_19/0.35)_0%,transparent_30%,transparent_62%,rgb(21_21_19/0.6)_100%)] lg:bg-[linear-gradient(180deg,rgb(21_21_19/0.62)_0%,rgb(21_21_19/0.08)_24%,rgb(21_21_19/0.05)_58%,rgb(21_21_19/0.72)_100%)]" />

          <div className="absolute inset-x-0 top-0 bg-[linear-gradient(180deg,rgb(21_21_19/0.7),transparent)] px-4 pb-10 pt-4 text-bone lg:hidden">
            <p className="t-mono text-[0.68rem]">FW26 · Drop 02 — &ldquo;Caliche&rdquo; is in the shop</p>
            <p className="mt-1 max-w-[34ch] text-[0.8rem] leading-snug text-bone/85">{named}: chalk, clay and dry-grass tones in linen, wool and raw denim.</p>
          </div>

          {/* Layer 2 — the window into FW26, clipped to the O's counter (desktop) */}
          <div ref={win} className="invisible absolute inset-0 z-[2] hidden lg:block" style={{ clipPath: "circle(0px at 50% 50%)" }} aria-hidden="true">
            <div ref={winImg} className="absolute inset-0 will-change-transform">
              <Image src="/images/ed/fw26-caliche.jpg" alt="" fill sizes="100vw" quality={70} className="object-cover" />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgb(21_21_19/0.6))]" />
          </div>

          {/* Layer 3 — the oversized wordmark */}
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-[3] lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2">
            <div ref={word} className="flex justify-center will-change-transform">
              {name ? (
                <h1
                  id="hero-title"
                  className="flex items-center whitespace-pre font-display font-extrabold uppercase leading-[0.8] tracking-[-0.045em] text-bone"
                  style={{ fontSize: name.fit(14.2, 90) }}
                >
                  <span aria-hidden="true">{name.before}</span>
                  <span ref={ring} className={clsx("block", name.ringFirst && "mr-[0.3em]")}>
                    <Ring className="h-[0.74em] w-[0.74em]" />
                  </span>
                  <span aria-hidden="true">{name.after}</span>
                  <span className="sr-only">
                    {biz.name}
                    {biz.area ? ` — clothing boutique, ${biz.area}` : ""}
                  </span>
                </h1>
              ) : (
                <h1 id="hero-title" className="flex items-center font-display text-[14.2vw] font-extrabold uppercase leading-[0.8] tracking-[-0.045em] text-bone">
                  <span ref={ring} className="block">
                    <Ring className="h-[0.74em] w-[0.74em]" />
                  </span>
                  <span aria-hidden="true">rdova</span>
                  <span className="sr-only">Ordova — concept store and small-batch label, Bishop Arts, Dallas</span>
                </h1>
              )}
            </div>
          </div>
        </div>

        {/* Layer 4 — copy & CTAs: stacked under the photo on phones, around the scene on desktop */}
        <div ref={copy} className="container-x relative z-[4] pb-7 pt-5 lg:absolute lg:inset-0 lg:flex lg:flex-col lg:justify-between lg:pb-16 lg:pt-[calc(var(--header-h)+1.25rem)]">
          <div className="hidden items-start justify-between gap-6 lg:flex">
            <p className="t-mono max-w-[22ch] text-bone/90">FW26 · Drop 02 — &ldquo;Caliche&rdquo; is in the shop</p>
            <div className="flex flex-col items-end gap-2 text-right">
              {place && <p className="t-mono text-bone/90">{place}</p>}
              {rating}
              {biz.phone && (
                <a href={telOf(biz)} className="t-mono link-u text-bone">
                  {biz.phoneDisplay}
                </a>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-md">
              <p className="text-balance text-[1.08rem] leading-snug text-bone lg:text-lg">
                Fewer, better clothes — cut and sewn a mile from the shop, in runs of thirty.
              </p>
              <div className="mt-3 lg:hidden">{rating}</div>
              {place && <p className="t-mono mt-1 text-[0.68rem] text-bone/70 lg:hidden">{place}</p>}
              <div className="mt-5 grid grid-cols-2 gap-2 lg:flex lg:flex-wrap">
                <Link href="/collections/new-in" prefetch={pf} className="btn btn-light max-lg:min-h-[2.75rem] max-lg:px-3 max-lg:text-[0.68rem]">
                  Shop new in <IconArrow size={16} />
                </Link>
                {biz.phone && (
                  <a href={telOf(biz)} className="btn btn-ghost btn-sm px-3 tracking-[0.04em] text-bone lg:hidden" aria-label={`Call the shop, ${biz.phoneDisplay}`}>
                    <IconPhone size={15} /> {biz.phoneDisplay}
                  </a>
                )}
                <Link href="/lookbook" prefetch={pf} className="btn btn-ghost hidden text-bone lg:inline-flex">
                  The lookbook
                </Link>
              </div>
            </div>
            <p className="t-mono hidden text-right text-bone/85 lg:block">
              Move through the cloth
              <br />
              Scroll — step through the {name && !name.hasO ? "ring" : "O"}
            </p>
          </div>
        </div>

        {/* Finale — inside the window (desktop scroll) */}
        <div ref={finale} className="container-x pointer-events-none absolute inset-x-0 bottom-0 z-[5] hidden pb-14 text-bone lg:block">
          <p className="t-mono overflow-hidden">
            <span data-fin className="block" style={{ transform: "translateY(120%)" }}>
              Now in the shop — FW26 · Drop 02
            </span>
          </p>
          <p className="mt-3 flex overflow-hidden font-display text-[10.5vw] font-extrabold uppercase leading-[0.82] tracking-[-0.04em]" aria-hidden="true">
            {"Caliche".split("").map((c, i) => (
              <span key={i} data-fin className="inline-block" style={{ transform: "translateY(120%)" }}>
                {c}
              </span>
            ))}
          </p>
          <div data-fin-fade className="pointer-events-auto mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 opacity-0">
            <p className="max-w-sm text-bone/90">{named}: chalk, clay and dry-grass tones in linen, wool and raw denim.</p>
            <Link href="/collections/new-in" prefetch={pf} className="btn btn-light" tabIndex={-1}>
              Shop Caliche <IconArrow size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
