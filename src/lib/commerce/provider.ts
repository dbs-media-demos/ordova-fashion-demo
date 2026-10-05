/*
 * The commerce provider interface.
 *
 * Everything the storefront needs from a backend goes through this contract.
 * The demo ships `mockProvider` (mock-provider.ts): an in-memory catalog with
 * a simulated checkout that charges nothing.
 *
 * To make the store real, implement this interface once and export it from
 * ./index.ts instead of the mock:
 *   - Shopify: map Storefront API products/variants onto `Product`/`Variant`,
 *     use the Cart API for `createCheckout`, and redirect to Shopify Checkout
 *     (or use Checkout Extensibility) for `placeOrder`.
 *   - Stripe: keep the catalog in this repo or a CMS, create a Checkout
 *     Session / PaymentIntent in a Route Handler for `createCheckout`, and
 *     mount Stripe Elements in place of the demo card form. Card data then
 *     goes straight to Stripe and never touches this app.
 * The UI components never import a provider directly; they only use these
 * functions and the types in ./types.ts.
 */

import type { CartLine, CategorySlug, CheckoutDraft, CollectionSlug, Order, Product, TrackStatus, Variant } from "./types";

export type PricedCart = {
  lines: { line: CartLine; product: Product; variant: Variant; total: number }[];
  count: number;
  subtotal: number;
  discount: number;
  promo?: { code: string; label: string };
  shipping: number | null;
  tax: number;
  total: number;
  freeShippingRemaining: number;
};

export type PaymentToken = {
  /** A provider token — in production created client-side by Stripe Elements / Shopify. */
  token: string;
  brand: string;
  last4: string;
};

export interface CommerceProvider {
  getProducts(filter?: { category?: CategorySlug; collection?: CollectionSlug }): Product[];
  getProduct(slug: string): Product | undefined;
  getVariant(id: string): { product: Product; variant: Variant } | undefined;
  validatePromo(code: string): { ok: true; code: string; label: string; rate: number } | { ok: false; message: string };
  priceCart(lines: CartLine[], opts?: { promo?: string; shippingMethod?: CheckoutDraft["shippingMethod"]; taxable?: boolean }): PricedCart;
  /** Simulated: resolves after ~1.5 s with an order. */
  placeOrder(lines: CartLine[], draft: CheckoutDraft, payment: PaymentToken): Promise<Order>;
  trackOrder(number: string, email: string): Promise<TrackStatus | null>;
}
