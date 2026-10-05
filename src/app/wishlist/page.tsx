import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { WishlistView } from "@/components/shop/WishlistView";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({ title: "Wishlist", description: "Pieces you've saved, kept on this device.", path: "/wishlist", privatePage: true });

export default function Page() {
  return (
    <>
      <PageHero crumbs={[{ name: "Wishlist", path: "/wishlist" }]} kicker="Saved on this device" title="Wishlist" size="md" />
      <div className="container-x -mt-10 pb-24">
        <WishlistView />
      </div>
    </>
  );
}
