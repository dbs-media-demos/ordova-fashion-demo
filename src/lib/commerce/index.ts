/**
 * The active commerce provider. Swap `mockProvider` for a Shopify Storefront
 * or Stripe implementation of `CommerceProvider` to take real orders — the UI
 * only imports `commerce` from here.
 */
import { mockProvider } from "./mock-provider";

export const commerce = mockProvider;
export { shippingMethods, deliveryEstimate, PROMOS } from "./mock-provider";
export type * from "./types";
export type { PricedCart, PaymentToken } from "./provider";
