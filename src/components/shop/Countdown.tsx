"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { nextDropAt, saleEndsAt } from "@/content/helpers";
import { useMounted } from "@/lib/store";

/** Ticking d/h/m/s countdown to the rolling sale end or next drop. Client-only (no hydration drift). */
export function Countdown({ to, className, size = "md" }: { to: "sale" | "drop"; className?: string; size?: "sm" | "md" | "lg" }) {
  const mounted = useMounted();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const target = (to === "sale" ? saleEndsAt(new Date(now)) : nextDropAt(new Date(now))).getTime();
  const left = Math.max(0, target - now);
  const parts = [
    { l: "days", v: Math.floor(left / 864e5) },
    { l: "hrs", v: Math.floor((left / 36e5) % 24) },
    { l: "min", v: Math.floor((left / 6e4) % 60) },
    { l: "sec", v: Math.floor((left / 1e3) % 60) },
  ];
  const label = to === "sale" ? "Sale ends in" : "Next drop in";
  return (
    <div className={clsx("flex items-end gap-3", className)} role="timer" aria-label={mounted ? `${label} ${parts[0].v} days ${parts[1].v} hours ${parts[2].v} minutes` : label}>
      {parts.map((p, i) => (
        <div key={p.l} className="flex items-end gap-3">
          <div className="text-center">
            <span
              className={clsx(
                "block font-display font-extrabold tabular-nums leading-none",
                size === "lg" ? "text-[clamp(2.4rem,5vw,4.5rem)]" : size === "md" ? "text-[clamp(1.8rem,3vw,2.6rem)]" : "text-xl",
              )}
              aria-hidden="true"
            >
              {mounted ? String(p.v).padStart(2, "0") : "––"}
            </span>
            <span className="t-mono mt-1 block text-[0.58rem] opacity-75" aria-hidden="true">
              {p.l}
            </span>
          </div>
          {i < 3 && (
            <span className={clsx("font-display font-bold opacity-40", size === "sm" ? "text-lg" : "text-2xl", "pb-5")} aria-hidden="true">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
