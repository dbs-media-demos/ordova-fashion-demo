import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { posts, postBySlug } from "@/content/journal";
import { productBySlug } from "@/content/products";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductCard } from "@/components/shop/ProductCard";
import { IntroTitle, Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleSchema } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";
import type { Product } from "@/lib/commerce/types";
import { toCard } from "@/content/helpers";

export const dynamicParams = false;
export const generateStaticParams = () => posts.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: PageProps<"/journal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = postBySlug.get(slug);
  if (!p) return {};
  return pageMeta({ title: p.title, description: p.dek, path: `/journal/${p.slug}`, ogTitle: p.title, ogKicker: "Ordova Journal", image: p.image, type: "article" });
}

export default async function PostPage({ params }: PageProps<"/journal/[slug]">) {
  const { slug } = await params;
  const p = postBySlug.get(slug);
  if (!p) notFound();
  const shop = p.products.map((s) => productBySlug.get(s)).filter((x): x is Product => !!x).map(toCard);
  const others = posts.filter((x) => x.slug !== p.slug);
  return (
    <article>
      <JsonLd data={articleSchema({ title: p.title, description: p.dek, path: `/journal/${p.slug}`, image: p.image, date: p.date, author: p.author })} />
      <header className="container-x pt-[calc(var(--header-h)+2rem)]">
        <Breadcrumbs items={[{ name: "Journal", path: "/journal" }, { name: p.title, path: `/journal/${p.slug}` }]} />
        <div className="mx-auto mt-10 max-w-4xl text-center">
          <p className="t-mono anim-fade text-muted">
            {new Date(p.date + "T12:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {p.author} · {p.read}
          </p>
          <IntroTitle lines={[p.title]} className="mt-5 font-display text-[clamp(2.4rem,6.5vw,6rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.035em]" />
          <p className="t-lead anim-fade mx-auto mt-6 max-w-2xl text-muted" style={{ "--d": "0.3s" } as React.CSSProperties}>
            {p.dek}
          </p>
        </div>
        <div className="anim-rise media relative mx-auto mt-12 aspect-[16/9] max-w-6xl overflow-hidden rounded-[2px]" style={{ "--d": "0.2s" } as React.CSSProperties}>
          <Image src={p.image} alt={p.imageAlt} fill preload sizes="(min-width: 1200px) 72rem, 100vw" className="object-cover" />
        </div>
      </header>
      <div className="container-x mx-auto max-w-2xl py-16 text-[1.1rem] leading-relaxed md:py-24">
        {p.body.map((b, i) => (
          <Reveal key={i} className="mb-7">
            {b.h && <h2 className="t-h3 mb-3 mt-12">{b.h}</h2>}
            <p className={i === 0 ? "first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-[4.2rem] first-letter:font-extrabold first-letter:leading-[0.8]" : undefined}>{b.p}</p>
          </Reveal>
        ))}
      </div>
      {shop.length > 0 && (
        <section className="theme-sand py-20" aria-labelledby="shop-story">
          <div className="container-x">
            <h2 id="shop-story" className="t-h2">
              Shop the story
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 lg:grid-cols-6">
              {shop.map((x) => (
                <ProductCard key={x.slug} product={x} sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 50vw" />
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="container-x py-20">
        <p className="t-mono text-muted">Keep reading</p>
        <ul className="mt-5 grid gap-6 md:grid-cols-2">
          {others.map((o) => (
            <li key={o.slug}>
              <Link href={`/journal/${o.slug}`} className="group flex items-center gap-5">
                <div className="media relative h-24 w-32 shrink-0 overflow-hidden rounded-[2px]">
                  <Image src={o.image} alt="" fill sizes="128px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <span className="t-h3 group-hover:text-cobalt">{o.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
