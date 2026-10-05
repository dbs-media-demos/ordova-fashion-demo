"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import type { Product } from "@/lib/commerce/types";
import { badgesFor, badgeLabel, findVariant, isSoldOut } from "@/content/helpers";
import { money } from "@/lib/format";
import { addToBag } from "@/lib/bag";
import { markMorph } from "@/lib/morph";
import { toggleWish, ui, useMounted, useWishlist } from "@/lib/store";
import { IconHeart, IconPlus } from "@/components/ui/Icons";

type Props = {
  product: Product;
  /** The page's LCP image → preload. */
  priority?: boolean;
  /** Above the fold → load eagerly without preloading. */
  eager?: boolean;
  sizes?: string;
  className?: string;
  tone?: "light" | "dark";
};

/**
 * A product card that comes alive: hover swaps to the on-model shot with a
 * small skew, swatches morph the image with a circular wipe, and a size row
 * slides up for one-tap add.
 */
export function ProductCard({ product: p, priority, eager, sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw", className, tone = "light" }: Props) {
  const [color, setColor] = useState(p.colors[0].name);
  const [prevColor, setPrevColor] = useState<string | null>(null);
  const [wipe, setWipe] = useState({ x: 50, y: 100, k: 0 });
  const [open, setOpen] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const wish = useWishlist();
  const mounted = useMounted();
  const saved = mounted && wish.includes(p.slug);
  const soldOut = isSoldOut(p);
  const badges = badgesFor(p);
  const colorImg = (name: string) => p.colors.find((c) => c.name === name)!.image;
  const variantsOfColor = p.variants.filter((v) => v.color === color);
  const price = variantsOfColor[0]?.price ?? p.price;
  const href = `/products/${p.slug}${color !== p.colors[0].name ? `?color=${encodeURIComponent(color)}` : ""}`;

  const pickColor = (name: string, e: React.MouseEvent) => {
    if (name === color) return;
    const r = frame.current?.getBoundingClientRect();
    const s = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (r) setWipe((w) => ({ x: ((s.left + s.width / 2 - r.left) / r.width) * 100, y: 100, k: w.k + 1 }));
    setPrevColor(color);
    setColor(name);
  };

  const quickAdd = (size: string) => {
    const v = findVariant(p, color, size);
    if (v && v.stock > 0) {
      addToBag(p, v, { from: frame.current });
      setOpen(false);
    }
  };

  return (
    <article className={clsx("group/card relative", className)}>
      <div ref={frame} className="media relative aspect-[4/5] overflow-hidden rounded-[2px]">
        <Link
          href={href}
          className="absolute inset-0 block"
          data-cursor="View"
          aria-label={`${p.name}, ${money(price)}`}
          onClick={(e) => markMorph(e.currentTarget)}
        >
          {/* previous colour stays underneath while the new one wipes in */}
          {prevColor && prevColor !== color && (
            <Image src={colorImg(prevColor)} alt="" fill sizes={sizes} className="object-cover" />
          )}
          <span
            key={`${color}-${wipe.k}`}
            className="absolute inset-0 block"
            style={wipe.k ? ({ animation: "swatch-wipe 0.9s cubic-bezier(0.16,1,0.3,1) both", "--wx": `${wipe.x}%`, "--wy": `${wipe.y}%` } as React.CSSProperties) : undefined}
          >
            <Image
              src={colorImg(color)}
              alt={p.images[0].alt}
              fill
              sizes={sizes}
              preload={priority}
              loading={priority || eager ? "eager" : "lazy"}
              className={clsx("object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-[1.03]", soldOut && "grayscale-[0.4]")}
              style={{ objectPosition: p.images[0].focal }}
            />
          </span>
          {/* on-model / alternate view on hover (desktop) */}
          {color === p.colors[0].name && (
            <span className="absolute inset-0 hidden opacity-0 transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] [transform:scale(1.08)_skewY(2deg)] group-hover/card:opacity-100 group-hover/card:[transform:none] md:block">
              <Image src={p.images[1].src} alt="" fill sizes={sizes} className="object-cover" style={{ objectPosition: p.images[1].focal }} />
            </span>
          )}
        </Link>

        {/* badges */}
        {badges.length > 0 && (
          <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
            {badges.map((b) => (
              <span
                key={b}
                className={clsx(
                  "t-mono rounded-full px-2.5 py-1 text-[0.6rem]",
                  b === "sale" ? "bg-cobalt text-bone" : b === "soldout" ? "bg-char text-bone" : "bg-bone/90 text-char backdrop-blur",
                )}
              >
                {badgeLabel(b, p)}
              </span>
            ))}
          </div>
        )}

        {/* wishlist */}
        <button
          type="button"
          onClick={() => {
            toggleWish(p.slug);
            ui.announce(saved ? `Removed ${p.name} from your wishlist.` : `Saved ${p.name} to your wishlist.`);
          }}
          className={clsx(
            "absolute right-1.5 top-1.5 grid h-11 w-11 place-items-center rounded-full transition-[transform,color] active:scale-90",
            saved ? "text-cobalt" : "text-char",
          )}
          aria-label={saved ? `Remove ${p.name} from wishlist` : `Save ${p.name} to wishlist`}
          aria-pressed={saved}
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-bone/85 backdrop-blur">
            <IconHeart size={17} filled={saved} className={saved ? "animate-[bag-bump_0.5s]" : undefined} />
          </span>
        </button>

        {/* quick add */}
        {!soldOut && (
          <>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="absolute bottom-2 right-2 grid h-11 w-11 place-items-center rounded-full md:hidden"
              aria-label={open ? `Close sizes for ${p.name}` : `Quick add ${p.name}`}
              aria-expanded={open}
            >
              <span className={clsx("grid h-9 w-9 place-items-center rounded-full bg-bone/90 shadow transition-transform", open && "rotate-45")}>
                <IconPlus size={18} />
              </span>
            </button>
            <div
              className={clsx(
                "absolute inset-x-2 bottom-2 rounded-md bg-bone/95 p-2 text-char shadow-lg backdrop-blur transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[115%] opacity-0",
                "md:group-hover/card:pointer-events-auto md:group-hover/card:translate-y-0 md:group-hover/card:opacity-100 md:group-focus-within/card:pointer-events-auto md:group-focus-within/card:translate-y-0 md:group-focus-within/card:opacity-100",
                open ? "right-14 md:right-2" : "",
              )}
            >
              <div className="flex items-center justify-between px-1 pb-1.5">
                <span className="t-mono text-[0.58rem] text-muted">{p.sizeSystem === "one" ? "One size" : "Quick add · pick a size"}</span>
                <button type="button" onClick={() => ui.quickView(p.slug)} className="t-mono link-u text-[0.58rem]">
                  Quick view
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {variantsOfColor.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    disabled={v.stock === 0}
                    onClick={() => quickAdd(v.size)}
                    className={clsx(
                      "t-mono min-h-9 min-w-9 flex-1 rounded px-1.5 text-[0.68rem] tracking-normal transition-colors",
                      v.stock === 0 ? "text-[#8d897f] line-through" : "bg-sand hover:bg-char hover:text-bone",
                    )}
                    aria-label={v.stock === 0 ? `${v.size} sold out` : `Add ${p.name}, ${color}, ${v.size === "One size" ? "" : `size ${v.size}, `}to bag`}
                  >
                    {v.size === "One size" ? "Add to bag" : v.size}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className={clsx("mt-3 flex items-start justify-between gap-3", tone === "dark" && "text-bone")}>
        <div className="min-w-0">
          <p className="truncate text-[0.95rem] font-medium leading-tight">
            <Link href={href} className="link-u" onClick={() => markMorph(frame.current?.querySelector("a") ?? null)} tabIndex={-1}>
              {p.name}
            </Link>
          </p>
          <p className={clsx("mt-1 text-xs", tone === "dark" ? "text-mist" : "text-muted")}>
            {soldOut ? "Sold out · notify me" : p.colors.length > 1 ? `${p.colors.length} colours` : p.colors[0].name}
          </p>
        </div>
        <p className="t-price shrink-0 text-right">
          {p.compareAt && <span className={clsx("mr-1.5 line-through", tone === "dark" ? "text-mist" : "text-muted")}>{money(p.compareAt)}</span>}
          <span className={p.compareAt ? (tone === "dark" ? "text-cobalt-lt" : "text-cobalt") : undefined}>{money(price)}</span>
        </p>
      </div>
      {p.colors.length > 1 && (
        <div className="mt-2 flex gap-1" role="radiogroup" aria-label={`${p.name} colour`}>
          {p.colors.map((c) => (
            <button
              key={c.name}
              type="button"
              role="radio"
              aria-checked={c.name === color}
              aria-label={c.name}
              onClick={(e) => pickColor(c.name, e)}
              className="grid h-8 w-8 place-items-center"
            >
              <span className={clsx("swatch h-4 w-4", c.name === color && "scale-110")} style={{ background: c.hex }} data-on={c.name === color} />
            </button>
          ))}
        </div>
      )}
    </article>
  );
}
