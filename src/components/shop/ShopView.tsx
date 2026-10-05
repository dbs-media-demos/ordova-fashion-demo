"use client";

import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import type { Product } from "@/lib/commerce/types";
import { ProductCard } from "./ProductCard";
import { Sheet, SheetHeader } from "@/components/ui/Sheet";
import { categories } from "@/content/taxonomy";
import { colorFamilies, facetValues } from "@/content/helpers";
import { EMPTY, PRICE_BANDS, SORTS, activeCount, applyFilters, parseFilters, serializeFilters, type Filters } from "@/lib/filters";
import { gsap, loadFlip, onIdle, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";
import { IconChevron, IconClose } from "@/components/ui/Icons";

type FlipT = Awaited<ReturnType<typeof loadFlip>>;

/** Reports URL search params to the (server-rendered) grid without forcing it client-only. */
function ParamsListener({ onChange }: { onChange: (sp: URLSearchParams) => void }) {
  const sp = useSearchParams();
  const key = sp.toString();
  useEffect(() => {
    onChange(new URLSearchParams(key));
  }, [key, onChange]);
  return null;
}

type Props = {
  products: Product[];
  /** Facets hidden because the page already fixes them (e.g. category pages). */
  hide?: ("cat" | "dept")[];
  label: string;
  /** Load the first row eagerly (pages without a big header image). */
  eagerCards?: boolean;
};

/**
 * The catalog grid. Filters + sort live in the URL (shareable), and every
 * change animates with GSAP Flip: cards glide to their new slots, leavers
 * shrink away, newcomers fade up.
 */
export function ShopView({ products, hide = [], label, eagerCards }: Props) {
  const [f, setF] = useState<Filters>(EMPTY);
  const [sheet, setSheet] = useState(false);
  const grid = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const flip = useRef<FlipT | null>(null);
  const pending = useRef<ReturnType<FlipT["getState"]> | null>(null);
  const prevH = useRef(0);
  const fRef = useRef(f);
  useEffect(() => {
    fRef.current = f;
  }, [f]);

  const visible = useMemo(() => applyFilters(products, f), [products, f]);
  const visibleSet = new Set(visible.map((p) => p.slug));
  const hiddenOnes = products.filter((p) => !visibleSet.has(p.slug));

  // Lazy-load Flip once idle.
  useEffect(() => onIdle(() => void loadFlip().then((F) => (flip.current = F))), []);

  const commit = useCallback((next: Filters, push = true) => {
    if (flip.current && grid.current && !prefersReducedMotion()) {
      pending.current = flip.current.getState(grid.current.querySelectorAll("[data-flip-id]"));
      prevH.current = grid.current.offsetHeight;
    }
    setF(next);
    if (push) {
      const qs = serializeFilters(next);
      window.history.replaceState(window.history.state, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
    }
  }, []);

  const onParams = useCallback(
    (sp: URLSearchParams) => {
      const next = parseFilters(sp);
      if (serializeFilters(next) !== serializeFilters(fRef.current)) commit(next, false);
    },
    [commit],
  );

  useLayoutEffect(() => {
    const st = pending.current;
    const F = flip.current;
    if (!st || !F) return;
    pending.current = null;
    const g = grid.current!;
    // Flip lifts cards out of flow while they travel; hold the grid's height so the page below doesn't jump.
    g.style.minHeight = `${Math.max(prevH.current, g.offsetHeight)}px`;
    F.from(st, {
      duration: 0.75,
      ease: "power3.inOut",
      absolute: true,
      stagger: 0.012,
      scale: false,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.25, stagger: 0.03, ease: "expo.out" }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.92, duration: 0.4, ease: "power2.in" }),
      onComplete: () => {
        g.style.minHeight = "";
        ScrollTrigger.refresh();
      },
    });
  }, [f]);

  // Cards below the fold wipe up in staggered batches the first time.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let triggers: ScrollTrigger[] = [];
    const cancel = onIdle(() => {
      const items = Array.from(grid.current?.querySelectorAll<HTMLElement>("[data-flip-id]:not([hidden]) [data-wipe]") ?? []).filter(
        (el) => el.getBoundingClientRect().top > window.innerHeight,
      );
      gsap.set(items, { clipPath: "inset(100% 0% 0% 0%)" });
      triggers = ScrollTrigger.batch(items, {
        start: "top 92%",
        once: true,
        onEnter: (b) => gsap.to(b, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "expo.inOut", stagger: 0.08, clearProps: "clipPath" }),
      });
    });
    return () => {
      cancel();
      triggers.forEach((t) => t.kill());
    };
  }, []);

  // Sticky bar condenses once it docks.
  const [docked, setDocked] = useState(false);
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setDocked(e.intersectionRatio < 1), { threshold: [1], rootMargin: "-1px 0px 0px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const toggle = (k: keyof Omit<Filters, "sort">, v: string) => {
    const cur = f[k];
    commit({ ...f, [k]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] });
  };
  const n = activeCount(f);

  const pills: { k: keyof Omit<Filters, "sort">; v: string; label: string }[] = [
    ...f.dept.map((v) => ({ k: "dept" as const, v, label: v[0].toUpperCase() + v.slice(1) })),
    ...f.cat.map((v) => ({ k: "cat" as const, v, label: categories.find((c) => c.slug === v)?.name ?? v })),
    ...f.size.map((v) => ({ k: "size" as const, v, label: `Size ${v}` })),
    ...f.color.map((v) => ({ k: "color" as const, v, label: v })),
    ...f.price.map((v) => ({ k: "price" as const, v, label: PRICE_BANDS.find((b) => b.id === v)?.label ?? v })),
    ...f.fabric.map((v) => ({ k: "fabric" as const, v, label: v })),
  ];

  return (
    <section aria-label={label}>
      <Suspense fallback={null}>
        <ParamsListener onChange={onParams} />
      </Suspense>

      {/* sticky filter bar */}
      <div ref={bar} className={clsx("sticky top-0 z-40 border-y border-line bg-bone/95 backdrop-blur transition-[padding] duration-500", docked ? "py-2" : "py-3.5")}>
        <div className="container-x flex items-center gap-2">
          <button type="button" onClick={() => setSheet(true)} className="chip shrink-0" aria-haspopup="dialog">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
              <circle cx="16" cy="7" r="2" />
              <circle cx="10" cy="17" r="2" />
            </svg>
            Filters{n ? ` (${n})` : ""}
          </button>
          {!hide.includes("dept") && (
            <div className="no-scrollbar hidden gap-2 overflow-x-auto sm:flex" role="group" aria-label="Department">
              {["women", "men", "unisex"].map((d) => (
                <button key={d} type="button" className="chip" aria-pressed={f.dept.includes(d)} onClick={() => toggle("dept", d)}>
                  {d === "unisex" ? "Accessories & unisex" : d[0].toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          )}
          <p className="t-mono ml-auto hidden text-muted md:block" aria-live="polite">
            {visible.length} {visible.length === 1 ? "piece" : "pieces"}
          </p>
          <label className="relative ml-auto shrink-0 md:ml-3">
            <span className="sr-only">Sort by</span>
            <select
              value={f.sort}
              onChange={(e) => commit({ ...f, sort: e.target.value as Filters["sort"] })}
              className="chip appearance-none bg-transparent pr-9"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <IconChevron size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
          </label>
        </div>
        {pills.length > 0 && (
          <div className="container-x mt-2 flex flex-wrap items-center gap-1.5">
            {pills.map((p) => (
              <button key={`${p.k}-${p.v}`} type="button" onClick={() => toggle(p.k, p.v)} className="t-mono inline-flex min-h-8 items-center gap-1.5 rounded-full bg-char px-3 text-[0.62rem] text-bone" aria-label={`Remove filter ${p.label}`}>
                {p.label} <IconClose size={12} />
              </button>
            ))}
            <button type="button" onClick={() => commit({ ...EMPTY, sort: f.sort })} className="t-mono link-u ml-1 text-[0.62rem]">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* grid */}
      <div className="container-x pb-24 pt-8">
        <p className="sr-only" aria-live="polite">
          {visible.length} products shown
        </p>
        <div ref={grid} className="relative grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
          {visible.map((p, i) => (
            <div key={p.slug} data-flip-id={p.slug}>
              <div data-wipe>
                <ProductCard product={p} eager={eagerCards && i < 4} />
              </div>
            </div>
          ))}
          {hiddenOnes.map((p) => (
            <div key={p.slug} data-flip-id={p.slug} hidden>
              <div data-wipe>
                <ProductCard product={p} />
              </div>
            </div>
          ))}
        </div>
        {visible.length === 0 && (
          <div className="mx-auto max-w-lg py-20 text-center">
            <p className="t-h3">Nothing matches — yet</p>
            <p className="mt-3 text-muted">We make things in small runs, so some combinations sell through. Loosen a filter, or start fresh:</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button type="button" className="btn btn-solid" onClick={() => commit({ ...EMPTY, sort: f.sort })}>
                Clear filters
              </button>
              {f.size.length > 0 && (
                <button type="button" className="btn btn-ghost" onClick={() => commit({ ...f, size: [] })}>
                  Any size
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* filter sheet */}
      <Sheet open={sheet} onClose={() => setSheet(false)} label="Filters" variant="left">
        <SheetHeader title={<>Filter & sort {n ? <span className="text-muted">({n})</span> : null}</>} onClose={() => setSheet(false)} />
        <div className="flex-1 space-y-8 overflow-y-auto overscroll-contain px-5 py-6 md:px-7">
          <Facet title="Sort">
            {SORTS.map((s) => (
              <button key={s.id} type="button" className="chip" aria-pressed={f.sort === s.id} onClick={() => commit({ ...f, sort: s.id })}>
                {s.label}
              </button>
            ))}
          </Facet>
          {!hide.includes("dept") && (
            <Facet title="Department">
              {["women", "men", "unisex"].map((d) => (
                <button key={d} type="button" className="chip" aria-pressed={f.dept.includes(d)} onClick={() => toggle("dept", d)}>
                  {d === "unisex" ? "Unisex" : d[0].toUpperCase() + d.slice(1)}
                </button>
              ))}
            </Facet>
          )}
          {!hide.includes("cat") && (
            <Facet title="Category">
              {categories.map((c) => (
                <button key={c.slug} type="button" className="chip" aria-pressed={f.cat.includes(c.slug)} onClick={() => toggle("cat", c.slug)}>
                  {c.name}
                </button>
              ))}
            </Facet>
          )}
          <Facet title="Size">
            {facetValues.sizes.map((s) => (
              <button key={s} type="button" className="chip min-w-12 justify-center" aria-pressed={f.size.includes(s)} onClick={() => toggle("size", s)}>
                {s}
              </button>
            ))}
          </Facet>
          <Facet title="Colour">
            {colorFamilies.map(([name, hex]) => (
              <button key={name} type="button" className="chip" aria-pressed={f.color.includes(name)} onClick={() => toggle("color", name)}>
                <span className="h-3.5 w-3.5 rounded-full ring-1 ring-char/20" style={{ background: hex }} aria-hidden="true" />
                {name}
              </button>
            ))}
          </Facet>
          <Facet title="Price">
            {PRICE_BANDS.map((b) => (
              <button key={b.id} type="button" className="chip" aria-pressed={f.price.includes(b.id)} onClick={() => toggle("price", b.id)}>
                {b.label}
              </button>
            ))}
          </Facet>
          <Facet title="Fabric">
            {facetValues.fabric.map((x) => (
              <button key={x} type="button" className="chip" aria-pressed={f.fabric.includes(x)} onClick={() => toggle("fabric", x)}>
                {x}
              </button>
            ))}
          </Facet>
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-2 border-t border-line bg-paper px-5 py-4 md:px-7">
          <button type="button" className="btn btn-ghost" onClick={() => commit({ ...EMPTY, sort: f.sort })}>
            Clear
          </button>
          <button type="button" className="btn btn-solid" onClick={() => setSheet(false)}>
            Show {visible.length} {visible.length === 1 ? "piece" : "pieces"}
          </button>
        </div>
      </Sheet>
    </section>
  );
}

function Facet({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="t-mono mb-3 text-muted">{title}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}
