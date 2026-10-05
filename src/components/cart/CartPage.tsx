"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/store";
import { CartLines, CrossSells, DeliveryToggle, FreeShippingBar, GiftOption, PromoField, Summary, usePricedCart } from "./CartParts";
import { LetterTitle } from "@/components/shop/ShopParts";
import { IconArrow, IconLock } from "@/components/ui/Icons";
import { collections } from "@/content/taxonomy";

export function CartPage() {
  const { mode } = useCart();
  const { priced, mounted } = usePricedCart();
  const empty = mounted && priced.lines.length === 0;

  return (
    <div className="container-x min-h-[90vh] pb-24 pt-[calc(var(--header-h)+2.5rem)]">
      <LetterTitle text="Your bag" className="text-[clamp(3rem,10vw,9rem)]" />
      {!mounted ? (
        <div className="mt-12 grid gap-4" aria-busy="true">
          <div className="skel h-36" />
          <div className="skel h-36" />
        </div>
      ) : empty ? (
        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <div>
            <p className="t-lead max-w-md">Nothing in here yet. The best place to start is the pieces people come back for in a second colour.</p>
            <div className="mt-8 flex flex-wrap gap-2">
              <Link href="/collections/bestsellers" className="btn btn-solid">
                Shop bestsellers <IconArrow size={16} />
              </Link>
              <Link href="/lookbook" className="btn btn-ghost">
                Browse the lookbook
              </Link>
            </div>
          </div>
          <ul className="grid grid-cols-2 gap-3">
            {collections.slice(0, 4).map((c) => (
              <li key={c.slug}>
                <Link href={`/collections/${c.slug}`} className="group block">
                  <div className="media aspect-[4/5] rounded-[2px]">
                    <Image src={c.image} alt="" fill sizes="(min-width: 768px) 22vw, 45vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <p className="mt-2 text-sm font-medium">{c.name}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-12 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <FreeShippingBar remaining={mode === "pickup" ? 0 : priced.freeShippingRemaining} subtotal={mode === "pickup" ? 150 : priced.subtotal - priced.discount} />
            <div className="mt-6 border-t border-line">
              <CartLines priced={priced} />
            </div>
            <div className="mt-10 border-t border-line pt-8">
              <CrossSells priced={priced} limit={4} />
            </div>
          </div>
          <aside className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start" aria-label="Order summary">
            <div className="space-y-5 rounded-lg bg-paper p-5 md:p-7">
              <DeliveryToggle />
              <GiftOption />
              <PromoField />
              <div className="border-t border-line pt-5">
                <Summary priced={priced} mode={mode} />
              </div>
              <Link href="/checkout" className="btn btn-solid btn-lg w-full">
                <IconLock size={16} /> Checkout securely
              </Link>
              <p className="t-mono text-center text-[0.6rem] text-muted">Demo store — no payment is taken</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
