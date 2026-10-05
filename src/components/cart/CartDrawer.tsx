"use client";

import Link from "next/link";
import { Sheet, SheetHeader } from "@/components/ui/Sheet";
import { ui, useCart, useUi } from "@/lib/store";
import { CartLines, CrossSells, DeliveryToggle, FreeShippingBar, GiftOption, PromoField, Summary, usePricedCart } from "./CartParts";
import { IconBag, IconLock } from "@/components/ui/Icons";

export function CartDrawer() {
  const { cartOpen } = useUi();
  const { mode } = useCart();
  const { priced } = usePricedCart();
  const empty = priced.lines.length === 0;

  return (
    <Sheet open={cartOpen} onClose={ui.closeCart} label="Your bag">
      <SheetHeader
        onClose={ui.closeCart}
        title={
          <>
            Your bag <span className="text-muted">({priced.count})</span>
          </>
        }
      />
      {empty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-sand">
            <IconBag size={30} />
          </span>
          <p className="t-h3">Your bag is empty</p>
          <p className="max-w-[28ch] text-muted">Start with the pieces people come back for in a second colour.</p>
          <div className="flex flex-col gap-2">
            <Link href="/collections/bestsellers" className="btn btn-solid" onClick={ui.closeCart}>
              Shop bestsellers
            </Link>
            <Link href="/collections/new-in" className="btn btn-ghost" onClick={ui.closeCart}>
              See what&apos;s new
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 md:px-7">
            <div className="py-4">
              <FreeShippingBar remaining={mode === "pickup" ? 0 : priced.freeShippingRemaining} subtotal={mode === "pickup" ? 150 : priced.subtotal - priced.discount} />
            </div>
            <CartLines priced={priced} compact />
            <div className="space-y-4 border-t border-line py-5">
              <DeliveryToggle />
              <GiftOption />
              <PromoField />
            </div>
            <div className="border-t border-line py-5">
              <CrossSells priced={priced} />
            </div>
          </div>
          <div className="border-t border-line bg-paper px-5 py-5 md:px-7">
            <Summary priced={priced} mode={mode} />
            <div className="mt-4 grid grid-cols-[auto_1fr] gap-2">
              <Link href="/cart" className="btn btn-ghost" onClick={ui.closeCart}>
                View bag
              </Link>
              <Link href="/checkout" className="btn btn-solid" onClick={ui.closeCart}>
                <IconLock size={16} /> Checkout
              </Link>
            </div>
            <p className="t-mono mt-3 text-center text-[0.6rem] text-muted">Free returns within 30 days · Demo store, nothing is charged</p>
          </div>
        </>
      )}
    </Sheet>
  );
}
