import { site } from "./site";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export const fmtTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const hh = ((h + 11) % 12) + 1;
  return `${hh}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h < 12 ? "am" : "pm"}`;
};

/** Current weekday + minutes in Dallas (America/Chicago), independent of the visitor's timezone. */
function dallasNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, min: Number(get("hour")) * 60 + Number(get("minute")) };
}

export function openStatus(now = new Date()) {
  const { day, min } = dallasNow(now);
  const today = site.hours.find((h) => h.day === day)!;
  if (today.open && today.close && min >= toMin(today.open) && min < toMin(today.close)) {
    const left = toMin(today.close) - min;
    return { open: true, label: left <= 60 ? `Open · closes soon (${fmtTime(today.close)})` : `Open now · until ${fmtTime(today.close)}` };
  }
  // Find the next opening.
  for (let i = 0; i < 8; i++) {
    const d = (day + i) % 7;
    const h = site.hours.find((x) => x.day === d)!;
    if (!h.open) continue;
    if (i === 0 && min >= toMin(h.open)) continue;
    const when = i === 0 ? "today" : i === 1 ? "tomorrow" : DAYS[d];
    return { open: false, label: `Closed · opens ${when} ${fmtTime(h.open)}` };
  }
  return { open: false, label: "Closed" };
}

export const hoursTable = () =>
  [1, 2, 3, 4, 5, 6, 0].map((d) => {
    const h = site.hours.find((x) => x.day === d)!;
    return { day: DAYS[d], short: DAYS[d].slice(0, 3), text: h.open && h.close ? `${fmtTime(h.open)} – ${fmtTime(h.close)}` : "Closed (studio day)" };
  });
