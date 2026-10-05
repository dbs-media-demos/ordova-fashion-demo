"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useUi } from "@/lib/store";
import { onIdle } from "@/lib/gsap";

/*
 * Cart drawer, quick view and search are code-split: they mount the first
 * time they're asked for, and their chunks are prefetched when the browser
 * is idle so the first open is still instant.
 */
const loadCart = () => import("@/components/cart/CartDrawer");
const loadShop = () => import("@/components/shop/Overlays");

const CartDrawer = dynamic(() => loadCart().then((m) => m.CartDrawer), { ssr: false });
const QuickView = dynamic(() => loadShop().then((m) => m.QuickView), { ssr: false });
const SearchOverlay = dynamic(() => loadShop().then((m) => m.SearchOverlay), { ssr: false });

export function LazyOverlays() {
  const { cartOpen, searchOpen, quickView } = useUi();
  const [want, setWant] = useState({ cart: false, search: false, quick: false });

  useEffect(() => {
    if (cartOpen || searchOpen || quickView) {
      setWant((w) => ({ cart: w.cart || cartOpen, search: w.search || searchOpen, quick: w.quick || !!quickView }));
    }
  }, [cartOpen, searchOpen, quickView]);

  useEffect(() => onIdle(() => void Promise.all([loadCart(), loadShop()]), 4000), []);

  return (
    <>
      {want.cart && <CartDrawer />}
      {want.quick && <QuickView />}
      {want.search && <SearchOverlay />}
    </>
  );
}
