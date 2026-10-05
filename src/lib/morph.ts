"use client";

/**
 * Shared-element morph from a product card into the product page hero.
 * Only the clicked card's image gets the `pdp-hero` view-transition name
 * (names must be unique per snapshot), and any previous holder is cleared.
 */
export const MORPH_NAME = "pdp-hero";

export function clearMorph() {
  document.querySelectorAll<HTMLElement>("[data-morph]").forEach((n) => {
    n.style.viewTransitionName = "";
    n.removeAttribute("data-morph");
  });
}

export function markMorph(el: HTMLElement | null) {
  if (!el || typeof document === "undefined" || !("startViewTransition" in document)) return;
  clearMorph();
  el.style.viewTransitionName = MORPH_NAME;
  el.setAttribute("data-morph", "");
}
