import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Stars } from "@/components/ui/Stars";
import { products } from "@/content/products";
import { site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Reviews — 4.9 from 312 customers",
  description: "What Ordova customers in Dallas and across the US say about the clothes, the fit, the service and the shop in Bishop Arts.",
  path: "/reviews",
  ogTitle: "4.9 ★ from 312 reviews",
  ogKicker: "Ordova reviews",
});

const STORE = [
  { a: "Grace O.", w: "Bishop Arts", t: "The best-edited store in Dallas", b: "Half of what's on the rail is made a mile away and it fits like it. The team remembers your size and doesn't push.", d: "Sep 2026" },
  { a: "Will J.", w: "East Dallas", t: "Free hemming, while I had coffee", b: "Bought chinos, they hemmed them while I walked to Davis St for a coffee. Ready when I came back. Free.", d: "Sep 2026" },
  { a: "Kendra A.", w: "The Cedars", t: "Pickup in under two hours", b: "Ordered at lunch, picked it up on my way home, wrapped in tissue with a note. Feels like a gift even when it's for you.", d: "Aug 2026" },
  { a: "Aaron D.", w: "Los Angeles, CA", t: "Great online too", b: "Emailed about a sleeve length and got a real measurement back in an hour. Shipping was two days to LA.", d: "Aug 2026" },
  { a: "Priya S.", w: "Plano", t: "Styling hour was a revelation", b: "I came in for one dress and left knowing my size in every brand they carry. No pressure at all.", d: "Jul 2026" },
  { a: "Ben C.", w: "Denton", t: "Returns are genuinely free", b: "Exchanged a sweater for a size down — they shipped the new one before mine even arrived back.", d: "Jul 2026" },
];

export default function ReviewsPage() {
  const productReviews = products.flatMap((p) => p.reviews.slice(0, 1).map((r) => ({ ...r, product: p }))).slice(0, 12);
  const breakdown = [
    [5, 91],
    [4, 7],
    [3, 1],
    [2, 1],
    [1, 0],
  ];
  return (
    <>
      <PageHero crumbs={[{ name: "Reviews", path: "/reviews" }]} kicker="Google · in store · online" title="Reviews" />
      <section className="container-x grid gap-14 pb-20 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="font-display text-[6rem] font-extrabold leading-none">{site.rating.value}</p>
          <Stars value={site.rating.value} size={22} />
          <p className="mt-2 text-muted">{site.rating.count} reviews on Google</p>
          <dl className="mt-8 space-y-2">
            {breakdown.map(([s, pct]) => (
              <div key={s} className="grid grid-cols-[3rem_1fr_3rem] items-center gap-3 text-sm">
                <dt>{s} star</dt>
                <dd className="h-1.5 overflow-hidden rounded-full bg-char/10">
                  <span className="block h-full rounded-full bg-char" style={{ width: `${pct}%` }} />
                </dd>
                <dd className="t-price text-right text-muted">{pct}%</dd>
              </div>
            ))}
          </dl>
        </div>
        <Reveal as="ul" stagger={0.06} className="grid gap-4 sm:grid-cols-2 md:col-span-8">
          {STORE.map((r) => (
            <li key={r.a} className="rounded-lg border border-line p-6">
              <div className="flex items-center justify-between">
                <Stars value={5} />
                <span className="sr-only">5 out of 5 stars</span>
                <span className="t-mono text-[0.6rem] text-muted">{r.d}</span>
              </div>
              <h2 className="mt-3 font-medium">{r.t}</h2>
              <p className="mt-2 text-muted">{r.b}</p>
              <p className="t-mono mt-4 text-[0.62rem]">
                {r.a} · {r.w}
              </p>
            </li>
          ))}
        </Reveal>
      </section>
      <section className="theme-sand py-20">
        <div className="container-x">
          <h2 className="t-h2">On the pieces</h2>
          <ul className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
            {productReviews.map((r) => (
              <li key={r.id} className="border-t border-line pt-5">
                <Stars value={r.rating} />
                <span className="sr-only">{r.rating} out of 5 stars</span>
                <h3 className="mt-2 font-medium">{r.title}</h3>
                <p className="mt-2 text-sm text-muted">{r.body}</p>
                <p className="t-mono mt-3 text-[0.6rem]">
                  {r.author} on{" "}
                  <Link href={`/products/${r.product.slug}`} className="link-line">
                    {r.product.name}
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
