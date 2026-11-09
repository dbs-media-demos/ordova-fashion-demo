import type { CSSProperties } from "react";

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
  archive: ["734px", "767px", "766px"],
  deck: ["606px", "calc(350px + 80vw)", "655px"],
  visit: ["850px", "892px", "895px"],
  footer: ["1439px", "calc(1320px + 11.4vw)", "calc(1320px + 11.4vw)"],
} as const;

export type CvId = keyof typeof H;

export const cv = (id: CvId) => {
  const [s, m, l] = H[id];
  return { "data-cv": id, style: { "--cv-s": s, "--cv": m, "--cv-l": l } as CSSProperties };
};
