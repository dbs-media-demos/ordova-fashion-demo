"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { commerce, deliveryEstimate, shippingMethods } from "@/lib/commerce";
import type { Address, CheckoutDraft } from "@/lib/commerce/types";
import { cart, useCart, useMounted } from "@/lib/store";
import { money, money2 } from "@/lib/format";
import { site } from "@/lib/site";
import { Sheet, SheetHeader } from "@/components/ui/Sheet";
import { CardForm, useCardForm } from "./CardForm";
import { PromoField } from "@/components/cart/CartParts";
import { IconCheck, IconChevron, IconLock, IconStore, IconTruck } from "@/components/ui/Icons";

const STATES = "AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split(" ");
const STEPS = ["Contact", "Delivery", "Shipping", "Payment", "Review"] as const;
export const ORDER_KEY = "ordova-last-order";

type AddrErrors = Partial<Record<keyof Address | "email" | "pickupName" | "pickupPhone", string>>;

export function Checkout() {
  const router = useRouter();
  const mounted = useMounted();
  const state = useCart();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [marketing, setMarketing] = useState(false);
  const [addr, setAddr] = useState<Address>({ firstName: "", lastName: "", line1: "", line2: "", city: "Dallas", state: "TX", zip: "", country: "US", phone: "" });
  const [pickup, setPickup] = useState({ name: "", phone: "" });
  const [method, setMethod] = useState<CheckoutDraft["shippingMethod"]>("standard");
  const [errors, setErrors] = useState<AddrErrors>({});
  const [paying, setPaying] = useState(false);
  const [express, setExpress] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const card = useCardForm();
  const panel = useRef<HTMLDivElement>(null);
  const delivery = state.mode;

  useEffect(() => {
    if (delivery === "pickup") setMethod("pickup");
    else if (method === "pickup") setMethod("standard");
  }, [delivery, method]);

  const taxable = delivery === "pickup" || addr.state === "TX";
  const priced = commerce.priceCart(mounted ? state.lines : [], { promo: state.promo, shippingMethod: method, taxable: step >= 2 && taxable });

  // Move focus to the step heading for keyboard/screen-reader users.
  useEffect(() => {
    panel.current?.querySelector<HTMLElement>(`[data-step="${step}"] h2`)?.focus({ preventScroll: true });
  }, [step]);

  if (!mounted) return <div className="min-h-[90vh]" aria-busy="true" />;

  if (state.lines.length === 0 && !paying) {
    return (
      <div className="mx-auto min-h-[90vh] max-w-lg py-24 text-center">
        <p className="t-h3">Your bag is empty</p>
        <p className="mt-3 text-muted">Add something you love, then come back to check out.</p>
        <Link href="/shop" className="btn btn-solid mt-8">
          Continue shopping
        </Link>
      </div>
    );
  }

  const focusFirstError = () =>
    window.setTimeout(() => panel.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 30);

  const next = () => {
    const e: AddrErrors = {};
    if (step === 0) {
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) e.email = "Enter a valid email so we can send your receipt.";
    }
    if (step === 1) {
      if (delivery === "ship") {
        if (!addr.firstName.trim()) e.firstName = "Required.";
        if (!addr.lastName.trim()) e.lastName = "Required.";
        if (addr.line1.trim().length < 4 || !/\d/.test(addr.line1)) e.line1 = "Enter a street address with a number.";
        if (!addr.city.trim()) e.city = "Required.";
        if (!STATES.includes(addr.state)) e.state = "Choose a state.";
        if (!/^\d{5}(-\d{4})?$/.test(addr.zip.trim())) e.zip = "Use a 5-digit ZIP.";
        if (addr.phone && addr.phone.replace(/\D/g, "").length < 10) e.phone = "Use a 10-digit number, or leave it blank.";
      } else {
        if (pickup.name.trim().length < 2) e.pickupName = "Who's picking up?";
        if (pickup.phone.replace(/\D/g, "").length < 10) e.pickupPhone = "We text you when it's ready — 10 digits.";
      }
    }
    setErrors(e);
    if (Object.keys(e).length) return focusFirstError();
    if (step === 3) {
      const ce = card.validate();
      if (Object.keys(ce).length) return focusFirstError();
    }
    setStep((s) => Math.min(4, s + 1));
  };

  const pay = async () => {
    const ce = card.validate();
    if (Object.keys(ce).length) {
      setStep(3);
      return;
    }
    setPaying(true);
    const { brand, last4 } = card.result();
    const draft: CheckoutDraft = {
      email,
      marketing,
      delivery,
      address: delivery === "ship" ? addr : undefined,
      shippingMethod: method,
      giftMessage: state.gift?.on ? state.gift.message : undefined,
      promo: state.promo,
    };
    const order = await commerce.placeOrder(state.lines, draft, { token: `tok_demo_${Date.now().toString(36)}`, brand: brand === "amex" ? "Amex" : brand === "mastercard" ? "Mastercard" : "Visa", last4 });
    card.wipe();
    try {
      window.sessionStorage.setItem(ORDER_KEY, JSON.stringify({ ...order, gift: !!state.gift?.on, pickupName: delivery === "pickup" ? pickup.name : undefined }));
    } catch {
      /* the success page falls back gracefully */
    }
    router.push("/checkout/success");
    window.setTimeout(() => cart.clear(), 400);
  };

  const field = (k: keyof Address, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className={props.className}>
      <label htmlFor={`a-${k}`} className="label">
        {label}
      </label>
      <input
        id={`a-${k}`}
        {...props}
        className="field"
        value={(addr[k] as string) ?? ""}
        onChange={(ev) => {
          setAddr({ ...addr, [k]: ev.target.value });
          if (errors[k]) setErrors({ ...errors, [k]: undefined });
        }}
        aria-invalid={!!errors[k]}
        aria-describedby={errors[k] ? `a-${k}-err` : undefined}
      />
      {errors[k] && (
        <p id={`a-${k}-err`} className="err">
          {errors[k]}
        </p>
      )}
    </div>
  );

  const summary = (
    <OrderSummary priced={priced} methodLabel={shippingMethods.find((m) => m.id === method)!.label} showTax={step >= 2} delivery={delivery} />
  );

  return (
    <>
      <div className="border-b border-line bg-sand">
        <p className="container-x t-mono py-2.5 text-center text-[0.62rem] leading-relaxed">
          Demo store — no payment is taken. Test card 4242 4242 4242 4242. The card form is a design only; nothing you type leaves this page.
        </p>
      </div>

      {/* Mobile summary accordion */}
      <div className="border-b border-line bg-paper lg:hidden">
        <button type="button" onClick={() => setSummaryOpen((o) => !o)} aria-expanded={summaryOpen} aria-controls="m-summary" className="container-x flex w-full items-center justify-between py-4">
          <span className="inline-flex items-center gap-2 text-sm">
            {summaryOpen ? "Hide" : "Show"} order summary <IconChevron size={16} className={clsx("transition-transform", summaryOpen && "rotate-180")} />
          </span>
          <span className="t-price">{mounted ? money2(priced.total) : "—"}</span>
        </button>
        <div id="m-summary" className={clsx("grid transition-[grid-template-rows] duration-500", summaryOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
          <div className="overflow-hidden" inert={!summaryOpen}>
            <div className="container-x pb-6">{summary}</div>
          </div>
        </div>
      </div>

      <div className="container-x grid gap-12 py-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16 lg:py-14">
        <div ref={panel}>
          {/* Express */}
          <div>
            <p className="t-mono text-center text-muted">Express checkout</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { id: "Apple Pay", cls: "bg-black text-white", label: "Apple Pay" },
                { id: "Google Pay", cls: "border border-line bg-white text-[#3c4043]", label: "G Pay" },
                { id: "PayPal", cls: "bg-[#ffc439] text-[#003087]", label: "PayPal" },
              ].map((b) => (
                <button key={b.id} type="button" onClick={() => setExpress(b.id)} className={clsx("h-12 rounded-md font-semibold tracking-tight transition-transform active:scale-[0.98]", b.cls)} aria-label={`Pay with ${b.id}`}>
                  {b.label}
                </button>
              ))}
            </div>
            <div className="my-8 flex items-center gap-4 text-sm text-muted">
              <span className="h-px flex-1 bg-line" /> or pay with card <span className="h-px flex-1 bg-line" />
            </div>
          </div>

          <ol className="t-mono mb-6 flex flex-wrap gap-x-4 gap-y-1 text-[0.62rem]" aria-label="Checkout steps">
            {STEPS.map((s, i) => (
              <li key={s} className={clsx("flex items-center gap-1.5", i === step ? "text-char" : i < step ? "text-muted" : "text-muted/70")} aria-current={i === step ? "step" : undefined}>
                <span className={clsx("grid h-5 w-5 place-items-center rounded-full text-[0.55rem]", i < step ? "bg-char text-bone" : i === step ? "border border-char" : "border border-line")}>{i < step ? "✓" : i + 1}</span>
                {s}
              </li>
            ))}
          </ol>

          <div className="space-y-3">
            <Step i={0} step={step} title="Contact" onEdit={() => setStep(0)} done={<p>{email}</p>}>
              <div>
                <label htmlFor="email" className="label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className="field"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-err" : "email-hint"}
                />
                {errors.email ? (
                  <p id="email-err" className="err">
                    {errors.email}
                  </p>
                ) : (
                  <p id="email-hint" className="mt-1 text-xs text-muted">
                    For your receipt and tracking. Nothing is sent from this demo.
                  </p>
                )}
              </div>
              <label className="mt-4 flex items-center gap-3 text-sm">
                <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="h-4 w-4 accent-[#151513]" />
                Email me about new drops (about one a month)
              </label>
            </Step>

            <Step
              i={1}
              step={step}
              title="Delivery"
              onEdit={() => setStep(1)}
              done={
                delivery === "ship" ? (
                  <p>
                    {addr.firstName} {addr.lastName}, {addr.line1}
                    {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} {addr.zip}
                  </p>
                ) : (
                  <p>Pickup at Bishop Arts · {pickup.name}</p>
                )
              }
            >
              <div role="radiogroup" aria-label="Delivery method" className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["ship", "Ship to me", IconTruck],
                    ["pickup", "Pick up in store", IconStore],
                  ] as const
                ).map(([id, l, Icon]) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={delivery === id}
                    onClick={() => cart.setMode(id)}
                    className={clsx("flex items-center gap-3 rounded-lg border p-4 text-left transition-colors", delivery === id ? "border-char ring-1 ring-char" : "border-line hover:border-char")}
                  >
                    <Icon size={20} /> <span className="text-sm font-medium">{l}</span>
                  </button>
                ))}
              </div>
              {delivery === "ship" ? (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {field("firstName", "First name", { autoComplete: "given-name" })}
                  {field("lastName", "Last name", { autoComplete: "family-name" })}
                  {field("line1", "Address", { autoComplete: "address-line1", className: "col-span-2", placeholder: "Street and number" })}
                  {field("line2", "Apartment, suite (optional)", { autoComplete: "address-line2", className: "col-span-2" })}
                  {field("city", "City", { autoComplete: "address-level2" })}
                  <div>
                    <label htmlFor="a-state" className="label">
                      State
                    </label>
                    <select id="a-state" autoComplete="address-level1" value={addr.state} onChange={(e) => setAddr({ ...addr, state: e.target.value })} className="field" aria-invalid={!!errors.state}>
                      {STATES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  {field("zip", "ZIP code", { autoComplete: "postal-code", inputMode: "numeric" })}
                  {field("phone", "Phone (optional)", { autoComplete: "tel", inputMode: "tel" })}
                </div>
              ) : (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-sand p-4 text-sm sm:col-span-2">
                    <p className="font-medium">Ordova — Bishop Arts</p>
                    <p className="text-muted">
                      {site.address.street}, Dallas, TX {site.address.postal}. Ready in 2 hours; we&apos;ll text you. Free hemming while you&apos;re here.
                    </p>
                  </div>
                  <div>
                    <label htmlFor="p-name" className="label">
                      Name for pickup
                    </label>
                    <input id="p-name" autoComplete="name" value={pickup.name} onChange={(e) => setPickup({ ...pickup, name: e.target.value })} className="field" aria-invalid={!!errors.pickupName} aria-describedby={errors.pickupName ? "p-name-err" : undefined} />
                    {errors.pickupName && (
                      <p id="p-name-err" className="err">
                        {errors.pickupName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="p-phone" className="label">
                      Mobile number
                    </label>
                    <input id="p-phone" autoComplete="tel" inputMode="tel" value={pickup.phone} onChange={(e) => setPickup({ ...pickup, phone: e.target.value })} className="field" aria-invalid={!!errors.pickupPhone} aria-describedby={errors.pickupPhone ? "p-phone-err" : undefined} />
                    {errors.pickupPhone && (
                      <p id="p-phone-err" className="err">
                        {errors.pickupPhone}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </Step>

            <Step i={2} step={step} title="Shipping method" onEdit={() => setStep(2)} done={<p>{shippingMethods.find((m) => m.id === method)!.label} · {deliveryEstimate(method)}</p>}>
              <div role="radiogroup" aria-label="Shipping method" className="grid gap-2">
                {shippingMethods
                  .filter((m) => (delivery === "pickup" ? m.id === "pickup" : m.id !== "pickup"))
                  .map((m) => {
                    const cost = m.id === "standard" && priced.subtotal - priced.discount >= site.freeShippingThreshold ? 0 : m.price;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        role="radio"
                        aria-checked={method === m.id}
                        onClick={() => setMethod(m.id)}
                        className={clsx("flex items-center justify-between gap-4 rounded-lg border p-4 text-left transition-colors", method === m.id ? "border-char ring-1 ring-char" : "border-line hover:border-char")}
                      >
                        <span>
                          <span className="block text-sm font-medium">{m.label}</span>
                          <span className="block text-sm text-muted">
                            {mounted ? deliveryEstimate(m.id) : m.detail}
                          </span>
                        </span>
                        <span className="t-price">{cost === 0 ? "Free" : money(cost)}</span>
                      </button>
                    );
                  })}
              </div>
            </Step>

            <Step i={3} step={step} title="Payment" onEdit={() => setStep(3)} done={<p>Card ending {card.number.replace(/\D/g, "").slice(-4) || "••••"}</p>}>
              <p className="mb-5 inline-flex items-center gap-2 text-sm text-muted">
                <IconLock size={16} /> In a live store this is Stripe or Shopify&apos;s secure card field.
              </p>
              <CardForm form={card} />
            </Step>

            <Step i={4} step={step} title="Review & pay" onEdit={() => setStep(4)} done={null}>
              <dl className="grid gap-3 text-sm">
                <Row k="Contact" v={email} />
                <Row k={delivery === "ship" ? "Ship to" : "Pickup"} v={delivery === "ship" ? `${addr.firstName} ${addr.lastName}, ${addr.line1}, ${addr.city}, ${addr.state} ${addr.zip}` : `${pickup.name} · Bishop Arts`} />
                <Row k="Method" v={`${shippingMethods.find((m) => m.id === method)!.label} · ${deliveryEstimate(method)}`} />
                <Row k="Payment" v={`${card.brand === "amex" ? "Amex" : card.brand === "mastercard" ? "Mastercard" : "Visa"} ending ${card.number.replace(/\D/g, "").slice(-4)}`} />
                {state.gift?.on && <Row k="Gift" v={state.gift.message ? `Wrapped, with: “${state.gift.message}”` : "Gift-wrapped"} />}
              </dl>
              <button type="button" onClick={pay} disabled={paying} className="btn btn-cobalt btn-lg mt-6 w-full" aria-live="polite">
                {paying ? (
                  <>
                    <span className="h-4 w-4 animate-[spin_0.8s_linear_infinite] rounded-full border-2 border-bone/40 border-t-bone" aria-hidden="true" /> Processing…
                  </>
                ) : (
                  <>
                    <IconLock size={16} /> Pay {money2(priced.total)}
                  </>
                )}
              </button>
              <p className="mt-3 text-center text-xs text-muted">Demo: no card is charged and nothing is sent anywhere.</p>
            </Step>
          </div>

          {step < 4 && (
            <div className="mt-6 flex items-center justify-between gap-3">
              {step > 0 ? (
                <button type="button" className="t-mono link-u" onClick={() => setStep((s) => s - 1)}>
                  ← Back
                </button>
              ) : (
                <Link href="/cart" className="t-mono link-u">
                  ← Back to bag
                </Link>
              )}
              <button type="button" onClick={next} className="btn btn-solid btn-lg">
                Continue to {STEPS[step + 1].toLowerCase()}
              </button>
            </div>
          )}
        </div>

        <aside className="hidden lg:block" aria-label="Order summary">
          <div className="sticky top-8 rounded-lg bg-paper p-7">{summary}</div>
        </aside>
      </div>

      <Sheet open={!!express} onClose={() => setExpress(null)} label="Express pay disabled" variant="modal" className="md:!w-[28rem]">
        <SheetHeader title={express ?? ""} onClose={() => setExpress(null)} />
        <div className="p-6 md:p-8">
          <p className="t-h3">Demo store: express pay is disabled</p>
          <p className="mt-3 text-muted">
            On a live Ordova store, {express} opens its own secure sheet and fills your address and card in one tap. Here, use the card form with the test card 4242 4242 4242 4242.
          </p>
          <button type="button" className="btn btn-solid mt-6 w-full" onClick={() => setExpress(null)}>
            Got it
          </button>
        </div>
      </Sheet>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[6rem_1fr] gap-3 border-b border-line pb-3">
      <dt className="text-muted">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

function Step({ i, step, title, children, done, onEdit }: { i: number; step: number; title: string; children: ReactNode; done: ReactNode; onEdit: () => void }) {
  const active = i === step;
  const complete = i < step;
  return (
    <section data-step={i} className={clsx("rounded-lg border transition-colors duration-500", active ? "border-char bg-paper" : "border-line")} aria-labelledby={`step-${i}`}>
      <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-6">
        <h2 id={`step-${i}`} tabIndex={-1} className="flex items-center gap-3 font-medium focus:outline-none">
          <span className={clsx("grid h-6 w-6 place-items-center rounded-full text-xs", complete ? "bg-char text-bone" : active ? "bg-cobalt text-bone" : "bg-char/10")}>{complete ? <IconCheck size={14} /> : i + 1}</span>
          {title}
        </h2>
        {complete && (
          <button type="button" onClick={onEdit} className="t-mono link-u text-[0.62rem]" aria-label={`Edit ${title}`}>
            Edit
          </button>
        )}
      </div>
      {complete && done && <div className="-mt-2 px-5 pb-4 pl-14 text-sm text-muted md:px-6 md:pl-15">{done}</div>}
      <div className={clsx("grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]", active ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden" inert={!active}>
          <div className={clsx("px-5 pb-6 transition-[opacity,transform] duration-500 md:px-6", active ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0")}>{children}</div>
        </div>
      </div>
    </section>
  );
}

function OrderSummary({ priced, methodLabel, showTax, delivery }: { priced: ReturnType<typeof commerce.priceCart>; methodLabel: string; showTax: boolean; delivery: "ship" | "pickup" }) {
  return (
    <div>
      <ul className="space-y-4">
        {priced.lines.map(({ line, product, variant, total }) => (
          <li key={line.variantId} className="flex items-center gap-4">
            <div className="media relative h-20 w-16 shrink-0 overflow-visible rounded-sm">
              <Image src={product.colors.find((c) => c.name === variant.color)?.image ?? product.images[0].src} alt="" fill sizes="64px" className="rounded-sm object-cover" />
              <span className="t-mono absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-char px-1 text-[0.58rem] text-bone">{line.qty}</span>
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-medium">{product.name}</p>
              <p className="text-muted">
                {variant.color}
                {variant.size !== "One size" ? ` · ${variant.size}` : ""}
              </p>
            </div>
            <p className="t-price text-sm">{money(total)}</p>
          </li>
        ))}
      </ul>
      <div className="mt-6 border-t border-line pt-5">
        <PromoField />
      </div>
      <dl className="mt-5 space-y-2 border-t border-line pt-5 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd className="t-price">{money2(priced.subtotal)}</dd>
        </div>
        {priced.discount > 0 && (
          <div className="flex justify-between text-ok">
            <dt>Discount · {priced.promo?.code}</dt>
            <dd className="t-price">−{money2(priced.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt>{delivery === "pickup" ? "Pickup" : `Shipping · ${methodLabel}`}</dt>
          <dd className="t-price">{priced.shipping === 0 ? "Free" : money2(priced.shipping ?? 0)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Sales tax {showTax ? "(8.25% TX)" : ""}</dt>
          <dd className="t-price">{showTax ? money2(priced.tax) : "Next step"}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
          <dt>Total</dt>
          <dd className="t-price text-base">
            <span className="mr-1 text-xs font-normal text-muted">USD</span>
            {money2(priced.total)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
