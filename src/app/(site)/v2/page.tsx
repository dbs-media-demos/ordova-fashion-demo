import type { Metadata } from "next";
import { HomeContent } from "@/components/home/HomeContent";
import { HeroPattern } from "@/components/home/HeroPattern";
import { homeMetadata } from "@/content/home-meta";

// The same page as / with a lighter hero: / is the one to index.
export const metadata: Metadata = { ...homeMetadata, robots: { index: false, follow: true } };

/** The homepage without any 3D: the chalked-pattern hero, zero bytes of three.js at any width. */
export default function HomeV2() {
  return <HomeContent hero={<HeroPattern />} three3D={false} />;
}
