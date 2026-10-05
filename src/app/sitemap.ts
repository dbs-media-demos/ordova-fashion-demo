import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { products } from "@/content/products";
import { categories, collections } from "@/content/catalog";
import { posts } from "@/content/journal";

// Cart, checkout, success, wishlist and track are private and left out on purpose.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority = 0.6, changeFrequency: "daily" | "weekly" | "monthly" | "yearly" = "monthly") => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });
  return [
    page("/", 1, "weekly"),
    page("/shop", 0.9, "daily"),
    ...categories.map((c) => page(`/shop/${c.slug}`, 0.8, "weekly")),
    ...collections.map((c) => page(`/collections/${c.slug}`, 0.8, "weekly")),
    ...products.map((p) => page(`/products/${p.slug}`, 0.7, "weekly")),
    page("/lookbook", 0.8, "monthly"),
    page("/studio", 0.6),
    page("/about", 0.6),
    page("/visit", 0.7),
    page("/size-guide", 0.5),
    page("/shipping-returns", 0.5),
    page("/journal", 0.5, "weekly"),
    ...posts.map((p) => page(`/journal/${p.slug}`, 0.4)),
    page("/gift-cards", 0.5),
    page("/faq", 0.5),
    page("/reviews", 0.5),
    page("/privacy", 0.2, "yearly"),
    page("/terms", 0.2, "yearly"),
  ];
}
