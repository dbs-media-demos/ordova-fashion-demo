"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { looks } from "@/content/lookbook";
import { gsap, useIdleGSAP, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";
import { IconArrow } from "@/components/ui/Icons";
import { cv } from "@/lib/cv";

const DECK = looks.slice(0, 6);
// Resting spots once the deck fans out (% of stage, rotation)
const SPREAD = [
  { x: -38, y: -21, r: -7 },
  { x: 38, y: -23, r: 6 },
  { x: -39, y: 23, r: 5 },
  { x: 39, y: 22, r: -5 },
  { x: -13, y: -33, r: -3 },
  { x: 14, y: 33, r: 4 },
];

/**
 * Scene 8 — the lookbook as a stack of prints on a table. Scroll and they
 * deal themselves across the stage; the last one stays centre with a pulsing
 * "shop the look" hotspot.
 */
export function LookbookDeck() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useIdleGSAP(() => {
    const sec = root.current;
    const st = stage.current;
    if (!sec || !st || prefersReducedMotion()) return;
    const prints = gsap.utils.toArray<HTMLElement>("[data-print]", st);
    const mobile = st.clientWidth < 768;
    gsap.set(prints, { xPercent: -50, yPercent: -50, rotate: (i: number) => (i % 2 ? 1 : -1) * (2 + i), y: (i: number) => i * -4 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.8, invalidateOnRefresh: true } });
    prints.forEach((p, i) => {
      const s = SPREAD[i];
      tl.to(
        p,
        {
          x: () => (s.x / 100) * st.clientWidth * (mobile ? 0.9 : 1),
          y: () => (s.y / 100) * st.clientHeight * (mobile ? 0.9 : 1),
          rotate: s.r,
          scale: mobile ? 0.56 : 0.64,
          duration: 1,
          ease: "power3.inOut",
        },
        i * 0.18,
      );
    });
    tl.fromTo(st.querySelector("[data-title]"), { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6 }, 0.6).to({}, { duration: 0.5 });
    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(st);
    return () => ro.disconnect();
  }, root);

  return (
    <>
    <PhoneDeck />
    <section ref={root} className="relative bg-sand ph:hidden desk:h-[280svh]" aria-labelledby="deck-title">
      <div ref={stage} className="grain relative h-[100svh] overflow-hidden desk:sticky desk:top-0">
        <div className="container-x absolute inset-x-0 top-0 z-[60] flex items-start justify-between pt-[calc(var(--header-h)+1.5rem)]">
          <p className="t-mono text-muted">( 08 ) FW26 Lookbook</p>
          <p className="t-mono hidden text-muted md:block">8 looks · shot around Dallas</p>
        </div>
        <div data-title className="pointer-events-none absolute inset-0 z-[40] grid place-items-center">
          <h2 id="deck-title" className="text-center font-display text-[clamp(2.2rem,9.6vw,10rem)] font-extrabold uppercase leading-[0.8] tracking-[-0.045em] text-char/90">
            Shop
            <br />
            the look
          </h2>
        </div>
        {DECK.map((l, i) => (
          <div
            key={l.id}
            data-print
            className="absolute left-1/2 top-1/2 z-10 block w-[46vw] bg-paper p-2 pb-9 shadow-[0_25px_50px_-18px_rgb(21_21_19/0.45)] sm:w-[34vw] md:w-[21vw]"
            style={{ zIndex: 10 + i, transform: `translate(-50%,-50%) rotate(${(i % 2 ? 1 : -1) * (2 + i)}deg)` }}
          >
            <span className="media block aspect-[4/5]">
              <Image src={l.image} alt={l.alt} fill sizes="(min-width: 768px) 21vw, 46vw" className="object-cover" />
            </span>
            <span className="t-mono absolute inset-x-3 bottom-3 flex justify-between text-[0.58rem] text-muted">
              <span>Look {l.n}</span>
              <span>{l.place}</span>
            </span>
          </div>
        ))}
        <div className="absolute inset-x-0 bottom-0 z-[60] flex justify-center pb-24 md:pb-8">
          <Link href="/lookbook" className="btn btn-solid">
            Open the lookbook <IconArrow size={16} />
          </Link>
        </div>
      </div>
    </section>
    </>
  );
}

/** Phones and touch tablets: the prints as a swipe rail, slightly askew like on the table. */
function PhoneDeck() {
  return (
    <section {...cv("deck")} className="grain hidden bg-sand py-16 ph:block" aria-labelledby="deck-title-ph">
      <div className="container-x flex items-start justify-between gap-4">
        <p className="t-mono text-muted">( 08 ) FW26 Lookbook</p>
        <p className="t-mono text-muted">8 looks · shot around Dallas</p>
      </div>
      <h2 id="deck-title-ph" className="container-x mt-4 font-display text-[3rem] font-extrabold uppercase leading-[0.82] tracking-[-0.045em] text-char/90">
        Shop
        <br />
        the look
      </h2>
      <ul className="rail mt-8 pb-4 pt-2">
        {DECK.map((l, i) => (
          <li key={l.id} className="w-[64vw] max-w-[18rem] bg-paper p-2 pb-9 shadow-[0_18px_36px_-16px_rgb(21_21_19/0.4)]" style={{ transform: `rotate(${i % 2 ? 1.2 : -1.2}deg)` }}>
            <span className="media relative block aspect-[4/5]">
              <Image src={l.image} alt={l.alt} fill sizes="(min-width: 640px) 18rem, 64vw" className="object-cover" />
            </span>
            <span className="t-mono mt-3 flex justify-between px-1 text-[0.58rem] text-muted">
              <span>Look {l.n}</span>
              <span>{l.place}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="container-x mt-8">
        <Link href="/lookbook" className="btn btn-solid">
          Open the lookbook <IconArrow size={16} />
        </Link>
      </div>
    </section>
  );
}
