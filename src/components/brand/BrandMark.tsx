"use client";

import clsx from "clsx";
import { useBiz } from "@/components/preview/BizContext";
import { LeadLogo } from "./LeadLogo";
import { Wordmark } from "./Logo";
import { nameEm } from "@/lib/hero-name";

/**
 * The header's mark: the ORDOVA wordmark on the concept site; on a preview the business's own logo
 * (in the header's ink, currentColor), or without one their name set like our wordmark.
 */
export function BrandMark({ className, logoClassName }: { className?: string; logoClassName?: string }) {
  const biz = useBiz();
  if (biz.logo) return <LeadLogo svg={biz.logo.svg} label={biz.name} className={clsx("h-7 max-w-[8.5rem] md:h-9 md:max-w-[15rem]", logoClassName)} />;
  if (biz.preview)
    return (
      <span
        className={clsx(className, "inline-block whitespace-pre font-display font-extrabold uppercase leading-none tracking-[-0.02em]")}
        // one line between the menu and the bag: about 44vw on a phone, up to 1.6rem on a big screen
        style={{ fontSize: `min(1.6rem, ${(44 / Math.max(6, nameEm(biz.shortName))).toFixed(2)}vw)` }}
      >
        {biz.shortName}
      </span>
    );
  return <Wordmark className={className} />;
}
