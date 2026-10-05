"use client";

import { useRef } from "react";
import Link from "next/link";
import type { Product } from "@/lib/commerce/types";
import { ProductCard } from "@/components/shop/ProductCard";
import { gsap, ScrollTrigger, useIdleGSAP, prefersReducedMotion } from "@/lib/gsap";
import { IconArrow } from "@/components/ui/Icons";

/**
 * Scene 3 — New in: a horizontal track driven by vertical scroll (desktop).
 * The section is as tall as the track is wide; a sticky stage keeps it in
 * view while the cards travel. On touch it's a native swipeable rail.
 */
export function NewInTrack({ products }: { products: Product[] }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useIdleGSAP(() => {
    const sec = root.current;
    const tr = track.current;
    if (!sec || !tr || prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (hover: hover)", () => {
      const dist = () => tr.scrollWidth - window.innerWidth;
      const setH = () => (sec.style.height = `${dist() + window.innerHeight}px`);
      setH();
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true, onRefreshInit: setH },
      });
      tl.to(tr, { x: () => -dist(), duration: 1 }, 0)
        .fromTo(title.current, { xPercent: 0 }, { xPercent: -30, duration: 1 }, 0)
        .fromTo(bar.current, { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0);
      // cards lean into the motion
      const cards = tr.querySelectorAll<HTMLElement>("[data-card]");
      let last = 0;
      const skew = gsap.quickTo(cards, "skewX", { duration: 0.5, ease: "power3.out" });
      const st = tl.scrollTrigger!;
      const tick = () => {
        const v = st.getVelocity();
        const k = gsap.utils.clamp(-6, 6, v / -250);
        if (Math.abs(k - last) > 0.05) skew(k);
        last = k;
      };
      gsap.ticker.add(tick);
      ScrollTrigger.refresh();
      return () => {
        gsap.ticker.remove(tick);
        sec.style.height = "";
      };
    });
    return () => mm.revert();
  }, root);

  return (
    <section ref={root} className="relative bg-bone" aria-labelledby="newin-title">
      <div className="lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:flex-col lg:justify-center lg:overflow-hidden">
        <div className="container-x flex items-end justify-between gap-6 pt-24 lg:pt-16">
          <div>
            <p className="t-mono text-muted">( 02 ) Just landed</p>
            <h2 ref={title} id="newin-title" className="mt-3 whitespace-nowrap font-display text-[clamp(3rem,10vw,10rem)] font-extrabold uppercase leading-[0.8] tracking-[-0.04em]">
              New in
            </h2>
          </div>
          <Link href="/collections/new-in" className="btn btn-ghost mb-2 hidden shrink-0 sm:inline-flex">
            Shop all new <IconArrow size={16} />
          </Link>
        </div>
        <div
          ref={track}
          data-cursor="Drag"
          className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-6 lg:snap-none lg:overflow-visible lg:pb-0"
        >
          {products.map((p, i) => (
            <div key={p.slug} data-card className="w-[72vw] shrink-0 snap-start sm:w-[42vw] lg:w-[23vw]">
              <ProductCard product={p} sizes="(min-width: 1024px) 23vw, (min-width: 640px) 42vw, 72vw" />
              <p className="t-mono mt-2 text-[0.6rem] text-muted">N° {String(i + 1).padStart(2, "0")}</p>
            </div>
          ))}
          <Link
            href="/collections/new-in"
            className="theme-char grid aspect-[4/5] w-[60vw] shrink-0 snap-start place-items-center rounded-[2px] p-8 text-center sm:w-[36vw] lg:w-[20vw]"
          >
            <span>
              <span className="block font-display text-3xl font-extrabold uppercase leading-none">See every new piece</span>
              <span className="t-mono mt-4 inline-flex items-center gap-2 text-cobalt-lt">
                Shop new in <IconArrow size={16} />
              </span>
            </span>
          </Link>
        </div>
        <div className="container-x mt-8 hidden lg:block">
          <div className="h-px bg-line">
            <div ref={bar} className="h-px origin-left scale-x-0 bg-char" />
          </div>
        </div>
      </div>
    </section>
  );
}
