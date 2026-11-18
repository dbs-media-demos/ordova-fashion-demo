import type { Metadata } from "next";
import { Success } from "@/components/checkout/Success";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({ title: "Order confirmed", description: "Your order is confirmed (demo).", path: "/checkout/success", privatePage: true });

export default function Page() {
  return (
    <div className="pt-[var(--header-h)]">
      <Success />
    </div>
  );
}
