import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontVariables } from "@/lib/fonts";
import { site, siteUrl, noindex, agencyName, agencyUrl } from "@/lib/site";
import { LazyOverlays } from "@/components/layout/Overlays";
import { Cursor, DemoBadge, LiveRegion, PhoneRise, SmoothScroll } from "@/components/layout/Chrome";

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
        <SmoothScroll />
        <PhoneRise />
        {/* Header, page, footer and phone bar: (site)/layout for the concept store, for/[token]/layout for a preview (SiteChrome) */}
        {children}
        <LazyOverlays />
        <DemoBadge />
        <LiveRegion />
        <Cursor />
      </body>
    </html>
  );
}
