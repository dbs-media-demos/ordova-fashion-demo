import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/layout/PageHero";
import { Booking } from "@/components/content/Booking";
import { BishopMap } from "@/components/content/BishopMap";
import { OpenBadge } from "@/components/layout/Chrome";
import { Parallax, Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/site";
import { hoursTable } from "@/lib/hours";
import { pageMeta } from "@/lib/seo";
import { IconPhone, IconPin } from "@/components/ui/Icons";

export const metadata: Metadata = pageMeta({
  title: "Visit the store — Bishop Arts, Dallas",
  description: "Ordova, 421 N Bishop Ave in the Bishop Arts District, Dallas. Open Tue–Sun. Free hemming while you wait, styling appointments, and 2-hour pickup for online orders.",
  path: "/visit",
  ogTitle: "Visit the store",
  ogKicker: "Bishop Arts, Dallas",
  image: "/images/ed/storefront.jpg",
});

const SERVICES = [
  ["Free hemming", "Any trouser or skirt bought here, usually while you wait or browse the block."],
  ["Styling appointments", "A private hour with one of us — in the shop or on video. Free, no minimum."],
  ["2-hour pickup", "Order online, choose pickup, and we'll text when it's wrapped and ready."],
  ["Same-day courier", "Weekdays before noon to Oak Cliff, Uptown, Deep Ellum and the Design District."],
];

export default function VisitPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Visit", path: "/visit" }]}
        kicker="Bishop Arts District, Dallas"
        title="Visit the store"
        intro="A bright, quiet room on Bishop Ave with our label on one wall and the brands we love on the other. Come try things on — we'll put the kettle on."
        image="/images/ed/store-interior-1.jpg"
        imageAlt="Inside Ordova: minimal rails, plaster walls and daylight"
      >
        <div className="anim-fade mt-6 flex flex-wrap items-center gap-3" style={{ "--d": "0.4s" } as React.CSSProperties}>
          <OpenBadge />
        </div>
      </PageHero>

      <section className="container-x grid gap-12 pb-24 md:grid-cols-12">
        <div className="md:col-span-5">
          <h2 className="t-h3">Find us</h2>
          <address className="mt-4 not-italic leading-relaxed">
            {site.address.street}
            <br />
            Bishop Arts District
            <br />
            Dallas, TX {site.address.postal}
          </address>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={site.mapsUrl} target="_blank" rel="noopener" className="btn btn-solid btn-sm" data-track="directions">
              <IconPin size={16} /> Directions
            </a>
            <a href={site.phoneHref} className="btn btn-ghost btn-sm">
              <IconPhone size={16} /> {site.phone}
            </a>
          </div>
          <h2 className="t-h3 mt-12">Hours</h2>
          <table className="mt-4 w-full text-sm">
            <caption className="sr-only">Opening hours</caption>
            <tbody>
              {hoursTable().map((h) => (
                <tr key={h.day} className="border-b border-line">
                  <th scope="row" className="py-2.5 text-left font-normal">
                    {h.day}
                  </th>
                  <td className="py-2.5 text-right tabular-nums">{h.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-sm text-muted">Street parking on Bishop and Davis; free lot behind the shop after 5 pm. DART bus 21 stops at the corner.</p>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <div className="relative aspect-[600/510] overflow-hidden rounded-[2px]">
            <BishopMap />
          </div>
          <p className="t-mono mt-3 text-[0.6rem] text-muted">Schematic of the Bishop Arts District. Ordova is a fictional store.</p>
        </div>
      </section>

      <section className="theme-sand py-20 md:py-28">
        <div className="container-x grid gap-14 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="t-mono text-muted">By appointment</p>
            <h2 className="t-h2 mt-3">Book a styling hour</h2>
            <p className="mt-4 max-w-sm text-muted">Tell us the occasion and the sizes you usually wear — we&apos;ll have a rail ready when you arrive.</p>
            <Parallax className="mt-10 hidden aspect-[4/5] rounded-[2px] md:block" amount={8}>
              <Image src="/images/ed/store-interior-2.jpg" alt="A styling rail prepared in the fitting area" fill sizes="30vw" className="object-cover" />
            </Parallax>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <Booking />
          </div>
        </div>
      </section>

      <section className="container-x py-20 md:py-28">
        <h2 className="t-h2">In the shop</h2>
        <Reveal as="ul" stagger={0.08} className="mt-10 grid gap-8 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map(([t, d]) => (
            <li key={t}>
              <h3 className="t-h3">{t}</h3>
              <p className="mt-2 text-muted">{d}</p>
            </li>
          ))}
        </Reveal>
        <p className="mt-12 max-w-2xl text-muted">
          We ship to all 50 states and serve Dallas–Fort Worth in person: Oak Cliff, Bishop Arts, Kessler Park, Uptown, Deep Ellum, the Design District, Lakewood, Highland Park, Plano and Fort Worth.
        </p>
      </section>
    </>
  );
}
