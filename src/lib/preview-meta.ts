import type { Metadata } from "next";
import { previewBiz } from "./preview";

/** Title and description for a personalised preview (/for/<token> and its /v2); never indexed. */
export async function previewMetadata(token: string): Promise<Metadata> {
  const biz = await previewBiz(token);
  const robots = { index: false, follow: false, googleBot: { index: false, follow: false } };
  if (!biz) return { title: "Preview not found", robots };
  const place = [biz.address.city || biz.area, biz.address.region].filter(Boolean).join(", ") || biz.area;
  const title = `${biz.name} | Clothing boutique${place ? `, ${place}` : ""}`;
  const description = `Womenswear, menswear and accessories from ${biz.name}${biz.area ? ` in ${biz.area}` : ""}. Shop online with free returns, or visit the store${biz.phoneDisplay ? ` · ${biz.phoneDisplay}` : ""}.`;
  return {
    title: { absolute: title },
    description,
    robots,
    alternates: { canonical: null },
    openGraph: { type: "website", siteName: biz.name, title, description, images: [] },
    twitter: { card: "summary", title, description },
  };
}
