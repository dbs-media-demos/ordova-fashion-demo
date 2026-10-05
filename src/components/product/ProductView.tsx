"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import clsx from "clsx";
import type { Product } from "@/lib/commerce/types";
import { findVariant, sizesInStock } from "@/content/helpers";
import { money } from "@/lib/format";
import { addToBag } from "@/lib/bag";
import { pushRecent, useMounted, useRecent } from "@/lib/store";
import { site } from "@/lib/site";
import { BuyBox } from "./BuyBox";
import { Gallery, type GalleryHandle } from "./Gallery";
import { ProductCard } from "@/components/shop/ProductCard";
import { Stars } from "@/components/ui/Stars";
import { IconChevron, IconPlus } from "@/components/ui/Icons";
import { gsap, useIdleGSAP, prefersReducedMotion } from "@/lib/gsap";

const SizeGuideModal = dynamic(() => import("./SizeTools").then((m) => m.SizeGuideModal), { ssr: false });
const FitFinder = dynamic(() => import("./SizeTools").then((m) => m.FitFinder), { ssr: false });

export type MiniProduct = { slug: string; name: string; price: number; image: string };

export function ProductView({ product: p, pairs, index, initialColor }: { product: Product; pairs: Product[]; index: MiniProduct[]; initialColor?: string }) {
  const [color, setColor] = useState(initialColor && p.colors.some((c) => c.name === initialColor) ? initialColor : p.colors[0].name);
  const [size, setSize] = useState<string | null>(p.sizeSystem === "one" ? p.sizes[0] : null);
  const [guide, setGuide] = useState(false);
  const [finder, setFinder] = useState(false);
  const [suggest, setSuggest] = useState<string | null>(null);
  const [showBar, setShowBar] = useState(false);
  const gallery = useRef<GalleryHandle>(null);
  const buy = useRef<HTMLDivElement>(null);

  useEffect(() => pushRecent(p.slug), [p.slug]);

  // Read ?color= from the URL after hydration (keeps the page static).
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("color");
    if (c && p.colors.some((x) => x.name === c)) setColor(c);
  }, [p]);

  const changeColor = (c: string) => {
    setColor(c);
    const url = new URL(window.location.href);
    if (c === p.colors[0].name) url.searchParams.delete("color");
    else url.searchParams.set("color", c);
    window.history.replaceState(window.history.state, "", url);
  };

  // Mobile sticky add-to-bag appears once the main button scrolls away.
  useEffect(() => {
    const el = buy.current?.querySelector("[data-atc]") ?? buy.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div className="md:container-x md:grid md:grid-cols-[1.35fr_1fr] md:gap-10 lg:gap-16">
        <div className="md:pt-[calc(var(--header-h)+1rem)]">
          <div className="pt-[var(--header-h)] md:pt-0">
            <Gallery ref={gallery} product={p} color={color} />
          </div>
        </div>
        <div className="container-x md:px-0">
          <div ref={buy} className="pb-8 pt-6 md:sticky md:top-[calc(var(--header-h)+1rem)] md:pt-[calc(var(--header-h)+1rem)]">
            <div data-atc>
              <BuyBox
                product={p}
                color={color}
                onColor={changeColor}
                flyFrom={() => gallery.current?.hero() ?? null}
                onSizeGuide={() => setGuide(true)}
                onFitFinder={p.sizeSystem === "one" ? undefined : () => setFinder(true)}
                suggestedSize={suggest}
                size={size}
                onSize={setSize}
              />
            </div>
            <Accordions p={p} />
          </div>
        </div>
      </div>

      <Reviews p={p} />
      <CompleteTheLook pairs={pairs} />
      <RecentlyViewed current={p.slug} index={index} />

      {/* Mobile sticky bar */}
      <StickyBar p={p} color={color} size={size} show={showBar} onPickSize={setSize} flyFrom={() => gallery.current?.hero() ?? null} />

      {guide && <SizeGuideModal open={guide} onClose={() => setGuide(false)} product={p} />}
      {finder && (
        <FitFinder
          open={finder}
          onClose={() => setFinder(false)}
          product={p}
          onPick={(s) => {
            setSuggest(s);
            setSize(s);
          }}
        />
      )}
    </>
  );
}

function Accordion({ title, children, defaultOpen }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const id = useId();
  return (
    <div className="border-b border-line">
      <h2>
        <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between py-4 text-left">
          <span className="t-mono">{title}</span>
          <IconPlus size={16} className={clsx("transition-transform duration-500", open && "rotate-45")} />
        </button>
      </h2>
      <div id={id} role="region" className={clsx("grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden" inert={!open}>
          <div className="pb-5 text-sm leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Accordions({ p }: { p: Product }) {
  return (
    <div className="mt-6 border-t border-line">
      <Accordion title="Details" defaultOpen>
        <p>{p.long}</p>
        <ul className="mt-3 list-disc space-y-1 pl-4 marker:text-stone">
          {p.details.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </Accordion>
      <Accordion title="Fabric, origin & care">
        <p>
          <span className="font-medium">Fabric:</span> {p.materials}
        </p>
        <p className="mt-1">
          <span className="font-medium">Made:</span> {p.origin}
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-4 marker:text-stone">
          {p.care.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </Accordion>
      <Accordion title="Shipping & returns">
        <p>
          Free standard shipping on orders over {money(site.freeShippingThreshold)} (otherwise {money(site.standardShipping)}, 3–5 business days). Express is {money(site.expressShipping)}, 1–2 business days. Free pickup in Bishop Arts — ready in 2 hours.
        </p>
        <p className="mt-2">
          Free returns and exchanges within {site.returnDays} days, sale pieces included. A prepaid label is in every box.{" "}
          <Link href="/shipping-returns" className="link-line">
            Full policy
          </Link>
        </p>
      </Accordion>
    </div>
  );
}

function Reviews({ p }: { p: Product }) {
  const dist = [5, 4, 3, 2, 1].map((s) => {
    const base = s === 5 ? p.rating - 3.95 : s === 4 ? 4.95 - p.rating : s === 3 ? 0.04 : 0.01;
    return { s, pct: Math.max(1, Math.round(Math.max(0, base) * 100)) };
  });
  const sum = dist.reduce((a, d) => a + d.pct, 0);
  const fitPos = ((p.fitScore + 1) / 2) * 100;
  const bars = useRef<HTMLDivElement>(null);

  useIdleGSAP(() => {
    const el = bars.current;
    if (!el || prefersReducedMotion()) return;
    gsap.fromTo(el.querySelectorAll("[data-bar]"), { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: el, start: "top 85%", once: true } });
    gsap.fromTo(el.querySelector("[data-fit]"), { left: "50%" }, { left: `${fitPos}%`, duration: 1.6, ease: "elastic.out(1,0.6)", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
  }, bars);

  return (
    <section id="reviews" className="container-x scroll-mt-24 border-t border-line py-20 md:py-28" aria-labelledby="reviews-title">
      <div className="grid gap-12 md:grid-cols-12">
        <div ref={bars} className="md:col-span-4">
          <h2 id="reviews-title" className="t-h2">
            Reviews
          </h2>
          <div className="mt-6 flex items-center gap-4">
            <span className="font-display text-6xl font-extrabold leading-none">{p.rating.toFixed(1)}</span>
            <div>
              <Stars value={p.rating} size={18} />
              <p className="mt-1 text-sm text-muted">{p.reviewCount} verified reviews</p>
            </div>
          </div>
          <dl className="mt-8 space-y-2">
            {dist.map((d) => (
              <div key={d.s} className="grid grid-cols-[3rem_1fr_3rem] items-center gap-3 text-sm">
                <dt>{d.s} star</dt>
                <dd className="h-1.5 overflow-hidden rounded-full bg-char/10">
                  <span data-bar className="block h-full origin-left rounded-full bg-char" style={{ width: `${(d.pct / sum) * 100}%` }} />
                </dd>
                <dd className="t-price text-right text-muted">{Math.round((d.pct / sum) * 100)}%</dd>
              </div>
            ))}
          </dl>
          <div className="mt-10">
            <p className="t-mono text-muted">How it fits</p>
            <div className="relative mt-4 h-1.5 rounded-full bg-char/10" role="img" aria-label={`Fit: ${p.fitScore > 0.25 ? "runs large" : p.fitScore < -0.25 ? "runs small" : "true to size"}`}>
              <span className="absolute left-1/2 top-1/2 h-3 w-px -translate-y-1/2 bg-char/30" />
              <span data-fit className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cobalt ring-4 ring-bone" style={{ left: `${fitPos}%` }} />
            </div>
            <div className="t-mono mt-3 flex justify-between text-[0.6rem] text-muted">
              <span>Runs small</span>
              <span>True to size</span>
              <span>Runs large</span>
            </div>
          </div>
        </div>
        <ul className="space-y-8 md:col-span-7 md:col-start-6">
          {p.reviews.map((r) => (
            <li key={r.id} className="border-b border-line pb-8">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Stars value={r.rating} />
                  <span className="sr-only">{r.rating} out of 5 stars</span>
                  <h3 className="font-medium">{r.title}</h3>
                </div>
                <time className="t-mono text-[0.62rem] text-muted" dateTime={r.date}>
                  {new Date(r.date + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </time>
              </div>
              <p className="mt-3 leading-relaxed">{r.body}</p>
              <p className="t-mono mt-3 text-[0.62rem] text-muted">
                {r.author} · {r.location}
                {r.sizeBought ? ` · bought ${r.sizeBought}` : ""}
                {r.height ? ` · ${r.height}` : ""}
                {r.sizeBought ? ` · ${r.fit > 0.25 ? "runs large" : r.fit < -0.25 ? "runs small" : "true to size"}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CompleteTheLook({ pairs }: { pairs: Product[] }) {
  const rail = useRef<HTMLDivElement>(null);
  useIdleGSAP(() => {
    const el = rail.current;
    if (!el || prefersReducedMotion()) return;
    el.querySelectorAll<HTMLElement>("[data-par]").forEach((c, i) =>
      gsap.fromTo(c, { y: 60 + i * 40 }, { y: -20 - i * 10, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } }),
    );
  }, rail);
  if (!pairs.length) return null;
  return (
    <section className="theme-sand py-20 md:py-28" aria-labelledby="ctl-title">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="t-mono text-muted">Pairs well with</p>
            <h2 id="ctl-title" className="t-h2 mt-2">
              Complete the look
            </h2>
          </div>
          <p className="max-w-sm text-muted">Styled together in the shop. Tap a size and it&apos;s in your bag — you stay right here.</p>
        </div>
        <div ref={rail} className="mt-12 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-6">
          {pairs.map((x) => (
            <div key={x.slug} data-par>
              <ProductCard product={x} sizes="(min-width: 768px) 30vw, 50vw" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RecentlyViewed({ current, index }: { current: string; index: MiniProduct[] }) {
  const recent = useRecent();
  const mounted = useMounted();
  const list = mounted ? recent.filter((s) => s !== current).map((s) => index.find((x) => x.slug === s)).filter((x): x is MiniProduct => !!x).slice(0, 6) : [];
  if (!list.length) return null;
  return (
    <section className="container-x py-16" aria-labelledby="recent-title">
      <h2 id="recent-title" className="t-mono text-muted">
        Recently viewed
      </h2>
      <ul className="no-scrollbar mt-5 flex gap-3 overflow-x-auto">
        {list.map((x) => (
          <li key={x.slug} className="w-36 shrink-0 md:w-44">
            <Link href={`/products/${x.slug}`} className="group block">
              <div className="media aspect-[4/5] rounded-[2px]">
                <Image src={x.image} alt="" fill sizes="176px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <p className="mt-2 truncate text-sm font-medium">{x.name}</p>
              <p className="t-price text-xs text-muted">{money(x.price)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function StickyBar({ p, color, size, show, onPickSize, flyFrom }: { p: Product; color: string; size: string | null; show: boolean; onPickSize: (s: string) => void; flyFrom: () => Element | null }) {
  const sizes = p.variants.filter((v) => v.color === color);
  const v = size ? findVariant(p, color, size) : undefined;
  const out = sizesInStock(p, color).length === 0;
  return (
    <div
      className={clsx(
        "fixed inset-x-0 bottom-0 z-[95] border-t border-line bg-bone/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.6rem)] pt-2.5 backdrop-blur transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden",
        show ? "translate-y-0" : "translate-y-full",
      )}
      inert={!show}
    >
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{p.name}</p>
          <p className="t-price text-xs">{money(v?.price ?? sizes[0]?.price ?? p.price)}</p>
        </div>
        {p.sizeSystem !== "one" && (
          <label className="relative">
            <span className="sr-only">Size</span>
            <select value={size ?? ""} onChange={(e) => onPickSize(e.target.value)} className="h-11 appearance-none rounded-full border border-line bg-transparent pl-4 pr-8 text-sm">
              <option value="" disabled>
                Size
              </option>
              {sizes.map((x) => (
                <option key={x.id} value={x.size} disabled={x.stock === 0}>
                  {x.size}
                  {x.stock === 0 ? " — sold out" : x.stock <= 2 ? ` — ${x.stock} left` : ""}
                </option>
              ))}
            </select>
            <IconChevron size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
          </label>
        )}
        <button
          type="button"
          disabled={out || !v || v.stock === 0}
          onClick={() => v && addToBag(p, v, { from: flyFrom() })}
          className="btn btn-solid btn-sm h-11 px-5"
        >
          {out ? "Sold out" : "Add to bag"}
        </button>
      </div>
    </div>
  );
}
