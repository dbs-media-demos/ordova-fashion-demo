import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { SizeChart } from "@/components/product/SizeTools";
import { pageMeta } from "@/lib/seo";
import { IconArrow } from "@/components/ui/Icons";

export const metadata: Metadata = pageMeta({
  title: "Size guide",
  description: "Ordova size charts in inches and centimetres for clothing, trousers, hats and belts — plus how to measure and how each piece fits.",
  path: "/size-guide",
  ogTitle: "Size guide",
  ogKicker: "Inches & cm",
});

export default function Page() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Size guide", path: "/size-guide" }]}
        kicker="Inches or centimetres"
        title="Size guide"
        intro="Body measurements, not garment measurements. Each product page also shows the model's height and size, and a fit slider from real reviews."
      />
      <section className="container-x pb-20">
        <SizeChart />
      </section>
      <section className="theme-sand py-16">
        <div className="container-x flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="t-h3">Still between sizes?</h2>
            <p className="mt-2 max-w-lg text-muted">Every product page has a four-question Fit Finder, or book a free styling hour and try everything on.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/shop" className="btn btn-solid">
              Shop all <IconArrow size={16} />
            </Link>
            <Link href="/visit" className="btn btn-ghost">
              Book a styling hour
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
