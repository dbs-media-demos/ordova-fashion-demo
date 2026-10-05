import type { MetadataRoute } from "next";
import { noindex, siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (noindex) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/cart", "/checkout", "/wishlist", "/track", "/api/"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
