import clsx from "clsx";
import { IconStar } from "./Icons";

/** Fractional star rating (decorative — pair it with a text rating). */
export function Stars({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={clsx("inline-flex", className)} aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="relative">
          <IconStar size={size} filled={false} className="opacity-25" />
          <span className="absolute inset-0 overflow-hidden" style={{ width: `${Math.max(0, Math.min(1, value - i)) * 100}%` }}>
            <IconStar size={size} />
          </span>
        </span>
      ))}
    </span>
  );
}
