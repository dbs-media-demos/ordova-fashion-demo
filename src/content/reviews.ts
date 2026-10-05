import type { CategorySlug, Review } from "@/lib/commerce/types";

/*
 * Fictional customer reviews, grouped by category. Each product draws three or
 * four of these (deterministically) in products.ts, so pages stay stable
 * between builds.
 */

type R = Omit<Review, "id">;

export const reviewPool: Record<CategorySlug, R[]> = {
  dresses: [
    { author: "Maya R.", location: "Oak Cliff, Dallas", rating: 5, date: "2026-09-14", title: "Wore it to two weddings already", body: "The cut does the work. It skims instead of clinging, and the hem hits right at mid-calf on me. I got stopped twice at the reception asking where it was from.", fit: 0, sizeBought: "S", height: "5'6\"" },
    { author: "Danielle K.", location: "Austin, TX", rating: 5, date: "2026-08-30", title: "Worth the wait for a restock", body: "I tried it on in the store in July and they shipped my size the week it was recut. Fabric is heavier than it looks in photos, in a good way.", fit: 0, sizeBought: "M", height: "5'8\"" },
    { author: "Priya S.", location: "Plano, TX", rating: 4, date: "2026-08-11", title: "Size down if between sizes", body: "Lovely and well finished inside — French seams everywhere. It runs a touch roomy through the waist so I went down to an XS and it's perfect.", fit: 0.5, sizeBought: "XS", height: "5'3\"" },
    { author: "Lauren T.", location: "Brooklyn, NY", rating: 5, date: "2026-07-22", title: "Finally, a dress with pockets that sit flat", body: "Ordered online after seeing it on their Instagram. Arrived in two days, wrapped in tissue with a handwritten note. Pockets are deep and don't bulge.", fit: 0, sizeBought: "M", height: "5'7\"" },
    { author: "Grace O.", location: "Bishop Arts, Dallas", rating: 5, date: "2026-06-29", title: "My summer uniform", body: "I live three blocks from the shop and I've worn this every other day since June. It washes well and looks better wrinkled than most dresses look pressed.", fit: 0, sizeBought: "S", height: "5'5\"" },
    { author: "Hannah W.", location: "Fort Worth, TX", rating: 4, date: "2026-06-03", title: "Long on me, but they hemmed it", body: "I'm 5'2\" so it was long. They offered a free hem when I picked up in store and it was ready the same afternoon. Great service.", fit: 0, sizeBought: "XS", height: "5'2\"" },
  ],
  tops: [
    { author: "Jess M.", location: "Lakewood, Dallas", rating: 5, date: "2026-09-18", title: "The shirt I was trying to find for years", body: "Crisp without being stiff, and the collar holds its shape after washing. The back pleat gives just enough room. I bought a second colour a week later.", fit: 0, sizeBought: "S", height: "5'7\"" },
    { author: "Marcus L.", location: "Deep Ellum, Dallas", rating: 5, date: "2026-09-02", title: "Proper weight", body: "This is not a see-through, fall-apart-after-three-washes top. It's substantial and it softens nicely. Shoulders sit right.", fit: 0, sizeBought: "M", height: "6'0\"" },
    { author: "Ana P.", location: "Houston, TX", rating: 4, date: "2026-08-19", title: "Boxy as promised", body: "It's meant to be boxy and it is — size down if you want it closer to the body. I like it oversized with a wide trouser.", fit: 0.6, sizeBought: "M", height: "5'4\"" },
    { author: "Tom H.", location: "Uptown, Dallas", rating: 5, date: "2026-07-27", title: "Wear it to work and to dinner", body: "Looks sharp tucked into a pleated trouser, relaxed untucked on the weekend. Buttons are real corozo, which you don't see at this price.", fit: 0, sizeBought: "L", height: "6'2\"" },
    { author: "Rachel B.", location: "Chicago, IL", rating: 5, date: "2026-07-08", title: "Fast shipping, beautiful packaging", body: "Came folded in a box with tissue and a little card about who cut it. That's a lovely touch. The fabric is even nicer in person.", fit: 0, sizeBought: "S", height: "5'6\"" },
    { author: "Diego F.", location: "Oak Lawn, Dallas", rating: 4, date: "2026-06-14", title: "Runs slightly short in the body", body: "Great quality. If you're long in the torso, note it sits at the hip. I'm keeping it, it works with high-rise trousers.", fit: -0.4, sizeBought: "M", height: "6'1\"" },
  ],
  knitwear: [
    { author: "Ellie D.", location: "Lower Greenville, Dallas", rating: 5, date: "2026-09-21", title: "Not itchy at all", body: "I'm sensitive to wool and this sits fine on bare skin. It's warm without being bulky, which is exactly what a Dallas winter needs.", fit: 0, sizeBought: "S", height: "5'5\"" },
    { author: "Ben C.", location: "Denton, TX", rating: 5, date: "2026-09-04", title: "Heirloom-level knit", body: "Dense, even stitches and the seams are linked, not overlocked. It feels like something my grandfather would've worn for twenty years.", fit: 0, sizeBought: "L", height: "6'0\"" },
    { author: "Sofia G.", location: "Kessler Park, Dallas", rating: 4, date: "2026-08-15", title: "Pilled a little at first", body: "Some light pilling under the arms in the first week, which the shop said is normal for long-staple wool. A sweater comb fixed it and it's stopped since.", fit: 0, sizeBought: "M", height: "5'8\"" },
    { author: "Nate S.", location: "Seattle, WA", rating: 5, date: "2026-07-30", title: "Generous cut", body: "Sized down from my usual L to M based on the fit finder and it's spot on. Sleeves are long enough for once.", fit: 0.5, sizeBought: "M", height: "5'11\"" },
    { author: "Claire V.", location: "Highland Park, TX", rating: 5, date: "2026-07-01", title: "Bought it for my husband, then stole it", body: "It's unisex enough that it works oversized on me. The colour is a warm oatmeal, slightly darker than my screen showed.", fit: 0, sizeBought: "M", height: "5'7\"" },
  ],
  trousers: [
    { author: "Kendra A.", location: "Cedars, Dallas", rating: 5, date: "2026-09-16", title: "The drape!", body: "They move like a much more expensive trouser. High rise, and the length works with flats and a small heel. I got the free hem in store too.", fit: 0, sizeBought: "S", height: "5'6\"" },
    { author: "Will J.", location: "East Dallas", rating: 5, date: "2026-09-01", title: "True to size waist", body: "My usual 32 fits without a belt. The pleats add room in the thigh without looking sloppy. Pocket bags are a sturdy twill, not flimsy cotton.", fit: 0, sizeBought: "32", height: "5'11\"" },
    { author: "Lena Z.", location: "San Antonio, TX", rating: 4, date: "2026-08-09", title: "Snug at first", body: "A little snug in the waist the first wear but it relaxed after a day. If you're between sizes, size up.", fit: -0.5, sizeBought: "M", height: "5'4\"" },
    { author: "Chris N.", location: "Bishop Arts, Dallas", rating: 5, date: "2026-07-19", title: "My daily trouser now", body: "I bike to work and these hold up. No sag at the knee after a full day. Already ordered the second colour.", fit: 0, sizeBought: "34", height: "6'2\"" },
    { author: "Olivia P.", location: "Portland, OR", rating: 5, date: "2026-06-25", title: "Returns were easy", body: "First pair was too long, exchange label was in the box and the new size arrived in four days. Fit is perfect now.", fit: 0, sizeBought: "XS", height: "5'1\"" },
  ],
  outerwear: [
    { author: "Rebecca H.", location: "M Streets, Dallas", rating: 5, date: "2026-09-25", title: "Investment that already feels worth it", body: "The shoulders are tailored but it layers over a chunky knit. Lining is a beautiful cupro and every seam inside is finished.", fit: 0, sizeBought: "S", height: "5'7\"" },
    { author: "James W.", location: "Fort Worth, TX", rating: 5, date: "2026-09-07", title: "Built like workwear, looks like tailoring", body: "Heavy, structured and the pockets are cut where your hands actually go. Wore it on a windy night at the Stockyards and stayed warm.", fit: 0, sizeBought: "L", height: "6'1\"" },
    { author: "Mina K.", location: "Richardson, TX", rating: 4, date: "2026-08-21", title: "Size down for a closer fit", body: "It's cut roomy to go over layers. I sized down and it still fits over a sweater.", fit: 0.6, sizeBought: "XS", height: "5'3\"" },
    { author: "Aaron D.", location: "Los Angeles, CA", rating: 5, date: "2026-08-02", title: "Customer service was great", body: "Emailed about sleeve length before ordering and got a reply within the hour with the exact measurement. Fits like they said it would.", fit: 0, sizeBought: "M", height: "5'10\"" },
    { author: "Tasha L.", location: "Uptown, Dallas", rating: 5, date: "2026-07-12", title: "Compliments every single time", body: "The colour is so rich. I've worn it to work all week and someone asks about it every day.", fit: 0, sizeBought: "M", height: "5'8\"" },
  ],
  bags: [
    { author: "Noor A.", location: "Design District, Dallas", rating: 5, date: "2026-09-19", title: "Fits a 14\" laptop and lunch", body: "Structured enough to stand on its own and the leather has already started to soften. Handles sit comfortably on the shoulder in a coat.", fit: 0 },
    { author: "Greg T.", location: "Arlington, TX", rating: 5, date: "2026-08-28", title: "Bought as a gift", body: "Gift-wrapped beautifully at no charge and they included a care card. My wife uses it every day.", fit: 0 },
    { author: "Isabel M.", location: "Bishop Arts, Dallas", rating: 4, date: "2026-08-04", title: "Stiff at first", body: "It's quite stiff out of the box — give it a couple of weeks. The inside pocket is a nice size for keys and phone.", fit: 0 },
    { author: "Paul R.", location: "Denver, CO", rating: 5, date: "2026-07-15", title: "Simple and well made", body: "No logos, solid brass hardware, edges are painted cleanly. Exactly what I wanted.", fit: 0 },
    { author: "Yuki N.", location: "Frisco, TX", rating: 5, date: "2026-06-21", title: "Gets better with use", body: "Six months in and it's developing a lovely patina. Stitching is still perfect.", fit: 0 },
  ],
  accessories: [
    { author: "Carmen V.", location: "Oak Cliff, Dallas", rating: 5, date: "2026-09-12", title: "The finishing touch", body: "It pulls a plain outfit together. Quality is excellent for the price and the colour is exactly as photographed.", fit: 0 },
    { author: "Luke B.", location: "Lakewood, Dallas", rating: 5, date: "2026-08-26", title: "Sizing guide was spot on", body: "Measured with a string like the size guide says and ordered the L/XL. Fits perfectly, no squeezing.", fit: 0 },
    { author: "Amara J.", location: "Atlanta, GA", rating: 4, date: "2026-08-07", title: "Lovely, slightly smaller than expected", body: "Beautiful quality, just a little smaller than I imagined. Check the measurements on the page and you'll be fine.", fit: -0.3 },
    { author: "Sam E.", location: "Deep Ellum, Dallas", rating: 5, date: "2026-07-24", title: "Easy gift", body: "Bought three as gifts. The gift cards and wrapping made it look far more expensive than it was.", fit: 0 },
    { author: "Ruth G.", location: "Plano, TX", rating: 5, date: "2026-07-03", title: "Wear it daily", body: "Has held its shape through a hot Texas summer. I keep reaching for it.", fit: 0 },
  ],
};
