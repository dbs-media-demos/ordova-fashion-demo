import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { LookbookTrack } from "@/components/lookbook/LookbookTrack";
import { looks } from "@/content/lookbook";
import { pageMeta } from "@/lib/seo";
import { IconArrow } from "@/components/ui/Icons";

export const metadata: Metadata = pageMeta({
  title: "FW26 Lookbook — Caliche",
  description: "Eight looks from FW26 “Caliche”, shot around Dallas. Tap any piece to shop it, or add the full look in one go.",
  path: "/lookbook",
  ogTitle: "FW26 Lookbook — Caliche",
  ogKicker: "Shop the look",
  image: "/images/ed/lookbook-01.jpg",
});

export default function LookbookPage() {
  return (
    <>
      <PageHero
        dark
        crumbs={[{ name: "Lookbook", path: "/lookbook" }]}
        kicker="FW26 · Drop 02 · Shot around Dallas"
        title="Caliche"
        intro="Named for the pale layer under Texas soil: chalk, clay and dry-grass tones in linen, wool and raw denim. Tap a + to shop a piece, or add the whole look."
      />
      <LookbookTrack looks={looks} />
      <section className="theme-sand py-20 text-center md:py-28">
        <p className="t-mono text-muted">That&apos;s the collection</p>
        <h2 className="t-h2 mx-auto mt-3 max-w-[16ch]">Every piece, in every size we have left</h2>
        <Link href="/collections/new-in" className="btn btn-solid mt-8">
          Shop new in <IconArrow size={16} />
        </Link>
      </section>
    </>
  );
}
