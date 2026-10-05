"use client";

import { useId, useRef, useState } from "react";
import clsx from "clsx";
import { gsap, useIdleGSAP, prefersReducedMotion } from "@/lib/gsap";
import { IconPlus } from "@/components/ui/Icons";

/** Accessible FAQ item with an animated height. */
export function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="border-b border-line">
      <h3>
        <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-6 py-5 text-left text-lg">
          {q}
          <span className={clsx("grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line transition-transform duration-500", open && "rotate-45 bg-char text-bone")}>
            <IconPlus size={16} />
          </span>
        </button>
      </h3>
      <div id={id} role="region" className={clsx("grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden" inert={!open}>
          <p className="max-w-2xl pb-6 text-muted">{a}</p>
        </div>
      </div>
    </div>
  );
}

const FLOW = [
  { t: "Start a return", d: "Use the prepaid label in your box, or start one online with your order number." },
  { t: "Drop it off", d: "Any UPS location — or bring it to the shop in Bishop Arts." },
  { t: "Exchange ships first", d: "Swapping sizes? We send the new one as soon as the carrier scans your return." },
  { t: "Refund in 2 days", d: "Money back to your card within two business days of it reaching us." },
];

/** Animated returns flow: a parcel travels a dotted path through four stops as you scroll. */
export function ReturnsFlow() {
  const root = useRef<HTMLDivElement>(null);
  useIdleGSAP(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const line = el.querySelector("[data-line]");
    const box = el.querySelector("[data-box]");
    const stops = el.querySelectorAll("[data-stop]");
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 75%", end: "bottom 55%", scrub: 0.8 } });
    tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, ease: "none", duration: 1 }, 0).fromTo(box, { left: "0%" }, { left: "100%", ease: "none", duration: 1 }, 0);
    stops.forEach((s, i) => tl.fromTo(s, { opacity: 0.35, y: 16 }, { opacity: 1, y: 0, duration: 0.2 }, (i / (stops.length - 1)) * 0.85));
  }, root);
  return (
    <div ref={root} className="relative">
      <div className="relative mx-[12.5%] hidden h-10 md:block" aria-hidden="true">
        <div className="absolute inset-x-0 top-1/2 h-px border-t border-dashed border-char/30" />
        <div data-line className="absolute inset-x-0 top-1/2 h-px origin-left bg-cobalt" />
        <div data-box className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2">
          <svg width="40" height="34" viewBox="0 0 40 34" fill="none">
            <path d="M3 9h34v22H3z" fill="#d8c5a2" stroke="#151513" strokeWidth="1.4" />
            <path d="M3 9l5-6h24l5 6" fill="#c4ad86" stroke="#151513" strokeWidth="1.4" />
            <circle cx="28" cy="20" r="5" fill="#2b36f0" />
          </svg>
        </div>
      </div>
      <ol className="mt-6 grid gap-8 md:grid-cols-4">
        {FLOW.map((f, i) => (
          <li key={f.t} data-stop className="text-center md:px-2">
            <span className="t-mono mx-auto grid h-10 w-10 place-items-center rounded-full border border-char">{i + 1}</span>
            <h3 className="mt-4 font-medium">{f.t}</h3>
            <p className="mt-1 text-sm text-muted">{f.d}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
