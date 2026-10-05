"use client";

import { useState } from "react";
import clsx from "clsx";

/*
 * Demo card form. Everything here stays inside this component's state:
 * no network requests, no storage, no logging, no analytics. On "pay" the
 * parent receives only { brand, last4 } plus a fake token, and the fields
 * are wiped. In production this whole component is replaced by Stripe
 * Elements / Shopify Checkout, so card data never touches the app.
 */

export type Brand = "visa" | "mastercard" | "amex" | "unknown";

export function detectBrand(num: string): Brand {
  const n = num.replace(/\D/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2(2[2-9][1-9]|2[3-9]\d|[3-6]\d\d|7[01]\d|720))/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  return "unknown";
}

export function luhn(num: string) {
  const d = num.replace(/\D/g, "");
  if (d.length < 12) return false;
  let sum = 0;
  let dbl = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let x = +d[i];
    if (dbl) {
      x *= 2;
      if (x > 9) x -= 9;
    }
    sum += x;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

const fmtNumber = (v: string, brand: Brand) => {
  const d = v.replace(/\D/g, "").slice(0, brand === "amex" ? 15 : 16);
  if (brand === "amex") return [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)].filter(Boolean).join(" ");
  return d.replace(/(.{4})/g, "$1 ").trim();
};
const fmtExp = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

type Errors = Partial<Record<"number" | "exp" | "cvc" | "name", string>>;

export type CardResult = { brand: Brand; last4: string };

export function useCardForm() {
  const [number, setNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const brand = detectBrand(number);

  const validate = (): Errors => {
    const e: Errors = {};
    const digits = number.replace(/\D/g, "");
    if (!digits) e.number = "Enter your card number.";
    else if (brand === "unknown") e.number = "We accept Visa, Mastercard and American Express.";
    else if (digits.length !== (brand === "amex" ? 15 : 16) || !luhn(digits)) e.number = "That card number doesn't look right.";
    const m = exp.match(/^(\d{2})\/(\d{2})$/);
    if (!m) e.exp = "Use MM/YY.";
    else {
      const mm = +m[1];
      const yy = 2000 + +m[2];
      const now = new Date();
      if (mm < 1 || mm > 12) e.exp = "Month must be 01–12.";
      else if (yy < now.getFullYear() || (yy === now.getFullYear() && mm < now.getMonth() + 1)) e.exp = "This card has expired.";
    }
    if (!new RegExp(`^\\d{${brand === "amex" ? 4 : 3}}$`).test(cvc)) e.cvc = brand === "amex" ? "4 digits on the front." : "3 digits on the back.";
    if (name.trim().length < 2) e.name = "Name as it appears on the card.";
    setErrors(e);
    return e;
  };

  const wipe = () => {
    setNumber("");
    setExp("");
    setCvc("");
    setName("");
    setErrors({});
  };

  const result = (): CardResult => ({ brand, last4: number.replace(/\D/g, "").slice(-4) });

  return { number, setNumber, exp, setExp, cvc, setCvc, name, setName, errors, setErrors, brand, validate, wipe, result };
}

const BRAND_LABEL: Record<Brand, string> = { visa: "VISA", mastercard: "mastercard", amex: "AMEX", unknown: "" };

export function CardForm({ form }: { form: ReturnType<typeof useCardForm> }) {
  const [flip, setFlip] = useState(false);
  const { number, setNumber, exp, setExp, cvc, setCvc, name, setName, errors, setErrors, brand } = form;
  const clear = (k: keyof Errors) => errors[k] && setErrors({ ...errors, [k]: undefined });
  const shown = number || "•••• •••• •••• ••••";

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_17rem] md:items-start">
      <div className="grid gap-4">
        <div>
          <label htmlFor="cc-number" className="label">
            Card number
          </label>
          <div className="relative">
            <input
              id="cc-number"
              inputMode="numeric"
              autoComplete="cc-number"
              value={number}
              onChange={(e) => {
                setNumber(fmtNumber(e.target.value, detectBrand(e.target.value)));
                clear("number");
              }}
              placeholder="1234 1234 1234 1234"
              className="field pr-24 tabular-nums"
              aria-invalid={!!errors.number}
              aria-describedby={errors.number ? "cc-number-err" : "cc-number-hint"}
            />
            <span className="t-mono absolute right-3 top-1/2 -translate-y-1/2 text-[0.62rem] text-muted" aria-live="polite">
              {BRAND_LABEL[brand]}
            </span>
          </div>
          {errors.number ? (
            <p id="cc-number-err" className="err">
              {errors.number}
            </p>
          ) : (
            <p id="cc-number-hint" className="mt-1 text-xs text-muted">
              Test card: 4242 4242 4242 4242, any future date, any CVC.
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="cc-exp" className="label">
              Expiry (MM/YY)
            </label>
            <input
              id="cc-exp"
              inputMode="numeric"
              autoComplete="cc-exp"
              value={exp}
              onChange={(e) => {
                setExp(fmtExp(e.target.value));
                clear("exp");
              }}
              placeholder="MM/YY"
              className="field tabular-nums"
              aria-invalid={!!errors.exp}
              aria-describedby={errors.exp ? "cc-exp-err" : undefined}
            />
            {errors.exp && (
              <p id="cc-exp-err" className="err">
                {errors.exp}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="cc-cvc" className="label">
              Security code
            </label>
            <input
              id="cc-cvc"
              inputMode="numeric"
              autoComplete="cc-csc"
              value={cvc}
              onFocus={() => setFlip(true)}
              onBlur={() => setFlip(false)}
              onChange={(e) => {
                setCvc(e.target.value.replace(/\D/g, "").slice(0, brand === "amex" ? 4 : 3));
                clear("cvc");
              }}
              placeholder={brand === "amex" ? "1234" : "123"}
              className="field tabular-nums"
              aria-invalid={!!errors.cvc}
              aria-describedby={errors.cvc ? "cc-cvc-err" : undefined}
            />
            {errors.cvc && (
              <p id="cc-cvc-err" className="err">
                {errors.cvc}
              </p>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="cc-name" className="label">
            Name on card
          </label>
          <input
            id="cc-name"
            autoComplete="cc-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clear("name");
            }}
            className="field"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "cc-name-err" : undefined}
          />
          {errors.name && (
            <p id="cc-name-err" className="err">
              {errors.name}
            </p>
          )}
        </div>
      </div>

      {/* Card preview — flips to its back while the CVC field is focused */}
      <div className="flip flip-manual mx-auto aspect-[1.586] w-full max-w-[17rem]" data-flipped={flip} aria-hidden="true">
        <div className="flip-inner">
          <div className={clsx("flip-face flex flex-col justify-between rounded-xl p-4 text-bone shadow-xl", brand === "amex" ? "bg-[#2f3a33]" : brand === "mastercard" ? "bg-[#2b2622]" : "bg-char")}>
            <div className="flex items-start justify-between">
              <span className="h-6 w-8 rounded bg-[linear-gradient(135deg,#d8c08a,#a88a4f)]" />
              <span className="t-mono text-[0.7rem]">{BRAND_LABEL[brand] || "CARD"}</span>
            </div>
            <p className="font-mono text-[0.95rem] tracking-[0.12em] tabular-nums">{shown}</p>
            <div className="flex justify-between text-[0.6rem] uppercase">
              <span className="truncate pr-2">{name || "Your name"}</span>
              <span className="tabular-nums">{exp || "MM/YY"}</span>
            </div>
          </div>
          <div className="flip-face flip-back flex flex-col justify-center rounded-xl bg-ink3 text-bone shadow-xl">
            <span className="h-8 w-full bg-char" />
            <div className="mx-4 mt-4 flex items-center justify-end rounded bg-bone px-3 py-1.5">
              <span className="font-mono text-sm tracking-widest text-char">{cvc || (brand === "amex" ? "••••" : "•••")}</span>
            </div>
            <span className="t-mono mx-4 mt-2 text-right text-[0.55rem] text-mist">Security code</span>
          </div>
        </div>
      </div>
    </div>
  );
}
