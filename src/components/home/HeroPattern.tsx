"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Link from "next/link";
import clsx from "clsx";
import { getImageProps } from "next/image";
import { Ring } from "@/components/brand/Logo";
import { gsap, useIdleGSAP, prefersReducedMotion, onIdle } from "@/lib/gsap";
import { IconArrow, IconPhone } from "@/components/ui/Icons";
import { Stars } from "@/components/ui/Stars";
import { useBiz } from "@/components/preview/BizContext";
import { telOf } from "@/lib/biz-core";
import { heroName } from "@/lib/hero-name";
import { loaderShowing, whenLoaderDone } from "@/lib/loader";

/*
 * The /v2 hero: the homepage without any 3D (no three.js, no WebGL; SVG, CSS and GSAP only).
 *
 * Signature 1, drawn by hand — "chalked, cut, sewn". A length of the Caliche clay linen lies on the
 * cutting table. In the first seconds the overshirt's front pattern draws itself on it in tailor's
 * chalk (cut line, notches, pocket, buttons, grainline, the piece's label), then a needle runs the
 * stitch line round. The scroll cuts it: the offcut falls away, the piece lifts off the table, and
 * the cloth inside the outline becomes the finished FW26 shirt. Phones get the same first screen
 * as /: the still of the Caliche cloth, stacked with the name, rating, Shop and Call.
 */

const DESKTOP = "(min-width: 1024px)";
const SCENE = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";
/** Phones and tablets never fetch the table's photos: their <img> is this, the real ones are desktop <source>s. */
const BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const STILL = "/images/3d/hero-cloth";
const set = (name: string, ws: number[], ext: string) => ws.map((w) => `${name}-${w}.${ext} ${w}w`).join(", ");
const PHONE_AVIF = set(`${STILL}-phone`, [750, 1000], "avif");
const PHONE_WEBP = set(`${STILL}-phone`, [750, 1000], "webp");

const LINEN_AVIF = "/images/v2/clay-linen.avif";
const LINEN_WEBP = "/images/v2/clay-linen.webp";
const PANEL_SIZES = "(min-width: 1024px) 44vh, 1px";
const garment = getImageProps({ src: "/images/ed/fw26-caliche.jpg", alt: "", width: 2400, height: 1600, quality: 70, sizes: PANEL_SIZES }).props;

/* The overshirt's front, in a 600 × 800 pattern sheet: neck point, shoulder, armhole, side seam, hem, centre front with the button stand. */
const CUT = "M230,62 L478,124 C462,206 474,296 540,318 L552,738 Q336,760 84,744 L84,212 L110,212 C176,210 224,148 230,62 Z";
/** The stitch line, 7% inside the cut line (the seam allowance). */
const SEAM_T = "translate(316 420) scale(0.925) translate(-316 -420)";
const NOTCHES = "M478,243 h-17 M546,520 h-17 M354,93 l-4,16 M327,750 v-17 M84,470 h17";
const GRAIN = "M490,430 V690 M490,430 l-8,17 M490,430 l8,17 M490,690 l-8,-17 M490,690 l8,-17";
const BUTTONS = [282, 378, 474, 570, 666];

const t = (s: number, d?: number) => ({ "--t": `${s}s`, ...(d ? { "--d": `${d}s` } : {}) }) as CSSProperties;

export function HeroPattern() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const sheen = useRef<HTMLDivElement>(null);
  const offcut = useRef<HTMLDivElement>(null);
  const piece = useRef<HTMLDivElement>(null);
  const shadow = useRef<SVGSVGElement>(null);
  const marks = useRef<SVGSVGElement>(null);
  const gOuter = useRef<HTMLDivElement>(null);
  const gInner = useRef<HTMLDivElement>(null);
  const finale = useRef<HTMLDivElement>(null);
  const steps = useRef<HTMLOListElement>(null);
  const garmentImg = useRef<HTMLImageElement>(null);
  const needleSvg = useRef<SVGSVGElement>(null);
  const biz = useBiz();
  const pf = biz.preview ? false : undefined;
  // A preview: the business's name in the wordmark's place, its town, and the season without Dallas
  const name = biz.preview ? heroName(biz.shortName) : null;
  const town = biz.preview ? [biz.area, biz.address.region].filter(Boolean).join(", ") : "Bishop Arts, Dallas";

  // A preview that opens on the lead's logo: the needle (SVG timing, which CSS can't pause) waits too,
  // then starts from the top as the loader leaves, with the chalk lines (paused in CSS meanwhile).
  useEffect(() => {
    const svg = needleSvg.current;
    if (!svg || !loaderShowing()) return;
    svg.pauseAnimations();
    return whenLoaderDone(() => {
      svg.setCurrentTime(0);
      svg.unpauseAnimations();
    });
  }, []);

  // Decode the shirt photo while the browser is idle after load, so its first reveal mid-scroll never stalls a frame.
  useEffect(() => {
    if (!window.matchMedia(DESKTOP).matches) return;
    let cancel = () => {};
    const go = () => (cancel = onIdle(() => void garmentImg.current?.decode().catch(() => {}), 2500));
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => {
      window.removeEventListener("load", go);
      cancel();
    };
  }, []);

  // Desktop with a mouse: the table tilts under the cursor and the light follows it; the scroll cuts and sews.
  useIdleGSAP(() => {
    const sec = root.current;
    const st = stage.current;
    if (!sec || !st || !window.matchMedia(SCENE).matches || prefersReducedMotion()) return;

    const rx = gsap.quickTo(tilt.current, "rotationX", { duration: 0.9, ease: "power3.out" });
    const ry = gsap.quickTo(tilt.current, "rotationY", { duration: 0.9, ease: "power3.out" });
    const sx = gsap.quickTo(sheen.current, "xPercent", { duration: 1.2, ease: "power3.out" });
    const sy = gsap.quickTo(sheen.current, "yPercent", { duration: 1.2, ease: "power3.out" });
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = st.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      ry(nx * 7);
      rx(-ny * 5);
      sx(nx * 60);
      sy(ny * 60);
    };
    const onLeave = () => {
      rx(0);
      ry(0);
      sx(0);
      sy(0);
    };
    st.addEventListener("pointermove", onMove, { passive: true });
    st.addEventListener("pointerleave", onLeave);

    const items = steps.current ? Array.from(steps.current.children) : [];
    let step = -1;
    const mark = (p: number) => {
      const s = p < 0.3 ? 0 : p < 0.68 ? 1 : 2;
      if (s === step) return;
      step = s;
      items.forEach((el, i) => el.toggleAttribute("data-on", i === s));
    };
    mark(0);

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.7, onUpdate: (self) => mark(self.progress) },
    });
    // 01 → 02: the shears go round, the offcut falls away and the piece lifts off the table, square to you
    tl.to(offcut.current, { yPercent: 10, rotation: -7, opacity: 0, duration: 0.34, ease: "power2.in" }, 0)
      .to(piece.current, { rotation: 2.5, scale: 1.04, duration: 0.34, ease: "power2.inOut" }, 0)
      .to(shadow.current, { opacity: 1, duration: 0.3 }, 0.04)
      // 02 → 03: the chalk marks go, and the cloth inside the outline becomes the finished shirt
      .to(marks.current, { opacity: 0, duration: 0.16 }, 0.36)
      .fromTo(gOuter.current, { y: 0, yPercent: 100 }, { y: 0, yPercent: 0, duration: 0.36, ease: "power2.inOut" }, 0.36)
      .fromTo(gInner.current, { y: 0, yPercent: -100, scale: 1.16 }, { y: 0, yPercent: 0, scale: 1, duration: 0.36, ease: "power2.inOut" }, 0.36)
      .fromTo(finale.current, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.14, ease: "power2.out" }, 0.78);

    return () => {
      st.removeEventListener("pointermove", onMove);
      st.removeEventListener("pointerleave", onLeave);
    };
  }, root);

  const rating = biz.rating && (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-bone/90">
      <Stars value={biz.rating.value} size={13} className="text-[#e9c46a]" />
      <span>
        <strong className="font-semibold text-bone">{biz.rating.value}</strong> · {biz.rating.count} Google reviews
      </span>
    </p>
  );
  const srName = (
    <span className="sr-only">
      {biz.preview ? `${biz.name}${biz.area ? ` — clothing boutique, ${biz.area}` : ""}` : "Ordova — concept store and small-batch label, Bishop Arts, Dallas"}
    </span>
  );
  /** The wordmark: ORDOVA, or on a preview their name with its first O as the ring */
  const word = (max: number, width: number, className: string) =>
    name ? (
      <h1 className={clsx(className, "whitespace-pre")} style={{ fontSize: name.fit(max, width) }}>
        <span aria-hidden="true">{name.before}</span>
        <span className={clsx("block", name.ringFirst && "mr-[0.3em]")}>
          <Ring className="h-[0.74em] w-[0.74em]" />
        </span>
        <span aria-hidden="true">{name.after}</span>
        {srName}
      </h1>
    ) : (
      <h1 className={className} style={{ fontSize: `${max}vw` }}>
        <span className="block">
          <Ring className="h-[0.74em] w-[0.74em]" />
        </span>
        <span aria-hidden="true">rdova</span>
        {srName}
      </h1>
    );

  return (
    <section ref={root} className="theme-char relative pt-[var(--header-h)] lg:pt-0 deskl:motion-safe:h-[230svh]" data-hero aria-label={biz.preview ? [biz.name, biz.area].filter(Boolean).join(", ") : "Ordova, Bishop Arts, Dallas"}>
      {/* ---- Phones and tablets: the same first screen as / ---- */}
      <div className="lg:hidden">
        <div className="relative h-[min(50svh,112vw)] overflow-hidden">
          <link rel="preload" as="image" type="image/avif" imageSrcSet={PHONE_AVIF} imageSizes="100vw" media="(max-width: 1023px)" fetchPriority="high" />
          <picture>
            <source media={DESKTOP} srcSet={BLANK} />
            <source type="image/avif" srcSet={PHONE_AVIF} sizes="100vw" />
            <source type="image/webp" srcSet={PHONE_WEBP} sizes="100vw" />
            <img
              src={`${STILL}-phone-750.webp`}
              alt="FW26 Caliche cloth in the Ordova studio: clay linen and moss wool hanging from brass clips"
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-[50%_55%]"
            />
          </picture>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(21_21_19/0.35)_0%,transparent_30%,transparent_62%,rgb(21_21_19/0.6)_100%)]" />
          <div className="absolute inset-x-0 top-0 bg-[linear-gradient(180deg,rgb(21_21_19/0.7),transparent)] px-4 pb-10 pt-4 text-bone">
            <p className="t-mono text-[0.68rem]">FW26 · Drop 02 — &ldquo;Caliche&rdquo; is in the shop</p>
            <p className="mt-1 max-w-[34ch] text-[0.8rem] leading-snug text-bone/85">{biz.preview ? "Named for pale earth" : "Named for the pale Texas earth"}: chalk, clay and dry-grass tones in linen, wool and raw denim.</p>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-[3] flex justify-center">
            {word(14.2, 90, "flex items-center font-display font-extrabold uppercase leading-[0.8] tracking-[-0.045em] text-bone")}
          </div>
        </div>
        <div className="container-x relative z-[4] pb-7 pt-5">
          <div className="max-w-md">
            <p className="text-balance text-[1.08rem] leading-snug text-bone">Fewer, better clothes — cut and sewn a mile from the shop, in runs of thirty.</p>
            <div className="mt-3">{rating}</div>
            {town && <p className="t-mono mt-1 text-[0.68rem] text-bone/70">{biz.preview ? town : `${town} · Est. 2019`}</p>}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Link href="/collections/new-in" prefetch={pf} className="btn btn-light min-h-[2.75rem] px-3 text-[0.68rem]">
                Shop new in <IconArrow size={16} />
              </Link>
              {biz.phone && (
                <a href={telOf(biz)} className="btn btn-ghost btn-sm px-3 tracking-[0.04em] text-bone" aria-label={`Call the shop, ${biz.phoneDisplay}`}>
                  <IconPhone size={15} /> {biz.phoneDisplay}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---- Desktop: the cutting table ---- */}
      <div ref={stage} className="pat-mat relative hidden h-[100svh] overflow-hidden lg:sticky lg:top-0 lg:block">
        <link rel="preload" as="image" type="image/avif" href={LINEN_AVIF} media={DESKTOP} fetchPriority="high" />
        <div className="container-x relative flex h-full gap-[clamp(2rem,4.5vw,5rem)] pb-[8svh] pt-[calc(var(--header-h)+8svh)]">
          {/* The words: there at once, never animated in */}
          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <p className="t-mono text-bone/90">FW26 · Drop 02 — &ldquo;Caliche&rdquo; is in the shop{biz.preview ? "" : " · Est. 2019"}</p>

            <div>
              <p className="t-mono text-bone/80">{biz.preview ? `Clothing boutique${town ? ` — ${town}` : ""}` : "Concept store & small-batch label — Bishop Arts, Dallas"}</p>
              {word(6.2, 38, "mt-4 flex items-center font-display font-extrabold uppercase leading-[0.8] tracking-[-0.045em] text-bone")}
              <p className="mt-7 max-w-[30ch] text-balance text-[clamp(1.2rem,1.65vw,1.7rem)] leading-[1.25] text-bone">
                Fewer, better clothes — cut and sewn a mile from the shop, in runs of thirty.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
                {rating}
                {town && <span className="t-mono text-bone/70">{town}</span>}
              </div>
              <div className="mt-7 flex flex-wrap gap-2.5">
                <Link href="/collections/new-in" prefetch={pf} className="btn btn-light">
                  Shop new in <IconArrow size={16} />
                </Link>
                <Link href="/lookbook" prefetch={pf} className="btn btn-ghost text-bone">
                  The lookbook
                </Link>
                {biz.phone && (
                  <a href={telOf(biz)} className="btn btn-ghost text-bone" aria-label={`Call the shop, ${biz.phoneDisplay}`}>
                    <IconPhone size={15} /> {biz.phoneDisplay}
                  </a>
                )}
              </div>
            </div>

            <ol ref={steps} className="pat-steps t-mono hidden items-center gap-6 text-bone deskl:motion-safe:flex" aria-hidden="true">
              <li data-on="">01 Chalked</li>
              <li>02 Cut</li>
              <li>03 Sewn</li>
              <li className="!opacity-60">— Scroll</li>
            </ol>
          </div>

          {/* The cutting table */}
          <div className="relative aspect-[3/4] h-full flex-none [perspective:1400px]">
            <div ref={tilt} className="relative h-full w-full will-change-transform">
              <div className="absolute inset-0" style={{ transform: "rotate(-2.5deg)" }}>
                {/* the length of cloth on the table: the offcut once the piece is cut */}
                <div ref={offcut} className="pat-cloth absolute -inset-[4%] overflow-hidden will-change-[transform,opacity]">
                  <picture>
                    <source media={DESKTOP} type="image/avif" srcSet={LINEN_AVIF} />
                    <source media={DESKTOP} type="image/webp" srcSet={LINEN_WEBP} />
                    <img src={BLANK} alt="" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
                  </picture>
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgb(255_244_228/0.16),transparent_60%),linear-gradient(180deg,transparent_70%,rgb(21_21_19/0.28))]" />
                </div>

                {/* the cut piece */}
                <div ref={piece} className="absolute inset-0 will-change-transform">
                  <svg ref={shadow} viewBox="0 0 600 800" className="absolute inset-0 h-full w-full overflow-visible opacity-0 will-change-[opacity]" aria-hidden="true">
                    <defs>
                      <filter id="pat-soft" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="16" />
                      </filter>
                    </defs>
                    <path d={CUT} transform="translate(18 30)" fill="#000" opacity="0.55" filter="url(#pat-soft)" />
                    <path d={CUT} transform="translate(4 7)" fill="#000" opacity="0.35" />
                  </svg>
                  <div className="absolute inset-0 [clip-path:url(#ordova-piece)]">
                    <div className="absolute -inset-[4%]">
                      <picture>
                        <source media={DESKTOP} type="image/avif" srcSet={LINEN_AVIF} />
                        <source media={DESKTOP} type="image/webp" srcSet={LINEN_WEBP} />
                        <img src={BLANK} alt="" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
                      </picture>
                    </div>
                    <div ref={gOuter} className="absolute inset-0 overflow-hidden will-change-transform" style={{ transform: "translateY(100%)" }}>
                      <div ref={gInner} className="absolute inset-0 will-change-transform" style={{ transform: "translateY(-100%)" }}>
                        <picture>
                          <source media={DESKTOP} srcSet={garment.srcSet} sizes={PANEL_SIZES} />
                          <img ref={garmentImg} src={BLANK} alt="" decoding="async" fetchPriority="low" className="absolute inset-0 h-full w-full object-cover object-[35%_50%]" />
                        </picture>
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgb(21_21_19/0.7))]" />
                      </div>
                    </div>
                  </div>

                  {/* chalk: the marks inside the piece */}
                  <svg ref={marks} viewBox="0 0 600 800" className="pat-chalk absolute inset-0 h-full w-full overflow-visible will-change-[opacity]" aria-hidden="true">
                    <path d={NOTCHES} pathLength={1} className="pat-draw" style={t(1.15, 0.5)} />
                    <rect x="300" y="250" width="118" height="124" rx="2" className="pat-type pat-dash" style={t(1.35)} />
                    <path d={GRAIN} pathLength={1} className="pat-draw" style={t(1.5, 0.8)} />
                    <path d="M110,212 V744" className="pat-type pat-dash" style={t(1.2)} />
                    {BUTTONS.map((y, i) => (
                      <g key={y} className="pat-pop" style={t(1.55 + i * 0.09)}>
                        <circle cx="110" cy={y} r="8" />
                        <path d={`M98,${y} h24 M110,${y - 12} v24`} />
                      </g>
                    ))}
                    <g className="pat-label">
                      <text x="150" y="452" className="pat-type" style={t(1.75)}>
                        {biz.preview ? `${biz.shortName.toUpperCase().slice(0, 18)} — FW26` : "ORDOVA — FW26"}
                      </text>
                      <text x="150" y="482" className="pat-type pat-big" style={t(1.85)}>
                        CALICHE OVERSHIRT
                      </text>
                      <text x="150" y="512" className="pat-type" style={t(1.95)}>
                        FRONT · CUT 2 · SIZE M
                      </text>
                      <text x="150" y="538" className="pat-type" style={t(2.05)}>
                        CLAY LINEN · 185 G/M²
                      </text>
                      <text x="122" y="240" className="pat-type" style={t(1.3)}>
                        CF
                      </text>
                      <text x="0" y="0" transform="translate(508 598) rotate(-90)" className="pat-type" style={t(1.9)}>
                        GRAIN
                      </text>
                      <text x="316" y="242" className="pat-type" style={t(1.6)}>
                        POCKET
                      </text>
                    </g>
                  </svg>

                  {/* chalk: the cut line, then the stitches sewn round it */}
                  <svg ref={needleSvg} viewBox="0 0 600 800" className="pat-chalk absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
                    <defs>
                      <clipPath id="ordova-piece" clipPathUnits="objectBoundingBox">
                        <path d={CUT} transform="scale(0.0016667 0.00125)" />
                      </clipPath>
                      <mask id="pat-sew" maskUnits="userSpaceOnUse" x="-50" y="-50" width="700" height="900">
                        <path d={CUT} pathLength={1} className="pat-draw pat-sewing" stroke="#fff" strokeWidth="14" fill="none" style={t(1.7, 2.6)} />
                      </mask>
                    </defs>
                    <path d={CUT} pathLength={1} className="pat-draw pat-cut" style={t(0.15, 1.5)} />
                    <g transform={SEAM_T}>
                      <path d={CUT} mask="url(#pat-sew)" className="pat-stitch" />
                      <circle r="5.5" className="pat-needle" opacity="0">
                        <animateMotion path={CUT} dur="2.6s" begin="1.7s" fill="freeze" />
                        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.04;0.9;1" dur="2.8s" begin="1.7s" fill="freeze" />
                      </circle>
                    </g>
                  </svg>
                </div>
              </div>

              {/* the studio lamp: a soft light that drifts, and follows the cursor */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div ref={sheen} className="absolute -inset-1/4 will-change-transform">
                  <div className="pat-sheen absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgb(255_246_232/0.16),transparent_42%)]" />
                </div>
              </div>

              {/* 03: now in the shop */}
              <div ref={finale} className="invisible absolute bottom-[10%] left-[19%] right-[12%] opacity-0">
                <p className="t-mono text-bone [text-shadow:0_1px_12px_rgb(21_21_19/0.6)]">
                  {biz.preview ? "Sewn in small runs — now in the shop" : "Sewn in Dallas — now in the shop"}
                  <span className="mt-1.5 block font-display text-[clamp(1.6rem,2.4vw,2.5rem)] font-extrabold leading-none tracking-[-0.03em]">CALICHE</span>
                </p>
                <Link href="/collections/new-in" prefetch={pf} className="btn btn-light btn-sm mt-4" tabIndex={-1}>
                  Shop Caliche <IconArrow size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
