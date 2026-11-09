/** The four cloths on the studio table: the same words on the desktop swatch and the phone grid. */
export type FabricId = "linen" | "wool" | "denim" | "knit";

export const FABRICS: {
  id: FabricId;
  t: string;
  o: string;
  weight: string;
  feel: string;
  img: string;
  still: string;
}[] = [
  { id: "linen", t: "Linen", o: "Belgian flax, garment-washed", weight: "185 g/m²", feel: "Crisp folds, cool and dry. Softens every wash.", img: "/images/ed/fabric-linen.jpg", still: "/images/3d/swatch-linen" },
  { id: "wool", t: "Wool", o: "Tropical & double-faced, Biella", weight: "290 g/m²", feel: "Heavy, quiet drape. Holds a crease, sheds a wrinkle.", img: "/images/ed/fabric-wool.jpg", still: "/images/3d/swatch-wool" },
  { id: "denim", t: "Denim", o: "14 oz raw selvedge, shuttle loom", weight: "475 g/m²", feel: "Stiff and square at first. Moulds to you in a month.", img: "/images/ed/fabric-denim.jpg", still: "/images/3d/swatch-denim" },
  { id: "knit", t: "Knit", o: "Merino & lambswool, knitted in LA", weight: "240 g/m²", feel: "Gives and springs back. Fluid, warm, never itchy.", img: "/images/ed/fabric-knit.jpg", still: "/images/3d/swatch-knit" },
];
