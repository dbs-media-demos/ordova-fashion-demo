"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import type { Product } from "@/lib/commerce/types";
import { categories } from "@/content/taxonomy";
import { discountPct, findVariant } from "@/content/helpers";
import { money } from "@/lib/format";
import { addToBag } from "@/lib/bag";
import { Countdown } from "./Countdown";
import { gsap, useIdleGSAP, prefersReducedMotion, belowFold } from "@/lib/gsap";
import { IconArrow, IconCheck } from "@/components/ui/Icons";
import { Ring } from "@/components/brand/Logo";

/** Page title that assembles letter by letter (CSS-only: it's above the fold). */
export function LetterTitle({ text, className, as: Tag = "h1" }: { text: string; className?: string; as?: "h1" | "h2" }) {
  const words = text.split(" ");
  let k = 0;
  return (
    <Tag className={clsx("font-display font-extrabold uppercase leading-[0.84] tracking-[-0.04em]", className)} aria-label={text}>
      {words.map((w, wi) => (
        <span key={wi} className="inline-flex whitespace-nowrap" aria-hidden="true">
          {w.split("").map((c) => {
            const d = k++ * 0.028;
            return (
              <span key={`${c}-${d}`} className="anim-mask inline-block">
                <span style={{ "--d": `${d}s` } as CSSProperties}>{c}</span>
              </span>
            );
          })}
          {wi < words.length - 1 && <span className="inline-block w-[0.28em]" />}
        </span>
      ))}
    </Tag>
  );
}

/** Category strip: a draggable rail of image tiles. */
export function CategoryRail({ current, priority }: { current?: string; priority?: boolean }) {
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef({ on: false, x: 0, left: 0, moved: 0 });
  return (
    <div
      ref={rail}
      data-cursor="Drag"
      className="no-scrollbar flex cursor-grab gap-3 overflow-x-auto px-[var(--gutter)] active:cursor-grabbing"
      onPointerDown={(e) => {
        if (e.pointerType !== "mouse") return;
        drag.current = { on: true, x: e.clientX, left: rail.current!.scrollLeft, moved: 0 };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d.on) return;
        const dx = e.clientX - d.x;
        d.moved = Math.max(d.moved, Math.abs(dx));
        rail.current!.scrollLeft = d.left - dx;
      }}
      onPointerUp={() => (drag.current.on = false)}
      onPointerLeave={() => (drag.current.on = false)}
      onClickCapture={(e) => {
        if (drag.current.moved > 6) {
          e.preventDefault();
          e.stopPropagation();
          drag.current.moved = 0;
        }
      }}
    >
      {categories.map((c, i) => (
        <Link
          key={c.slug}
          href={`/shop/${c.slug}`}
          draggable={false}
          aria-current={current === c.slug ? "page" : undefined}
          className="anim-rise group relative block w-[42vw] shrink-0 sm:w-[24vw] lg:w-[15.5vw]"
          style={{ "--d": `${0.15 + i * 0.05}s` } as CSSProperties}
        >
          <div className={clsx("media aspect-[4/5] rounded-[2px]", current === c.slug && "outline outline-2 outline-offset-2 outline-cobalt")}>
            <Image src={c.image} alt="" fill sizes="(min-width: 1024px) 16vw, (min-width: 640px) 24vw, 42vw" draggable={false} preload={priority && i === 0} loading={priority && i < 2 ? "eager" : "lazy"} className="pointer-events-none object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgb(21_21_19/0.6))]" />
            <span className="absolute inset-x-3 bottom-3 font-display text-[0.95rem] font-bold uppercase leading-tight text-bone">{c.name}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

/** "New drop" banner: countdown to the next drop + a notify field (sends nothing). */
export function DropBanner() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "err" | "ok">("idle");
  return (
    <div className="theme-char grain relative overflow-hidden rounded-[3px]">
      <Ring className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 text-white/[0.06] md:-right-10" />
      <div className="relative grid gap-8 p-6 md:grid-cols-[1.2fr_1fr_1fr] md:items-center md:p-10">
        <div>
          <p className="t-mono text-cobalt-lt">Drop 03 · &ldquo;Norther&rdquo;</p>
          <p className="mt-2 font-display text-[clamp(1.8rem,3.4vw,3rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.03em]">
            Winter wool lands Thursday, 10 am
          </p>
        </div>
        <Countdown to="drop" />
        {state === "ok" ? (
          <p className="flex items-center gap-3" role="status">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cobalt">
              <IconCheck size={18} />
            </span>
            You&apos;ll get one email the minute it drops.
          </p>
        ) : (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              setState(/^\S+@\S+\.\S+$/.test(email.trim()) ? "ok" : "err");
            }}
          >
            <label htmlFor="drop-email" className="t-mono mb-2 block text-bone/80">
              Notify me at drop time
            </label>
            <div className="flex gap-2">
              <input
                id="drop-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={state === "err"}
                aria-describedby={state === "err" ? "drop-err" : undefined}
                className="min-h-11 w-full rounded-full border border-line-lt bg-white/5 px-4 text-bone placeholder:text-mist focus:border-bone focus:outline-none"
              />
              <button type="submit" className="btn btn-light btn-sm shrink-0">
                Notify me
              </button>
            </div>
            {state === "err" && (
              <p id="drop-err" className="mt-2 text-sm text-[#ffb3a3]">
                Please enter a valid email.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

/**
 * Signature 4b — "Last sizes" flip cards. Front: the piece. Back: the sizes
 * left and the sale price, with one-tap add. Hover flips on desktop; tap the
 * flip button on touch. They deal in with a staggered flip as they scroll in.
 */
export function LastSizes({ items, title = "Last sizes", intro }: { items: { p: Product; left: string[] }[]; title?: string; intro?: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useIdleGSAP(() => {
    const el = root.current;
    if (!el || prefersReducedMotion() || !belowFold(el)) return;
    const cards = el.querySelectorAll("[data-flipcard]");
    gsap.fromTo(
      cards,
      { rotateY: -100, opacity: 0, transformPerspective: 1200 },
      { rotateY: 0, opacity: 1, duration: 1.4, ease: "expo.out", stagger: 0.1, clearProps: "transform", scrollTrigger: { trigger: el, start: "top 80%", once: true } },
    );
  }, root);

  return (
    <div ref={root}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="t-mono text-muted">Flip a card</p>
          <h2 className="t-h2 mt-2">{title}</h2>
        </div>
        {intro && <div className="max-w-sm text-muted">{intro}</div>}
      </div>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {items.map(({ p, left }) => (
          <li key={p.slug} data-flipcard>
            <FlipCard p={p} left={left} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function FlipCard({ p, left }: { p: Product; left: string[] }) {
  const [flipped, setFlipped] = useState(false);
  const [added, setAdded] = useState<string | null>(null);
  const front = useRef<HTMLDivElement>(null);
  return (
    <div className="flip relative aspect-[3/4.4]" data-flipped={flipped}>
      <div className="flip-inner">
        <div ref={front} className="flip-face media overflow-hidden rounded-[3px]">
          <Image src={p.images[0].src} alt={p.images[0].alt} fill sizes="(min-width: 1024px) 16vw, (min-width: 768px) 32vw, 48vw" className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgb(21_21_19/0.7))]" />
          <span className="t-mono absolute left-2.5 top-2.5 rounded-full bg-bone/90 px-2.5 py-1 text-[0.58rem] text-char">
            {left.length === 1 ? "1 size left" : `${left.length} sizes left`}
          </span>
          <p className="absolute inset-x-3 bottom-3 text-sm font-medium text-bone">{p.name}</p>
        </div>
        <div className="flip-face flip-back theme-char flex flex-col justify-between rounded-[3px] p-4">
          <div>
            <p className="t-mono text-cobalt-lt">−{discountPct(p)}% · Archive</p>
            <p className="mt-2 font-display text-lg font-bold uppercase leading-tight">{p.name}</p>
            <p className="t-price mt-2">
              <span className="mr-2 text-mist line-through">{money(p.compareAt!)}</span>
              <span className="text-cobalt-lt">{money(p.price)}</span>
            </p>
          </div>
          <div>
            <p className="t-mono mb-2 text-[0.6rem] text-mist">{p.sizeSystem === "one" ? "Units left" : "Sizes left — tap to add"}</p>
            <div className="flex flex-wrap gap-1.5">
              {left.map((s) => (
                <button
                  key={s}
                  type="button"
                  tabIndex={flipped ? 0 : -1}
                  onClick={() => {
                    const v = findVariant(p, p.colors[0].name, s);
                    if (v) {
                      addToBag(p, v, { from: front.current });
                      setAdded(s);
                    }
                  }}
                  className="t-mono min-h-9 min-w-10 rounded-full border border-line-lt px-3 text-[0.7rem] tracking-normal hover:bg-bone hover:text-char"
                  aria-label={`Add ${p.name}, ${s === "One size" ? "" : `size ${s}, `}to bag`}
                >
                  {added === s ? "✓" : s === "One size" ? "Add" : s}
                </button>
              ))}
            </div>
            <Link href={`/products/${p.slug}`} tabIndex={flipped ? 0 : -1} className="t-mono link-u mt-3 inline-flex items-center gap-1 text-[0.6rem] text-bone/80">
              Details <IconArrow size={12} />
            </Link>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-pressed={flipped}
        aria-label={flipped ? `Show ${p.name} photo` : `Show sizes left and sale price for ${p.name}`}
        className="absolute bottom-2 right-2 z-10 grid h-10 w-10 place-items-center rounded-full bg-bone/90 text-char shadow"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M4 12a8 8 0 0 1 13.7-5.6M20 12a8 8 0 0 1-13.7 5.6M18 3v4h-4M6 21v-4h4" />
        </svg>
      </button>
    </div>
  );
}

/** The Archive Sale band used on shop pages (light coverflow + countdown). */
export function SaleBand({ children }: { children: ReactNode }) {
  return (
    <section className="theme-olive overflow-hidden py-16 md:py-24" aria-labelledby="saleband-title">
      <div className="container-x mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="t-mono text-bone/80">On sale now</p>
          <h2 id="saleband-title" className="mt-2 font-display text-[clamp(2.2rem,5vw,4.5rem)] font-extrabold uppercase leading-[0.86] tracking-[-0.035em]">
            The Archive Sale
          </h2>
        </div>
        <Countdown to="sale" size="sm" />
      </div>
      {children}
      <div className="mt-10 flex justify-center">
        <Link href="/collections/archive-sale" className="btn btn-light">
          See every archive piece <IconArrow size={16} />
        </Link>
      </div>
    </section>
  );
}
