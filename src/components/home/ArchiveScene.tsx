import Link from "next/link";
import type { Product } from "@/lib/commerce/types";
import { SaleSwiper } from "@/components/shop/SaleSwiper";
import { Countdown } from "@/components/shop/Countdown";
import { SplitReveal } from "@/components/ui/Reveal";
import { IconArrow } from "@/components/ui/Icons";

/** Scene 7 — The Archive Sale on olive: a countdown and the 3D coverflow. Confident, not shouty. */
export function ArchiveScene({ products }: { products: Product[] }) {
  return (
    <section className="theme-olive relative overflow-hidden py-24 md:py-32" aria-labelledby="archive-title">
      <div className="container-x grid gap-10 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <p className="t-mono text-bone/80">( 06 ) On sale now</p>
          <SplitReveal id="archive-title" by="chars" className="mt-3 font-display text-[clamp(2.2rem,7vw,6.5rem)] font-extrabold uppercase leading-[0.84] tracking-[-0.04em]">
            The Archive Sale
          </SplitReveal>
          <p className="mt-5 max-w-md text-bone/85">Last sizes from past runs, up to 30% off. We never recut archive patterns — when a size is gone, it&apos;s gone.</p>
        </div>
        <div className="md:col-span-5 md:justify-self-end">
          <Countdown to="sale" size="lg" />
        </div>
      </div>
      <div className="mt-14 md:mt-16">
        <SaleSwiper products={products} />
      </div>
      <div className="container-x mt-10 flex justify-center">
        <Link href="/collections/archive-sale" className="btn btn-light">
          Shop the Archive Sale <IconArrow size={16} />
        </Link>
      </div>
    </section>
  );
}
