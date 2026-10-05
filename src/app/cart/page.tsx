import type { Metadata } from "next";
import { CartPage } from "@/components/cart/CartPage";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({ title: "Your bag", description: "Review your bag, apply a promo code and choose shipping or pickup.", path: "/cart", privatePage: true });

export default function Page() {
  return <CartPage />;
}
