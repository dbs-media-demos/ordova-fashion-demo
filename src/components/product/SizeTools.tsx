"use client";

import { useState } from "react";
import clsx from "clsx";
import type { Product } from "@/lib/commerce/types";
import { Sheet, SheetHeader } from "@/components/ui/Sheet";
import { alphaChart, hatChart, howToMeasure, waistChart } from "@/content/sizing";
import { IconArrow, IconCheck } from "@/components/ui/Icons";

type Unit = "in" | "cm";
const conv = (v: number, u: Unit) => (u === "in" ? `${v}` : `${Math.round(v * 2.54)}`);
const range = ([a, b]: [number, number], u: Unit) => (a === 0 && b === 0 ? "—" : a === b ? conv(a, u) : `${conv(a, u)}–${conv(b, u)}`);

export function SizeChart({ initial = "alpha", compact }: { initial?: "alpha" | "waist" | "hat"; compact?: boolean }) {
  const [unit, setUnit] = useState<Unit>("in");
  const [tab, setTab] = useState(initial);
  const chart = tab === "alpha" ? alphaChart : tab === "waist" ? waistChart : hatChart;
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Size chart" className="flex flex-wrap gap-1.5">
          {(
            [
              ["alpha", "Clothing"],
              ["waist", "Trousers"],
              ["hat", "Hats & belts"],
            ] as const
          ).map(([id, l]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} className="chip" data-on={tab === id} onClick={() => setTab(id)}>
              {l}
            </button>
          ))}
        </div>
        <div role="radiogroup" aria-label="Units" className="inline-flex rounded-full border border-line p-1">
          {(["in", "cm"] as const).map((u) => (
            <button
              key={u}
              type="button"
              role="radio"
              aria-checked={unit === u}
              onClick={() => setUnit(u)}
              className={clsx("t-mono min-h-9 rounded-full px-4 transition-colors", unit === u ? "bg-char text-bone" : "")}
            >
              {u === "in" ? "Inches" : "cm"}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5 overflow-x-auto" role="tabpanel">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <caption className="t-mono mb-3 text-left text-muted">
            {chart.label} — body measurements in {unit === "in" ? "inches" : "centimetres"}
          </caption>
          <thead>
            <tr className="border-b border-char">
              {chart.cols.filter(Boolean).map((c) => (
                <th key={c} scope="col" className="py-2.5 pr-4 font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chart.rows.map(([s, a, b, c]) => (
              <tr key={s} className="border-b border-line">
                <th scope="row" className="t-mono py-2.5 pr-4 font-normal">
                  {s}
                </th>
                <td className="py-2.5 pr-4 tabular-nums">{range(a, unit)}</td>
                <td className="py-2.5 pr-4 tabular-nums">{range(b, unit)}</td>
                {chart.cols[3] && <td className="py-2.5 pr-4 tabular-nums">{range(c, unit)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!compact && (
        <div className="mt-8 grid gap-6 sm:grid-cols-[9rem_1fr]">
          <svg viewBox="0 0 120 220" className="mx-auto h-56 w-auto text-char" aria-hidden="true">
            <g fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="60" cy="22" r="13" />
              <path d="M60 35v10M38 48c8-4 36-4 44 0l8 52M38 48l-8 52M44 100c-2 30 0 50 6 110M76 100c2 30 0 50-6 110M44 100h32" />
            </g>
            <g stroke="#2b36f0" strokeWidth="1.6" strokeDasharray="3 3" fill="none">
              <ellipse cx="60" cy="62" rx="26" ry="5" />
              <ellipse cx="60" cy="88" rx="20" ry="4" />
              <ellipse cx="60" cy="108" rx="24" ry="5" />
              <path d="M62 112v90" />
            </g>
          </svg>
          <dl className="space-y-3 text-sm">
            {howToMeasure.map((m) => (
              <div key={m.k}>
                <dt className="font-medium">{m.k}</dt>
                <dd className="text-muted">{m.d}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}

export function SizeGuideModal({ open, onClose, product }: { open: boolean; onClose: () => void; product: Product }) {
  return (
    <Sheet open={open} onClose={onClose} label="Size guide" variant="modal">
      <SheetHeader title="Size guide" onClose={onClose} />
      <div className="flex-1 overflow-y-auto overscroll-contain p-5 md:p-8">
        <h2 className="t-h3">{product.name}</h2>
        <p className="mt-2 text-sm text-muted">
          {product.fit} fit.{product.model ? ` ${product.model}.` : ""} Between sizes? {product.fitScore > 0.25 ? "This piece runs a little large — size down." : product.fitScore < -0.25 ? "This piece runs a little small — size up." : "It's true to size — take your usual."}
        </p>
        <div className="mt-6">
          <SizeChart initial={product.sizeSystem === "waist" ? "waist" : product.category === "accessories" ? "hat" : "alpha"} />
        </div>
      </div>
    </Sheet>
  );
}

const ALPHA = ["XS", "S", "M", "L", "XL"];

/**
 * Signature 5 — Fit finder. Four quick questions → a recommended size with a
 * confidence bar. Uses the product's fit feedback from reviews.
 */
export function FitFinder({ open, onClose, product, onPick }: { open: boolean; onClose: () => void; product: Product; onPick: (size: string) => void }) {
  const [step, setStep] = useState(0);
  const [h, setH] = useState(67); // inches
  const [w, setW] = useState(150); // lbs
  const [usual, setUsual] = useState<string | null>(null);
  const [pref, setPref] = useState<"close" | "true" | "roomy" | null>(null);
  const waist = product.sizeSystem === "waist";
  const options = waist ? product.sizes : ALPHA;

  const result = (() => {
    if (!usual || !pref) return null;
    let idx = options.indexOf(usual);
    let shift = 0;
    shift -= product.fitScore * 0.9; // runs large → size down
    if (pref === "close") shift -= 0.45;
    if (pref === "roomy") shift += 0.55;
    const bmi = (w / (h * h)) * 703;
    if (bmi > 27) shift += 0.25;
    if (bmi < 19.5) shift -= 0.2;
    idx = Math.max(0, Math.min(options.length - 1, Math.round(idx + shift)));
    const conf = Math.round(Math.max(62, Math.min(96, 94 - Math.abs(shift - Math.round(shift)) * 50 - (Math.abs(product.fitScore) > 0.4 ? 6 : 0))));
    return { size: options[idx], conf, shift };
  })();

  const reset = () => {
    setStep(0);
    setUsual(null);
    setPref(null);
  };
  const close = () => {
    onClose();
    window.setTimeout(reset, 500);
  };
  const ft = Math.floor(h / 12);
  const inch = h % 12;

  const steps = [
    {
      t: "How tall are you?",
      body: (
        <div>
          <p className="font-display text-5xl font-extrabold tabular-nums">
            {ft}&prime;{inch}&Prime; <span className="text-xl text-muted">/ {Math.round(h * 2.54)} cm</span>
          </p>
          <label htmlFor="ff-h" className="sr-only">
            Height in inches
          </label>
          <input id="ff-h" type="range" min={58} max={78} value={h} onChange={(e) => setH(+e.target.value)} className="mt-6 w-full accent-[#2b36f0]" aria-valuetext={`${ft} feet ${inch} inches`} />
        </div>
      ),
      ok: true,
    },
    {
      t: "And your weight?",
      body: (
        <div>
          <p className="font-display text-5xl font-extrabold tabular-nums">
            {w} lb <span className="text-xl text-muted">/ {Math.round(w * 0.4536)} kg</span>
          </p>
          <label htmlFor="ff-w" className="sr-only">
            Weight in pounds
          </label>
          <input id="ff-w" type="range" min={90} max={280} step={5} value={w} onChange={(e) => setW(+e.target.value)} className="mt-6 w-full accent-[#2b36f0]" />
          <p className="mt-3 text-sm text-muted">Only used to fine-tune the suggestion. Nothing is stored or sent.</p>
        </div>
      ),
      ok: true,
    },
    {
      t: waist ? "What waist do you usually buy?" : "What size do you usually buy?",
      body: (
        <div role="radiogroup" aria-label="Usual size" className="flex flex-wrap gap-2">
          {options.map((s) => (
            <button key={s} type="button" role="radio" aria-checked={usual === s} onClick={() => setUsual(s)} className="size-opt min-w-14">
              {s}
            </button>
          ))}
        </div>
      ),
      ok: !!usual,
    },
    {
      t: "How do you like it to fit?",
      body: (
        <div role="radiogroup" aria-label="Fit preference" className="grid gap-2">
          {(
            [
              ["close", "Closer to the body", "Neat through the shoulder and waist"],
              ["true", "As designed", "How we cut it — the model's fit"],
              ["roomy", "Roomier", "Room to layer, a little slouch"],
            ] as const
          ).map(([id, l, d]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={pref === id}
              onClick={() => setPref(id)}
              className={clsx("rounded-lg border p-4 text-left transition-colors", pref === id ? "border-char bg-char text-bone" : "border-line hover:border-char")}
            >
              <span className="block font-medium">{l}</span>
              <span className={clsx("text-sm", pref === id ? "text-bone/75" : "text-muted")}>{d}</span>
            </button>
          ))}
        </div>
      ),
      ok: !!pref,
    },
  ];

  const done = step >= steps.length;

  return (
    <Sheet open={open} onClose={close} label="Find my size" variant="drawer">
      <SheetHeader title="Fit finder" onClose={close} />
      <div className="px-5 pt-4 md:px-7">
        <div className="flex gap-1" aria-hidden="true">
          {[...steps, 1].map((_, i) => (
            <span key={i} className={clsx("h-1 flex-1 rounded-full transition-colors duration-500", i <= step ? "bg-cobalt" : "bg-char/10")} />
          ))}
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ transform: `translateX(-${step * 100}%)` }}>
          {steps.map((s, i) => (
            <div key={s.t} className="w-full shrink-0 overflow-y-auto px-5 py-8 md:px-7" inert={i !== step} aria-hidden={i !== step}>
              <p className="t-mono text-muted">
                Step {i + 1} of {steps.length}
              </p>
              <h2 className="t-h3 mt-3">{s.t}</h2>
              <div className="mt-8">{s.body}</div>
            </div>
          ))}
          <div className="w-full shrink-0 overflow-y-auto px-5 py-8 md:px-7" inert={!done} aria-hidden={!done}>
            {result && (
              <div role="status">
                <p className="t-mono text-muted">Your size in {product.name}</p>
                <p className="mt-4 font-display text-[6rem] font-extrabold leading-none">{result.size}</p>
                <div className="mt-6">
                  <div className="flex justify-between text-sm">
                    <span>Confidence</span>
                    <span className="t-price">{result.conf}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-char/10">
                    <div className="h-full rounded-full bg-cobalt transition-[width] delay-300 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ width: done ? `${result.conf}%` : "0%" }} />
                  </div>
                </div>
                <p className="mt-6 text-sm text-muted">
                  Based on your answers and {product.reviewCount} reviews — customers say it {product.fitScore > 0.25 ? "runs a little large" : product.fitScore < -0.25 ? "runs a little small" : "fits true to size"}.
                  {product.model ? ` ${product.model}.` : ""}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2 border-t border-line bg-paper px-5 py-4 md:px-7">
        {step > 0 && (
          <button type="button" className="btn btn-ghost" onClick={() => setStep((s) => s - 1)}>
            Back
          </button>
        )}
        {!done ? (
          <button type="button" className="btn btn-solid flex-1" disabled={!steps[step].ok} onClick={() => setStep((s) => s + 1)}>
            {step === steps.length - 1 ? "See my size" : "Next"} <IconArrow size={16} />
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-solid flex-1"
            onClick={() => {
              if (result) onPick(result.size);
              close();
            }}
          >
            <IconCheck size={16} /> Select {result?.size}
          </button>
        )}
      </div>
    </Sheet>
  );
}
