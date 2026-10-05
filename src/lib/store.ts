"use client";

/*
 * Tiny client stores (cart, wishlist, recently viewed, UI) built on
 * useSyncExternalStore. Persisted to localStorage with every access wrapped
 * in try/catch, so the shop still works with storage blocked.
 */

import { useSyncExternalStore } from "react";
import type { CartLine } from "@/lib/commerce/types";

function createStore<T>(key: string | null, initial: T) {
  let state = initial;
  let hydrated = false;
  const listeners = new Set<() => void>();

  const load = () => {
    if (hydrated || !key || typeof window === "undefined") return;
    hydrated = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) state = JSON.parse(raw) as T;
    } catch {
      /* storage blocked or corrupt — start empty */
    }
  };

  const persist = () => {
    if (!key) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  };

  return {
    get: () => {
      load();
      return state;
    },
    set(next: T | ((prev: T) => T)) {
      load();
      state = typeof next === "function" ? (next as (p: T) => T)(state) : next;
      persist();
      listeners.forEach((l) => l());
    },
    subscribe(l: () => void) {
      listeners.add(l);
      // Keep tabs in sync.
      const onStorage = (e: StorageEvent) => {
        if (key && e.key === key) {
          try {
            state = e.newValue ? JSON.parse(e.newValue) : initial;
          } catch {
            state = initial;
          }
          l();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(l);
        window.removeEventListener("storage", onStorage);
      };
    },
    initial,
  };
}

type Store<T> = ReturnType<typeof createStore<T>>;

function useStore<T>(store: Store<T>) {
  return useSyncExternalStore(store.subscribe, store.get, () => store.initial);
}

/* ─── cart ─── */

export type CartState = { lines: CartLine[]; promo?: string; gift?: { on: boolean; message: string }; mode: "ship" | "pickup" };
export const cartStore = createStore<CartState>("ordova-cart-v1", { lines: [], mode: "ship" });
export const useCart = () => useStore(cartStore);

export const cart = {
  add(variantId: string, slug: string, qty = 1) {
    cartStore.set((s) => {
      const hit = s.lines.find((l) => l.variantId === variantId);
      const lines = hit
        ? s.lines.map((l) => (l.variantId === variantId ? { ...l, qty: Math.min(l.qty + qty, 10) } : l))
        : [...s.lines, { variantId, slug, qty }];
      return { ...s, lines };
    });
  },
  setQty(variantId: string, qty: number) {
    cartStore.set((s) => ({
      ...s,
      lines: qty <= 0 ? s.lines.filter((l) => l.variantId !== variantId) : s.lines.map((l) => (l.variantId === variantId ? { ...l, qty: Math.min(qty, 10) } : l)),
    }));
  },
  remove(variantId: string) {
    let removed: { line: CartLine; index: number } | null = null;
    cartStore.set((s) => {
      const index = s.lines.findIndex((l) => l.variantId === variantId);
      if (index >= 0) removed = { line: s.lines[index], index };
      return { ...s, lines: s.lines.filter((l) => l.variantId !== variantId) };
    });
    return removed as { line: CartLine; index: number } | null;
  },
  restore(line: CartLine, index: number) {
    cartStore.set((s) => {
      const lines = [...s.lines];
      lines.splice(Math.min(index, lines.length), 0, line);
      return { ...s, lines };
    });
  },
  setPromo(code?: string) {
    cartStore.set((s) => ({ ...s, promo: code }));
  },
  setGift(gift: CartState["gift"]) {
    cartStore.set((s) => ({ ...s, gift }));
  },
  setMode(mode: CartState["mode"]) {
    cartStore.set((s) => ({ ...s, mode }));
  },
  clear() {
    cartStore.set({ lines: [], mode: "ship" });
  },
};

/* ─── wishlist ─── */

export const wishStore = createStore<string[]>("ordova-wishlist-v1", []);
export const useWishlist = () => useStore(wishStore);
export const toggleWish = (slug: string) =>
  wishStore.set((w) => (w.includes(slug) ? w.filter((s) => s !== slug) : [slug, ...w]));

/* ─── recently viewed ─── */

export const recentStore = createStore<string[]>("ordova-recent-v1", []);
export const useRecent = () => useStore(recentStore);
export const pushRecent = (slug: string) => recentStore.set((r) => [slug, ...r.filter((s) => s !== slug)].slice(0, 8));

/* ─── UI (not persisted) ─── */

export type Ui = {
  cartOpen: boolean;
  searchOpen: boolean;
  quickView: string | null;
  /** Live-region message for screen readers. */
  announce: string;
  /** Bumps whenever something lands in the bag (drives the icon bounce). */
  bump: number;
};
export const uiStore = createStore<Ui>(null, { cartOpen: false, searchOpen: false, quickView: null, announce: "", bump: 0 });
export const useUi = () => useStore(uiStore);
export const ui = {
  openCart: () => uiStore.set((u) => ({ ...u, cartOpen: true, searchOpen: false, quickView: null })),
  closeCart: () => uiStore.set((u) => ({ ...u, cartOpen: false })),
  openSearch: () => uiStore.set((u) => ({ ...u, searchOpen: true })),
  closeSearch: () => uiStore.set((u) => ({ ...u, searchOpen: false })),
  quickView: (slug: string | null) => uiStore.set((u) => ({ ...u, quickView: slug })),
  announce: (msg: string) => uiStore.set((u) => ({ ...u, announce: msg })),
  bump: () => uiStore.set((u) => ({ ...u, bump: u.bump + 1 })),
};

/** Hydration-safe "has mounted" flag for client-only values (counts, dates). */
const noop = () => () => {};
export const useMounted = () => useSyncExternalStore(noop, () => true, () => false);
