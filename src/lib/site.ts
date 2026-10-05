/** Single source of truth for the (fictional) business. */

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://ordova-fashion-demo.vercel.app").replace(/\/$/, "");

/** Demo sites stay out of search engines unless NEXT_PUBLIC_NOINDEX is explicitly "false". */
export const noindex = process.env.NEXT_PUBLIC_NOINDEX !== "false";

export const agencyName = "Scale by Noon";
export const agencyUrl = "https://www.scalebynoon.com";

export const site = {
  name: "Ordova",
  legalName: "Ordova Studio LLC",
  tagline: "Fewer, better clothes. Cut and sewn in Dallas.",
  description:
    "Ordova is an independent concept store and small-batch label in Bishop Arts, Dallas. Womenswear, menswear and accessories, cut and sewn a mile from the shop, shipped free over $150.",
  phone: "(214) 555-0163",
  phoneHref: "tel:+12145550163",
  email: "hello@ordovastudio.com",
  address: {
    street: "421 N Bishop Ave, Suite 102",
    city: "Dallas",
    region: "TX",
    postal: "75208",
    country: "US",
    neighborhood: "Bishop Arts District",
  },
  geo: { lat: 32.7487, lng: -96.8278 },
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Bishop+Arts+District+Dallas+TX",
  instagram: "https://www.instagram.com/",
  founded: 2019,
  currency: "USD",
  freeShippingThreshold: 150,
  standardShipping: 8,
  expressShipping: 18,
  taxRate: 0.0825,
  returnDays: 30,
  /** 0 = Sunday. Times are Dallas local (America/Chicago). */
  hours: [
    { day: 0, open: "12:00", close: "17:00" },
    { day: 1, open: null, close: null },
    { day: 2, open: "11:00", close: "19:00" },
    { day: 3, open: "11:00", close: "19:00" },
    { day: 4, open: "11:00", close: "20:00" },
    { day: 5, open: "11:00", close: "20:00" },
    { day: 6, open: "10:00", close: "20:00" },
  ] as { day: number; open: string | null; close: string | null }[],
  rating: { value: 4.9, count: 312 },
  serviceArea: ["Dallas", "Oak Cliff", "Bishop Arts", "Deep Ellum", "Uptown", "Fort Worth", "Plano", "All 50 states"],
} as const;

export const nav = {
  primary: [
    { label: "Shop", href: "/shop" },
    { label: "Women", href: "/shop?dept=women" },
    { label: "Men", href: "/shop?dept=men" },
    { label: "Lookbook", href: "/lookbook" },
    { label: "Studio", href: "/studio" },
    { label: "Visit", href: "/visit" },
  ],
  footer: [
    {
      title: "Shop",
      links: [
        { label: "New in", href: "/collections/new-in" },
        { label: "Bestsellers", href: "/collections/bestsellers" },
        { label: "The Archive Sale", href: "/collections/archive-sale" },
        { label: "Essentials", href: "/collections/essentials" },
        { label: "Gifts under $100", href: "/collections/gifts-under-100" },
        { label: "Gift cards", href: "/gift-cards" },
      ],
    },
    {
      title: "Ordova",
      links: [
        { label: "Our story", href: "/about" },
        { label: "The studio", href: "/studio" },
        { label: "Lookbook", href: "/lookbook" },
        { label: "Journal", href: "/journal" },
        { label: "Reviews", href: "/reviews" },
        { label: "Visit the store", href: "/visit" },
      ],
    },
    {
      title: "Help",
      links: [
        { label: "Size guide", href: "/size-guide" },
        { label: "Shipping & returns", href: "/shipping-returns" },
        { label: "Track an order", href: "/track" },
        { label: "FAQ", href: "/faq" },
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ],
    },
  ],
};
