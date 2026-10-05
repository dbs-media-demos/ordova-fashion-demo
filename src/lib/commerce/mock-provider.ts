/*
 * Demo implementation of CommerceProvider.
 *
 * - Catalog: the typed in-repo catalog (src/content/products.ts).
 * - Checkout: simulated. `placeOrder` waits ~1.5 s and returns an order. It
 *   receives only a fake payment token (brand + last four) — the demo card
 *   form never passes card numbers out of its component, and nothing here
 *   makes a network request.
 * Replace this file's export in ./index.ts with a Shopify or Stripe provider
 * to go live; see provider.ts for the mapping notes.
 */

import { products, productBySlug, variantById } from "@/content/products";
import { site } from "@/lib/site";
import type { CommerceProvider, PricedCart } from "./provider";
import type { CartLine, Order, ShippingMethod } from "./types";

export const PROMOS: Record<string, { label: string; rate: number }> = {
  WELCOME10: { label: "10% off your first order", rate: 0.1 },
};

export const shippingMethods: ShippingMethod[] = [
  { id: "standard", label: "Standard", detail: "3–5 business days · free over $150", price: site.standardShipping, days: [3, 5] },
  { id: "express", label: "Express", detail: "1–2 business days", price: site.expressShipping, days: [1, 2] },
  { id: "pickup", label: "Pick up in Bishop Arts", detail: "Ready in 2 hours · free", price: 0, days: [0, 0] },
];

const round = (n: number) => Math.round(n * 100) / 100;

function addBusinessDays(from: Date, days: number) {
  const d = new Date(from);
  let left = days;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) left--;
  }
  return d;
}

export function deliveryEstimate(method: ShippingMethod["id"], from = new Date()) {
  const m = shippingMethods.find((s) => s.id === method)!;
  if (m.id === "pickup") return "Ready for pickup in 2 hours";
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  return `${fmt(addBusinessDays(from, m.days[0]))} – ${fmt(addBusinessDays(from, m.days[1]))}`;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const mockProvider: CommerceProvider = {
  getProducts(filter) {
    return products.filter(
      (p) => (!filter?.category || p.category === filter.category) && (!filter?.collection || p.collections.includes(filter.collection)),
    );
  },
  getProduct: (slug) => productBySlug.get(slug),
  getVariant: (id) => variantById.get(id),

  validatePromo(code) {
    const key = code.trim().toUpperCase();
    const promo = PROMOS[key];
    if (!promo) return { ok: false, message: key ? `“${key}” isn't a valid code. Try WELCOME10.` : "Enter a code first." };
    return { ok: true, code: key, ...promo };
  },

  priceCart(lines, opts = {}): PricedCart {
    const priced = lines
      .map((line) => {
        const hit = variantById.get(line.variantId);
        if (!hit) return null;
        return { line, product: hit.product, variant: hit.variant, total: round(hit.variant.price * line.qty) };
      })
      .filter((x): x is NonNullable<typeof x> => !!x);

    const subtotal = round(priced.reduce((a, l) => a + l.total, 0));
    const promo = opts.promo ? PROMOS[opts.promo] : undefined;
    const discount = promo ? round(subtotal * promo.rate) : 0;
    const afterDiscount = subtotal - discount;

    let shipping: number | null = null;
    if (opts.shippingMethod) {
      const m = shippingMethods.find((s) => s.id === opts.shippingMethod)!;
      shipping = m.id === "standard" && afterDiscount >= site.freeShippingThreshold ? 0 : m.price;
    } else if (afterDiscount >= site.freeShippingThreshold) {
      shipping = 0;
    }
    const tax = opts.taxable ? round(afterDiscount * site.taxRate) : 0;
    return {
      lines: priced,
      count: priced.reduce((a, l) => a + l.line.qty, 0),
      subtotal,
      discount,
      promo: promo && opts.promo ? { code: opts.promo, label: promo.label } : undefined,
      shipping,
      tax,
      total: round(afterDiscount + (shipping ?? 0) + tax),
      freeShippingRemaining: Math.max(0, round(site.freeShippingThreshold - afterDiscount)),
    };
  },

  async placeOrder(lines: CartLine[], draft, payment) {
    await wait(1500);
    const taxable = draft.delivery === "pickup" || draft.address?.state?.toUpperCase() === "TX";
    const priced = this.priceCart(lines, { promo: draft.promo, shippingMethod: draft.shippingMethod, taxable });
    const method = shippingMethods.find((s) => s.id === draft.shippingMethod)!;
    const number = `ORD-${String(Date.now()).slice(-5)}${Math.floor(Math.random() * 90 + 10)}`;
    const order: Order = {
      number,
      email: draft.email,
      createdAt: new Date().toISOString(),
      lines: priced.lines.map(({ product, variant, line }) => ({
        slug: product.slug,
        name: product.name,
        color: variant.color,
        size: variant.size,
        qty: line.qty,
        price: variant.price,
        image: product.colors.find((c) => c.name === variant.color)?.image ?? product.images[0].src,
      })),
      subtotal: priced.subtotal,
      discount: priced.discount,
      shipping: priced.shipping ?? 0,
      tax: priced.tax,
      total: priced.total,
      delivery: draft.delivery,
      shippingLabel: method.label,
      estimate: deliveryEstimate(method.id),
      city: draft.address?.city,
      paymentSummary: `${payment.brand} ending ${payment.last4}`,
    };
    return order;
  },

  async trackOrder(number, email) {
    await wait(900);
    const n = number.trim().toUpperCase();
    if (!/^ORD-\d{5,8}$/.test(n) || !/^\S+@\S+\.\S+$/.test(email.trim())) return null;
    const day = (offset: number) => {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    };
    return {
      number: n,
      carrier: "UPS Ground · 1Z 4R9 0V4 03 1427 7781",
      eta: day(2),
      steps: [
        { label: "Order placed", detail: "We've got it. A real person checks every order.", date: day(-2), done: true },
        { label: "Packed in the studio", detail: "Folded in tissue, boxed, stickered with your order number.", date: day(-1), done: true },
        { label: "Shipped", detail: "Picked up from Bishop Arts by UPS.", date: day(-1), done: true },
        { label: "Out for delivery", detail: "On the truck in your city.", date: day(2), done: false },
        { label: "Delivered", detail: "Enjoy it. Returns are free for 30 days.", date: day(2), done: false },
      ],
    };
  },
};
