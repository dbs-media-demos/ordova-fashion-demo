"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import type { Product } from "@/lib/commerce/types";
import { discountPct, sizesInStock } from "@/content/helpers";
import { money } from "@/lib/format";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { markMorph } from "@/lib/morph";
import { IconArrow } from "@/components/ui/Icons";

/**
 * Signature 4a — the Archive Sale coverflow. A 3D card stack you can drag,
 * flick (with inertia), scroll sideways, or drive with arrow keys/buttons.
 * Transforms are written straight to the DOM each frame; React only tracks
 * the active index (for the counter and screen readers).
 */
export function SaleSwiper({ products, tone = "dark", label = "The Archive Sale", priority }: { products: Product[]; tone?: "dark" | "light"; label?: string; priority?: boolean }) {
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const pos = useRef({ v: 0 });
  const tween = useRef<gsap.core.Tween | null>(null);
  const [active, setActive] = useState(0);
  const n = products.length;

  const render = () => {
    const el = stage.current;
    if (!el) return;
    const w = el.clientWidth;
    const cw = cards.current[0]?.offsetWidth ?? 300;
    const spread = Math.min(cw * 0.62, w * 0.24);
    cards.current.forEach((c, i) => {
      if (!c) return;
      const o = i - pos.current.v;
      const a = Math.abs(o);
      gsap.set(c, {
        x: o * spread,
        z: -a * 170,
        rotateY: gsap.utils.clamp(-62, 62, -o * 32),
        scale: 1 - Math.min(a, 3) * 0.04,
        opacity: a > 3.4 ? 0 : 1 - Math.max(0, a - 2) * 0.6,
        zIndex: 100 - Math.round(a * 10),
      });
      c.style.pointerEvents = a > 2.5 ? "none" : "";
      c.dataset.near = a < 0.5 ? "true" : "false";
    });
    const idx = Math.round(gsap.utils.clamp(0, n - 1, pos.current.v));
    setActive((cur) => (cur === idx ? cur : idx));
  };

  const goTo = (target: number, duration = 0.9) => {
    const t = gsap.utils.clamp(0, n - 1, target);
    tween.current?.kill();
    tween.current = gsap.to(pos.current, { v: t, duration: prefersReducedMotion() ? 0 : duration, ease: "power3.out", onUpdate: render });
  };

  useEffect(() => {
    const start = Math.min(2, Math.floor((n - 1) / 2));
    pos.current.v = start;
    render();
    // gentle entrance: the deck fans out from the centre card
    if (!prefersReducedMotion()) {
      pos.current.v = start + 1.4;
      goTo(start, 1.6);
    }
    const ro = new ResizeObserver(render);
    if (stage.current) ro.observe(stage.current);
    return () => {
      ro.disconnect();
      tween.current?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  // Drag + inertia
  const drag = useRef({ on: false, x: 0, start: 0, last: 0, lastT: 0, vel: 0, moved: 0 });
  const onDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    tween.current?.kill();
    const d = drag.current;
    d.on = true;
    d.x = e.clientX;
    d.start = pos.current.v;
    d.last = e.clientX;
    d.lastT = performance.now();
    d.vel = 0;
    d.moved = 0;
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.on) return;
    const cw = cards.current[0]?.offsetWidth ?? 300;
    const spread = Math.min(cw * 0.62, (stage.current?.clientWidth ?? 1000) * 0.24);
    const dx = e.clientX - d.x;
    d.moved = Math.max(d.moved, Math.abs(dx));
    if (d.moved > 6 && !(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const now = performance.now();
    d.vel = (e.clientX - d.last) / Math.max(1, now - d.lastT);
    d.last = e.clientX;
    d.lastT = now;
    pos.current.v = gsap.utils.clamp(-0.4, n - 0.6, d.start - dx / spread);
    render();
  };
  const onUp = () => {
    const d = drag.current;
    if (!d.on) return;
    d.on = false;
    const cw = cards.current[0]?.offsetWidth ?? 300;
    const fling = (-d.vel * 380) / cw;
    goTo(Math.round(pos.current.v + fling), 0.9 + Math.min(0.8, Math.abs(fling) * 0.15));
  };

  // Horizontal wheel / trackpad
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let acc = 0;
    let t = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      acc += e.deltaX;
      window.clearTimeout(t);
      t = window.setTimeout(() => (acc = 0), 120);
      if (Math.abs(acc) > 60) {
        goTo(Math.round(pos.current.v) + Math.sign(acc));
        acc = 0;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dark = tone === "dark";

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label} className="relative">
      <div
        ref={stage}
        data-cursor="Drag"
        className="relative h-[27rem] touch-pan-y select-none [perspective:1400px] sm:h-[31rem] md:h-[36rem]"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            goTo(active + 1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            goTo(active - 1);
          }
        }}
      >
        <div className="absolute inset-0 [transform-style:preserve-3d]">
          {products.map((p, i) => {
            const left = sizesInStock(p);
            // Server-rendered starting pose (GSAP takes over after hydration).
            const o = i - Math.min(2, Math.floor((n - 1) / 2));
            const ao = Math.abs(o);
            const initial = {
              transform: `translateX(${o * 62}%) translateZ(${-ao * 170}px) rotateY(${Math.max(-62, Math.min(62, -o * 32))}deg) scale(${1 - Math.min(ao, 3) * 0.04})`,
              zIndex: 100 - ao * 10,
              opacity: ao > 3.4 ? 0 : 1 - Math.max(0, ao - 2) * 0.6,
            };
            return (
              <div
                key={p.slug}
                ref={(el) => {
                  cards.current[i] = el;
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${n}: ${p.name}`}
                style={initial}
                data-near={ao < 0.5 ? "true" : "false"}
                className="group/s absolute left-1/2 top-0 w-[15.5rem] -ml-[7.75rem] will-change-transform sm:w-[17rem] sm:-ml-[8.5rem] md:w-[19.5rem] md:-ml-[9.75rem]"
              >
                <Link
                  href={`/products/${p.slug}`}
                  draggable={false}
                  onFocus={() => goTo(i)}
                  onClick={(e) => {
                    if (drag.current.moved > 6) {
                      e.preventDefault();
                      return;
                    }
                    markMorph(e.currentTarget.querySelector("[data-media]"));
                  }}
                  className="block"
                >
                  <div data-media className="media aspect-[4/5] overflow-hidden rounded-[3px] shadow-[0_30px_60px_-20px_rgb(0_0_0/0.55)]">
                    <Image src={p.images[0].src} alt={p.images[0].alt} fill sizes="(min-width: 768px) 20rem, 16rem" draggable={false} preload={priority && i === Math.min(2, Math.floor((n - 1) / 2))} loading={priority && i < 5 ? "eager" : "lazy"} className="pointer-events-none object-cover" />
                    <span className="t-mono absolute left-3 top-3 rounded-full bg-cobalt px-2.5 py-1 text-[0.6rem] text-bone">−{discountPct(p)}%</span>
                    {left.length <= 2 && (
                      <span className="t-mono absolute right-3 top-3 rounded-full bg-bone/90 px-2.5 py-1 text-[0.6rem] text-char">
                        {left.length === 1 ? `Last: ${left[0]}` : `${left.join(" · ")} left`}
                      </span>
                    )}
                  </div>
                  <div className={clsx("mt-3 flex items-baseline justify-between gap-3 transition-opacity duration-500 group-data-[near=false]/s:opacity-0", dark ? "text-bone" : "text-char")}>
                    <span className="truncate font-medium">{p.name}</span>
                    <span className="t-price shrink-0">
                      <span className={clsx("mr-1.5 line-through", dark ? "text-mist" : "text-muted")}>{money(p.compareAt!)}</span>
                      <span className={dark ? "text-cobalt-lt" : "text-cobalt"}>{money(p.price)}</span>
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
      <div className={clsx("mt-6 flex items-center justify-center gap-4", dark ? "text-bone" : "text-char")}>
        <button type="button" onClick={() => goTo(active - 1)} disabled={active === 0} className="icon-btn border border-current/30 disabled:opacity-30" aria-label="Previous piece">
          <IconArrow size={18} className="rotate-180" />
        </button>
        <p className="t-mono w-20 text-center tabular-nums" aria-live="polite">
          {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
        </p>
        <button type="button" onClick={() => goTo(active + 1)} disabled={active === n - 1} className="icon-btn border border-current/30 disabled:opacity-30" aria-label="Next piece">
          <IconArrow size={18} />
        </button>
      </div>
    </div>
  );
}
