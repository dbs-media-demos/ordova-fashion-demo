import type { Metadata } from "next";
import { products } from "@/content/products";
import { archiveSale, lastSizes, toCard } from "@/content/catalog";
import { ShopView } from "@/components/shop/ShopView";
import { CategoryRail, DropBanner, LastSizes, LetterTitle, SaleBand } from "@/components/shop/ShopParts";
import { SaleSwiper } from "@/components/shop/SaleSwiper";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { itemListSchema } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Shop all — womenswear, menswear & accessories",
  description: "All 36 Ordova pieces: dresses, shirts, knitwear, trousers, outerwear, bags and accessories, cut and sewn in Dallas. Filter by size, colour, fabric and price.",
  path: "/shop",
  ogTitle: "Shop all",
  ogKicker: "36 pieces · Made in Dallas",
});

export default function ShopPage() {
  const list = [...products].sort((a, b) => b.featured - a.featured);
  return (
    <>
      <JsonLd data={itemListSchema("Shop all", "/shop", list)} />
      <header className="pt-[calc(var(--header-h)+2rem)]">
        <div className="container-x">
          <Breadcrumbs items={[{ name: "Shop", path: "/shop" }]} />
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <LetterTitle text="Shop all" className="text-[clamp(2.4rem,10vw,10rem)]" />
            <p className="anim-fade max-w-sm pb-3 text-muted" style={{ "--d": "0.3s" } as React.CSSProperties}>
              Thirty-six pieces, most of them cut and sewn a mile from here. Free shipping over $150, free returns for 30 days.
            </p>
          </div>
        </div>
        <div className="mt-10">
          <CategoryRail priority />
        </div>
      </header>
      <div className="mt-10">
        <ShopView products={list.map(toCard)} label="All products" />
      </div>
      <div className="container-x pb-16">
        <DropBanner />
      </div>
      <SaleBand>
        <SaleSwiper products={archiveSale().map(toCard)} />
      </SaleBand>
      <section className="container-x py-20 md:py-28">
        <LastSizes items={lastSizes().map((x) => ({ ...x, p: toCard(x.p) }))} intro={<p>Single sizes from past runs. Flip a card to see what&apos;s left and tap a size to add it.</p>} />
      </section>
    </>
  );
}
