import type { Metadata } from "next";
import { site, siteUrl, noindex } from "./site";

type MetaInput = {
  title: string;
  description: string;
  path: string;
  /** A photo (path under /public) to feature on the dynamic OG card. */
  image?: string;
  ogTitle?: string;
  ogKicker?: string;
  /** Force noindex (cart, checkout, wishlist, track). */
  privatePage?: boolean;
  type?: "website" | "article";
};

export function pageMeta({ title, description, path, image, ogTitle, ogKicker, privatePage, type = "website" }: MetaInput): Metadata {
  const url = `${siteUrl}${path === "/" ? "" : path}`;
  // Every page gets a branded card from /api/og; product pages pass their photo in.
  const og = `/api/og?title=${encodeURIComponent(ogTitle ?? title)}${ogKicker ? `&kicker=${encodeURIComponent(ogKicker)}` : ""}${image ? `&img=${encodeURIComponent(image)}` : ""}`;
  const robots = privatePage || noindex ? { index: false, follow: !privatePage && !noindex, googleBot: { index: false, follow: false } } : undefined;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url,
      siteName: site.name,
      locale: "en_US",
      type,
      images: [{ url: og, width: 1200, height: 630, alt: `${site.name} — ${ogTitle ?? title}` }],
    },
    twitter: { card: "summary_large_image", title: `${title} | ${site.name}`, description, images: [og] },
    robots,
  };
}
