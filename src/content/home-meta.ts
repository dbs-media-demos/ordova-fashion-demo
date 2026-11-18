import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

const title = "Ordova — Concept store & small-batch label in Bishop Arts, Dallas";

/** The homepage's metadata, shared by / and /v2 (both point their canonical at /). */
export const homeMetadata: Metadata = {
  ...pageMeta({
    title,
    description:
      "Womenswear, menswear and accessories cut and sewn a mile from our Bishop Arts shop. FW26 “Caliche” is in. Free shipping over $150, free 30-day returns, pickup in 2 hours.",
    path: "/",
    ogTitle: "Fewer, better clothes. Cut and sewn in Dallas.",
    ogKicker: "FW26 · Caliche",
  }),
  title: { absolute: title },
};
