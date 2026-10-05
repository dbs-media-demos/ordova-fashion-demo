import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { collectionBySlug, collections, inCollection, lastSizes, toCard } from "@/content/catalog";
import type { CollectionSlug } from "@/lib/commerce/types";
import { ShopView } from "@/components/shop/ShopView";
import { LastSizes, LetterTitle } from "@/components/shop/ShopParts";
import { SaleSwiper } from "@/components/shop/SaleSwiper";
import { Countdown } from "@/components/shop/Countdown";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Marquee } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { itemListSchema } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";

export const dynamicParams = false;
export const generateStaticParams = () => collections.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = collectionBySlug.get(slug as CollectionSlug);
  if (!c) return {};
  return pageMeta({
    title: c.name,
    description: `${c.blurb} Ordova, Bishop Arts, Dallas — free shipping over $150.`,
    path: `/collections/${c.slug}`,
    ogTitle: c.name,
    ogKicker: c.kicker,
  });
}

export default async function CollectionPage({ params }: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const c = collectionBySlug.get(slug as CollectionSlug);
  if (!c) notFound();
  const list = inCollection(c.slug);
  const sale = c.slug === "archive-sale";

  return (
    <>
      <JsonLd data={itemListSchema(c.name, `/collections/${c.slug}`, list)} />
      <header className={sale ? "theme-olive overflow-hidden pb-16 pt-[calc(var(--header-h)+2rem)]" : "relative overflow-hidden pt-[calc(var(--header-h)+2rem)]"}>
        <div className="container-x">
          <Breadcrumbs items={[{ name: "Collections", path: "/shop" }, { name: c.name, path: `/collections/${c.slug}` }]} tone={sale ? "dark" : "light"} />
          <div className="mt-6 grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-8">
              <p className={`t-mono anim-fade ${sale ? "text-bone/85" : "text-muted"}`}>{c.kicker}</p>
              <LetterTitle text={c.name} className="mt-3 text-[clamp(1.8rem,7.2vw,7.5rem)]" />
              <p className={`anim-fade mt-6 max-w-lg ${sale ? "text-bone/85" : "text-muted"}`} style={{ "--d": "0.3s" } as React.CSSProperties}>
                {c.blurb}
              </p>
            </div>
            <div className="md:col-span-4 md:justify-self-end">
              {sale ? (
                <Countdown to="sale" size="md" />
              ) : (
                <div className="anim-rise media aspect-[4/5] w-full overflow-hidden rounded-[2px] md:w-64" style={{ "--d": "0.2s" } as React.CSSProperties}>
                  <Image src={c.image} alt="" fill preload sizes="(min-width: 768px) 16rem, 100vw" className="object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
        {sale && (
          <>
            <div className="mt-14">
              <SaleSwiper products={list.map(toCard)} priority />
            </div>
            <div className="mt-14 border-y border-line-lt py-3">
              <Marquee duration={30}>
                {["Last sizes from past runs", "Up to 30% off", "Never recut", "Free returns, even on sale", "Free hemming in store"].map((t) => (
                  <span key={t} className="t-mono pr-10">
                    {t} ·
                  </span>
                ))}
              </Marquee>
            </div>
          </>
        )}
      </header>

      {sale && (
        <section className="container-x py-16 md:py-24">
          <LastSizes items={lastSizes().map((x) => ({ ...x, p: toCard(x.p) }))} title="Last sizes" intro={<p>Flip a card to see the sizes left and the sale price. Tap a size to add it — no page change.</p>} />
        </section>
      )}

      <div className={sale ? "" : "mt-10"}>
        <ShopView products={list.map(toCard)} label={c.name} />
      </div>

      <section className="container-x pb-24">
        <p className="t-mono text-muted">More collections</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {collections
            .filter((x) => x.slug !== c.slug)
            .map((x) => (
              <li key={x.slug}>
                <Link href={`/collections/${x.slug}`} className="chip">
                  {x.name}
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </>
  );
}
