"use client";

import { useEffect, useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";
import type { Product } from "@/lib/commerce/types";
import { findVariant } from "@/content/helpers";
import { money } from "@/lib/format";
import { addToBag } from "@/lib/bag";
import { deliveryEstimate } from "@/lib/commerce";
import { site } from "@/lib/site";
import { toggleWish, ui, useMounted, useWishlist } from "@/lib/store";
import { IconCheck, IconHeart, IconRuler, IconStore, IconTruck } from "@/components/ui/Icons";
import { Stars } from "@/components/ui/Stars";

/** Roving-tabindex radio group: arrow keys move + select, like native radios. */
function RadioGroup({ label, children, className, labelledBy }: { label?: string; labelledBy?: string; children: ReactNode; className?: string }) {
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].includes(e.key)) return;
    const radios = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]'));
    const i = radios.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    e.preventDefault();
    const n =
      e.key === "Home" ? 0 : e.key === "End" ? radios.length - 1 : (i + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1) + radios.length) % radios.length;
    radios[n].focus();
    radios[n].click();
  };
  return (
    <div role="radiogroup" aria-label={label} aria-labelledby={labelledBy} className={className} onKeyDown={onKey}>
      {children}
    </div>
  );
}

type Props = {
  product: Product;
  color: string;
  onColor: (c: string) => void;
  /** Element the fly-to-bag ghost starts from (gallery hero). */
  flyFrom?: () => Element | null;
  compact?: boolean;
  onAdded?: () => void;
  headingLevel?: "h1" | "h2";
  onSizeGuide?: () => void;
  onFitFinder?: () => void;
  /** Size pre-selected by the fit finder. */
  suggestedSize?: string | null;
  /** Report size choice up (for the sticky mobile bar). */
  onSize?: (s: string | null) => void;
  size?: string | null;
};

export function BuyBox({ product: p, color, onColor, flyFrom, compact, onAdded, headingLevel = "h1", onSizeGuide, onFitFinder, suggestedSize, onSize, size: sizeProp }: Props) {
  const oneSize = p.sizeSystem === "one";
  const [sizeState, setSizeState] = useState<string | null>(oneSize ? p.sizes[0] : null);
  const size = sizeProp !== undefined ? sizeProp : sizeState;
  const setSize = (s: string | null) => {
    setSizeState(s);
    onSize?.(s);
  };
  const [error, setError] = useState(false);
  const [added, setAdded] = useState(false);
  const [notify, setNotify] = useState<"idle" | "done">("idle");
  const [email, setEmail] = useState("");
  const wish = useWishlist();
  const mounted = useMounted();
  const saved = mounted && wish.includes(p.slug);
  const H = headingLevel;

  useEffect(() => {
    if (suggestedSize) {
      setSizeState(suggestedSize);
      onSize?.(suggestedSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedSize]);

  const variant = size ? findVariant(p, color, size) : undefined;
  const colorVariants = p.variants.filter((v) => v.color === color);
  const price = variant?.price ?? colorVariants[0]?.price ?? p.price;
  const allOut = colorVariants.every((v) => v.stock === 0);
  const sizeOut = variant ? variant.stock === 0 : false;
  const estimate = useMemo(() => (mounted ? deliveryEstimate("standard") : ""), [mounted]);

  const add = async () => {
    if (!variant) {
      setError(true);
      document.getElementById(`sizes-${p.slug}`)?.querySelector<HTMLElement>('[role="radio"]')?.focus();
      return;
    }
    if (variant.stock === 0) return;
    setAdded(true);
    await addToBag(p, variant, { from: flyFrom?.() });
    onAdded?.();
    window.setTimeout(() => setAdded(false), 1800);
  };

  let stockMsg: ReactNode = null;
  if (allOut) stockMsg = <span>Sold out in {color}. Leave your email and we&apos;ll tell you when it&apos;s recut.</span>;
  else if (variant && variant.stock === 0) stockMsg = <span>{size} is sold out — get notified when it&apos;s back.</span>;
  else if (variant && variant.stock <= 2) stockMsg = <span className="text-cobalt">Only {variant.stock} left in {size}.</span>;
  else if (variant) stockMsg = <span className="inline-flex items-center gap-1.5"><IconCheck size={15} /> In stock, ships from Dallas.</span>;

  return (
    <div className={clsx("flex flex-col", compact ? "gap-5" : "gap-6")}>
      <div>
        {!compact && (
          <p className="t-mono mb-3 text-muted">
            <Link href={`/shop/${p.category}`} className="link-u">
              {p.category === "tops" ? "Shirts & tops" : p.category}
            </Link>{" "}
            · {p.dept === "unisex" ? "Unisex" : p.dept === "women" ? "Women" : "Men"}
          </p>
        )}
        <H className={clsx("font-display font-bold uppercase leading-[0.95] tracking-[-0.02em]", compact ? "text-2xl" : "text-[clamp(2rem,3.4vw,3rem)]")}>{p.name}</H>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="t-price text-lg" aria-live="polite">
            {p.compareAt && <span className="mr-2 text-muted line-through">{money(p.compareAt)}</span>}
            <span className={p.compareAt ? "text-cobalt" : undefined}>{money(price)}</span>
            {p.compareAt && <span className="sr-only"> (sale price, was {money(p.compareAt)})</span>}
          </p>
          <a href="#reviews" className="inline-flex items-center gap-2 text-sm" onClick={() => onAdded?.()}>
            <Stars value={p.rating} />
            <span className="link-u">
              {p.rating.toFixed(1)} · {p.reviewCount} reviews
            </span>
          </a>
        </div>
        {!compact && <p className="mt-4 max-w-[46ch] text-pretty text-[1.02rem] leading-relaxed">{p.short}</p>}
      </div>

      {/* colour */}
      <div>
        <p className="mb-2.5 text-sm" id={`color-label-${p.slug}`}>
          Colour: <span className="font-medium">{color}</span>
        </p>
        <RadioGroup labelledBy={`color-label-${p.slug}`} className="flex flex-wrap gap-2.5">
          {p.colors.map((c) => (
            <button
              key={c.name}
              type="button"
              role="radio"
              aria-checked={c.name === color}
              aria-label={`${c.name}${c.price ? `, ${money(c.price)}` : ""}`}
              tabIndex={c.name === color ? 0 : -1}
              onClick={() => onColor(c.name)}
              className="swatch"
              style={{ background: c.hex }}
            />
          ))}
        </RadioGroup>
      </div>

      {/* size */}
      {!oneSize && (
        <div>
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <p className="text-sm" id={`size-label-${p.slug}`}>
              Size{size ? <span className="font-medium">: {size}</span> : ""}
            </p>
            <div className="flex items-center gap-4">
              {onFitFinder && (
                <button type="button" onClick={onFitFinder} className="t-mono link-line text-[0.66rem]">
                  Find my size
                </button>
              )}
              {onSizeGuide && (
                <button type="button" onClick={onSizeGuide} className="t-mono link-line inline-flex items-center gap-1.5 text-[0.66rem]">
                  <IconRuler size={14} /> Size guide
                </button>
              )}
            </div>
          </div>
          <RadioGroup labelledBy={`size-label-${p.slug}`} className="flex flex-wrap gap-2">
            <div id={`sizes-${p.slug}`} className="contents">
              {colorVariants.map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={size === v.size}
                  tabIndex={size === v.size || (!size && i === 0) ? 0 : -1}
                  data-out={v.stock === 0}
                  onClick={() => {
                    setSize(v.size);
                    setError(false);
                  }}
                  className="size-opt"
                  aria-label={`${v.size}${v.stock === 0 ? ", sold out" : v.stock <= 2 ? `, only ${v.stock} left` : ""}`}
                >
                  {v.size}
                  {v.stock > 0 && v.stock <= 2 && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-cobalt" aria-hidden="true" />}
                </button>
              ))}
            </div>
          </RadioGroup>
          {error && (
            <p className="err" role="alert">
              Choose a size first.
            </p>
          )}
          {p.model && !compact && <p className="mt-3 text-sm text-muted">{p.model}. {p.fit} fit.</p>}
        </div>
      )}

      {stockMsg && <p className="-mt-2 text-sm">{stockMsg}</p>}

      {/* actions */}
      {allOut || sizeOut ? (
        notify === "done" ? (
          <p className="flex items-center gap-3 rounded-lg bg-sand px-4 py-4 text-sm" role="status">
            <IconCheck size={18} /> You&apos;re on the list for {p.name} in {color}
            {size && !oneSize ? `, ${size}` : ""}. We&apos;ll email you once — no spam.
          </p>
        ) : (
          <form
            noValidate
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (/^\S+@\S+\.\S+$/.test(email.trim())) setNotify("done");
              else setError(true);
            }}
          >
            <label htmlFor={`notify-${p.slug}`} className="sr-only">
              Email for restock notification
            </label>
            <input
              id={`notify-${p.slug}`}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
              autoComplete="email"
            />
            <button type="submit" className="btn btn-solid btn-lg shrink-0">
              Notify me
            </button>
          </form>
        )
      ) : (
        <div className="flex gap-2">
          <button type="button" onClick={add} className="btn btn-solid btn-lg flex-1" aria-live="polite">
            {added ? (
              <>
                <IconCheck size={18} /> Added to bag
              </>
            ) : (
              <>
                Add to bag — {money(price)}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              toggleWish(p.slug);
              ui.announce(saved ? `Removed ${p.name} from your wishlist.` : `Saved ${p.name} to your wishlist.`);
            }}
            className={clsx("grid h-14 w-14 shrink-0 place-items-center rounded-full border transition-colors", saved ? "border-cobalt text-cobalt" : "border-line hover:border-char")}
            aria-pressed={saved}
            aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          >
            <IconHeart filled={saved} />
          </button>
        </div>
      )}

      {!compact && (
        <ul className="grid gap-2.5 border-y border-line py-4 text-sm">
          <li className="flex items-start gap-3">
            <IconTruck size={18} className="mt-0.5 shrink-0" />
            <span>
              Free shipping over {money(site.freeShippingThreshold)}.{" "}
              {estimate ? (
                <>
                  Order today, arrives <strong className="font-medium">{estimate}</strong>.
                </>
              ) : (
                "Ships in 1 business day."
              )}
            </span>
          </li>
          <li className="flex items-start gap-3">
            <IconStore size={18} className="mt-0.5 shrink-0" />
            <span>Free pickup in Bishop Arts, ready in 2 hours. Free returns within {site.returnDays} days.</span>
          </li>
        </ul>
      )}
    </div>
  );
}

export { RadioGroup };
