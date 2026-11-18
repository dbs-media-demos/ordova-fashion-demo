import type { ReactNode } from "react";
import { SiteChrome } from "@/components/layout/SiteChrome";

/** The concept store: the fictional shop's chrome and structured data around every page. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
