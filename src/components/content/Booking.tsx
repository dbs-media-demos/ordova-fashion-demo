"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { site } from "@/lib/site";
import { useMounted } from "@/lib/store";
import { IconCheck } from "@/components/ui/Icons";

const TYPES = [
  { id: "style", t: "Styling hour", d: "45 min in the shop with one of our team. Free.", mins: 45 },
  { id: "video", t: "Video styling", d: "30 min on a call — we pull pieces and show you fit live.", mins: 30 },
  { id: "fit", t: "Alterations fitting", d: "20 min with our seamstress for hems and adjustments.", mins: 20 },
] as const;

/** Styling appointment booking UI. Validates and confirms; sends nothing. */
export function Booking() {
  const mounted = useMounted();
  const [type, setType] = useState<(typeof TYPES)[number]["id"]>("style");
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const days = useMemo(() => {
    if (!mounted) return [];
    const out: { iso: string; label: string; dow: string; date: string }[] = [];
    const d = new Date();
    for (let i = 1; out.length < 10 && i < 20; i++) {
      const x = new Date(d);
      x.setDate(d.getDate() + i);
      const h = site.hours.find((hh) => hh.day === x.getDay());
      if (!h?.open) continue;
      out.push({
        iso: x.toISOString().slice(0, 10),
        label: x.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
        dow: x.toLocaleDateString("en-US", { weekday: "short" }),
        date: x.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
    }
    return out;
  }, [mounted]);

  const slots = useMemo(() => {
    if (!day) return [];
    const dow = new Date(day + "T12:00:00").getDay();
    const h = site.hours.find((x) => x.day === dow)!;
    const [oh] = h.open!.split(":").map(Number);
    const [ch] = h.close!.split(":").map(Number);
    const out: { t: string; free: boolean }[] = [];
    for (let hr = oh; hr < ch - 1; hr++)
      for (const m of [0, 30]) {
        const label = `${((hr + 11) % 12) + 1}:${m ? "30" : "00"} ${hr < 12 ? "am" : "pm"}`;
        const seed = (hr * 7 + m + dow * 13 + day.charCodeAt(9)) % 5;
        out.push({ t: label, free: seed !== 0 });
      }
    return out;
  }, [day]);

  if (done) {
    const t = TYPES.find((x) => x.id === type)!;
    return (
      <div className="rounded-lg bg-sand p-6 md:p-10" role="status">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-cobalt text-bone">
          <IconCheck size={22} />
        </span>
        <p className="t-h3 mt-5">You&apos;re booked, {form.name.split(" ")[0]}.</p>
        <p className="mt-3 max-w-md text-muted">
          {t.t} on {days.find((d) => d.iso === day)?.label} at {slot}. {type === "video" ? "We'd email a video link." : `See you at ${site.address.street}.`} This is a demo — nothing was sent.
        </p>
        <button
          type="button"
          className="btn btn-ghost mt-6"
          onClick={() => {
            setDone(false);
            setDay(null);
            setSlot(null);
          }}
        >
          Book another
        </button>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        const er: Record<string, string> = {};
        if (!day) er.day = "Pick a day.";
        if (!slot) er.slot = "Pick a time.";
        if (form.name.trim().length < 2) er.name = "Your name, please.";
        if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) er.email = "A valid email for the confirmation.";
        if (form.phone && form.phone.replace(/\D/g, "").length < 10) er.phone = "10 digits, or leave it blank.";
        setErrors(er);
        if (Object.keys(er).length) return;
        setDone(true);
      }}
    >
      <fieldset>
        <legend className="t-mono mb-3 text-muted">1 · What would you like?</legend>
        <div role="radiogroup" aria-label="Appointment type" className="grid gap-2 md:grid-cols-3">
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={type === t.id}
              onClick={() => setType(t.id)}
              className={clsx("rounded-lg border p-4 text-left transition-colors", type === t.id ? "border-char bg-char text-bone" : "border-line hover:border-char")}
            >
              <span className="block font-medium">{t.t}</span>
              <span className={clsx("mt-1 block text-sm", type === t.id ? "text-bone/75" : "text-muted")}>{t.d}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="t-mono mb-3 text-muted">2 · Pick a day</legend>
        <div role="radiogroup" aria-label="Day" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {!mounted
            ? Array.from({ length: 7 }, (_, i) => <span key={i} className="skel h-20 w-16 shrink-0" />)
            : days.map((d) => (
                <button
                  key={d.iso}
                  type="button"
                  role="radio"
                  aria-checked={day === d.iso}
                  onClick={() => {
                    setDay(d.iso);
                    setSlot(null);
                  }}
                  className={clsx("grid h-20 w-16 shrink-0 place-items-center rounded-lg border text-center transition-colors", day === d.iso ? "border-char bg-char text-bone" : "border-line hover:border-char")}
                >
                  <span>
                    <span className="t-mono block text-[0.6rem]">{d.dow}</span>
                    <span className="mt-1 block text-sm font-medium">{d.date}</span>
                  </span>
                </button>
              ))}
        </div>
        {errors.day && <p className="err">{errors.day}</p>}
      </fieldset>
      {day && (
        <fieldset className="anim-fade">
          <legend className="t-mono mb-3 text-muted">3 · Pick a time</legend>
          <div role="radiogroup" aria-label="Time" className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {slots.map((s) => (
              <button
                key={s.t}
                type="button"
                role="radio"
                aria-checked={slot === s.t}
                disabled={!s.free}
                onClick={() => setSlot(s.t)}
                className={clsx("t-mono min-h-11 rounded-lg border text-[0.7rem] tracking-normal transition-colors", !s.free ? "border-line text-[#8d897f] line-through" : slot === s.t ? "border-char bg-char text-bone" : "border-line hover:border-char")}
                aria-label={`${s.t}${s.free ? "" : ", booked"}`}
              >
                {s.t}
              </button>
            ))}
          </div>
          {errors.slot && <p className="err">{errors.slot}</p>}
        </fieldset>
      )}
      <fieldset>
        <legend className="t-mono mb-3 text-muted">4 · Your details</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["name", "Name", "name", "text"],
              ["email", "Email", "email", "email"],
              ["phone", "Phone (optional)", "tel", "tel"],
            ] as const
          ).map(([k, l, ac, t]) => (
            <div key={k} className={k === "name" ? "sm:col-span-2" : undefined}>
              <label htmlFor={`b-${k}`} className="label">
                {l}
              </label>
              <input
                id={`b-${k}`}
                type={t}
                autoComplete={ac}
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                className="field"
                aria-invalid={!!errors[k]}
                aria-describedby={errors[k] ? `b-${k}-err` : undefined}
              />
              {errors[k] && (
                <p id={`b-${k}-err`} className="err">
                  {errors[k]}
                </p>
              )}
            </div>
          ))}
          <div className="sm:col-span-2">
            <label htmlFor="b-notes" className="label">
              Anything we should pull for you? (optional)
            </label>
            <textarea id="b-notes" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="field resize-none" placeholder="An occasion, sizes you usually wear, pieces you've had your eye on…" />
          </div>
        </div>
      </fieldset>
      <button type="submit" className="btn btn-solid btn-lg w-full sm:w-auto" data-track="booking">
        Book the appointment
      </button>
    </form>
  );
}
