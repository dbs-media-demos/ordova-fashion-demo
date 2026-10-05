"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, useIdleGSAP, prefersReducedMotion, belowFold } from "@/lib/gsap";
import { IconArrowUpRight } from "@/components/ui/Icons";

const PANELS = [
  { t: "Women", k: "Dresses · shirts · wide trousers · coats", href: "/shop?dept=women", img: "/images/ed/wardrobe-women.jpg", n: "14 pieces" },
  { t: "Men", k: "Oxfords · knits · selvedge · chore coats", href: "/shop?dept=men", img: "/images/ed/wardrobe-men.jpg", n: "12 pieces" },
  { t: "Objects", k: "Leather bags · belts · silk · felt", href: "/shop/accessories", img: "/images/ed/wardrobe-accessories.jpg", n: "12 pieces" },
];

/**
 * Scene 4 — three wardrobes. Panels wipe up at different speeds as the
 * section arrives (parallax columns); on desktop the hovered panel widens.
 */
export function Wardrobes() {
  const root = useRef<HTMLElement>(null);

  useIdleGSAP(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const panels = el.querySelectorAll<HTMLElement>("[data-panel]");
    if (belowFold(el)) {
      gsap.fromTo(
        panels,
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut", stagger: 0.14, scrollTrigger: { trigger: el, start: "top 75%", once: true } },
      );
    }
    panels.forEach((p, i) => {
      gsap.fromTo(
        p.querySelector("[data-img]"),
        { yPercent: -6 - i * 3 },
        { yPercent: 6 + i * 3, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
      );
    });
    if (window.matchMedia("(min-width: 768px)").matches)
      gsap.fromTo(
      el.querySelectorAll("[data-col]"),
      { y: (i: number) => [80, 0, 140][i] },
      { y: (i: number) => [-40, 0, -80][i], ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
    );
  }, root);

  return (
    <section ref={root} className="bg-bone py-24 md:py-36" aria-labelledby="wardrobes-title">
      <div className="container-x mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="t-mono text-muted">( 03 ) Three wardrobes</p>
          <h2 id="wardrobes-title" className="t-h2 mt-3 max-w-[14ch]">
            One point of view, cut three ways
          </h2>
        </div>
        <p className="max-w-sm text-muted">Womenswear, menswear and the objects that finish them — designed together so everything on the rail works with everything else.</p>
      </div>
      <div className="container-x group/w grid gap-4 md:flex md:h-[78vh] md:gap-3">
        {PANELS.map((p) => (
          <div key={p.t} data-col className="md:flex-1 md:transition-[flex-grow] md:duration-700 md:ease-[cubic-bezier(0.16,1,0.3,1)] md:hover:flex-[1.6]">
            <Link href={p.href} data-panel className="theme-char group relative block h-[70vh] overflow-hidden rounded-[2px] md:h-[78vh]" data-cursor="Shop">
              <div data-img className="absolute -inset-y-[10%] inset-x-0">
                <Image src={p.img} alt="" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]" />
              </div>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgb(21_21_19/0.72))]" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-7">
                <div>
                  <p className="t-mono text-bone/80">{p.n}</p>
                  <h3 className="mt-2 font-display text-[clamp(2.2rem,3.4vw,3.6rem)] font-extrabold uppercase leading-[0.85] tracking-[-0.03em]">{p.t}</h3>
                  <p className="mt-3 max-w-[26ch] text-sm text-bone/85">{p.k}</p>
                </div>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-bone text-char transition-transform duration-500 group-hover:rotate-45">
                  <IconArrowUpRight size={18} />
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
