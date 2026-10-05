import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Parallax, Reveal } from "@/components/ui/Reveal";
import { posts } from "@/content/journal";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Journal",
  description: "Notes from the Ordova studio and shop: building a small wardrobe, dressing for Texas light, and how a run of thirty gets made.",
  path: "/journal",
  ogTitle: "Journal",
  ogKicker: "Notes from the studio",
});

const fmt = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

export default function JournalPage() {
  const [lead, ...rest] = posts;
  return (
    <>
      <PageHero crumbs={[{ name: "Journal", path: "/journal" }]} kicker="Notes from the studio" title="Journal" />
      <section className="container-x pb-24">
        <Link href={`/journal/${lead.slug}`} className="group grid gap-8 md:grid-cols-12 md:items-end">
          <div className="anim-rise media relative aspect-[16/10] overflow-hidden rounded-[2px] md:col-span-8">
            <Image src={lead.image} alt={lead.imageAlt} fill preload sizes="(min-width: 768px) 66vw, 100vw" className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]" />
          </div>
          <div className="md:col-span-4">
            <p className="t-mono text-muted">
              {fmt(lead.date)} · {lead.read}
            </p>
            <h2 className="t-h2 mt-3 group-hover:text-cobalt">{lead.title}</h2>
            <p className="mt-3 text-muted">{lead.dek}</p>
          </div>
        </Link>
        <div className="mt-20 grid gap-12 md:grid-cols-2">
          {rest.map((p) => (
            <Reveal key={p.slug}>
              <Link href={`/journal/${p.slug}`} className="group block">
                <Parallax className="aspect-[4/3] rounded-[2px]" amount={8}>
                  <Image src={p.image} alt={p.imageAlt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                </Parallax>
                <p className="t-mono mt-5 text-muted">
                  {fmt(p.date)} · {p.read}
                </p>
                <h2 className="t-h3 mt-2 group-hover:text-cobalt">{p.title}</h2>
                <p className="mt-2 text-muted">{p.dek}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
