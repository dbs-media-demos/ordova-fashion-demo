import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { categories, categoryBySlug, inCategory, toCard } from "@/content/catalog";
import type { CategorySlug } from "@/lib/commerce/types";
import { ShopView } from "@/components/shop/ShopView";
import { CategoryRail, LetterTitle } from "@/components/shop/ShopParts";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { itemListSchema } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";

export const dynamicParams = false;
export const generateStaticParams = () => categories.map((c) => ({ category: c.slug }));

export async function generateMetadata({ params }: PageProps<"/shop/[category]">): Promise<Metadata> {
  const { category } = await params;
  const c = categoryBySlug.get(category as CategorySlug);
  if (!c) return {};
  return pageMeta({
    title: `${c.name} — made in Dallas`,
    description: `${c.blurb} Shop ${c.name.toLowerCase()} from Ordova, Bishop Arts. Free shipping over $150 and free 30-day returns.`,
    path: `/shop/${c.slug}`,
    ogTitle: c.name,
    ogKicker: "Ordova · Shop",
  });
}

export default async function CategoryPage({ params }: PageProps<"/shop/[category]">) {
  const { category } = await params;
  const c = categoryBySlug.get(category as CategorySlug);
  if (!c) notFound();
  const list = inCategory(c.slug).sort((a, b) => b.featured - a.featured);
  return (
    <>
      <JsonLd data={itemListSchema(c.name, `/shop/${c.slug}`, list)} />
      <header className="relative pt-[calc(var(--header-h)+2rem)]">
        <div className="container-x grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <Breadcrumbs items={[{ name: "Shop", path: "/shop" }, { name: c.name, path: `/shop/${c.slug}` }]} />
            <LetterTitle text={c.name} className="mt-6 text-[clamp(1.9rem,7.6vw,7.5rem)]" />
            <p className="anim-fade mt-6 max-w-md text-muted" style={{ "--d": "0.3s" } as React.CSSProperties}>
              {c.blurb}
            </p>
          </div>
          <div className="anim-rise media hidden aspect-[4/5] overflow-hidden rounded-[2px] md:col-span-3 md:col-start-10 md:block" style={{ "--d": "0.2s" } as React.CSSProperties}>
            <Image src={c.image} alt="" fill preload sizes="25vw" className="object-cover" />
          </div>
        </div>
        <div className="mt-10">
          <CategoryRail current={c.slug} />
        </div>
      </header>
      <div className="mt-10">
        <ShopView products={list.map(toCard)} hide={["cat"]} label={c.name} />
      </div>
    </>
  );
}
