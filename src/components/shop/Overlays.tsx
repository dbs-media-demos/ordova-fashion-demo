"use client";

import { useDeferredValue, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import clsx from "clsx";
import { Sheet, SheetHeader } from "@/components/ui/Sheet";
import { BuyBox } from "@/components/product/BuyBox";
import { products, productBySlug } from "@/content/products";
import { categories, collections } from "@/content/taxonomy";
import { ui, useUi } from "@/lib/store";
import { money } from "@/lib/format";
import { IconArrow, IconSearch } from "@/components/ui/Icons";

/** Quick view: image + compact buy box, opened from any product card. */
export function QuickView() {
  const { quickView } = useUi();
  const p = quickView ? productBySlug.get(quickView) : undefined;
  const [color, setColor] = useState<string | null>(null);
  const img = useRef<HTMLDivElement>(null);
  const current = p ? (color && p.colors.some((c) => c.name === color) ? color : p.colors[0].name) : "";
  const close = () => {
    ui.quickView(null);
    setColor(null);
  };

  return (
    <Sheet open={!!p} onClose={close} label={p ? `Quick view: ${p.name}` : "Quick view"} variant="modal">
      {p && (
        <>
          <SheetHeader title="Quick view" onClose={close} />
          <div className="grid flex-1 overflow-y-auto overscroll-contain md:grid-cols-[1fr_1.05fr]">
            <div ref={img} className="media relative aspect-[4/5] md:aspect-auto md:min-h-[34rem]">
              {p.colors.map((c) => (
                <Image
                  key={c.name}
                  src={c.image}
                  alt={c.name === current ? p.images[0].alt : ""}
                  fill
                  sizes="(min-width: 768px) 32rem, 100vw"
                  className={clsx("object-cover transition-[opacity,transform] duration-700", c.name === current ? "scale-100 opacity-100" : "scale-105 opacity-0")}
                />
              ))}
            </div>
            <div className="p-5 md:p-8">
              <BuyBox product={p} color={current} onColor={setColor} flyFrom={() => img.current} compact headingLevel="h2" onAdded={close} />
              <Link href={`/products/${p.slug}`} onClick={close} className="t-mono link-line mt-6 inline-flex items-center gap-2">
                View full details <IconArrow size={16} />
              </Link>
            </div>
          </div>
        </>
      )}
    </Sheet>
  );
}

const SUGGEST = ["linen", "trench", "oxford", "selvedge", "tote", "merino", "slip dress"];

function score(q: string, text: string) {
  const t = text.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .reduce((s, w) => s + (t.includes(w) ? (t.startsWith(w) ? 3 : 1) : -100), 0);
}

/** Instant search with thumbnails, prices and suggestions when nothing matches. */
export function SearchOverlay() {
  const { searchOpen } = useUi();
  const [q, setQ] = useState("");
  const dq = useDeferredValue(q);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = useMemo(() => {
    const s = dq.trim();
    if (!s) return [];
    return products
      .map((p) => ({ p, s: score(s, `${p.name} ${p.category} ${p.dept} ${p.fabric} ${p.colors.map((c) => c.name).join(" ")} ${p.short}`) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || b.p.featured - a.p.featured)
      .slice(0, 8)
      .map((x) => x.p);
  }, [dq]);

  const close = () => ui.closeSearch();

  return (
    <Sheet open={searchOpen} onClose={close} label="Search" variant="full" initialFocus={input}>
      <div className="container-x flex h-[var(--header-h)] items-center justify-between border-b border-line">
        <span className="t-mono text-muted">Search Ordova</span>
        <button type="button" onClick={close} className="t-mono link-u">
          Close
        </button>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="container-x mx-auto max-w-6xl py-8 md:py-14">
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              if (results[0]) {
                close();
                router.push(`/products/${results[0].slug}`);
              }
            }}
          >
            <label htmlFor="site-search" className="sr-only">
              Search products
            </label>
            <div className="flex items-center gap-4 border-b-2 border-char pb-3">
              <IconSearch size={28} />
              <input
                ref={input}
                id="site-search"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Linen, trench, size M…"
                autoComplete="off"
                className="w-full bg-transparent font-display text-[clamp(1.6rem,4.5vw,3.4rem)] font-bold uppercase tracking-tight placeholder:text-char/25 focus:outline-none"
              />
            </div>
          </form>

          {!q.trim() && (
            <div className="mt-10 grid gap-10 md:grid-cols-[1fr_2fr]">
              <div>
                <p className="t-mono text-muted">Popular</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {SUGGEST.map((s) => (
                    <button key={s} type="button" className="chip" onClick={() => setQ(s)}>
                      {s}
                    </button>
                  ))}
                </div>
                <p className="t-mono mt-10 text-muted">Collections</p>
                <ul className="mt-4 space-y-2">
                  {collections.map((c) => (
                    <li key={c.slug}>
                      <Link href={`/collections/${c.slug}`} onClick={close} className="link-u text-lg">
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="t-mono text-muted">Shop by category</p>
                <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {categories.map((c) => (
                    <li key={c.slug}>
                      <Link href={`/shop/${c.slug}`} onClick={close} className="group block">
                        <div className="media aspect-[4/5] rounded-sm">
                          <Image src={c.image} alt="" fill sizes="(min-width: 640px) 14vw, 45vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                        </div>
                        <p className="mt-2 text-sm font-medium">{c.name}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {q.trim() && (
            <div className="mt-8" aria-live="polite">
              <p className="t-mono text-muted">
                {results.length ? `${results.length} result${results.length > 1 ? "s" : ""}` : `Nothing for “${q.trim()}”`}
              </p>
              {results.length ? (
                <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                  {results.map((p, i) => (
                    <li key={p.slug} className="anim-fade" style={{ "--d": `${i * 0.04}s` } as React.CSSProperties}>
                      <Link href={`/products/${p.slug}`} onClick={close} className="group block">
                        <div className="media aspect-[4/5] rounded-sm">
                          <Image src={p.images[0].src} alt="" fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                        </div>
                        <div className="mt-2.5 flex justify-between gap-2 text-sm">
                          <span className="font-medium">{p.name}</span>
                          <span className="t-price">{money(p.price)}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-5">
                  <p className="text-muted">Try a fabric or a piece — or one of these:</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {SUGGEST.map((s) => (
                      <button key={s} type="button" className="chip" onClick={() => setQ(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <Link href="/shop" onClick={close} className="btn btn-solid mt-8">
                    Browse everything <IconArrow size={16} />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Sheet>
  );
}
