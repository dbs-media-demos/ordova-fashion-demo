import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

const base = ({ size = 20, ...p }: P) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
  ...p,
});

export const IconBag = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 8h14l-1.2 12.1a1 1 0 0 1-1 .9H7.2a1 1 0 0 1-1-.9L5 8Z" />
    <path d="M9 10V6.5a3 3 0 0 1 6 0V10" />
  </svg>
);
export const IconSearch = (p: P) => (
  <svg {...base(p)}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m20 20-4.8-4.8" />
  </svg>
);
export const IconHeart = ({ filled, ...p }: P & { filled?: boolean }) => (
  <svg {...base(p)} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20s-7.5-4.6-7.5-10.1A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" />
  </svg>
);
export const IconClose = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const IconMenu = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.5 8h17M3.5 16h17" />
  </svg>
);
export const IconArrow = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const IconArrowUpRight = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);
export const IconChevron = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const IconPlus = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IconMinus = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12h14" />
  </svg>
);
export const IconPhone = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 4h3.5l1.7 4.3-2.2 1.4a11 11 0 0 0 6.3 6.3l1.4-2.2L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4Z" />
  </svg>
);
export const IconPin = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21s-6.5-5.4-6.5-11a6.5 6.5 0 0 1 13 0c0 5.6-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.3" />
  </svg>
);
export const IconTruck = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7" />
    <circle cx="6.5" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </svg>
);
export const IconStore = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 9.5V20h16V9.5M3 9.5l1.6-5h14.8l1.6 5M3 9.5h18M9.5 20v-5.5h5V20" />
  </svg>
);
export const IconReturn = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
  </svg>
);
export const IconCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);
export const IconStar = ({ filled = true, ...p }: P & { filled?: boolean }) => (
  <svg {...base(p)} fill={filled ? "currentColor" : "none"} strokeWidth={1.2}>
    <path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8L12 3.6Z" />
  </svg>
);
export const IconRuler = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 15.5 15.5 3 21 8.5 8.5 21 3 15.5Z" />
    <path d="m7.5 11 2 2M10.5 8l2 2M13.5 5l2 2M4.5 14l2 2" />
  </svg>
);
export const IconGift = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13" />
    <path d="M12 7c-1.5-3-5-3.5-5-1.5S10 7 12 7Zm0 0c1.5-3 5-3.5 5-1.5S14 7 12 7Z" />
  </svg>
);
export const IconLock = (p: P) => (
  <svg {...base(p)}>
    <rect x="5" y="10.5" width="14" height="10" rx="1.5" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
  </svg>
);
export const IconZoom = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
  </svg>
);
export const IconPlay = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M8 5.5v13l11-6.5-11-6.5Z" />
  </svg>
);
export const IconPause = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
  </svg>
);
export const IconInstagram = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="3.8" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
  </svg>
);
