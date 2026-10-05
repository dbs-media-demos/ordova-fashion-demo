"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { commerce, type PricedCart } from "@/lib/commerce";
import type { Product } from "@/lib/commerce/types";
import { cart, ui, useCart, useMounted } from "@/lib/store";
import { money } from "@/lib/format";
import { site } from "@/lib/site";
import { productBySlug } from "@/content/products";
import { sizesInStock, findVariant } from "@/content/helpers";
import { addToBag } from "@/lib/bag";
import { IconMinus, IconPlus, IconTruck, IconStore, IconGift, IconCheck } from "@/components/ui/Icons";

/** Priced view of the persisted cart (client only). */
export function usePricedCart(): { priced: PricedCart; mounted: boolean } {
  const state = useCart();
  const mounted = useMounted();
  const priced = commerce.priceCart(mounted ? state.lines : [], { promo: state.promo });
  return { priced, mounted };
}

export function FreeShippingBar({ remaining, subtotal }: { remaining: number; subtotal: number }) {
  const pct = Math.min(100, (subtotal / site.freeShippingThreshold) * 100);
  return (
    <div>
      <p className="text-sm">
        {remaining > 0 ? (
          <>
            You&apos;re <strong className="font-semibold">{money(remaining)}</strong> away from free shipping.
          </>
        ) : (
          <span className="inline-flex items-center gap-2">
            <IconCheck size={16} /> Free shipping unlocked.
          </span>
        )}
      </p>
      <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-char/10" role="progressbar" aria-label="Progress to free shipping" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
        <div className="h-full origin-left rounded-full bg-cobalt transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ transform: `scaleX(${pct / 100})` }} />
      </div>
    </div>
  );
}

export function Stepper({ value, onChange, label, max = 10 }: { value: number; onChange: (n: number) => void; label: string; max?: number }) {
  return (
    <div className="inline-flex items-center rounded-full border border-line" role="group" aria-label={`Quantity for ${label}`}>
      <button type="button" className="grid h-9 w-9 place-items-center rounded-full hover:bg-char/5" onClick={() => onChange(value - 1)} aria-label={`Decrease quantity of ${label}`}>
        <IconMinus size={14} />
      </button>
      <span className="t-price w-6 text-center" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="grid h-9 w-9 place-items-center rounded-full hover:bg-char/5 disabled:opacity-30"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Increase quantity of ${label}`}
      >
        <IconPlus size={14} />
      </button>
    </div>
  );
}

export function CartLines({ priced, compact }: { priced: PricedCart; compact?: boolean }) {
  const [undo, setUndo] = useState<{ line: Parameters<typeof cart.restore>[0]; index: number; name: string } | null>(null);
  const timer = useRef<number>(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const remove = (variantId: string, name: string) => {
    const r = cart.remove(variantId);
    if (!r) return;
    ui.announce(`Removed ${name} from your bag.`);
    setUndo({ ...r, name });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setUndo(null), 6000);
  };

  return (
    <div>
      {undo && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-char px-4 py-3 text-sm text-bone" role="status">
          <span>Removed {undo.name}.</span>
          <button
            type="button"
            className="t-mono underline underline-offset-4"
            onClick={() => {
              cart.restore(undo.line, undo.index);
              ui.announce(`Restored ${undo.name}.`);
              setUndo(null);
            }}
          >
            Undo
          </button>
        </div>
      )}
      <ul className="divide-y divide-line">
        {priced.lines.map(({ line, product, variant, total }) => {
          const img = product.colors.find((c) => c.name === variant.color)?.image ?? product.images[0].src;
          return (
            <li key={line.variantId} className="flex gap-4 py-4">
              <Link href={`/products/${product.slug}`} className={clsx("media shrink-0 rounded-sm", compact ? "h-28 w-[5.6rem]" : "h-36 w-28")} onClick={() => ui.closeCart()}>
                <Image src={img} alt={product.images[0].alt} fill sizes="120px" className="object-cover" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/products/${product.slug}`} className="link-u font-medium" onClick={() => ui.closeCart()}>
                      {product.name}
                    </Link>
                    <p className="mt-0.5 text-sm text-muted">
                      {variant.color}
                      {variant.size !== "One size" && ` · ${variant.size}`}
                    </p>
                    {variant.stock > 0 && variant.stock <= 2 && <p className="t-mono mt-1 text-[0.62rem] text-cobalt">Only {variant.stock} left</p>}
                  </div>
                  <div className="text-right">
                    <p className="t-price">{money(total)}</p>
                    {variant.compareAt && <p className="t-price text-xs text-muted line-through">{money(variant.compareAt * line.qty)}</p>}
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <Stepper value={line.qty} onChange={(n) => (n <= 0 ? remove(line.variantId, product.name) : cart.setQty(line.variantId, n))} label={product.name} max={Math.max(1, Math.min(10, variant.stock))} />
                  <button type="button" className="t-mono link-u text-muted" onClick={() => remove(line.variantId, product.name)}>
                    Remove
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function DeliveryToggle() {
  const { mode } = useCart();
  const opts = [
    { id: "ship" as const, label: "Ship to me", icon: IconTruck, note: "Free over $150" },
    { id: "pickup" as const, label: "Pick up in store", icon: IconStore, note: "Bishop Arts · 2 hrs" },
  ];
  return (
    <div role="radiogroup" aria-label="Delivery" className="grid grid-cols-2 gap-2">
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={mode === o.id}
          onClick={() => cart.setMode(o.id)}
          className={clsx(
            "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
            mode === o.id ? "border-char bg-char text-bone" : "border-line hover:border-char",
          )}
        >
          <o.icon size={20} />
          <span>
            <span className="block text-sm font-medium leading-tight">{o.label}</span>
            <span className={clsx("block text-xs", mode === o.id ? "text-bone/70" : "text-muted")}>{o.note}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

export function GiftOption() {
  const { gift } = useCart();
  const on = !!gift?.on;
  return (
    <div className="rounded-lg border border-line px-4 py-3">
      <label className="flex cursor-pointer items-center gap-3 text-sm">
        <input type="checkbox" checked={on} onChange={(e) => cart.setGift({ on: e.target.checked, message: gift?.message ?? "" })} className="h-4 w-4 accent-[#151513]" />
        <IconGift size={18} />
        <span>
          Gift-wrap this order <span className="text-muted">— free, tissue + handwritten card</span>
        </span>
      </label>
      {on && (
        <div className="mt-3">
          <label htmlFor="gift-msg" className="sr-only">
            Gift message
          </label>
          <textarea
            id="gift-msg"
            rows={2}
            maxLength={180}
            placeholder="Your message (we'll write it by hand)"
            value={gift?.message ?? ""}
            onChange={(e) => cart.setGift({ on: true, message: e.target.value })}
            className="field min-h-0 resize-none text-sm"
          />
          <p className="mt-1 text-right text-xs text-muted">{(gift?.message ?? "").length}/180</p>
        </div>
      )}
    </div>
  );
}

export function PromoField() {
  const { promo } = useCart();
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  if (promo) {
    return (
      <div className="flex items-center justify-between rounded-lg bg-sand px-4 py-3 text-sm">
        <span className="inline-flex items-center gap-2">
          <IconCheck size={16} /> <span className="t-mono">{promo}</span> applied — 10% off
        </span>
        <button
          type="button"
          className="t-mono link-u text-muted"
          onClick={() => {
            cart.setPromo(undefined);
            setMsg(null);
          }}
        >
          Remove
        </button>
      </div>
    );
  }
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const r = commerce.validatePromo(code);
        if (r.ok) {
          cart.setPromo(r.code);
          ui.announce(`Promo code ${r.code} applied: ${r.label}.`);
          setMsg(null);
          setCode("");
        } else setMsg({ ok: false, text: r.message });
      }}
    >
      <label htmlFor="promo" className="label">
        Promo code
      </label>
      <div className="flex gap-2">
        <input
          id="promo"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. WELCOME10"
          autoComplete="off"
          className="field min-h-11 py-2 uppercase"
          aria-invalid={msg ? !msg.ok : undefined}
          aria-describedby={msg ? "promo-msg" : undefined}
        />
        <button type="submit" className="btn btn-ghost btn-sm shrink-0">
          Apply
        </button>
      </div>
      {msg && (
        <p id="promo-msg" className="err" role="alert">
          {msg.text}
        </p>
      )}
    </form>
  );
}

export function Summary({ priced, mode }: { priced: PricedCart; mode: "ship" | "pickup" }) {
  const shipping = mode === "pickup" ? 0 : priced.shipping;
  const total = priced.subtotal - priced.discount + (shipping ?? 0);
  return (
    <dl className="space-y-1.5 text-sm">
      <div className="flex justify-between">
        <dt>Subtotal</dt>
        <dd className="t-price">{money(priced.subtotal)}</dd>
      </div>
      {priced.discount > 0 && (
        <div className="flex justify-between text-ok">
          <dt>Discount ({priced.promo?.code})</dt>
          <dd className="t-price">−{money(priced.discount)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt>{mode === "pickup" ? "Pickup in Bishop Arts" : "Shipping"}</dt>
        <dd className="t-price">{shipping === null ? `from ${money(site.standardShipping)}` : shipping === 0 ? "Free" : money(shipping)}</dd>
      </div>
      <div className="flex justify-between text-muted">
        <dt>Sales tax</dt>
        <dd>Calculated at checkout</dd>
      </div>
      <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
        <dt>Estimated total</dt>
        <dd className="t-price text-base">{money(Math.round(total * 100) / 100)}</dd>
      </div>
    </dl>
  );
}

/** "Complete the look" upsells: pairs of what's in the bag, not already in it. One tap = add. */
export function CrossSells({ priced, limit = 3, title = "Complete the look" }: { priced: PricedCart; limit?: number; title?: string }) {
  const inBag = new Set(priced.lines.map((l) => l.product.slug));
  const picks: Product[] = [];
  for (const l of priced.lines)
    for (const s of l.product.pairs) {
      const p = productBySlug.get(s);
      if (p && !inBag.has(s) && !picks.includes(p) && sizesInStock(p).length) picks.push(p);
    }
  if (!picks.length) for (const s of ["bridle-belt", "rib-beanie", "washed-cap", "market-canvas-tote"]) picks.push(productBySlug.get(s)!);
  const list = picks.slice(0, limit);
  return (
    <div>
      <p className="t-mono mb-3 text-muted">{title}</p>
      <ul className="space-y-3">
        {list.map((p) => (
          <CrossSellRow key={p.slug} p={p} />
        ))}
      </ul>
    </div>
  );
}

function CrossSellRow({ p }: { p: Product }) {
  const sizes = sizesInStock(p);
  const [size, setSize] = useState(sizes.length === 1 ? sizes[0] : "");
  const img = useRef<HTMLDivElement>(null);
  const add = () => {
    const v = findVariant(p, p.colors[0].name, size || sizes[0]);
    if (v) addToBag(p, v, { from: img.current, open: false });
  };
  return (
    <li className="flex items-center gap-3">
      <div ref={img} className="media h-16 w-[3.2rem] shrink-0 rounded-sm">
        <Image src={p.images[0].src} alt="" fill sizes="60px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <Link href={`/products/${p.slug}`} className="link-u block truncate text-sm font-medium" onClick={() => ui.closeCart()}>
          {p.name}
        </Link>
        <p className="t-price text-xs text-muted">{money(p.price)}</p>
      </div>
      {sizes.length > 1 && (
        <select aria-label={`Size for ${p.name}`} value={size} onChange={(e) => setSize(e.target.value)} className="h-10 rounded-full border border-line bg-transparent px-2 text-sm">
          <option value="">Size</option>
          {sizes.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      )}
      <button type="button" className="btn btn-solid btn-sm px-4" onClick={add} disabled={sizes.length > 1 && !size} aria-label={`Add ${p.name} to bag`}>
        Add
      </button>
    </li>
  );
}
