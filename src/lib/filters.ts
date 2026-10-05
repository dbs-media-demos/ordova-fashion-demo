import type { Product } from "@/lib/commerce/types";
import { colorFamily } from "@/content/helpers";

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "rating";

export type Filters = {
  dept: string[];
  cat: string[];
  size: string[];
  color: string[];
  price: string[];
  fabric: string[];
  sort: SortKey;
};

export const EMPTY: Filters = { dept: [], cat: [], size: [], color: [], price: [], fabric: [], sort: "featured" };

export const SORTS: { id: SortKey; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price, low to high" },
  { id: "price-desc", label: "Price, high to low" },
  { id: "rating", label: "Best rated" },
];

export const PRICE_BANDS: { id: string; label: string; test: (n: number) => boolean }[] = [
  { id: "u100", label: "Under $100", test: (n) => n < 100 },
  { id: "100-200", label: "$100–$200", test: (n) => n >= 100 && n < 200 },
  { id: "200-300", label: "$200–$300", test: (n) => n >= 200 && n < 300 },
  { id: "300p", label: "$300+", test: (n) => n >= 300 },
];

const KEYS = ["dept", "cat", "size", "color", "price", "fabric"] as const;

export function parseFilters(sp: URLSearchParams): Filters {
  const f: Filters = { ...EMPTY, dept: [], cat: [], size: [], color: [], price: [], fabric: [] };
  for (const k of KEYS) {
    const v = sp.get(k);
    if (v) f[k] = v.split(",").filter(Boolean);
  }
  const s = sp.get("sort") as SortKey | null;
  if (s && SORTS.some((x) => x.id === s)) f.sort = s;
  return f;
}

export function serializeFilters(f: Filters) {
  const sp = new URLSearchParams();
  for (const k of KEYS) if (f[k].length) sp.set(k, f[k].join(","));
  if (f.sort !== "featured") sp.set("sort", f.sort);
  return sp.toString();
}

export const activeCount = (f: Filters) => KEYS.reduce((a, k) => a + f[k].length, 0);

export function applyFilters(list: Product[], f: Filters) {
  const out = list.filter((p) => {
    if (f.dept.length && !f.dept.includes(p.dept)) return false;
    if (f.cat.length && !f.cat.includes(p.category)) return false;
    if (f.fabric.length && !f.fabric.includes(p.fabric)) return false;
    if (f.price.length && !PRICE_BANDS.filter((b) => f.price.includes(b.id)).some((b) => b.test(p.price))) return false;
    if (f.color.length && !p.colors.some((c) => f.color.includes(colorFamily(c.name)))) return false;
    if (f.size.length && !p.variants.some((v) => v.stock > 0 && f.size.includes(v.size))) return false;
    return true;
  });
  const by: Record<SortKey, (a: Product, b: Product) => number> = {
    featured: (a, b) => b.featured - a.featured,
    newest: (a, b) => b.dropped.localeCompare(a.dropped),
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
  };
  return out.sort(by[f.sort]);
}
