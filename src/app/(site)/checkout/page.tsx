import type { Metadata } from "next";
import { Checkout } from "@/components/checkout/Checkout";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({ title: "Checkout", description: "Secure checkout (demo — no payment is taken).", path: "/checkout", privatePage: true });

export default function Page() {
  return (
    <div className="pt-[var(--header-h)]">
      <h1 className="sr-only">Checkout</h1>
      <Checkout />
    </div>
  );
}
