"use client";

import Link from "next/link";
import { productBySlug } from "@/content/products";
import { inCollection } from "@/content/catalog";
import { useMounted, useWishlist, wishStore } from "@/lib/store";
import { ProductCard } from "./ProductCard";
import { IconArrow, IconHeart } from "@/components/ui/Icons";

export function WishlistView() {
  const list = useWishlist();
  const mounted = useMounted();
  const items = list.map((s) => productBySlug.get(s)).filter((p): p is NonNullable<typeof p> => !!p);

  if (!mounted) return <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4" aria-busy="true">{[0, 1, 2, 3].map((i) => <div key={i} className="skel aspect-[4/5]" />)}</div>;

  if (!items.length) {
    const ideas = inCollection("bestsellers").slice(0, 4);
    return (
      <div className="mt-12">
        <div className="flex flex-col items-start gap-4 rounded-lg bg-sand p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <p className="flex items-center gap-3">
            <IconHeart size={22} /> Tap the heart on anything you like — it&apos;ll wait for you here, on this device.
          </p>
          <Link href="/shop" className="btn btn-solid shrink-0">
            Start browsing <IconArrow size={16} />
          </Link>
        </div>
        <h2 className="t-mono mt-14 text-muted">A few to start with</h2>
        <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4">
          {ideas.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between">
        <p className="t-mono text-muted" aria-live="polite">
          {items.length} saved
        </p>
        <button type="button" className="t-mono link-u" onClick={() => wishStore.set([])}>
          Clear wishlist
        </button>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
