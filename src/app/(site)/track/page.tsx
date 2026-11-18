import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { TrackView } from "@/components/shop/TrackView";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({ title: "Track your order", description: "Follow your Ordova order from our Dallas studio to your door.", path: "/track", privatePage: true });

export default function Page() {
  return (
    <>
      <PageHero crumbs={[{ name: "Track an order", path: "/track" }]} kicker="Studio → your door" title="Track an order" size="md" intro="Enter your order number and email. Orders ship from Bishop Arts the next business day." />
      <div className="container-x -mt-6 pb-24">
        <TrackView />
      </div>
    </>
  );
}
