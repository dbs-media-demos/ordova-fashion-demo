# Ordova — fashion store demo (Scale by Noon)

A concept online store for a fictional concept store and small-batch label in Bishop Arts, Dallas. Built by [Scale by Noon](https://www.scalebynoon.com) to show what a modern, motion-rich e-commerce site can be. **Demo store: nothing is charged, nothing is sent.**

- Next.js 16 (App Router, Turbopack), React 19.2 (`ViewTransition`), Tailwind CSS v4, GSAP 3 (ScrollTrigger, SplitText, Flip), Lenis
- ~80 statically generated routes: 36 products, 7 categories, 7 collections, lookbook, studio, journal, checkout flow

## Run it

```bash
npm install
npm run dev -- --port 4252
```

Production check: `npm run build && npm start`. Set `NEXT_PUBLIC_NOINDEX=false` to make the site indexable (it is `noindex` by default because it's a demo). `NEXT_PUBLIC_SITE_URL` sets canonical URLs.

Demo promo code: **WELCOME10** (10% off). Test card: **4242 4242 4242 4242**, any future expiry, any CVC.

## Where things live

| Path | What |
| --- | --- |
| `src/content/products.ts` | The typed catalog (36 products, variants, per-size stock, reviews) |
| `src/content/taxonomy.ts`, `helpers.ts`, `catalog.ts` | Categories/collections, pure product helpers, catalog queries |
| `src/lib/commerce/` | **The commerce adapter** (see below) |
| `src/lib/store.ts` | Cart, wishlist, recently-viewed and UI stores (`useSyncExternalStore` + `localStorage`, every access in try/catch) |
| `src/lib/bag.ts` | Add-to-bag + fly-to-cart animation |
| `src/components/home/*` | The ten homepage scenes (runway zoom-through, studio window, fabric reel, archive coverflow…) |
| `src/components/shop/*` | Product card, Flip-animated filter grid, 3D sale swiper, flip cards, search, quick view |
| `src/components/product/*` | Gallery (lens + fullscreen), buy box, fit finder, size guide |
| `src/components/checkout/*` | Checkout steps, demo card form, success animation |

## Making it a real store (`src/lib/commerce`)

The UI never talks to a backend directly. It uses the `CommerceProvider` interface in `provider.ts` (`getProducts`, `getProduct`, `validatePromo`, `priceCart`, `placeOrder`, `trackOrder`) and the shared types in `types.ts`. The demo ships `mock-provider.ts`: an in-memory catalog and a checkout that waits 1.5 s and returns an order.

To take real orders, implement the same interface once and export it from `src/lib/commerce/index.ts`:

- **Shopify (Storefront API):** map Shopify products/variants onto `Product`/`Variant`, use the Cart API for the bag, and hand off to Shopify Checkout for `placeOrder`.
- **Stripe:** keep the catalog here or in a CMS, create a Checkout Session or PaymentIntent in a Route Handler, and replace the demo card form with Stripe Elements so card data goes straight to Stripe.

The demo card form (`components/checkout/CardForm.tsx`) never sends, stores or logs card data. It passes only a brand and the last four digits to `placeOrder` and wipes its fields after "payment".

## Credits

Photography and video from Unsplash and Pexels (free licences), listed in `public/images/SOURCES.md`. Fonts: Syne, Inter Tight, DM Mono (OFL), self-hosted and subset.
