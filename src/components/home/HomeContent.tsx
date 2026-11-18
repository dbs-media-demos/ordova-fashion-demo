import type { ReactNode } from "react";
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
import { defaultBiz, type Biz } from "@/lib/biz";

/**
 * The homepage, shared by both versions so a change lands in both.
 *   / :   hero <Hero /> with three3D: the live Caliche cloth hero and the 3D swatch (desktop only, behind lib/three-gate)
 *   /v2:  hero <HeroPattern /> without: the chalked-pattern hero and the swatch as stills, no three.js at any width
 * Everything below the hero is the same: sections, words, photos and order. The page passes its
 * hero in (rather than this file importing both) so each version only ships its own hero's code.
 * A personalised preview (/for/<token>, /for/<token>/v2) renders this same tree with its business
 * (`biz`; client sections read it from BizContext).
 */
export function HomeContent({ hero, three3D, biz = defaultBiz }: { hero: ReactNode; three3D: boolean; biz?: Biz }) {
  const fresh = [...inCollection("new-in"), ...inCollection("bestsellers").filter((p) => !p.isNew)].slice(0, 10).map(toCard);
  return (
    <>
      {hero}
      <Manifesto biz={biz} />
      <NewInTrack products={fresh} />
      <WornInDallas />
      <Wardrobes />
      <StudioWindow />
      <FabricReel cloth3D={three3D} />
      <ArchiveScene products={archiveSale().map(toCard)} />
      <LookbookDeck />
      <VisitAperture />
    </>
  );
}
