import type { Badge, Product, Variant } from "@/lib/commerce/types";

/*
 * Pure product helpers. They take a product and never import the catalog,
 * so client components can use them without shipping every product.
 */

export const totalStock = (p: Product) => p.variants.reduce((a, v) => a + v.stock, 0);
export const isSoldOut = (p: Product) => totalStock(p) === 0;
export const minPrice = (p: Product) => Math.min(...p.variants.map((v) => v.price));
export const discountPct = (p: Product) => (p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : 0);

/** Sizes that still have stock in the given colour. */
export const sizesInStock = (p: Product, color = p.colors[0].name) =>
  p.variants.filter((v) => v.color === color && v.stock > 0).map((v) => v.size);

export const findVariant = (p: Product, color: string, size: string): Variant | undefined =>
  p.variants.find((v) => v.color === color && v.size === size);

/** Up to two badges, most important first. */
export function badgesFor(p: Product): Badge[] {
  if (isSoldOut(p)) return ["soldout"];
  const out: Badge[] = [];
  if (p.compareAt) out.push("sale");
  if (p.isNew) out.push("new");
  if (p.isBestseller && !p.compareAt) out.push("bestseller");
  const firstColour = p.variants.filter((v) => v.color === p.colors[0].name);
  if (firstColour.reduce((a, v) => a + v.stock, 0) <= 3) out.push("low");
  return out.slice(0, 2);
}

export function badgeLabel(b: Badge, p: Product) {
  switch (b) {
    case "new":
      return "New";
    case "bestseller":
      return "Bestseller";
    case "sale":
      return `−${discountPct(p)}%`;
    case "low":
      return "Last sizes";
    case "soldout":
      return "Sold out";
  }
}

/** Rolling end date so the demo's countdown never expires: the next Sunday 11:59 pm Dallas time, at least 3 days out. */
export function saleEndsAt(now = new Date()) {
  const d = new Date(now);
  d.setUTCHours(4, 59, 0, 0); // 11:59 pm CDT the previous day ≈ 04:59 UTC
  const add = (7 - d.getUTCDay()) % 7 || 7;
  d.setUTCDate(d.getUTCDate() + add + 1);
  if (d.getTime() - now.getTime() < 3 * 864e5) d.setUTCDate(d.getUTCDate() + 7);
  return d;
}

/** Next drop: the coming Thursday at 10 am Dallas time (15:00 UTC), at least 2 days out. */
export function nextDropAt(now = new Date()) {
  const d = new Date(now);
  d.setUTCHours(15, 0, 0, 0);
  const add = (4 - d.getUTCDay() + 7) % 7 || 7;
  d.setUTCDate(d.getUTCDate() + add);
  if (d.getTime() - now.getTime() < 2 * 864e5) d.setUTCDate(d.getUTCDate() + 7);
  return d;
}

/** Coarse colour families for the colour filter. */
export const colorFamily = (name: string): string => {
  const n = name.toLowerCase();
  if (/(white|bone|ecru|natural|cream|champagne)/.test(n)) return "Light";
  if (/(black|ink|charcoal)/.test(n)) return "Black";
  if (/(grey|stone)/.test(n)) return "Grey";
  if (/(navy|blue|indigo|wash|rinse|stripe)/.test(n)) return "Blue";
  if (/(olive|moss)/.test(n)) return "Olive";
  if (/(oat|sand|khaki|camel|tan|oatmeal)/.test(n)) return "Neutral";
  return "Earth";
};

export const colorFamilies: [string, string][] = [
  ["Light", "#efe9dd"],
  ["Neutral", "#c9b593"],
  ["Earth", "#8a5a3b"],
  ["Olive", "#555840"],
  ["Blue", "#36486b"],
  ["Grey", "#8e8b86"],
  ["Black", "#1a1a18"],
];

export const facetValues = {
  fabric: ["Canvas", "Cotton", "Denim", "Felt", "Knit", "Leather", "Linen", "Satin", "Silk", "Suede", "Wool"],
  sizes: ["XS", "S", "M", "L", "XL", "24", "26", "28", "30", "32", "34", "36", "38", "One size"],
};

/** A lighter copy of a product for cards and rails (no reviews or long copy). */
export const toCard = (p: Product): Product => ({ ...p, reviews: [], long: "", details: [], care: [], materials: "" });
