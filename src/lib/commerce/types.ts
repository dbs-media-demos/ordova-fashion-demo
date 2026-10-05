/*
 * Commerce domain types.
 *
 * These are deliberately provider-agnostic: the UI only ever talks to these
 * shapes. A Shopify Storefront API or Stripe-backed provider maps its own
 * responses onto them (see provider.ts), so swapping the backend never
 * touches a component.
 */

export type Dept = "women" | "men" | "unisex";
export type CategorySlug = "dresses" | "tops" | "knitwear" | "trousers" | "outerwear" | "bags" | "accessories";
export type CollectionSlug =
  | "new-in"
  | "bestsellers"
  | "archive-sale"
  | "essentials"
  | "workwear"
  | "weekend-edit"
  | "gifts-under-100";

export type SizeSystem = "alpha" | "waist" | "one";

export type Colorway = {
  /** Display name, e.g. "Bone". Also the variant option value. */
  name: string;
  hex: string;
  /** Hero image for this colour (4:5). The first colour uses the product's first image. */
  image: string;
  /** Optional price override for this colour (per-variant pricing). */
  price?: number;
};

export type Variant = {
  id: string;
  sku: string;
  color: string;
  size: string;
  price: number;
  compareAt?: number;
  stock: number;
};

export type Review = {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  /** -1 runs small … 0 true to size … +1 runs large */
  fit: number;
  sizeBought?: string;
  height?: string;
};

export type ProductImage = { src: string; alt: string; focal?: string };

export type Badge = "new" | "bestseller" | "sale" | "low" | "soldout";

export type Product = {
  slug: string;
  name: string;
  dept: Dept;
  category: CategorySlug;
  /** Base price (USD). Variants may override per colour. */
  price: number;
  compareAt?: number;
  sizeSystem: SizeSystem;
  sizes: string[];
  colors: Colorway[];
  variants: Variant[];
  images: ProductImage[];
  short: string;
  long: string;
  details: string[];
  materials: string;
  care: string[];
  origin: string;
  model?: string;
  fabric: string;
  fit: "Relaxed" | "Regular" | "Slim" | "Oversized" | "Cropped" | "One size";
  /** Average fit feedback from reviews: -1 runs small … +1 runs large */
  fitScore: number;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  collections: CollectionSlug[];
  isNew?: boolean;
  isBestseller?: boolean;
  /** Higher = earlier in "Featured" sort. */
  featured: number;
  /** ISO date the product dropped (for "Newest"). */
  dropped: string;
  /** Slugs for "Complete the look". */
  pairs: string[];
};

export type Category = { slug: CategorySlug; name: string; blurb: string; image: string };
export type Collection = { slug: CollectionSlug; name: string; kicker: string; blurb: string; image: string };

export type CartLine = {
  variantId: string;
  slug: string;
  qty: number;
};

export type ShippingMethod = {
  id: "standard" | "express" | "pickup";
  label: string;
  detail: string;
  price: number;
  /** Business days, for delivery estimates. */
  days: [number, number];
};

export type Address = {
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: "US";
  phone?: string;
};

export type CheckoutDraft = {
  email: string;
  marketing: boolean;
  delivery: "ship" | "pickup";
  address?: Address;
  shippingMethod: ShippingMethod["id"];
  giftMessage?: string;
  promo?: string;
};

export type OrderLine = {
  slug: string;
  name: string;
  color: string;
  size: string;
  qty: number;
  price: number;
  image: string;
};

export type Order = {
  number: string;
  email: string;
  createdAt: string;
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  delivery: "ship" | "pickup";
  shippingLabel: string;
  estimate: string;
  city?: string;
  /** Last four digits + brand only. Full card data never reaches the provider in this demo. */
  paymentSummary: string;
};

export type TrackStatus = {
  number: string;
  steps: { label: string; detail: string; date: string; done: boolean }[];
  carrier: string;
  eta: string;
};
