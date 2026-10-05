export type Post = {
  slug: string;
  title: string;
  dek: string;
  date: string;
  author: string;
  read: string;
  image: string;
  imageAlt: string;
  body: { h?: string; p: string }[];
  products: string[];
};

export const posts: Post[] = [
  {
    slug: "the-twelve-piece-wardrobe",
    title: "The twelve-piece wardrobe",
    dek: "How to build a closet that covers a Dallas year — 100° Augusts and all — with twelve things you actually like.",
    date: "2026-09-18",
    author: "Marisol Ordaz",
    read: "6 min read",
    image: "/images/ed/journal-1.jpg",
    imageAlt: "Neatly folded and hanging garments in a calm, neutral wardrobe",
    body: [
      { p: "Every customer who's ever told us they have nothing to wear has a full closet. The problem is rarely quantity. It's that the pieces don't talk to each other." },
      { h: "Start with the floor", p: "Two trousers and one pair of jeans you'd wear three days in a row. A wide trouser in a dry wool, a chino or pleated trouser in a lighter cloth, and a jean that's been broken in to you. Everything else stands on these." },
      { h: "Then the layer you see most", p: "Three tops: a crisp poplin shirt, a heavy tee and a fine knit. Choose them in colours that sit next to each other — bone, oat, olive — so any of them works with any of the trousers." },
      { h: "Add one piece that does the talking", p: "A slip dress, a suede jacket, a coat you'd save for. One statement is plenty; it gets worn more when everything around it is quiet." },
      { h: "Finish with the things that last", p: "A belt in real leather, a bag that stands up on its own, a hat for the sun. These outlive everything else, so buy them once." },
      { p: "Our rule in the studio is simple: if a new piece doesn't work with three things already on your rail, leave it on ours." },
    ],
    products: ["oak-cliff-wide-trouser", "bishop-poplin-shirt", "lamar-boxy-tee", "field-merino-crew", "calle-slip-dress", "bridle-belt"],
  },
  {
    slug: "dressing-for-texas-light",
    title: "Dressing for Texas light",
    dek: "Why our FW26 palette looks like the ground under your feet — and what the sun at 6 pm on Davis Street taught us about colour.",
    date: "2026-09-02",
    author: "Theo Lindqvist",
    read: "4 min read",
    image: "/images/ed/journal-2.jpg",
    imageAlt: "Dallas in warm late-afternoon light",
    body: [
      { p: "Texas light is not gentle. At noon it flattens everything; at six it turns the whole city amber for twenty minutes. Clothes that look beautiful under a London sky can look washed-out here." },
      { h: "Caliche", p: "The pale, chalky layer under Texas soil gave our autumn drop its name and its palette: chalk, clay, camel, dry grass and the olive of a live oak in August. They hold up in hard sun and glow in low light." },
      { h: "Matte over shine", p: "We sand-wash our satins and garment-dye our cottons so they read matte at midday. A little texture keeps colour from bleaching out on camera and in life." },
      { p: "Next time you're in Bishop Arts around sunset, stand on the corner of Bishop and Davis for five minutes. You'll see why we shoot every lookbook at that hour." },
    ],
    products: ["marfa-shirt-dress", "lone-star-trench", "caliche-pleated-trouser", "felt-rancher-hat"],
  },
  {
    slug: "a-run-of-thirty",
    title: "A run of thirty",
    dek: "Inside the studio: how a pattern becomes thirty jackets, who sews them, and why we stop there.",
    date: "2026-08-14",
    author: "Ana Reyes",
    read: "5 min read",
    image: "/images/ed/journal-3.jpg",
    imageAlt: "Hands working with denim fabric on a cutting table",
    body: [
      { p: "Thirty is not a marketing number. It's how many layers of cloth our cutting table holds before the shears start to drift off the grain." },
      { h: "One lay, one day", p: "A run starts at 7 am: the fabric is rolled out by hand, layer on layer, smoothed so every ply lies flat. The paper pattern goes on top and Marisol cuts the whole stack before lunch." },
      { h: "Six people, one garment at a time", p: "Our sewers work in sequence — collars and cuffs at one machine, side seams and hems at the next — but each person finishes the pieces they start. Their name goes on the care tag." },
      { h: "Then the pattern rests", p: "After thirty, we stop, look at what sold, read every return note and fit comment, and adjust. Sometimes the pattern comes back next season a quarter-inch longer. Sometimes it goes to the archive for good." },
    ],
    products: ["chore-jacket", "selvedge-straight-jean", "akard-overshirt"],
  },
];

export const postBySlug = new Map(posts.map((p) => [p.slug, p]));
