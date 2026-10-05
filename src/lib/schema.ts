import type { Product } from "@/lib/commerce/types";
import { site, siteUrl } from "./site";
import { saleEndsAt } from "@/content/catalog";

const abs = (p: string) => (p.startsWith("http") ? p : `${siteUrl}${p}`);
const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const storeId = `${siteUrl}/#store`;

export function storeSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    "@id": storeId,
    name: site.name,
    legalName: site.legalName,
    description: site.description,
    url: siteUrl,
    logo: abs("/icon.svg"),
    image: abs("/images/ed/store-interior-1.jpg"),
    telephone: "+1-214-555-0163",
    email: site.email,
    priceRange: "$38–$480",
    currenciesAccepted: "USD",
    paymentAccepted: "Credit card, Apple Pay, Google Pay",
    foundingDate: String(site.founded),
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postal,
      addressCountry: site.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    areaServed: [
      { "@type": "City", name: "Dallas" },
      { "@type": "City", name: "Fort Worth" },
      { "@type": "Country", name: "United States" },
    ],
    openingHoursSpecification: site.hours
      .filter((h) => h.open)
      .map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: `https://schema.org/${DAY[h.day]}`, opens: h.open, closes: h.close })),
    aggregateRating: { "@type": "AggregateRating", ratingValue: site.rating.value, reviewCount: site.rating.count, bestRating: 5 },
    review: [
      { "@type": "Review", author: { "@type": "Person", name: "Grace O." }, reviewRating: { "@type": "Rating", ratingValue: 5 }, reviewBody: "The best-edited store in Dallas. Everything fits like it was made for you because half of it was made a mile away." },
      { "@type": "Review", author: { "@type": "Person", name: "Will J." }, reviewRating: { "@type": "Rating", ratingValue: 5 }, reviewBody: "They hemmed my chinos while I had coffee across the street. Free. That's the whole review." },
    ],
    sameAs: [site.instagram],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: site.name,
    publisher: { "@id": storeId },
    potentialAction: { "@type": "SearchAction", target: `${siteUrl}/shop?q={search_term_string}`, "query-input": "required name=search_term_string" },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

const shippingDetails = {
  "@type": "OfferShippingDetails",
  shippingRate: { "@type": "MonetaryAmount", value: site.standardShipping, currency: "USD" },
  shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
  deliveryTime: {
    "@type": "ShippingDeliveryTime",
    handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
    transitTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 5, unitCode: "DAY" },
  },
};

const returnPolicy = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "US",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: site.returnDays,
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/FreeReturn",
};

export function productSchema(p: Product) {
  const url = `${siteUrl}/products/${p.slug}`;
  const validUntil = p.compareAt ? saleEndsAt(new Date()).toISOString().slice(0, 10) : undefined;
  const offers = p.colors.flatMap((c) =>
    p.variants
      .filter((v) => v.color === c.name)
      .map((v) => ({
        "@type": "Offer",
        sku: v.sku,
        url: `${url}?color=${encodeURIComponent(c.name)}`,
        price: v.price,
        priceCurrency: "USD",
        ...(validUntil ? { priceValidUntil: validUntil } : {}),
        availability: v.stock > 0 ? (v.stock <= 2 ? "https://schema.org/LimitedAvailability" : "https://schema.org/InStock") : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        shippingDetails,
        hasMerchantReturnPolicy: returnPolicy,
        seller: { "@id": storeId },
      })),
  );
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: p.name,
    description: p.long,
    url,
    sku: p.variants[0].sku.split("-").slice(0, 2).join("-"),
    brand: { "@type": "Brand", name: site.name },
    image: [...new Set([...p.images.map((i) => i.src), ...p.colors.map((c) => c.image)])].map(abs),
    material: p.materials,
    color: p.colors.map((c) => c.name).join(", "),
    size: p.sizes.join(", "),
    aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviewCount, bestRating: 5 },
    review: p.reviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author },
      datePublished: r.date,
      name: r.title,
      reviewBody: r.body,
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
    })),
    offers,
  };
}

export function itemListSchema(name: string, path: string, items: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: abs(path),
    numberOfItems: items.length,
    itemListElement: items.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${siteUrl}/products/${p.slug}`, name: p.name })),
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function articleSchema(a: { title: string; description: string; path: string; image: string; date: string; author: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    image: abs(a.image),
    datePublished: a.date,
    author: { "@type": "Person", name: a.author },
    publisher: { "@id": storeId },
    mainEntityOfPage: abs(a.path),
  };
}
