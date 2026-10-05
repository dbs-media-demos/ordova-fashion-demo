import clsx from "clsx";

const R = 38.5;
const C = 2 * Math.PI * R;
const GAP = 10;

/**
 * The Ordova aperture: a heavy ring with a pattern notch cut at 12 o'clock —
 * part tailor's notch, part swing-tag hole. It doubles as the "O" in the wordmark.
 */
export function Ring({ className, notch = true, title }: { className?: string; notch?: boolean; title?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <circle
        cx="50"
        cy="50"
        r={R}
        fill="none"
        stroke="currentColor"
        strokeWidth="21"
        transform="rotate(-90 50 50)"
        strokeDasharray={notch ? `${C - GAP} ${GAP}` : undefined}
        strokeDashoffset={notch ? -GAP / 2 : undefined}
      />
    </svg>
  );
}

/** ORDOVA wordmark: live text in Syne ExtraBold with the ring as its first letter. */
export function Wordmark({ className, ringClassName }: { className?: string; ringClassName?: string }) {
  return (
    <span className={clsx("inline-flex items-center font-display font-extrabold uppercase leading-none tracking-[-0.02em]", className)}>
      <Ring className={clsx("mr-[0.06em] h-[0.74em] w-[0.74em] shrink-0", ringClassName)} />
      <span aria-hidden="true">rdova</span>
      <span className="sr-only">Ordova</span>
    </span>
  );
}
