"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import { Ring } from "@/components/brand/Logo";
import { money } from "@/lib/format";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { IconCheck } from "@/components/ui/Icons";

const AMOUNTS = [50, 100, 150, 250, 500];

/** Gift card builder: pick an amount and a finish; the card tilts to the pointer. Sending is simulated. */
export function GiftCardBuilder() {
  const [amount, setAmount] = useState(150);
  const [finish, setFinish] = useState<"char" | "olive" | "cobalt">("char");
  const [to, setTo] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState(false);
  const card = useRef<HTMLDivElement>(null);

  const tilt = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || prefersReducedMotion()) return;
    const r = card.current!.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(card.current, { rotateY: x * 16, rotateX: -y * 12, duration: 0.6, ease: "power3.out", transformPerspective: 900 });
  };

  const bg = finish === "char" ? "bg-char" : finish === "olive" ? "bg-olive" : "bg-cobalt";

  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
      <div className="[perspective:900px]" onPointerMove={tilt} onPointerLeave={() => gsap.to(card.current, { rotateX: 0, rotateY: 0, duration: 0.8 })}>
        <div ref={card} className={clsx("relative mx-auto flex aspect-[1.586] w-full max-w-md flex-col justify-between overflow-hidden rounded-2xl p-6 text-bone shadow-2xl transition-colors duration-700 md:p-8", bg)}>
          <Ring className="absolute -right-16 -top-16 h-64 w-64 text-white/10" />
          <div className="flex items-start justify-between">
            <span className="font-display text-2xl font-extrabold uppercase tracking-tight">Ordova</span>
            <span className="t-mono text-bone/80">Gift card</span>
          </div>
          <div>
            <p className="t-mono text-bone/75">{to ? `For ${to}` : "For someone good"}</p>
            <p className="mt-1 font-display text-6xl font-extrabold tabular-nums">{money(amount)}</p>
          </div>
        </div>
      </div>
      {sent ? (
        <div className="rounded-lg bg-sand p-8" role="status">
          <p className="flex items-center gap-3 text-lg">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-cobalt text-bone">
              <IconCheck size={18} />
            </span>
            Done — in a live store, a {money(amount)} card would go out now.
          </p>
          <p className="mt-3 text-muted">This is a demo, so nothing was charged or emailed. Gift cards never expire and work in store and online.</p>
          <button type="button" className="btn btn-ghost mt-6" onClick={() => setSent(false)}>
            Make another
          </button>
        </div>
      ) : (
        <form
          noValidate
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!/^\S+@\S+\.\S+$/.test(to.trim()) && to.trim().length < 2) return setErr(true);
            setSent(true);
          }}
        >
          <fieldset>
            <legend className="t-mono mb-3 text-muted">Amount</legend>
            <div className="flex flex-wrap gap-2">
              {AMOUNTS.map((a) => (
                <button key={a} type="button" className="chip" aria-pressed={amount === a} onClick={() => setAmount(a)}>
                  {money(a)}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="t-mono mb-3 text-muted">Finish</legend>
            <div className="flex gap-2">
              {(
                [
                  ["char", "Char", "#151513"],
                  ["olive", "Olive", "#3f4231"],
                  ["cobalt", "Cobalt", "#2b36f0"],
                ] as const
              ).map(([id, l, hex]) => (
                <button key={id} type="button" className="chip" aria-pressed={finish === id} onClick={() => setFinish(id)}>
                  <span className="h-3.5 w-3.5 rounded-full" style={{ background: hex }} aria-hidden="true" /> {l}
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="gc-to" className="label">
              Recipient&apos;s name or email
            </label>
            <input id="gc-to" value={to} onChange={(e) => (setTo(e.target.value), setErr(false))} className="field" aria-invalid={err} aria-describedby={err ? "gc-err" : undefined} />
            {err && (
              <p id="gc-err" className="err">
                Who&apos;s it for?
              </p>
            )}
          </div>
          <div>
            <label htmlFor="gc-msg" className="label">
              Message (optional)
            </label>
            <textarea id="gc-msg" rows={3} maxLength={200} value={msg} onChange={(e) => setMsg(e.target.value)} className="field resize-none" />
          </div>
          <button type="submit" className="btn btn-solid btn-lg w-full">
            Send a {money(amount)} gift card
          </button>
        </form>
      )}
    </div>
  );
}
