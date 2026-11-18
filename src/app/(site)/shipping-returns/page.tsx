import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { ReturnsFlow } from "@/components/content/Bits";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/site";
import { money } from "@/lib/format";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Shipping & returns",
  description: "Free shipping over $150, express in 1–2 days, free 2-hour pickup in Bishop Arts, and free returns or exchanges within 30 days — sale pieces included.",
  path: "/shipping-returns",
  ogTitle: "Shipping & returns",
  ogKicker: "Free over $150 · 30-day returns",
});

const RATES = [
  ["Standard", "3–5 business days", `${money(site.standardShipping)} · free over ${money(site.freeShippingThreshold)}`],
  ["Express", "1–2 business days", money(site.expressShipping)],
  ["Pickup in Bishop Arts", "Ready in about 2 hours", "Free"],
  ["Dallas same-day courier", "Weekdays, order by noon", "$12"],
];

export default function Page() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Shipping & returns", path: "/shipping-returns" }]}
        kicker="The small print, made big"
        title="Shipping & returns"
        intro="Everything ships from our studio in Dallas, wrapped in tissue. If it isn't right, sending it back is free and easy."
      />
      <section className="container-x pb-20">
        <h2 className="t-h3">Shipping</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left">
            <caption className="sr-only">Shipping options</caption>
            <thead>
              <tr className="t-mono border-b border-char text-[0.66rem]">
                <th scope="col" className="py-3 font-normal">
                  Method
                </th>
                <th scope="col" className="py-3 font-normal">
                  Timing
                </th>
                <th scope="col" className="py-3 text-right font-normal">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody>
              {RATES.map(([m, t, c]) => (
                <tr key={m} className="border-b border-line">
                  <th scope="row" className="py-4 font-medium">
                    {m}
                  </th>
                  <td className="py-4 text-muted">{t}</td>
                  <td className="t-price py-4 text-right">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-2xl text-sm text-muted">Orders before 2 pm Central ship the same business day. We ship to all 50 states; Alaska and Hawaii add 2 days. Texas orders include 8.25% sales tax.</p>
      </section>
      <section className="theme-sand py-20 md:py-28">
        <div className="container-x">
          <h2 className="t-h2 max-w-[16ch]">Returns in four easy steps</h2>
          <p className="mt-4 max-w-xl text-muted">Free within {site.returnDays} days of delivery, sale and archive pieces included. Unworn, tags on.</p>
          <div className="mt-14">
            <ReturnsFlow />
          </div>
        </div>
      </section>
      <section className="container-x grid gap-10 py-20 md:grid-cols-3">
        {[
          ["Exchanges", "Choose a new size or colour when you start a return — we ship it the moment your parcel is scanned."],
          ["Gifts", "Returning a gift? You'll get store credit by email and the giver won't be told."],
          ["Final sale", "Only gift cards and altered (hemmed) pieces are final sale."],
        ].map(([t, d]) => (
          <Reveal key={t}>
            <h3 className="t-h3">{t}</h3>
            <p className="mt-2 text-muted">{d}</p>
          </Reveal>
        ))}
        <p className="md:col-span-3">
          Questions? Call{" "}
          <a href={site.phoneHref} className="link-line">
            {site.phone}
          </a>{" "}
          or read the <Link href="/faq" className="link-line">FAQ</Link>.
        </p>
      </section>
    </>
  );
}
