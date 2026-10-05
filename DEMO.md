# Ordova (Scale by Noon demo)

- Niche: fashion boutique & small-batch label, online store   (industry id: `ecommerce` — this industry doesn't exist on scalebynoon.com yet; linking needs a new industry page or concept category)
- Market / city: US – Dallas, TX (Bishop Arts)
- Languages: en
- Live URL: https://ordova-fashion-demo.vercel.app
- Repo: https://github.com/dbs-media-demos/ordova-fashion-demo (Vercel git-connected)
- Folder: DBS Media Portfolio/Demo Websites/fashion
- Stack: Next.js 16.3, React 19.2, Tailwind v4, GSAP (ScrollTrigger, SplitText, Flip), Lenis
- Palette: char #151513, concrete #BDB8AF, sand #ECE7DE, bone #F6F3EE, olive #3F4231, moss #6B6E4F, cobalt #2B36F0   Fonts: Syne (display), Inter Tight (UI), DM Mono (labels)
- Pages: 81 static routes — home, shop, 7 categories, 7 collections, 36 products, lookbook, studio, about, visit, size guide, shipping & returns, journal + 3 posts, gift cards, FAQ, reviews, privacy, terms, cart, checkout, success, wishlist, track, 404
- Signature features:
  - Runway hero: scroll dives through the O of the wordmark into the FW26 "Caliche" collection
  - "Many worlds" home: studio window zoom-through + sketch→tag sequence, fabric reel, Archive Sale 3D coverflow, lookbook deck, aperture visit scene
  - Lookbook with hotspots, mini product sheet and "Add the full look" staggered fly-to-cart
  - Living product cards (hover swap, swatch wipe, one-tap size add), Flip-animated filters, flip cards for last sizes, drop countdown
  - Shared-element morph into product pages, fit finder, size guide, calm checkout with card flip and a garment-folding success animation
- Lighthouse (live, mobile, home): P 95–99 / A 100 / BP 100 / SEO 69 (only the intended noindex; 100 with NEXT_PUBLIC_NOINDEX=false). Shop 95–99, product 96–99 mobile; desktop 99–100.
- Promo code: WELCOME10 (10% off). Test card: 4242 4242 4242 4242, any future date, any CVC. Nothing is charged or sent.

## How to make it real
All commerce goes through `src/lib/commerce` (`CommerceProvider` interface + `mock-provider.ts`). Swap in a Shopify Storefront API provider (Cart API + Shopify Checkout) or a Stripe provider (Checkout Session / Elements) and export it from `src/lib/commerce/index.ts` — the UI doesn't change. Card data in the demo form never leaves the component.

## Portfolio copy
EN title: Ordova — fashion store
EN one-liner (≤ 120 chars): A Dallas boutique's online store that moves like a fashion film — and still checks out in a minute.
EN summary: A concept store and small-batch label from Bishop Arts, sold online. Scroll dives through the logo into the new collection, the lookbook is shoppable piece by piece, and filters, cards and checkout all move with intent while staying fast and easy.
SR title: Ordova — modna prodavnica
SR one-liner: Online prodavnica butika iz Dalasa koja se kreće kao modni film, a kupovina traje minut.
SR summary: Koncept prodavnica i mala modna linija iz Bishop Artsa, sada online. Skrol vodi kroz logo pravo u novu kolekciju, lookbook se kupuje komad po komad, a filteri, kartice i naplata su animirani, a opet brzi i jednostavni.

## Screenshots
handoff/desktop-home.png, handoff/desktop-feature.png, handoff/desktop-shop.png, handoff/desktop-product.png, handoff/mobile-home.png, handoff/mobile-product.png, handoff/mobile-checkout.png, handoff/scroll.mp4
