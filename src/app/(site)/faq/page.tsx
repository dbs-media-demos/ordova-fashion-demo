import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { FaqItem } from "@/components/content/Bits";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqs, allFaqs } from "@/content/faq";
import { faqSchema } from "@/lib/schema";
import { site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "FAQ — shipping, returns, sizing & the label",
  description: "Answers about Ordova shipping, free 30-day returns, in-store pickup, sizing and alterations, and how our Dallas label is made.",
  path: "/faq",
  ogTitle: "Questions, answered",
  ogKicker: "Ordova FAQ",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqSchema(allFaqs)} />
      <PageHero crumbs={[{ name: "FAQ", path: "/faq" }]} kicker="Questions, answered" title="FAQ" intro={<>Can&apos;t find it here? Call {site.phone} or stop by the shop — a person always answers.</>} />
      <section className="container-x grid gap-14 pb-24 md:grid-cols-12">
        <nav aria-label="FAQ topics" className="md:col-span-3">
          <ul className="t-mono space-y-2 md:sticky md:top-28">
            {faqs.map((g) => (
              <li key={g.group}>
                <a href={`#${g.group.toLowerCase().replace(/[^a-z]+/g, "-")}`} className="link-u">
                  {g.group}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-16 md:col-span-8 md:col-start-5">
          {faqs.map((g) => (
            <section key={g.group} id={g.group.toLowerCase().replace(/[^a-z]+/g, "-")} className="scroll-mt-28">
              <h2 className="t-h3">{g.group}</h2>
              <div className="mt-4 border-t border-line">
                {g.items.map((f) => (
                  <FaqItem key={f.q} q={f.q} a={f.a} />
                ))}
              </div>
            </section>
          ))}
          <p className="text-muted">
            More detail on <Link href="/shipping-returns" className="link-line">shipping & returns</Link> and the <Link href="/size-guide" className="link-line">size guide</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
