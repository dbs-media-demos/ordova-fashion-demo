"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";

declare global {
  interface Window {
    __lenis?: { stop: () => void; start: () => void; resize: () => void; scrollTo: (t: number | string | HTMLElement, o?: object) => void };
  }
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let locks = 0;
function lockScroll() {
  if (locks++ === 0) {
    document.documentElement.style.overflow = "hidden";
    window.__lenis?.stop();
  }
}
function unlockScroll() {
  if (--locks <= 0) {
    locks = 0;
    document.documentElement.style.overflow = "";
    window.__lenis?.start();
  }
}

type Props = {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  /** right drawer, bottom sheet (mobile) / centred modal, or full-screen overlay */
  variant?: "drawer" | "modal" | "full" | "left";
  className?: string;
  /** Element to focus first (defaults to the first focusable element). */
  initialFocus?: React.RefObject<HTMLElement | null>;
};

/**
 * Accessible overlay: traps focus, closes on Esc or backdrop click, returns
 * focus to the trigger, locks scroll (and pauses Lenis). Keeps its content
 * mounted through the exit animation.
 */
export function Sheet({ open, onClose, label, children, variant = "drawer", className, initialFocus }: Props) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  // Mount → next frame show (so the enter transition runs); hide → unmount after exit.
  useEffect(() => {
    if (open) {
      returnTo.current = document.activeElement as HTMLElement | null;
      setMounted(true);
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
    const t = window.setTimeout(() => setMounted(false), 520);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!mounted || !open) return;
    lockScroll();
    const el = panel.current;
    const focusFirst = () => {
      const target = initialFocus?.current ?? el?.querySelector<HTMLElement>("[data-autofocus]") ?? el?.querySelector<HTMLElement>(FOCUSABLE);
      target?.focus({ preventScroll: true });
    };
    const t = window.setTimeout(focusFirst, 40);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab" || !el) return;
      const items = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null || n === document.activeElement);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (!el.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      unlockScroll();
      const back = returnTo.current;
      if (back && document.contains(back)) back.focus({ preventScroll: true });
    };
  }, [mounted, open, initialFocus]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[200]" data-state={shown ? "open" : "closed"}>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={clsx(
          "absolute inset-0 bg-char/45 backdrop-blur-[2px] transition-opacity duration-500",
          shown ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        data-lenis-prevent
        className={clsx(
          "absolute flex flex-col overflow-hidden bg-bone text-char shadow-2xl transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          variant === "drawer" && "inset-y-0 right-0 w-full max-w-[30rem]",
          variant === "drawer" && (shown ? "translate-x-0" : "translate-x-full"),
          variant === "left" && "inset-y-0 left-0 w-full max-w-[34rem]",
          variant === "left" && (shown ? "translate-x-0" : "-translate-x-full"),
          variant === "modal" &&
            "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-2xl md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[88vh] md:w-[min(64rem,calc(100vw-3rem))] md:-translate-x-1/2 md:rounded-2xl",
          variant === "modal" && (shown ? "translate-y-0 md:-translate-y-1/2 md:opacity-100" : "translate-y-full md:-translate-y-[46%] md:opacity-0"),
          variant === "full" && "inset-0",
          variant === "full" && (shown ? "opacity-100" : "opacity-0"),
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ title, onClose, children }: { title: ReactNode; onClose: () => void; children?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3 md:px-7">
      <div className="t-mono flex items-center gap-3">{title}</div>
      <div className="flex items-center gap-1">
        {children}
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
