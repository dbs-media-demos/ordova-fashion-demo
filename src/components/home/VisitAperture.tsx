"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, useIdleGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Ring } from "@/components/brand/Logo";
import { OpenBadge } from "@/components/layout/Chrome";
import { site } from "@/lib/site";
import { useBiz } from "@/components/preview/BizContext";
import { areasFor, listOf } from "@/lib/biz-core";
import { IconArrow, IconPin } from "@/components/ui/Icons";
import { cv } from "@/lib/cv";

/**
 * Scene 10 — Visit. The store is seen through the Ordova aperture: the
 * ring's counter opens from a peephole to the full frame as you scroll.
 */
export function VisitAperture() {
  const biz = useBiz();
  const root = useRef<HTMLElement>(null);
  // A preview: the business's own street, towns and map search instead of the concept store's
  const couriers = areasFor(biz).filter((a) => a !== biz.area);
  const mapsUrl = biz.preview
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([biz.name, biz.address.full || biz.area].filter(Boolean).join(", "))}`
    : site.mapsUrl;
  const stage = useRef<HTMLDivElement>(null);

  useIdleGSAP(() => {
    const sec = root.current;
    const st = stage.current;
    if (!sec || !st || prefersReducedMotion()) return;
    const img = st.querySelector<HTMLElement>("[data-ap]")!;
    const ring = st.querySelector<HTMLElement>("[data-ring]")!;
    const copy = st.querySelector<HTMLElement>("[data-copy]")!;
    const r0 = () => Math.min(st.clientWidth, st.clientHeight) * 0.13;
    const far = () => Math.hypot(st.clientWidth, st.clientHeight) / 2 + 20;
    const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.7, invalidateOnRefresh: true } });
    tl.fromTo(img, { clipPath: () => `circle(${r0()}px at 50% 50%)` }, { clipPath: () => `circle(${far()}px at 50% 50%)`, duration: 1, ease: "power2.inOut" }, 0)
      .fromTo(img.querySelector("img"), { scale: 1.5 }, { scale: 1, duration: 1 }, 0)
      .fromTo(ring, { scale: 1, opacity: 1 }, { scale: () => far() / r0(), opacity: 0, duration: 1, ease: "power2.inOut" }, 0)
      .fromTo(copy, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.3 }, 0.7);
  }, root);

  return (
    <section ref={root} {...cv("visit", biz)} className="relative desk:h-[230svh]" aria-labelledby="visit-title">
      <div ref={stage} className="theme-char relative h-[100svh] overflow-hidden ph:h-auto desk:sticky desk:top-0">
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <p className="font-display text-[clamp(2.6rem,10vw,10rem)] font-extrabold uppercase leading-[0.8] tracking-[-0.045em] text-bone/10" aria-hidden="true">
            Come in
          </p>
        </div>
        <div data-ap className="absolute inset-0">
          <Image src="/images/ed/storefront.jpg" alt={biz.preview ? `A boutique shop front${biz.area ? ` in ${biz.area}` : ""}` : "The Ordova shop front in Bishop Arts"} fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(21_21_19/0.92),rgb(21_21_19/0.55)_40%,rgb(21_21_19/0.05)_75%)]" />
        </div>
        <div data-ring className="pointer-events-none absolute inset-0 hidden place-items-center desk:grid" aria-hidden="true">
          <Ring className="h-[46vmin] w-[46vmin] text-char" notch />
        </div>
        <div data-copy className="container-x absolute inset-x-0 bottom-0 pb-28 text-bone ph:relative ph:pb-16 ph:pt-[min(88vw,26rem)] md:pb-14">
          <p className="t-mono text-bone/85">( 09 ) Visit the store</p>
          <h2 id="visit-title" className="mt-3 font-display text-[clamp(2.2rem,6vw,5.5rem)] font-extrabold uppercase leading-[0.85] tracking-[-0.04em]">
            {biz.preview ? (
              <>
                {biz.area ? `${biz.area},` : "Come by,"}
                <br />
                in person
              </>
            ) : (
              <>
                Bishop Arts,
                <br />
                ground floor
              </>
            )}
          </h2>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <OpenBadge dark />
            {(biz.address.street || biz.area) && (
              <span className="t-mono inline-flex items-center gap-2 text-bone/85">
                <IconPin size={16} /> {biz.address.street || biz.area}
              </span>
            )}
          </div>
          <p className="mt-5 max-w-lg text-bone/90">
            Free hemming while you wait, styling appointments, and online orders ready for pickup in two hours.{" "}
            {biz.preview
              ? couriers.length
                ? `Same-day courier to ${listOf(biz, couriers)}; shipping to all 50 states.`
                : "Shipping to all 50 states."
              : "Same-day courier to Oak Cliff, Uptown, Deep Ellum and the Design District; shipping to all 50 states."}
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            <Link href="/visit" prefetch={biz.preview ? false : undefined} className="btn btn-light">
              Book a styling appointment <IconArrow size={16} />
            </Link>
            <a href={mapsUrl} target="_blank" rel="noopener" className="btn btn-ghost" data-track="directions">
              Get directions
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
