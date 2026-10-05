"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import type { Look } from "@/content/lookbook";
import type { Product } from "@/lib/commerce/types";
import { productBySlug } from "@/content/products";
import { findVariant, sizesInStock } from "@/content/helpers";
import { money } from "@/lib/format";
import { addLook, addToBag } from "@/lib/bag";
import { Sheet, SheetHeader } from "@/components/ui/Sheet";
import { gsap, ScrollTrigger, useIdleGSAP, prefersReducedMotion } from "@/lib/gsap";
import { IconArrow, IconPlus } from "@/components/ui/Icons";

const defaultSize = (p: Product) => {
  const left = sizesInStock(p);
  const pref = p.sizeSystem === "waist" ? ["32", "30", "26", "28"] : ["M", "S", "L"];
  return pref.find((s) => left.includes(s)) ?? left[0] ?? null;
};

/**
 * Signature 2 — the lookbook. On desktop a pinned horizontal editorial
 * track: each look's photo scales and unmasks as it arrives, with an
 * oversized caption sliding behind it. Hotspots open a mini product sheet;
 * "Add the full look" adds every piece with a staggered flight to the bag.
 */
export function LookbookTrack({ looks }: { looks: Look[] }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [mini, setMini] = useState<{ p: Product; from: HTMLElement | null } | null>(null);
  const [full, setFull] = useState<Look | null>(null);

  useIdleGSAP(() => {
    const sec = root.current;
    const tr = track.current;
    if (!sec || !tr || prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const dist = () => tr.scrollWidth - window.innerWidth;
      const setH = () => (sec.style.height = `${dist() + window.innerHeight}px`);
      setH();
      const move = gsap.to(tr, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true, onRefreshInit: setH },
      });
      tr.querySelectorAll<HTMLElement>("[data-look]").forEach((look) => {
        const img = look.querySelector("[data-img]");
        const cap = look.querySelector("[data-cap]");
        gsap.fromTo(
          img,
          { clipPath: "inset(12% 18% 12% 18%)", scale: 1.15 },
          { clipPath: "inset(0% 0% 0% 0%)", scale: 1, ease: "none", scrollTrigger: { trigger: look, containerAnimation: move, start: "left 95%", end: "left 35%", scrub: true } },
        );
        gsap.fromTo(cap, { xPercent: 30 }, { xPercent: -30, ease: "none", scrollTrigger: { trigger: look, containerAnimation: move, start: "left right", end: "right left", scrub: true } });
      });
      ScrollTrigger.refresh();
      return () => {
        sec.style.height = "";
      };
    });
    mm.add("(max-width: 1023px)", () => {
      tr.querySelectorAll<HTMLElement>("[data-img]").forEach((img) =>
        gsap.fromTo(img, { clipPath: "inset(10% 10% 10% 10%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: img, start: "top 95%", end: "top 40%", scrub: true } }),
      );
    });
    return () => mm.revert();
  }, root);

  return (
    <section ref={root} className="relative bg-bone" aria-label="FW26 looks">
      <div className="lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:items-center lg:overflow-hidden">
        <div ref={track} className="flex flex-col gap-24 pb-24 lg:flex-row lg:items-center lg:gap-[8vw] lg:pb-0 lg:pl-[8vw] lg:pr-[12vw]">
          {looks.map((l, i) => {
            const pieces = l.hotspots.map((h) => productBySlug.get(h.slug)).filter((p): p is Product => !!p);
            const total = pieces.reduce((a, p) => a + p.price, 0);
            return (
              <article key={l.id} id={l.id} data-look className="relative scroll-mt-24 lg:flex lg:shrink-0 lg:items-end lg:gap-10" aria-labelledby={`${l.id}-t`}>
                <span
                  data-cap
                  data-text={l.title}
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-6 left-0 z-0 whitespace-nowrap font-display text-[clamp(4rem,14vw,15rem)] font-extrabold uppercase leading-none tracking-[-0.05em] text-char/[0.07] before:content-[attr(data-text)] lg:-top-[12vh]"
                />
                <div className="container-x relative z-[1] lg:px-0">
                  <div data-img className="media relative aspect-[4/5] w-full overflow-hidden rounded-[2px] lg:h-[74vh] lg:w-[59.2vh]">
                    <Image src={l.image} alt={l.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" preload={i === 0} loading={i < 2 ? "eager" : "lazy"} className="object-cover" />
                    {l.hotspots.map((h) => {
                      const p = productBySlug.get(h.slug);
                      if (!p) return null;
                      return (
                        <button
                          key={h.slug}
                          type="button"
                          className="group absolute z-10 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center"
                          style={{ left: `${h.x}%`, top: `${h.y}%` }}
                          aria-label={`${p.name} · ${money(p.price)} — quick shop`}
                          onClick={(e) => setMini({ p, from: e.currentTarget.closest("[data-look]")?.querySelector(`[data-thumb="${p.slug}"]`) as HTMLElement | null })}
                        >
                          <span className="absolute h-7 w-7 rounded-full bg-bone/40" style={{ animation: "pulse-dot 2.2s infinite" }} aria-hidden="true" />
                          <span className="relative grid h-7 w-7 place-items-center rounded-full bg-bone text-char shadow-lg transition-transform group-hover:scale-110">
                            <IconPlus size={14} />
                          </span>
                          <span className="t-mono pointer-events-none absolute left-9 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-bone px-3 py-1.5 text-[0.6rem] text-char opacity-0 shadow transition-opacity group-hover:opacity-100 md:block">
                            {p.name} · {money(p.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="container-x relative z-[1] mt-6 lg:mt-0 lg:w-[22rem] lg:px-0 lg:pb-2">
                  <p className="t-mono text-muted">
                    Look {l.n} · {l.place}
                  </p>
                  <h2 id={`${l.id}-t`} className="t-h3 mt-2">
                    {l.title}
                  </h2>
                  <p className="mt-2 text-muted">{l.caption}</p>
                  <ul className="mt-5 space-y-2.5">
                    {pieces.map((p) => (
                      <li key={p.slug} className="flex items-center gap-3">
                        <button type="button" onClick={(e) => setMini({ p, from: e.currentTarget.querySelector("[data-thumb]") })} className="flex flex-1 items-center gap-3 text-left">
                          <span data-thumb={p.slug} className="media relative block h-14 w-11 shrink-0 rounded-sm">
                            <Image src={p.images[0].src} alt="" fill sizes="44px" className="object-cover" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="link-u block truncate text-sm font-medium">{p.name}</span>
                            <span className="t-price text-xs text-muted">{money(p.price)}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button type="button" className="btn btn-solid mt-6 w-full" onClick={() => setFull(l)}>
                    Add the full look — {money(total)}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <MiniSheet item={mini} onClose={() => setMini(null)} />
      <FullLookSheet look={full} onClose={() => setFull(null)} />
    </section>
  );
}

function SizeChips({ p, value, onChange, label }: { p: Product; value: string | null; onChange: (s: string) => void; label: string }) {
  if (p.sizeSystem === "one") return <p className="t-mono text-[0.62rem] text-muted">One size</p>;
  const vs = p.variants.filter((v) => v.color === p.colors[0].name);
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {vs.map((v) => (
        <button key={v.id} type="button" role="radio" aria-checked={value === v.size} data-out={v.stock === 0} disabled={v.stock === 0} onClick={() => onChange(v.size)} className="size-opt min-h-10 min-w-10 text-[0.72rem]">
          {v.size}
        </button>
      ))}
    </div>
  );
}

function MiniSheet({ item, onClose }: { item: { p: Product; from: HTMLElement | null } | null; onClose: () => void }) {
  const [size, setSize] = useState<string | null>(null);
  const p = item?.p;
  const current = p ? (size && sizesInStock(p).includes(size) ? size : p.sizeSystem === "one" ? p.sizes[0] : size) : null;
  const close = () => {
    setSize(null);
    onClose();
  };
  return (
    <Sheet open={!!p} onClose={close} label={p ? `Quick shop: ${p.name}` : "Quick shop"} variant="modal" className="md:!w-[44rem]">
      {p && (
        <>
          <SheetHeader title="From the look" onClose={close} />
          <div className="grid gap-6 overflow-y-auto p-5 sm:grid-cols-[13rem_1fr] md:p-7">
            <div className="media relative aspect-[4/5] rounded-[2px]">
              <Image src={p.images[0].src} alt={p.images[0].alt} fill sizes="13rem" className="object-cover" />
            </div>
            <div>
              <h2 className="t-h3">{p.name}</h2>
              <p className="t-price mt-2">{money(p.price)}</p>
              <p className="mt-3 text-sm text-muted">{p.short}</p>
              <div className="mt-5">
                <SizeChips p={p} value={current} onChange={setSize} label={`Size for ${p.name}`} />
                {p.model && <p className="mt-2 text-xs text-muted">{p.model}</p>}
              </div>
              <button
                type="button"
                className="btn btn-solid mt-6 w-full"
                disabled={!current}
                onClick={() => {
                  const v = current ? findVariant(p, p.colors[0].name, current) : undefined;
                  if (!v) return;
                  const from = item?.from;
                  close();
                  window.setTimeout(() => addToBag(p, v, { from }), 380);
                }}
              >
                {current ? `Add to bag — ${money(p.price)}` : "Choose a size"}
              </button>
              <Link href={`/products/${p.slug}`} className="t-mono link-line mt-4 inline-flex items-center gap-2" onClick={close}>
                Full details <IconArrow size={14} />
              </Link>
            </div>
          </div>
        </>
      )}
    </Sheet>
  );
}

function FullLookSheet({ look, onClose }: { look: Look | null; onClose: () => void }) {
  const pieces = look ? look.hotspots.map((h) => productBySlug.get(h.slug)).filter((p): p is Product => !!p) : [];
  const [sizes, setSizes] = useState<Record<string, string | null>>({});
  const sizeOf = (p: Product) => (p.slug in sizes ? sizes[p.slug] : defaultSize(p));
  const ready = pieces.every((p) => sizeOf(p));
  const total = pieces.reduce((a, p) => a + p.price, 0);
  const close = () => {
    setSizes({});
    onClose();
  };
  return (
    <Sheet open={!!look} onClose={close} label="Add the full look" variant="drawer">
      {look && (
        <>
          <SheetHeader title={`Look ${look.n} · ${look.title}`} onClose={close} />
          <div className="flex-1 overflow-y-auto px-5 py-6 md:px-7">
            <p className="text-muted">We picked your likely size for each piece — change any before adding.</p>
            <ul className="mt-6 space-y-6">
              {pieces.map((p) => (
                <li key={p.slug} className={clsx("flex gap-4 border-b border-line pb-6")}>
                  <div className="media relative h-24 w-[4.8rem] shrink-0 rounded-sm">
                    <Image src={p.images[0].src} alt="" fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{p.name}</p>
                    <p className="t-price mb-3 text-sm text-muted">{money(p.price)}</p>
                    <SizeChips p={p} value={sizeOf(p)} onChange={(s) => setSizes((x) => ({ ...x, [p.slug]: s }))} label={`Size for ${p.name}`} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t border-line bg-paper px-5 py-4 md:px-7">
            <button
              type="button"
              className="btn btn-solid btn-lg w-full"
              disabled={!ready}
              onClick={() => {
                const items = pieces
                  .map((p) => {
                    const v = findVariant(p, p.colors[0].name, sizeOf(p)!);
                    const from = document.getElementById(look.id)?.querySelector<HTMLElement>(`[data-thumb="${p.slug}"]`) ?? null;
                    return v ? { product: p, variant: v, from } : null;
                  })
                  .filter((x): x is NonNullable<typeof x> => !!x);
                close();
                window.setTimeout(() => addLook(items), 420);
              }}
            >
              Add all {pieces.length} pieces — {money(total)}
            </button>
          </div>
        </>
      )}
    </Sheet>
  );
}
