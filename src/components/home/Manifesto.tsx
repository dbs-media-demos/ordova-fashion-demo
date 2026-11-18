import { Counter, Marquee, ScrubWords } from "@/components/ui/Reveal";
import { Ring } from "@/components/brand/Logo";
import { cv } from "@/lib/cv";
import { defaultBiz, type Biz } from "@/lib/biz";

const promises = (where: string) => ["Free shipping over $150", "Free 30-day returns", `Pickup in ${where} in 2 hours`, "Free hemming in store", "Gift wrap on the house"];

/** Scene 2 — the manifesto: words light up as you read, then four honest numbers. */
export function Manifesto({ biz = defaultBiz }: { biz?: Biz }) {
  // A preview names the business's own town instead of Bishop Arts
  const PROMISES = promises(biz.preview ? biz.area || "store" : "Bishop Arts");
  return (
    <section {...cv("manifesto")} className="theme-sand relative overflow-hidden" aria-labelledby="manifesto-title">
      <div className="border-b border-line py-4">
        <Marquee duration={36}>
          {PROMISES.map((p) => (
            <span key={p} className="t-mono flex items-center gap-6 pr-6">
              {p}
              <Ring className="h-3 w-3 text-cobalt" notch={false} />
            </span>
          ))}
        </Marquee>
      </div>
      <div className="container-x grid gap-10 py-16 md:grid-cols-12 md:gap-12 md:py-36">
        <h2 id="manifesto-title" className="t-mono text-muted md:col-span-3">
          ( 01 ) The idea
        </h2>
        <div className="md:col-span-9">
          <ScrubWords
            className="text-balance font-display text-[clamp(1.75rem,4.2vw,4rem)] font-bold uppercase leading-[1.02] tracking-[-0.025em]"
            text="Fewer, better clothes. *Cut *and *sewn *a *mile *from *the *shop, in runs of thirty, by six people who'd rather you wore one thing for ten years than ten things for one."
          />
          <dl className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line pt-10 md:grid-cols-4">
            {[
              { v: 6, s: "", l: "people in the studio, every one of them named on your care tag" },
              { v: 30, s: "", l: "pieces per run — then the pattern rests" },
              { v: 1, s: " mi", l: biz.preview ? "from our cutting table to the rail in the shop" : "from our cutting table to the rail on Bishop Ave" },
              { v: 0, s: "", l: "logos. The cut is the signature." },
            ].map((x) => (
              <div key={x.l}>
                <dt className="sr-only">{x.l}</dt>
                <dd>
                  <Counter value={x.v} suffix={x.s} className="font-display text-[clamp(2.6rem,5vw,4.5rem)] font-extrabold leading-none" />
                  <p className="mt-3 max-w-[24ch] text-sm text-muted">{x.l}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
