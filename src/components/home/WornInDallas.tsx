"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, useIdleGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useBiz } from "@/components/preview/BizContext";
import { areasFor } from "@/lib/biz-core";
import { Stars } from "@/components/ui/Stars";
import { cv } from "@/lib/cv";
import { IconArrow } from "@/components/ui/Icons";

const COLS = [
  ["worn-01", "worn-04", "worn-07"],
  ["worn-02", "worn-05", "worn-08"],
  ["worn-03", "worn-06", "worn-09"],
];

const QUOTES = [
  { q: "They hemmed my chinos while I had coffee across the street. Free. That's the whole review.", a: "Will J.", w: "East Dallas" },
  { q: "The best-edited store in Dallas. Half of it was made a mile away and it fits like it.", a: "Grace O.", w: "Bishop Arts" },
  { q: "Ordered at 11 pm, picked it up on my lunch break. Wrapped in tissue with a handwritten note.", a: "Kendra A.", w: "The Cedars" },
];

/** A preview's sample reviews: the same three, without the concept store's Dallas places. */
const PREVIEW_QUOTES = [
  { q: "They hemmed my chinos while I had coffee across the street. Free. That's the whole review.", a: "Will J." },
  { q: "The best-edited store in town. Every piece feels chosen, and it fits like it was made for me.", a: "Grace O." },
  { q: "Ordered at 11 pm, picked it up on my lunch break. Wrapped in tissue with a handwritten note.", a: "Kendra A." },
];

/** Scene 9 — Worn in Dallas: three photo columns drifting at different speeds around the reviews. */
export function WornInDallas() {
  const biz = useBiz();
  const root = useRef<HTMLElement>(null);
  const place = biz.preview ? biz.area : "Dallas";
  // Reviewer places on a preview: the business's own towns, one each (or none)
  const towns = areasFor(biz);
  const quotes = biz.preview ? PREVIEW_QUOTES.map((x, i) => ({ ...x, w: towns.length ? towns[i % towns.length] : "" })) : QUOTES;

  useIdleGSAP(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const cols = gsap.utils.toArray<HTMLElement>("[data-col]", el);
    const speeds = [-18, 14, -26];
    cols.forEach((c, i) =>
      gsap.fromTo(c, { yPercent: -speeds[i] / 2 }, { yPercent: speeds[i] / 2, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } }),
    );
  }, root);

  return (
    <section ref={root} {...cv("worn", biz)} className="relative overflow-hidden bg-bone py-24 md:py-32" aria-labelledby="worn-title">
      <div className="container-x grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5 lg:py-16">
          <p className="t-mono text-muted">( 03 ) Worn in {place || "town"}</p>
          <h2 id="worn-title" className="t-h2 mt-3 max-w-[12ch]">
            What people say after a year
          </h2>
          {biz.rating && (
            <div className="mt-8 flex items-center gap-4">
              <span className="font-display text-6xl font-extrabold leading-none">{biz.rating.value}</span>
              <div>
                <Stars value={biz.rating.value} size={18} />
                <p className="mt-1 text-sm text-muted">
                  {biz.rating.count} Google reviews · {biz.preview ? biz.area || biz.shortName : "Bishop Arts"}
                </p>
              </div>
            </div>
          )}
          <p className="t-mono mt-8 text-[0.68rem] text-muted">Sample reviews for this concept site</p>
          <ul className="mt-4 space-y-6">
            {quotes.map((x) => (
              <li key={x.a} className="border-l-2 border-cobalt pl-5">
                <blockquote className="text-lg leading-snug">&ldquo;{x.q}&rdquo;</blockquote>
                <p className="t-mono mt-2 text-muted">
                  {x.w ? `${x.a} · ${x.w}` : x.a}
                </p>
              </li>
            ))}
          </ul>
          <Link href="/reviews" prefetch={biz.preview ? false : undefined} className="btn btn-ghost mt-10">
            Read all reviews <IconArrow size={16} />
          </Link>
        </div>
        <div className="grid h-[34rem] grid-cols-3 gap-3 overflow-hidden md:h-[46rem] lg:col-span-7 lg:h-[52rem]" aria-label={`Customers wearing ${biz.shortName}${place ? ` around ${place}` : ""}`} role="img">
          {COLS.map((col, ci) => (
            <div key={ci} data-col className="flex flex-col gap-3" style={{ marginTop: ci === 1 ? "-4rem" : ci === 2 ? "2rem" : 0 }}>
              {[...col, ...col].map((n, i) => (
                <div key={`${n}-${i}`} className="media aspect-[3/4] shrink-0 rounded-[2px]">
                  <Image src={`/images/ed/${n}.jpg`} alt="" fill sizes="(min-width: 1024px) 19vw, 31vw" className="object-cover" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
