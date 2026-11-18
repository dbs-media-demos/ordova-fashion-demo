import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { GiftCardBuilder } from "@/components/shop/GiftCard";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Gift cards",
  description: "Ordova gift cards from $50 to $500. Delivered by email or wrapped in store; never expire; valid online and in Bishop Arts.",
  path: "/gift-cards",
  ogTitle: "Gift cards",
  ogKicker: "Never expire",
});

export default function Page() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Gift cards", path: "/gift-cards" }]}
        kicker="For when you don't know their size"
        title="Gift cards"
        intro="Delivered by email in minutes, or wrapped in tissue at the shop. They never expire and work online and in Bishop Arts."
      />
      <section className="container-x pb-24">
        <GiftCardBuilder />
        <ul className="mt-20 grid gap-8 border-t border-line pt-10 md:grid-cols-3">
          {[
            ["Never expire", "Use it next week or next winter — the balance stays."],
            ["Online and in store", "Works at checkout here and at the counter on Bishop Ave."],
            ["Free styling hour", "Cards of $250+ include a private styling appointment."],
          ].map(([t, d]) => (
            <li key={t}>
              <h2 className="t-h3">{t}</h2>
              <p className="mt-2 text-muted">{d}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
