/*
 * FW26 "Caliche" lookbook. Each look has hotspots (x/y in % of the image)
 * pointing at catalog products, used by /lookbook "Shop the look".
 */

export type Hotspot = { slug: string; x: number; y: number };
export type Look = { id: string; n: string; title: string; caption: string; place: string; image: string; alt: string; hotspots: Hotspot[] };

export const looks: Look[] = [
  {
    id: "look-01",
    n: "01",
    title: "Long shadows",
    caption: "Double-faced camel and a chunky knit scarf, walking the arcade at six.",
    place: "Fair Park",
    image: "/images/ed/lookbook-01.jpg",
    alt: "Woman in a camel coat and cream scarf walking under white arched pillars",
    hotspots: [
      { slug: "pecan-wool-coat", x: 50, y: 62 },
      { slug: "mohair-scarf", x: 56, y: 40 },
    ],
  },
  {
    id: "look-02",
    n: "02",
    title: "Ivory hour",
    caption: "A pale trench over bias-cut satin, a small black bag for keys.",
    place: "Highland Park",
    image: "/images/ed/lookbook-02.jpg",
    alt: "Woman in an ivory coat over a slip dress with a black bag against a stone wall",
    hotspots: [
      { slug: "lone-star-trench", x: 38, y: 55 },
      { slug: "ring-crossbody", x: 65, y: 58 },
      { slug: "calle-slip-dress", x: 50, y: 75 },
    ],
  },
  {
    id: "look-03",
    n: "03",
    title: "Under the arch",
    caption: "A long mac and a pleated trouser — tailoring that forgives a long day.",
    place: "Downtown",
    image: "/images/ed/lookbook-03.jpg",
    alt: "Man in a long pink-beige coat and wide grey trousers under a stone arch",
    hotspots: [
      { slug: "mac-coat", x: 50, y: 42 },
      { slug: "caliche-pleated-trouser", x: 53, y: 72 },
    ],
  },
  {
    id: "look-04",
    n: "04",
    title: "Glass & stone",
    caption: "Poplin, a wide trouser and a trench with the belt left loose.",
    place: "Arts District",
    image: "/images/ed/lookbook-04.jpg",
    alt: "Woman in an oversized taupe coat and wide trousers outside a glass building",
    hotspots: [
      { slug: "lone-star-trench", x: 60, y: 40 },
      { slug: "bishop-poplin-shirt", x: 55, y: 22 },
      { slug: "oak-cliff-wide-trouser", x: 52, y: 75 },
    ],
  },
  {
    id: "look-05",
    n: "05",
    title: "Caliche",
    caption: "Stone on stone: a mac, a trench and undyed cable out in the dunes.",
    place: "Monahans",
    image: "/images/ed/lookbook-05.jpg",
    alt: "Two models in oversized stone coats against pale desert dunes",
    hotspots: [
      { slug: "mac-coat", x: 25, y: 62 },
      { slug: "fisherman-knit", x: 22, y: 38 },
      { slug: "lone-star-trench", x: 62, y: 65 },
    ],
  },
  {
    id: "look-06",
    n: "06",
    title: "Workshop",
    caption: "Twill overshirt, heavy black tee. Built to be worn every day.",
    place: "Deep Ellum",
    image: "/images/ed/lookbook-06.jpg",
    alt: "Man in a sand overshirt, black tee and white trousers against a dark ribbed wall",
    hotspots: [
      { slug: "akard-overshirt", x: 75, y: 42 },
      { slug: "lamar-boxy-tee", x: 63, y: 47 },
    ],
  },
  {
    id: "look-07",
    n: "07",
    title: "Saturday, slowly",
    caption: "A work jacket thrown over a stone wide-leg, straight to the patio.",
    place: "Bishop Arts",
    image: "/images/ed/lookbook-07.jpg",
    alt: "Woman in a light jacket and cream wide trousers crossing a sunny street",
    hotspots: [
      { slug: "chore-jacket", x: 25, y: 42 },
      { slug: "oak-cliff-wide-trouser", x: 30, y: 75 },
    ],
  },
  {
    id: "look-08",
    n: "08",
    title: "Morning paper",
    caption: "The mac again, with a white tee — the easiest uniform we know.",
    place: "Kessler Park",
    image: "/images/ed/lookbook-08.jpg",
    alt: "Man in a long stone trench coat and white tee reading a newspaper outdoors",
    hotspots: [
      { slug: "mac-coat", x: 30, y: 60 },
      { slug: "lamar-boxy-tee", x: 46, y: 40 },
    ],
  },
];
