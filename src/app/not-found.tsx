import Link from "next/link";
import { Ring } from "@/components/brand/Logo";
import { inCollection, toCard } from "@/content/catalog";
import { ProductCard } from "@/components/shop/ProductCard";
import { IconArrow } from "@/components/ui/Icons";

export default function NotFound() {
  const picks = inCollection("bestsellers").slice(0, 4).map(toCard);
  return (
    <div className="pt-[calc(var(--header-h)+3rem)]">
      <section className="container-x text-center">
        <p className="t-mono text-muted">Error 404</p>
        <h1 className="mt-6 flex items-center justify-center font-display text-[clamp(5rem,22vw,20rem)] font-extrabold uppercase leading-[0.8] tracking-[-0.05em]">
          <span className="anim-mask" aria-hidden="true">
            <span>4</span>
          </span>
          <span className="anim-mask" aria-hidden="true">
            <span style={{ "--d": "0.08s" } as React.CSSProperties}>
              <Ring className="h-[0.74em] w-[0.74em] text-cobalt" />
            </span>
          </span>
          <span className="anim-mask" aria-hidden="true">
            <span style={{ "--d": "0.16s" } as React.CSSProperties}>4</span>
          </span>
          <span className="sr-only">Page not found</span>
        </h1>
        <p className="t-lead mx-auto mt-8 max-w-md text-muted">This page sold out — or never existed. The good stuff is still on the rail.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Link href="/shop" className="btn btn-solid">
            Shop all <IconArrow size={16} />
          </Link>
          <Link href="/" className="btn btn-ghost">
            Home
          </Link>
        </div>
      </section>
      <section className="container-x py-24">
        <h2 className="t-mono text-muted">People come back for these</h2>
        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4">
          {picks.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
