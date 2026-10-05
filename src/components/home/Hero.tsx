"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Ring } from "@/components/brand/Logo";
import { gsap, ScrollTrigger, useIdleGSAP, prefersReducedMotion, isCoarse } from "@/lib/gsap";
import { IconArrow, IconPause, IconPlay } from "@/components/ui/Icons";

/** Counter (inner) radius of the ring as a fraction of its box: r 38.5 − stroke 21/2 = 28 of 100. */
const COUNTER = 0.28;

/**
 * Signature 1 — Runway hero.
 * A full-bleed walk under an oversized ORDOVA. Scroll and the camera dives
 * through the first O: its counter becomes a window that opens into the
 * FW26 "Caliche" collection. The layout is a tall section with a sticky
 * stage (no GSAP pin, so nothing is re-parented after hydration).
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLSpanElement>(null);
  const win = useRef<HTMLDivElement>(null);
  const winImg = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const finale = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [videoOn, setVideoOn] = useState(false);

  // Video: desktop starts once idle; touch devices wait for the first interaction or 6 s (keeps LCP on the poster).
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;
    let done = false;
    const start = () => {
      if (done) return;
      done = true;
      setVideoOn(true);
    };
    if (isCoarse()) {
      const t = window.setTimeout(start, 6000);
      const evs = ["touchstart", "scroll", "pointerdown"] as const;
      evs.forEach((e) => window.addEventListener(e, start, { once: true, passive: true }));
      return () => {
        window.clearTimeout(t);
        evs.forEach((e) => window.removeEventListener(e, start));
      };
    }
    const t = window.setTimeout(start, 1800);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const v = video.current;
    if (!videoOn || !v) return;
    v.play().catch(() => {});
  }, [videoOn]);

  useIdleGSAP(() => {
    const sec = root.current;
    const w = word.current;
    const r = ring.current;
    const wn = win.current;
    if (!sec || !w || !r || !wn || !stage.current) return;
    const reduced = prefersReducedMotion();

    let geo = { cx: 0, cy: 0, r0: 0, ox: 0, oy: 0, S: 10, vw: 0, vh: 0 };
    const measure = () => {
      gsap.set(w, { clearProps: "transform" });
      const st = stage.current!.getBoundingClientRect();
      const wr = w.getBoundingClientRect();
      const rr = r.getBoundingClientRect();
      const vw = st.width;
      const vh = st.height;
      const cx = rr.left - st.left + rr.width / 2;
      const cy = rr.top - st.top + rr.height / 2;
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

    // The counter "blinks open" into a window shortly after load.
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
      .fromTo(finale.current!.querySelectorAll("[data-fin]"), { yPercent: 120 }, { yPercent: 0, stagger: 0.03, duration: 0.18, ease: "power2.out" }, 0.78)
      .fromTo(finale.current!.querySelectorAll("[data-fin-fade]"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.15 }, 0.85);

    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(stage.current);
    return () => ro.disconnect();
  }, root);

  return (
    <section ref={root} className="relative h-[100svh] motion-safe:h-[250svh]" aria-labelledby="hero-title">
      <div ref={stage} className="theme-char sticky top-0 h-[100svh] overflow-hidden">
        {/* Layer 1 — runway film (poster is the LCP image) */}
        <div className="absolute inset-0">
          <Image
            src="/images/ed/hero-poster.jpg"
            alt=""
            fill
            preload
            sizes="100vw"
            quality={70}
            className="object-cover object-[50%_30%]"
          />
          {videoOn && (
            <video
              ref={video}
              className={`absolute inset-0 h-full w-full object-cover object-[50%_30%] transition-opacity duration-1000 ${playing ? "opacity-100" : "opacity-0"}`}
              src="/video/runway.mp4"
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
              onPlaying={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(21_21_19/0.55)_0%,rgb(21_21_19/0.15)_38%,rgb(21_21_19/0.25)_62%,rgb(21_21_19/0.78)_100%)]" />
        </div>

        {/* Layer 2 — the window into FW26, clipped to the O's counter */}
        <div ref={win} className="invisible absolute inset-0 z-[2]" style={{ clipPath: "circle(0px at 50% 50%)" }} aria-hidden="true">
          <div ref={winImg} className="absolute inset-0 will-change-transform">
            <Image src="/images/ed/fw26-caliche.jpg" alt="" fill sizes="100vw" quality={70} className="object-cover" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgb(21_21_19/0.6))]" />
        </div>

        {/* Layer 3 — the oversized wordmark */}
        <div className="absolute inset-x-0 top-[49%] z-[3] -translate-y-1/2 md:top-[50%]">
          <div ref={word} className="flex justify-center will-change-transform">
            <h1 id="hero-title" className="flex items-center font-display text-[14.2vw] font-extrabold uppercase leading-[0.8] tracking-[-0.045em] text-bone">
              <span className="anim-mask">
                <span ref={ring} className="block" style={{ "--d": "0.05s" } as React.CSSProperties}>
                  <Ring className="h-[0.74em] w-[0.74em]" />
                </span>
              </span>
              {"rdova".split("").map((c, i) => (
                <span key={i} className="anim-mask" aria-hidden="true">
                  <span style={{ "--d": `${0.1 + i * 0.05}s` } as React.CSSProperties}>{c}</span>
                </span>
              ))}
              <span className="sr-only">Ordova — concept store and small-batch label, Dallas</span>
            </h1>
          </div>
        </div>

        {/* Layer 4 — copy & CTAs */}
        <div ref={copy} className="container-x absolute inset-0 z-[4] flex flex-col justify-between pb-24 pt-[calc(var(--header-h)+1.25rem)] md:pb-20">
          <div className="anim-fade flex items-start justify-between gap-6" style={{ "--d": "0.4s" } as React.CSSProperties}>
            <p className="t-mono max-w-[22ch] text-bone/90">FW26 · Drop 02 — &ldquo;Caliche&rdquo; is in the shop</p>
            <p className="t-mono hidden text-right text-bone/90 md:block">
              Bishop Arts, Dallas
              <br />
              Est. 2019
            </p>
          </div>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="anim-fade max-w-md" style={{ "--d": "0.55s" } as React.CSSProperties}>
              <p className="text-balance text-[1.05rem] leading-snug text-bone md:text-lg">
                Fewer, better clothes — cut and sewn a mile from the shop, in runs of thirty.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href="/collections/new-in" className="btn btn-light">
                  Shop new in <IconArrow size={16} />
                </Link>
                <Link href="/lookbook" className="btn btn-ghost text-bone">
                  The lookbook
                </Link>
              </div>
            </div>
            <div className="anim-fade hidden items-center gap-4 md:flex" style={{ "--d": "0.7s" } as React.CSSProperties}>
              {videoOn && (
                <button
                  type="button"
                  className="icon-btn border border-line-lt text-bone"
                  aria-label={playing ? "Pause background film" : "Play background film"}
                  onClick={() => (playing ? video.current?.pause() : video.current?.play())}
                >
                  {playing ? <IconPause size={14} /> : <IconPlay size={14} />}
                </button>
              )}
              <p className="t-mono text-bone/85">Scroll — step through the O</p>
            </div>
          </div>
        </div>

        {/* Finale — inside the window */}
        <div ref={finale} className="container-x pointer-events-none absolute inset-x-0 bottom-0 z-[5] pb-28 text-bone md:pb-14">
          <p className="t-mono overflow-hidden">
            <span data-fin className="block" style={{ transform: "translateY(120%)" }}>
              Now in the shop — FW26 · Drop 02
            </span>
          </p>
          <p className="mt-3 flex overflow-hidden font-display text-[12vw] font-extrabold uppercase leading-[0.82] tracking-[-0.04em] md:text-[10.5vw]" aria-hidden="true">
            {"Caliche".split("").map((c, i) => (
              <span key={i} data-fin className="inline-block" style={{ transform: "translateY(120%)" }}>
                {c}
              </span>
            ))}
          </p>
          <div data-fin-fade className="pointer-events-auto mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 opacity-0">
            <p className="max-w-sm text-bone/90">Named for the pale Texas earth: chalk, clay and dry-grass tones in linen, wool and raw denim.</p>
            <Link href="/collections/new-in" className="btn btn-light" tabIndex={-1}>
              Shop Caliche <IconArrow size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
