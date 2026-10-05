"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Order } from "@/lib/commerce/types";
import { money2 } from "@/lib/format";
import { site } from "@/lib/site";
import { ORDER_KEY } from "./Checkout";
import { FoldBox } from "./FoldBox";
import { IconArrow, IconCheck } from "@/components/ui/Icons";

type Stored = Order & { gift?: boolean; pickupName?: string };

export function Success() {
  const [order, setOrder] = useState<Stored | null | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(ORDER_KEY);
      setOrder(raw ? (JSON.parse(raw) as Stored) : null);
    } catch {
      setOrder(null);
    }
  }, []);

  if (order === undefined) return <div className="min-h-[90vh]" aria-busy="true" />;

  if (order === null) {
    return (
      <div className="container-x mx-auto min-h-[90vh] max-w-xl py-28 text-center">
        <h1 className="t-h3">No recent order here</h1>
        <p className="mt-3 text-muted">Order confirmations live in this browser tab for your session. Looking for a past order?</p>
        <div className="mt-8 flex justify-center gap-2">
          <Link href="/track" className="btn btn-solid">
            Track an order
          </Link>
          <Link href="/shop" className="btn btn-ghost">
            Keep shopping
          </Link>
        </div>
      </div>
    );
  }

  const pickup = order.delivery === "pickup";
  const timeline = pickup
    ? [
        ["Now", "Order confirmed — a receipt would be on its way to " + order.email],
        ["Within 2 hours", "We pull, press and wrap it, then text you that it's ready"],
        ["Pickup", `${site.address.street}, Bishop Arts — bring your order number`],
        ["Any time in 30 days", "Free returns or exchanges, in store or by mail"],
      ]
    : [
        ["Now", "Order confirmed — a receipt would be on its way to " + order.email],
        ["Next business day", "Folded in tissue, boxed and stickered in the studio"],
        [order.estimate, `${order.shippingLabel} delivery${order.city ? ` to ${order.city}` : ""}, with tracking`],
        ["Any time in 30 days", "Free returns — a prepaid label is in the box"],
      ];

  return (
    <div className="container-x grid gap-14 py-14 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:py-20">
      <div className="flex justify-center lg:sticky lg:top-28">
        <FoldBox number={order.number} />
      </div>
      <div>
        <p className="t-mono inline-flex items-center gap-2 text-ok">
          <IconCheck size={16} /> Payment simulated · nothing was charged
        </p>
        <h1 className="mt-4 font-display text-[clamp(2.4rem,5.5vw,4.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.03em]">Thank you. It&apos;s being folded.</h1>
        <p className="mt-4 text-muted">
          Order <span className="t-mono text-char">{order.number}</span> · {order.paymentSummary}
          {order.gift ? " · gift-wrapped" : ""}
        </p>
        <p className="mt-2 text-lg">{pickup ? "Ready for pickup in about 2 hours." : <>Arriving <strong className="font-semibold">{order.estimate}</strong>.</>}</p>

        <ol className="mt-8 space-y-0 border-l border-line pl-6">
          {timeline.map(([k, v], i) => (
            <li key={k} className="relative pb-5">
              <span className={`absolute -left-[1.85rem] top-1 h-3 w-3 rounded-full ${i === 0 ? "bg-cobalt" : "border border-char/30 bg-bone"}`} aria-hidden="true" />
              <p className="t-mono text-muted">{k}</p>
              <p className="text-sm">{v}</p>
            </li>
          ))}
        </ol>

        <div className="mt-4 rounded-lg bg-paper p-5">
          <ul className="space-y-3">
            {order.lines.map((l) => (
              <li key={`${l.slug}-${l.color}-${l.size}`} className="flex items-center gap-3 text-sm">
                <div className="media h-14 w-11 shrink-0 rounded-sm">
                  <Image src={l.image} alt="" fill sizes="44px" className="object-cover" />
                </div>
                <span className="flex-1">
                  {l.name} <span className="text-muted">· {l.color}{l.size !== "One size" ? `, ${l.size}` : ""} × {l.qty}</span>
                </span>
                <span className="t-price">{money2(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1 border-t border-line pt-4 text-sm">
            {order.discount > 0 && (
              <div className="flex justify-between text-ok">
                <dt>Discount</dt>
                <dd className="t-price">−{money2(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd className="t-price">{order.shipping ? money2(order.shipping) : "Free"}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Tax</dt>
              <dd className="t-price">{money2(order.tax)}</dd>
            </div>
            <div className="flex justify-between font-semibold">
              <dt>Total</dt>
              <dd className="t-price">{money2(order.total)}</dd>
            </div>
          </dl>
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          <Link href="/track" className="btn btn-solid">
            Track this order <IconArrow size={16} />
          </Link>
          <Link href="/lookbook" className="btn btn-ghost">
            Back to the lookbook
          </Link>
        </div>
      </div>
    </div>
  );
}
