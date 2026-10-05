import type { CollectionSlug, CategorySlug } from "@/lib/commerce/types";
import { products } from "./products";
import { isSoldOut, sizesInStock } from "./helpers";

export * from "./taxonomy";
export * from "./helpers";

export const inCategory = (slug: CategorySlug) => products.filter((p) => p.category === slug);
export const inCollection = (slug: CollectionSlug) =>
  products.filter((p) => p.collections.includes(slug)).sort((a, b) => b.featured - a.featured);

/** Pieces for "Last sizes" flip cards: sale items with very few sizes left. */
export const lastSizes = () =>
  products
    .filter((p) => p.compareAt && !isSoldOut(p))
    .map((p) => ({ p, left: sizesInStock(p) }))
    .filter((x) => x.left.length > 0 && x.left.length <= 3)
    .sort((a, b) => a.left.length - b.left.length)
    .slice(0, 6);

export const archiveSale = () => inCollection("archive-sale");
