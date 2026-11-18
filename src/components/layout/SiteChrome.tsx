import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBar } from "@/components/layout/MobileBar";
import { PageTransition } from "@/components/layout/Chrome";
import { JsonLd } from "@/components/seo/JsonLd";
import { storeSchema, websiteSchema } from "@/lib/schema";
import type { Biz } from "@/lib/biz-core";

/**
 * Header, page, footer and the phone bar: the concept store's pages and a personalised preview share it.
 * They read the business from BizContext (a preview wraps this in its BizProvider).
 */
export function SiteChrome({ children, biz }: { children: ReactNode; biz?: Biz }) {
  return (
    <>
      <Header />
      <PageTransition>
        <main id="main" className="min-h-[60vh]">
          {children}
        </main>
        <Footer />
      </PageTransition>
      <MobileBar />
      {/* The concept store's structured data; a preview is never indexed. */}
      {!biz?.preview && (
        <>
          <JsonLd data={storeSchema()} />
          <JsonLd data={websiteSchema()} />
        </>
      )}
    </>
  );
}
