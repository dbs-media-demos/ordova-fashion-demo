import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeContent } from "@/components/home/HomeContent";
import { HeroPattern } from "@/components/home/HeroPattern";
import { previewBiz } from "@/lib/preview";
import { previewMetadata } from "@/lib/preview-meta";

/** The preview without 3D: the same page as /for/<token>, the chalked-pattern hero in place of the cloth. */
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return previewMetadata((await params).token);
}

export default async function PreviewPageV2({ params }: Props) {
  const biz = await previewBiz((await params).token);
  if (!biz) notFound();
  return <HomeContent hero={<HeroPattern />} three3D={false} biz={biz} />;
}
