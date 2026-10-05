"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Ring } from "@/components/brand/Logo";
import { OpenBadge } from "./Chrome";
import { nav, site, agencyUrl } from "@/lib/site";
import { hoursTable } from "@/lib/hours";
import { gsap, useIdleGSAP, prefersReducedMotion } from "@/lib/gsap";
import { IconArrow, IconCheck, IconInstagram } from "@/components/ui/Icons";

export function Footer() {
  const word = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const calm = pathname.startsWith("/checkout");

  // The giant wordmark rises letter by letter as the footer scrolls in.
  useIdleGSAP(() => {
    const el = word.current;
    if (!el || prefersReducedMotion()) return;
    const letters = el.querySelectorAll("[data-l]");
    gsap.fromTo(
      letters,
      { yPercent: 100 },
      { yPercent: 0, ease: "none", stagger: 0.08, scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: 0.8 } },
    );
  }, word);

  if (calm) {
    return (
      <footer className="border-t border-line py-8">
        <div className="container-x t-mono flex flex-wrap justify-between gap-4 text-muted">
          <span>© {new Date().getFullYear()} Ordova Studio · Demo store, no payments taken</span>
          <a href={agencyUrl} target="_blank" rel="noopener" className="link-u">
            Design & development: Scale by Noon
          </a>
        </div>
      </footer>
    );
  }

  return (
    <footer className="theme-char relative overflow-hidden pt-20 md:pt-28">
      <div className="container-x grid gap-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="t-mono text-mist">The letter</p>
          <h2 className="t-h3 mt-3 max-w-[18ch] text-balance text-[clamp(1.6rem,2.6vw,2.4rem)]">New drops, studio notes, no spam.</h2>
          <Newsletter />
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <OpenBadge dark />
            <a href={site.instagram} target="_blank" rel="noopener" className="icon-btn border border-line-lt" aria-label="Ordova on Instagram">
              <IconInstagram />
            </a>
          </div>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-7">
          {nav.footer.map((col) => (
            <div key={col.title}>
              <p className="t-mono text-mist">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="link-u text-[0.95rem]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="col-span-2 sm:col-span-3">
            <p className="t-mono text-mist">The shop</p>
            <div className="mt-4 grid gap-6 text-[0.95rem] sm:grid-cols-2">
              <address className="not-italic leading-relaxed">
                {site.address.street}
                <br />
                Bishop Arts District, Dallas, TX {site.address.postal}
                <br />
                <a href={site.phoneHref} className="link-line">
                  {site.phone}
                </a>{" "}
                ·{" "}
                <a href={`mailto:${site.email}`} className="link-line">
                  {site.email}
                </a>
              </address>
              <ul className="space-y-0.5 text-mist">
                {hoursTable().map((h) => (
                  <li key={h.day} className="flex justify-between gap-4">
                    <span>{h.short}</span>
                    <span className="text-bone/85">{h.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>
      </div>

      <div ref={word} className="mt-20 select-none overflow-hidden px-[2vw] md:mt-28" aria-hidden="true">
        <div className="flex items-end justify-between font-display font-extrabold uppercase leading-[0.78] tracking-[-0.04em] text-[14.6vw]">
          <span data-l className="inline-block">
            <Ring className="h-[0.72em] w-[0.72em] text-cobalt" />
          </span>
          {"RDOVA".split("").map((c, i) => (
            <span key={i} data-l className="inline-block">
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="container-x t-mono flex flex-wrap items-center justify-between gap-4 border-t border-line-lt py-6 text-mist">
        <span>© {new Date().getFullYear()} {site.legalName}. A fictional store.</span>
        <a href={agencyUrl} target="_blank" rel="noopener" className="link-u text-bone">
          Design & development: Scale by Noon ↗
        </a>
      </div>
    </footer>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "error" | "done">("idle");
  return state === "done" ? (
    <p className="mt-6 flex items-center gap-3 text-bone" role="status">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-cobalt">
        <IconCheck size={18} />
      </span>
      You&apos;re on the list. First letter lands before the next drop.
    </p>
  ) : (
    <form
      noValidate
      className="mt-6"
      onSubmit={(e) => {
        e.preventDefault();
        setState(/^\S+@\S+\.\S+$/.test(email.trim()) ? "done" : "error");
      }}
    >
      <label htmlFor="nl-email" className="sr-only">
        Email address
      </label>
      <div className={clsx("flex items-center border-b pb-2 transition-colors", state === "error" ? "border-[#ff8a73]" : "border-line-lt focus-within:border-bone")}>
        <input
          id="nl-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          aria-invalid={state === "error"}
          aria-describedby={state === "error" ? "nl-err" : undefined}
          className="min-h-11 w-full bg-transparent text-lg text-bone placeholder:text-mist focus:outline-none"
        />
        <button type="submit" className="icon-btn shrink-0" aria-label="Subscribe">
          <IconArrow />
        </button>
      </div>
      {state === "error" && (
        <p id="nl-err" className="mt-2 text-sm text-[#ffb3a3]">
          Please enter a valid email address.
        </p>
      )}
    </form>
  );
}
