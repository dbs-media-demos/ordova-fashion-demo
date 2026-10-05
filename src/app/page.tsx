import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { Manifesto } from "@/components/home/Manifesto";
import { NewInTrack } from "@/components/home/NewInTrack";
import { Wardrobes } from "@/components/home/Wardrobes";
import { StudioWindow } from "@/components/home/StudioWindow";
import { FabricReel } from "@/components/home/FabricReel";
import { ArchiveScene } from "@/components/home/ArchiveScene";
import { LookbookDeck } from "@/components/home/LookbookDeck";
import { WornInDallas } from "@/components/home/WornInDallas";
import { VisitAperture } from "@/components/home/VisitAperture";
import { inCollection, archiveSale, toCard } from "@/content/catalog";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMeta({
    title: "Ordova — Concept store & small-batch label in Bishop Arts, Dallas",
    description:
      "Womenswear, menswear and accessories cut and sewn a mile from our Bishop Arts shop. FW26 “Caliche” is in. Free shipping over $150, free 30-day returns, pickup in 2 hours.",
    path: "/",
    ogTitle: "Fewer, better clothes. Cut and sewn in Dallas.",
    ogKicker: "FW26 · Caliche",
  }),
  title: { absolute: "Ordova — Concept store & small-batch label in Bishop Arts, Dallas" },
};

export default function Home() {
  const fresh = [...inCollection("new-in"), ...inCollection("bestsellers").filter((p) => !p.isNew)].slice(0, 10).map(toCard);
  return (
    <>
      <Hero />
      <Manifesto />
      <NewInTrack products={fresh} />
      <Wardrobes />
      <StudioWindow />
      <FabricReel />
      <ArchiveScene products={archiveSale().map(toCard)} />
      <LookbookDeck />
      <WornInDallas />
      <VisitAperture />
    </>
  );
}
