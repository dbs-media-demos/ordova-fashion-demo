import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeContent } from "@/components/home/HomeContent";
import { Hero } from "@/components/home/Hero";
import { previewBiz } from "@/lib/preview";
import { previewMetadata } from "@/lib/preview-meta";

// Always the CRM's current data: an edit there shows on the next reload
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return previewMetadata((await params).token);
}

/** The lead's preview: the full homepage with the live 3D cloth hero (desktop), their business in it. */
export default async function PreviewPage({ params }: Props) {
  const biz = await previewBiz((await params).token);
  if (!biz) notFound();
  return <HomeContent hero={<Hero />} three3D biz={biz} />;
}
