import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products, productBySlug } from "@/content/products";
import { categoryBySlug, toCard } from "@/content/catalog";
import type { Product } from "@/lib/commerce/types";
import { ProductView } from "@/components/product/ProductView";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { productSchema } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";
import { money } from "@/lib/format";

export const dynamicParams = false;
export const generateStaticParams = () => products.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = productBySlug.get(slug);
  if (!p) return {};
  return pageMeta({
    title: `${p.name} — ${p.colors.map((c) => c.name).join(", ")}`,
    description: `${p.short} ${money(p.price)}${p.compareAt ? ` (was ${money(p.compareAt)})` : ""}. ${p.origin}. Free shipping over $150, free 30-day returns.`,
    path: `/products/${p.slug}`,
    image: p.images[0].src,
  });
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const p = productBySlug.get(slug);
  if (!p) notFound();
  const cat = categoryBySlug.get(p.category)!;
  return (
    <>
      <JsonLd data={productSchema(p)} />
      <ProductView
        product={p}
        pairs={p.pairs.map((s) => productBySlug.get(s)).filter((x): x is Product => !!x).map(toCard)}
        index={products.map((x) => ({ slug: x.slug, name: x.name, price: x.price, image: x.images[0].src }))}
      />
      <div className="container-x pb-10">
        <Breadcrumbs
          items={[
            { name: "Shop", path: "/shop" },
            { name: cat.name, path: `/shop/${cat.slug}` },
            { name: p.name, path: `/products/${p.slug}` },
          ]}
        />
      </div>
    </>
  );
}
