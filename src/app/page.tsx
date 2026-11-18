import { HomeContent } from "@/components/home/HomeContent";
import { Hero } from "@/components/home/Hero";
import { homeMetadata } from "@/content/home-meta";

export const metadata = homeMetadata;

/** The full homepage: the live 3D cloth hero on desktop (the light version without 3D is /v2). */
export default function Home() {
  return <HomeContent hero={<Hero />} three3D />;
}
