import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { StackSequence, ZoomFrame } from "@/components/content/Sequences";
import { STEPS } from "@/content/studio";
import { Reveal, ScrubWords } from "@/components/ui/Reveal";
import { inCollection, toCard } from "@/content/catalog";
import { ProductCard } from "@/components/shop/ProductCard";
import { pageMeta } from "@/lib/seo";
import { IconArrow } from "@/components/ui/Icons";

export const metadata: Metadata = pageMeta({
  title: "Our label & studio — how it's made",
  description: "Sketch, pattern, cut, sew, tag: how six people in a Bishop Arts studio make Ordova's label in runs of thirty, a mile from the shop.",
  path: "/studio",
  ogTitle: "How it's made",
  ogKicker: "The Ordova studio",
  image: "/images/ed/studio-room.jpg",
});

const EXTRA = ["Pencil, tracing paper, one big window", "Brown kraft paper, a toile on three bodies", "30 plies, hand shears, true grain", "Two lockstitch machines, one overlocker", "Signed care tags, one mile to the rail"];

export default function StudioPage() {
  const made = inCollection("essentials").slice(0, 4).map(toCard);
  return (
    <>
      <PageHero
        crumbs={[{ name: "The studio", path: "/studio" }]}
        kicker="Our label"
        title="The studio"
        intro="Upstairs from a tyre shop on Bishop Ave, six people make most of what hangs in the store. Here's how a piece gets from a pencil line to your care tag."
        image="/images/ed/studio-room.jpg"
        imageAlt="The Ordova studio: rails, cutting table and sewing machines in daylight"
      />
      <section className="container-x pb-24">
        <ScrubWords
          className="max-w-5xl font-display text-[clamp(1.6rem,3.6vw,3.2rem)] font-bold uppercase leading-[1.04] tracking-[-0.02em]"
          text="We make slowly on purpose. *A *run *is *thirty *pieces, the people who sew them sign the tags, and when a size sells out we read every note before we cut again."
        />
      </section>
      <StackSequence label="From sketch to tag" steps={STEPS.map((s, i) => ({ ...s, extra: EXTRA[i] }))} />
      <section className="container-x grid gap-10 py-24 md:grid-cols-3 md:py-32">
        {[
          ["6", "people in the studio", "Pattern cutting, sewing, finishing and pressing — every name on a care tag."],
          ["30", "pieces per run", "The most our table holds before the shears drift off the grain."],
          ["1 mile", "from table to rail", "Finished pieces walk from the studio to the shop on Bishop Ave."],
        ].map(([n, t, d]) => (
          <Reveal key={t}>
            <p className="font-display text-[clamp(3.5rem,7vw,6rem)] font-extrabold leading-none tracking-[-0.04em]">{n}</p>
            <h2 className="t-mono mt-3">{t}</h2>
            <p className="mt-2 max-w-xs text-muted">{d}</p>
          </Reveal>
        ))}
      </section>
      <ZoomFrame img="/images/ed/studio-team.jpg" alt="The studio team at work at the cutting table" kicker="Visits" line="First Saturday of every month, the studio door is open" />
      <section className="container-x py-24 md:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="t-h2 max-w-[14ch]">Made in this room</h2>
          <Link href="/collections/essentials" className="btn btn-ghost">
            Shop essentials <IconArrow size={16} />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4">
          {made.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
