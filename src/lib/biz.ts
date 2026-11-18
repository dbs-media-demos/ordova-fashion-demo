import { site } from "./site";
import { type Biz } from "./biz-core";

export type { Biz } from "./biz-core";

/** The fictional store as a Biz: what the concept site shows (previews swap in a real one from the CRM). */
export const defaultBiz: Biz = {
  lang: "en",
  name: site.name,
  shortName: site.name,
  tagline: null,
  area: site.address.city,
  phone: site.phoneHref.replace(/^tel:/, ""),
  phoneDisplay: site.phone,
  address: {
    street: site.address.street,
    city: site.address.city,
    region: site.address.region,
    postal: site.address.postal,
    full: `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postal}`,
  },
  timezone: "America/Chicago",
  hours: site.hours.map((h) => ({ ...h })),
  hoursSummary: "Tue–Wed 11–7 · Thu–Sat till 8 · Sun 12–5",
  rating: { ...site.rating },
  preview: false,
  logo: null,
  areas: site.serviceArea.filter((a) => a !== "All 50 states"),
};
