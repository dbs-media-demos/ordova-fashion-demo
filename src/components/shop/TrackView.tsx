"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { commerce } from "@/lib/commerce";
import type { TrackStatus } from "@/lib/commerce/types";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { IconCheck, IconTruck } from "@/components/ui/Icons";

export function TrackView() {
  const [num, setNum] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<TrackStatus | null>(null);
  const list = useRef<HTMLOListElement>(null);

  // Prefill from the last order in this tab, if any.
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("ordova-last-order");
      if (raw) {
        const o = JSON.parse(raw);
        setNum(o.number ?? "");
        setEmail(o.email ?? "");
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const el = list.current;
    if (!res || !el || prefersReducedMotion()) return;
    const tl = gsap.timeline();
    tl.fromTo(el.querySelector("[data-line]"), { scaleY: 0 }, { scaleY: 1, duration: 1.6, ease: "power2.inOut" }).fromTo(
      el.querySelectorAll("li"),
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, stagger: 0.18, duration: 0.6, ease: "expo.out" },
      0.1,
    );
    return () => {
      tl.kill();
    };
  }, [res]);

  const done = res ? res.steps.filter((s) => s.done).length : 0;

  return (
    <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1.2fr]">
      <form
        noValidate
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setErr(null);
          if (!/^ORD-\d{5,8}$/i.test(num.trim())) return setErr("Order numbers look like ORD-1234567 — it's on your confirmation.");
          if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErr("Enter the email you ordered with.");
          setLoading(true);
          const r = await commerce.trackOrder(num, email);
          setLoading(false);
          if (!r) setErr("We couldn't find that order. Check the number and email.");
          setRes(r);
        }}
      >
        <div>
          <label htmlFor="t-num" className="label">
            Order number
          </label>
          <input id="t-num" value={num} onChange={(e) => setNum(e.target.value)} placeholder="ORD-1234567" className="field uppercase" aria-invalid={!!err && !/^ORD-\d{5,8}$/i.test(num.trim())} />
        </div>
        <div>
          <label htmlFor="t-email" className="label">
            Email
          </label>
          <input id="t-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
        </div>
        {err && (
          <p className="err" role="alert">
            {err}
          </p>
        )}
        <button type="submit" className="btn btn-solid btn-lg w-full" disabled={loading}>
          {loading ? "Looking it up…" : "Track my order"}
        </button>
        <p className="text-sm text-muted">Demo: any number like ORD-1234567 with any email shows a sample journey.</p>
      </form>

      <div aria-live="polite">
        {res ? (
          <div className="rounded-lg bg-paper p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="t-mono">{res.number}</p>
              <p className="inline-flex items-center gap-2 text-sm">
                <IconTruck size={18} /> Arrives {res.eta}
              </p>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-char/10">
              <div className="h-full rounded-full bg-cobalt transition-[width] duration-1000" style={{ width: `${(done / res.steps.length) * 100}%` }} />
            </div>
            <ol ref={list} className="relative mt-8 space-y-6 pl-10">
              <span data-line className="absolute bottom-2 left-[0.7rem] top-2 w-px origin-top bg-char/20" aria-hidden="true" />
              {res.steps.map((s) => (
                <li key={s.label} className="relative">
                  <span className={clsx("absolute -left-10 top-0 grid h-6 w-6 place-items-center rounded-full", s.done ? "bg-char text-bone" : "border border-char/25 bg-bone")} aria-hidden="true">
                    {s.done && <IconCheck size={13} />}
                  </span>
                  <p className="font-medium">
                    {s.label} <span className="t-mono ml-2 text-[0.6rem] text-muted">{s.date}</span>
                  </p>
                  <p className="text-sm text-muted">{s.detail}</p>
                  <span className="sr-only">{s.done ? "Completed" : "Upcoming"}</span>
                </li>
              ))}
            </ol>
            <p className="t-mono mt-6 text-[0.6rem] text-muted">{res.carrier}</p>
          </div>
        ) : (
          <div className="grid h-full min-h-56 place-items-center rounded-lg border border-dashed border-line p-8 text-center text-muted">
            Your order&apos;s journey from our studio to your door will appear here.
          </div>
        )}
      </div>
    </div>
  );
}
