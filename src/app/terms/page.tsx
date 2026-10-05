import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { LegalBody } from "@/components/content/Legal";
import { site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({ title: "Terms of sale", description: "Ordova terms of sale: orders, pricing, shipping, returns and gift cards.", path: "/terms" });

export default function Page() {
  return (
    <>
      <PageHero crumbs={[{ name: "Terms", path: "/terms" }]} kicker="The agreement" title="Terms of sale" size="md" />
      <LegalBody
        updated="October 1, 2026"
        sections={[
          { h: "Demo notice", p: <p>This website is a concept by Scale by Noon. No real orders are placed, no goods are shipped and no payments are taken.</p> },
          { h: "Orders", p: <p>An order is accepted when we email a shipping or pickup confirmation. We may cancel orders affected by pricing errors or stock issues and refund in full.</p> },
          { h: "Prices & tax", p: <p>Prices are in US dollars. Texas orders and in-store pickups include 8.25% sales tax; other states are taxed where required.</p> },
          { h: "Shipping", p: <p>Free standard shipping over $150. Delivery estimates are estimates; risk passes to you on delivery.</p> },
          { h: "Returns", p: <p>Free returns and exchanges within {site.returnDays} days of delivery for unworn items with tags. Altered items and gift cards are final sale.</p> },
          { h: "Gift cards", p: <p>Gift cards never expire, have no fees and can&apos;t be exchanged for cash except where the law requires.</p> },
          { h: "Governing law", p: <p>These terms are governed by the laws of the State of Texas.</p> },
        ]}
      />
    </>
  );
}
