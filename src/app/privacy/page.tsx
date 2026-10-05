import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { LegalBody } from "@/components/content/Legal";
import { site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({ title: "Privacy policy", description: "How Ordova handles your information: what we collect, why, and your choices.", path: "/privacy" });

export default function Page() {
  return (
    <>
      <PageHero crumbs={[{ name: "Privacy", path: "/privacy" }]} kicker="Plain English" title="Privacy" size="md" />
      <LegalBody
        updated="October 1, 2026"
        sections={[
          {
            h: "This is a demo store",
            p: (
              <p>
                Ordova is a fictional business created by Scale by Noon to show what a modern online store can be. Forms on this site validate and confirm but send nothing. The checkout takes no payment and card details never leave your browser tab.
              </p>
            ),
          },
          {
            h: "What we'd collect",
            p: (
              <>
                <p>In a live store: your name, email, shipping address and phone number to fulfil orders; your order history; and messages you send us.</p>
                <p>Payments would be processed by our payment provider; we would never see or store your full card number.</p>
              </>
            ),
          },
          {
            h: "What stays on your device",
            p: <p>Your bag, wishlist and recently viewed items are kept in your browser&apos;s local storage so they&apos;re there when you come back. Clear your browser data to remove them.</p>,
          },
          {
            h: "Analytics & cookies",
            p: <p>This demo uses no analytics, advertising or tracking cookies. A live store would ask for consent before using any non-essential cookies.</p>,
          },
          {
            h: "Your choices",
            p: <p>You can ask us for a copy of your data, to correct it or to delete it, and you can unsubscribe from emails at any time with one click.</p>,
          },
          {
            h: "Contact",
            p: (
              <p>
                {site.legalName}, {site.address.street}, Dallas, TX {site.address.postal} · {site.email}
              </p>
            ),
          },
        ]}
      />
    </>
  );
}
