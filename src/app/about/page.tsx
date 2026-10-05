import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Timeline, ZoomFrame } from "@/components/content/Sequences";
import { Parallax, Reveal, ScrubWords } from "@/components/ui/Reveal";
import { pageMeta } from "@/lib/seo";
import { IconArrow } from "@/components/ui/Icons";

export const metadata: Metadata = pageMeta({
  title: "Our story",
  description: "Ordova began with a hand-painted sign on an Oak Cliff alterations shop. Today it's a concept store and small-batch label in Bishop Arts, Dallas.",
  path: "/about",
  ogTitle: "Our story",
  ogKicker: "Bishop Arts, since 2019",
  image: "/images/ed/about-hero.jpg",
});

const TEAM = [
  ["Marisol Ordaz", "Founder · pattern cutter", "Trained in tailoring in Mexico City and London; cuts every first pattern by hand."],
  ["Theo Lindqvist", "Co-founder · the shop", "Buys the brands we stock beside our own, and will hem your trousers while you wait."],
  ["Ana Reyes", "Head seamstress", "Twenty-two years on industrial machines. Her initials are on more care tags than anyone's."],
  ["Jonah Bell", "Knitwear & finishing", "Works with our knitter in LA and presses every piece before it leaves."],
];

const MOMENTS = [
  { y: "1974", t: "Novedades Ordaz", d: "Marisol's grandmother Elena opens an alterations and fabric shop on Jefferson Blvd in Oak Cliff.", img: "/images/ed/dallas.jpg" },
  { y: "2019", t: "The sign comes down", d: "The faded hand-painted sign has lost letters — it reads ORD···OVA. Marisol keeps it and opens Ordova on Bishop Ave." },
  { y: "2021", t: "The studio upstairs", d: "Two machines, one cutting table and the first run of thirty: the Bishop poplin shirt.", img: "/images/ed/studio-room.jpg" },
  { y: "2023", t: "Menswear", d: "The chore jacket and selvedge jean arrive, and the shop doubles in size next door." },
  { y: "2026", t: "Caliche", d: "Our biggest collection yet, named for the pale earth under Texas soil — and still made a mile from the rail.", img: "/images/ed/fw26-caliche.jpg" },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Our story", path: "/about" }]}
        kicker="Since 2019 · Bishop Arts"
        title="Our story"
        intro="Ordova is a concept store with a point of view and a small-batch label made upstairs. We'd rather sell you one great thing than five fine ones."
        image="/images/ed/about-hero.jpg"
        imageAlt="Clothes on a rail in the bright, minimal Ordova shop"
      />
      <section className="container-x grid gap-12 pb-24 md:grid-cols-12 md:pb-32">
        <div className="md:col-span-7">
          <ScrubWords
            className="font-display text-[clamp(1.6rem,3.4vw,3rem)] font-bold uppercase leading-[1.05] tracking-[-0.02em]"
            text="The name came off a sign. *Elena *Ordaz's *alterations *shop had a hand-painted board that lost letters to forty Texas summers until it simply read ORDOVA. It hangs above our counter now."
          />
        </div>
        <Parallax className="aspect-[4/5] rounded-[2px] md:col-span-4 md:col-start-9" amount={10}>
          <Image src="/images/ed/founders.jpg" alt="The two founders working together in the shop" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
        </Parallax>
      </section>
      <Timeline label="Fifty years, one block apart" items={MOMENTS} />
      <ZoomFrame img="/images/ed/store-interior-2.jpg" alt="Inside the Ordova shop: rails, plaster walls and daylight" kicker="The shop" line="A gallery you can try things on in" />
      <section className="container-x py-24 md:py-32">
        <h2 className="t-h2">The people</h2>
        <Reveal as="ul" stagger={0.08} className="mt-10 grid gap-8 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map(([n, r, d]) => (
            <li key={n}>
              <p className="t-mono text-muted">{r}</p>
              <h3 className="t-h3 mt-2">{n}</h3>
              <p className="mt-2 text-muted">{d}</p>
            </li>
          ))}
        </Reveal>
        <div className="mt-16 flex flex-wrap gap-2">
          <Link href="/studio" className="btn btn-solid">
            See the studio <IconArrow size={16} />
          </Link>
          <Link href="/visit" className="btn btn-ghost">
            Visit the shop
          </Link>
        </div>
      </section>
    </>
  );
}
