"use client";

import type { Product, Variant } from "@/lib/commerce/types";
import { cart, ui } from "@/lib/store";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * Fly a ghost of `from` (an image or its wrapper) into the bag icon.
 * Pure decoration — the cart is already updated before this runs.
 */
export function flyToBag(from: Element | null | undefined, delay = 0): Promise<void> {
  return new Promise((resolve) => {
    const target = document.querySelector<HTMLElement>("[data-bag-icon]");
    if (!from || !target || prefersReducedMotion()) return resolve();
    const img = from instanceof HTMLImageElement ? from : from.querySelector("img");
    const r = from.getBoundingClientRect();
    const t = target.getBoundingClientRect();
    if (!r.width || !r.height) return resolve();

    const ghost = document.createElement("div");
    ghost.className = "fly-ghost";
    ghost.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;`;
    if (img?.currentSrc || img?.src) ghost.style.backgroundImage = `url("${img.currentSrc || img.src}")`;
    document.body.appendChild(ghost);

    const dx = t.left + t.width / 2 - (r.left + r.width / 2);
    const dy = t.top + t.height / 2 - (r.top + r.height / 2);
    const s = Math.max(0.06, 28 / Math.max(r.width, r.height));

    // Different eases on x and y bend the path into an arc.
    gsap
      .timeline({
        delay,
        onComplete: () => {
          ghost.remove();
          ui.bump();
          resolve();
        },
      })
      .fromTo(ghost, { scale: 1, borderRadius: 2, opacity: 1 }, { scale: s, borderRadius: 999, duration: 0.85, ease: "power2.inOut" }, 0)
      .to(ghost, { x: dx, duration: 0.85, ease: "power1.inOut" }, 0)
      .to(ghost, { y: dy, duration: 0.85, ease: "back.in(1.3)" }, 0)
      .to(ghost, { opacity: 0, duration: 0.15 }, 0.75);
  });
}

type AddOpts = { from?: Element | null; open?: boolean; qty?: number; delay?: number; silent?: boolean };

/** Add a variant to the bag: update the store, announce it, fly the image, then open the drawer. */
export async function addToBag(product: Product, variant: Variant, opts: AddOpts = {}) {
  cart.add(variant.id, product.slug, opts.qty ?? 1);
  const sizeText = variant.size === "One size" ? "" : `, size ${variant.size}`;
  if (!opts.silent) ui.announce(`Added ${product.name}, ${variant.color}${sizeText}, to your bag.`);
  await flyToBag(opts.from, opts.delay);
  if (prefersReducedMotion()) ui.bump();
  if (opts.open !== false) ui.openCart();
}

/** Add several pieces with a staggered flight (Lookbook "Add the full look"). */
export async function addLook(items: { product: Product; variant: Variant; from?: Element | null }[]) {
  const flights = items.map((it, i) => addToBag(it.product, it.variant, { from: it.from, open: false, delay: i * 0.16, silent: true }));
  ui.announce(`Added ${items.length} pieces to your bag: ${items.map((i) => i.product.name).join(", ")}.`);
  await Promise.all(flights);
  ui.openCart();
}
