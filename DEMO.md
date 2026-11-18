# Ordova (Scale by Noon demo)

- Niche: fashion boutique & small-batch label, online store   (industry id: `ecommerce` — this industry doesn't exist on scalebynoon.com yet; linking needs a new industry page or concept category)
- Market / city: US – Dallas, TX (Bishop Arts)
- Languages: en
- Live URL: https://ordova-fashion-demo.vercel.app
- Repo: https://github.com/dbs-media-demos/ordova-fashion-demo (Vercel git-connected)
- Folder: DBS Media Portfolio/Demo Websites/fashion
- Stack: Next.js 16.3, React 19.2, Tailwind v4, GSAP (ScrollTrigger, SplitText, Flip), Lenis, three.js 0.187 (desktop only)
- Palette: char #151513, concrete #BDB8AF, sand #ECE7DE, bone #F6F3EE, olive #3F4231, moss #6B6E4F, cobalt #2B36F0   Fonts: Syne (display), Inter Tight (UI), DM Mono (labels)
- Pages: 81 static routes — home (reviews now third, right after New in), shop, 7 categories, 7 collections, 36 products, lookbook, studio, about, visit, size guide, shipping & returns, journal + 3 posts, gift cards, FAQ, reviews, privacy, terms, cart, checkout, success, wishlist, track, 404
- Signature features:
  - 3D cloth hero (desktop, real time): two lengths of the FW26 "Caliche" cloth (clay linen, moss wool) hang from brass clips in a plaster studio under one soft spotlight, with soft shadows on the wall. It is a real cloth simulation: a breeze keeps them breathing, the cursor moves the air through the folds, the scroll pushes the camera in while a draught lifts them, then the dive goes through the O of the wordmark into the collection
  - "Feel the cloth" (desktop, 3D): one swatch on two clips; pick linen, wool, denim or knit and it re-hangs with that cloth's real weight, stiffness and stretch, and you can take hold of it and pull
  - "Many worlds" home: studio window zoom-through + sketch→tag sequence, fabric reel, Archive Sale 3D coverflow, lookbook deck, aperture visit scene
  - Lookbook with hotspots, mini product sheet and "Add the full look" staggered fly-to-cart
  - Living product cards (hover swap, swatch wipe, one-tap size add), Flip-animated filters, flip cards for last sizes, drop countdown
  - Shared-element morph into product pages, fit finder, size guide, calm checkout with card flip and a garment-folding success animation
- Lighthouse (live, mobile, home): P 95–99 / A 100 / BP 100 / SEO 69 (only the intended noindex; 100 with NEXT_PUBLIC_NOINDEX=false). Shop 95–99, product 96–99 mobile; desktop 99–100.
- Promo code: WELCOME10 (10% off). Test card: 4242 4242 4242 4242, any future date, any CVC. Nothing is charged or sent.

## 3D (desktop only)
- Why cloth: a fashion label's first promise is the fabric ("we buy fabric before we design"). Real cloth that drapes, catches light and moves when you touch the air around it says that better than any film, and it is exactly what a shopper can't feel online.
- Built from primitives, no model files: the cloth is a position-based simulation (`src/components/fx/cloth/sim.ts`: structural, shear and bending links, long-range attachments, aerodynamic air); the weaves (linen plain weave with slubs, wool 2/2 twill, denim 3/1 twill, jersey knit) and the plaster are painted in code (`weave.ts`). Nothing to license, nothing to download but the code (~155 KB gzip for three.js + the scene, fetched on desktop only).
- Phones and every non-3D screen get stills rendered from the same scene (`public/images/3d`, `node _src/stills/render.mjs`; hero phone still 17 KB AVIF). `src/lib/three-gate.ts` imports 3D only after load on a big screen with a mouse, without reduced motion or Save-Data: zero bytes of three.js on phones. A slow first two seconds or no real GPU fades back to the still for the visit.
- Measured on the production build (2026-11-09). Phone, 375 px, 4x CPU, slow 4G: first-load JS 180 KB home / 172 KB shop / 189 KB product, LCP 1.4-1.6 s (the cloth still), TBT 100-150 ms, CLS 0, 0 bytes of three.js on all 74 routes, ~490 KB on first load, 2 font files. Desktop (1440x900): hero fades in ~3.0 s after opening, swatch ready at ~7.7 s (warmed in idle time, long before it is reached), 2-4 ms of work per frame, no 3D task over 42 ms (the environment map links its shaders off the main thread; texture painting and the fold settle run in ≤8 ms idle slices). 4x CPU: the page-load check keeps the stills and never fetches three.js; if a slow CPU gets past it, the settle times a cloth step (~30 ms vs ~6 ms here) and stops before the first live frame, then the rest of the visit stays on stills. Measure with `node scripts/with-server.mjs node scripts/3d-smooth.mjs`.
- Phones: no pinned or scrubbed scenes, no Lenis, GSAP only after load (`src/lib/gsap.ts`); below-the-fold sections hold their measured heights (`src/lib/cv.ts`, `scripts/section-heights.mjs`). Measure with `npm run build && node scripts/with-server.mjs node scripts/phone-budget.mjs / 375`.

## /v2 — the homepage without 3D
- Same sections, words, photos and order as `/`, one tree: `components/home/HomeContent.tsx`, each page passes its hero (`/` <Hero />, `/v2` <HeroPattern />), so each only ships its own hero's code. On `/v2` the "Feel the cloth" swatch stays its still.
- The `/v2` hero (`components/home/HeroPattern.tsx`, SVG + CSS + GSAP, no three.js): a length of clay linen on the cutting table; in the first seconds the Caliche overshirt's front pattern draws itself in tailor's chalk (cut line, notches, pocket, buttons, grainline, the piece's label), then a needle sews the stitch line round. The scroll cuts it: the offcut falls away, the piece lifts, and the cloth inside the outline becomes the FW26 photo (01 Chalked → 02 Cut → 03 Sewn). The table tilts and the lamp follows the cursor. Reduced motion shows the finished drawing. Phones get exactly `/`'s first screen.
- Measured on the production build (2026-11-18): 0 bytes of three.js and no WebGL context on /v2 at 1024, 1280 and 1440 px and on phones; first-load JS 220.9 KB gzip vs 219.9 on `/`; phone 375 px (4x CPU, slow 4G) LCP 1.3 s, CLS 0, TBT ~110 ms. `node scripts/with-server.mjs node scripts/v2-check.mjs <out> /v2 1440 900`, `scripts/v2-fps.mjs`, `scripts/phone-compare.mjs <out> / /v2`, `scripts/first-js.mjs / /v2`.

## /for/[token] — the personalised preview
- `/for/<token>` (3D hero) and `/for/<token>/v2` (pattern hero) render the same homepage tree with a real boutique from the Scale by Noon CRM (`src/lib/preview.ts` → `GET {CRM_API_URL}/demos/public/<token>`, fresh on every request; unknown token → 404, never indexed). Copied from the HVAC demo: `lib/biz-core.ts`, `lib/biz.ts` (the concept store as a Biz), `components/preview/BizContext`, `PreviewGuard` (the preview is the homepage only: other links say the page comes with the full site), the lead-logo loader (`lib/loader.ts`, `lib/lead-logo.ts`, `components/preview/LeadLoader`).
- What changes: name, phone (hidden when the CRM has none), town and region, hours (open badge in their timezone, footer table; hidden when unknown), Google rating (hidden when none), their logo (loader on the first view in a tab, header in its light/dark ink, big footer mark) and CRM areas (footer courier line, visit scene, reviewer places). Without a logo the name is set like the ORDOVA wordmark (hero, header, footer), its first O drawn as the ring the 3D dive goes through (a name without an O gets the ring in front). Dallas/Bishop Arts/Texas lines become general; sample reviews stay labelled as samples. English only, like the concept site.
- Pages live in `src/app/(site)` (concept chrome + structured data in `(site)/layout.tsx`); the preview layout wraps the same `SiteChrome` in its `BizProvider`.
- Measured on the production build (2026-11-18), phone 375 px, 4x CPU, slow 4G: preview LCP 1.36 s (`/v2` 1.42 s), CLS 0, TBT 130-146 ms, 0 bytes of three.js; first-load JS 224.4 / 225.8 KB gzip (`/` 223.8, `/v2` 225.2; each figure counts the 38.7 KB legacy polyfill script modern browsers never load). Desktop: the preview's 3D hero goes live as on `/`; `/for/<token>/v2` has no three.js and no WebGL. Phone held heights for the footer, visit and reviews follow what the lead has (`src/lib/cv.ts`).
- Test without the CRM: point `CRM_API_URL` at a local stub, e.g. `CRM_API_URL=http://localhost:4299/api NEXT_DIST_DIR=.next-test PORT=4251 node scripts/with-server.mjs node <check>.mjs` (a separate build folder keeps a running preview server untouched).

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
handoff/desktop-home.png, handoff/desktop-feature.png, handoff/desktop-shop.png, handoff/desktop-product.png, handoff/mobile-home.png, handoff/mobile-product.png, handoff/mobile-checkout.png, handoff/scroll.mp4 (desktop-home, desktop-feature and mobile-home show the 3D pass; scroll.mp4 still shows the earlier runway-film hero)
