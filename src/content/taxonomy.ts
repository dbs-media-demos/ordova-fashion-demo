import type { Category, Collection } from "@/lib/commerce/types";

/* Categories and collections — no product data, so it's cheap to import anywhere. */

export const categories: Category[] = [
  { slug: "dresses", name: "Dresses", blurb: "Bias-cut, linen and rib — dresses that move and wash and last.", image: "/images/products/calle-slip-dress-2.jpg" },
  { slug: "tops", name: "Shirts & tops", blurb: "Poplin, oxford, heavy jersey. The layer everything else sits on.", image: "/images/products/bishop-poplin-shirt-2.jpg" },
  { slug: "knitwear", name: "Knitwear", blurb: "Merino, lambswool and undyed cable — knitted in LA, finished in Dallas.", image: "/images/products/fisherman-knit-c2.jpg" },
  { slug: "trousers", name: "Trousers & denim", blurb: "High-rise wides, pleated chinos and raw selvedge. Free hemming in store.", image: "/images/products/oak-cliff-wide-trouser-1.jpg" },
  { slug: "outerwear", name: "Outerwear", blurb: "Trenches, chore coats and one heirloom wool coat — made in runs of thirty.", image: "/images/products/lone-star-trench-2.jpg" },
  { slug: "bags", name: "Bags", blurb: "Vegetable-tanned leather and heavy canvas. No logos, solid brass.", image: "/images/products/plinth-leather-tote-2.jpg" },
  { slug: "accessories", name: "Belts, scarves & hats", blurb: "The finishing pieces: bridle belts, silk squares, felt and knit.", image: "/images/ed/wardrobe-accessories.jpg" },
];

export const collections: Collection[] = [
  { slug: "new-in", name: "New in", kicker: "Drop 02 · FW26 Caliche", blurb: "The latest pieces off the cutting table, landed in the shop this month.", image: "/images/ed/fw26-caliche.jpg" },
  { slug: "bestsellers", name: "Bestsellers", kicker: "Most reordered", blurb: "The pieces people come back for in a second colour.", image: "/images/ed/lookbook-02.jpg" },
  { slug: "archive-sale", name: "The Archive Sale", kicker: "On sale now", blurb: "Last sizes from past runs, up to 30% off. When they're gone, they're gone — we don't recut archive pieces.", image: "/images/ed/lookbook-05.jpg" },
  { slug: "essentials", name: "Essentials", kicker: "Always in stock", blurb: "The core wardrobe we never stop making: shirts, tees, trousers, belts.", image: "/images/ed/wardrobe-women.jpg" },
  { slug: "workwear", name: "Workwear", kicker: "Monday to Friday", blurb: "Tailoring that survives a commute, a client lunch and a late flight.", image: "/images/ed/lookbook-03.jpg" },
  { slug: "weekend-edit", name: "The Weekend Edit", kicker: "Saturday, slowly", blurb: "Linen, canvas, a good hat. Clothes for the farmers' market and the patio after.", image: "/images/ed/lookbook-06.jpg" },
  { slug: "gifts-under-100", name: "Gifts under $100", kicker: "Gift-wrapped free", blurb: "Small, well-made things — every one gift-wrapped in tissue at no charge.", image: "/images/ed/giftcard.jpg" },
];

export const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
export const collectionBySlug = new Map(collections.map((c) => [c.slug, c]));
