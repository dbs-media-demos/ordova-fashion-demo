import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontVariables } from "@/lib/fonts";
import { site, siteUrl, noindex, agencyName, agencyUrl } from "@/lib/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBar } from "@/components/layout/MobileBar";
import { LazyOverlays } from "@/components/layout/Overlays";
import { Cursor, DemoBadge, LiveRegion, PageTransition, SmoothScroll } from "@/components/layout/Chrome";
import { JsonLd } from "@/components/seo/JsonLd";
import { storeSchema, websiteSchema } from "@/lib/schema";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${site.name} — Concept store & small-batch label, Bishop Arts, Dallas`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: agencyName, url: agencyUrl }],
  creator: agencyName,
  formatDetection: { telephone: false },
  robots: noindex ? { index: false, follow: false, googleBot: { index: false, follow: false } } : undefined,
  other: { "color-scheme": "light" },
};

export const viewport: Viewport = {
  themeColor: "#f6f3ee",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-US" className={fontVariables} suppressHydrationWarning>
      <body className="min-h-screen">
        <a href="#main" className="t-mono fixed left-4 top-4 z-[300] -translate-y-24 rounded-full bg-cobalt px-5 py-3 text-bone focus:translate-y-0">
          Skip to content
        </a>
        <JsonLd data={storeSchema()} />
        <JsonLd data={websiteSchema()} />
        <SmoothScroll />
        <Header />
        <PageTransition>
          <main id="main" className="min-h-[60vh]">
            {children}
          </main>
          <Footer />
        </PageTransition>
        <LazyOverlays />
        <MobileBar />
        <DemoBadge />
        <LiveRegion />
        <Cursor />
      </body>
    </html>
  );
}
