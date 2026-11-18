import type { CSSProperties } from "react";
import type { Biz } from "./biz-core";

/**
 * Phones: the height a [data-cv] section really has, held by content-visibility until it nears the
 * screen (globals.css, phone pass), so the browser skips laying it out at load and the page never
 * jumps. Content-box heights (the section's own padding comes on top), in three bands: under 360 px,
 * 360–389 px and 390–767 px. Measured on the production build with scripts/section-heights.mjs
 * (held vs real within ~1%, 2% at worst); re-measure after changing a section's phone layout.
 */
const H = {
  manifesto: ["1067px", "970px", "942px"],
  newin: ["calc(306px + 80vw)", "calc(306px + 80vw)", "calc(306px + 80vw)"],
  wardrobes: ["647px", "calc(245px + 118vw)", "calc(245px + 118vw)"],
  studio: ["727px", "757px", "771px"],
  archive: ["745px", "767px", "766px"],
  deck: ["606px", "calc(350px + 80vw)", "655px"],
  visit: ["850px", "892px", "895px"],
  worn: ["calc(1556px - 70.4vw)", "calc(1556px - 70.4vw)", "calc(1556px - 70.4vw)"],
  fabric: ["1231px", "calc(580px + 190vw)", "calc(580px + 190vw)"],
  footer: ["1612px", "calc(1509px + 11.4vw)", "calc(1509px + 11.4vw)"],
} as const;

/**
 * A personalised preview's footer, visit and reviews heights follow what the lead has (hours, phone,
 * street, towns, logo, rating): a base without any of them plus each block's measured height (phones,
 * 320 / 375 px, fitted on two leads within ~1%; a lead's longer lines move them a little).
 */
type Lead = Pick<Biz, "preview" | "hours" | "phone" | "address" | "areas" | "area" | "logo" | "rating">;
function previewHeights(id: CvId, b: Lead): readonly [string, string, string] | null {
  const couriers = b.areas.filter((a) => a !== b.area).length > 0;
  if (id === "footer") {
    // the courier line: two lines for a list of towns, one for their own town alone
    const towns = b.areas.length > 1 ? 48 : b.areas.length || b.area ? 24 : 0;
    const px = towns + (b.hours ? 175 : 0) + (b.phone ? 24 : 0) + (b.address.street ? 24 : 0) + (b.logo ? 11 : 0);
    const vw = 5.7 + (b.logo ? 7.3 : 0);
    return [`calc(${1276 + px}px + ${vw}vw)`, `calc(${1250 + px}px + ${vw}vw)`, `calc(${1250 + px}px + ${vw}vw)`];
  }
  if (id === "visit") {
    // the courier sentence wraps one line fewer from 390 px up
    const badge = b.hours ? 15 : 0;
    return [`${754 + (couriers ? 48 : 0) + badge}px`, `calc(${418 + (couriers ? 48 : 0) + badge}px + 88vw)`, `calc(${418 + (couriers ? 24 : 0) + badge}px + 88vw)`];
  }
  if (id === "worn" && !b.rating) return ["calc(1464px - 70.4vw)", "calc(1464px - 70.4vw)", "calc(1464px - 70.4vw)"];
  return null;
}

export type CvId = keyof typeof H;

export const cv = (id: CvId, biz?: Lead) => {
  const [s, m, l] = (biz?.preview && previewHeights(id, biz)) || H[id];
  return { "data-cv": id, style: { "--cv-s": s, "--cv": m, "--cv-l": l } as CSSProperties };
};
