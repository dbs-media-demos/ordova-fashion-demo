"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Wordmark } from "@/components/brand/Logo";
import { IconBag, IconHeart, IconMenu, IconSearch, IconClose, IconArrowUpRight } from "@/components/ui/Icons";
import { useCart, useUi, ui, useMounted, useWishlist } from "@/lib/store";
import { collections } from "@/content/taxonomy";
import { site } from "@/lib/site";

const MEGA = [
  {
    title: "Women",
    links: [
      ["All women", "/shop?dept=women"],
      ["Dresses", "/shop/dresses"],
      ["Shirts & tops", "/shop?dept=women&cat=tops"],
      ["Trousers & denim", "/shop?dept=women&cat=trousers"],
      ["Outerwear", "/shop?dept=women&cat=outerwear"],
    ],
  },
  {
    title: "Men",
    links: [
      ["All men", "/shop?dept=men"],
      ["Shirts", "/shop?dept=men&cat=tops"],
      ["Knitwear", "/shop/knitwear"],
      ["Trousers & denim", "/shop?dept=men&cat=trousers"],
      ["Outerwear", "/shop?dept=men&cat=outerwear"],
    ],
  },
  {
    title: "Accessories",
    links: [
      ["Bags", "/shop/bags"],
      ["Belts, scarves & hats", "/shop/accessories"],
      ["Gift cards", "/gift-cards"],
    ],
  },
] as const;

const NAV = [
  { label: "Women", href: "/shop?dept=women" },
  { label: "Men", href: "/shop?dept=men" },
  { label: "Lookbook", href: "/lookbook" },
  { label: "Studio", href: "/studio" },
  { label: "Visit", href: "/visit" },
];

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mega, setMega] = useState(false);
  const [menu, setMenu] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);
  const megaBtn = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number>(0);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > (isHome ? window.innerHeight * 0.7 : 24));
      setHidden(y > 320 && y > lastY + 4 ? true : y < lastY - 4 ? false : (h) => h);
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // Close menus on navigation.
  useEffect(() => {
    setMega(false);
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    if (!mega) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMega(false);
        megaBtn.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!megaRef.current?.contains(e.target as Node) && !megaBtn.current?.contains(e.target as Node)) setMega(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [mega]);

  // Checkout stays calm: logo, a way back, and a lock.
  if (pathname.startsWith("/checkout")) {
    return (
      <header className="vt-header fixed inset-x-0 top-0 z-[100] border-b border-line bg-bone">
        <div className="container-x grid h-[var(--header-h)] grid-cols-[1fr_auto_1fr] items-center">
          <Link href="/cart" className="t-mono link-u justify-self-start">
            ← Bag
          </Link>
          <Link href="/" aria-label="Ordova — home">
            <Wordmark className="text-[1.45rem]" />
          </Link>
          <span className="t-mono inline-flex items-center gap-2 justify-self-end text-muted">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <rect x="5" y="10.5" width="14" height="10" rx="1.5" />
              <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
            </svg>
            <span className="hidden sm:inline">Secure checkout</span>
          </span>
        </div>
      </header>
    );
  }

  const over = isHome && !scrolled && !mega;
  const openMega = () => {
    window.clearTimeout(closeTimer.current);
    setMega(true);
  };
  const scheduleClose = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMega(false), 180);
  };

  return (
    <>
      <header
        className={clsx(
          "vt-header fixed inset-x-0 top-0 z-[100] transition-[transform,background-color,color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          hidden && !mega && !menu ? "-translate-y-full" : "translate-y-0",
          over ? "bg-transparent text-bone" : "bg-bone/92 text-char shadow-[0_1px_0_rgb(21_21_19/0.08)] backdrop-blur-md",
        )}
      >
        <div className="container-x grid h-[var(--header-h)] grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* left */}
          <div className="flex items-center gap-1">
            <button type="button" className="icon-btn -ml-2 lg:hidden" aria-label="Open menu" aria-expanded={menu} onClick={() => setMenu(true)}>
              <IconMenu size={22} />
            </button>
            <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
              <button
                ref={megaBtn}
                type="button"
                className="t-mono link-u py-3"
                aria-expanded={mega}
                aria-controls="mega-menu"
                onClick={() => setMega((m) => !m)}
                onPointerEnter={(e) => e.pointerType === "mouse" && openMega()}
                onPointerLeave={(e) => e.pointerType === "mouse" && scheduleClose()}
              >
                Shop
              </button>
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="t-mono link-u py-3" aria-current={pathname === n.href ? "page" : undefined}>
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* logo */}
          <Link href="/" aria-label="Ordova — home" className="justify-self-center">
            <Wordmark className="text-[1.45rem] md:text-[1.7rem]" />
          </Link>

          {/* right */}
          <div className="flex items-center justify-end gap-0.5">
            <button type="button" className="icon-btn" aria-label="Search the shop" onClick={() => ui.openSearch()}>
              <IconSearch />
            </button>
            <WishLink />
            <BagButton />
          </div>
        </div>

        {/* Mega menu */}
        <div
          id="mega-menu"
          ref={megaRef}
          onPointerEnter={openMega}
          onPointerLeave={scheduleClose}
          className={clsx(
            "absolute inset-x-0 top-full hidden overflow-hidden bg-bone text-char lg:block",
            "transition-[clip-path] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
            mega ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]",
          )}
          inert={!mega}
        >
          <div className="container-x grid grid-cols-[1fr_1fr_1fr_1.1fr_1.6fr] gap-10 border-t border-line py-10">
            {MEGA.map((col, ci) => (
              <div key={col.title}>
                <p className="t-mono mb-4 text-muted">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map(([label, href], i) => (
                    <li
                      key={href}
                      className={clsx("transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]", mega ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0")}
                      style={{ transitionDelay: mega ? `${ci * 60 + i * 35}ms` : "0ms" }}
                    >
                      <Link href={href} className="link-u text-[1.05rem]">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <p className="t-mono mb-4 text-muted">Collections</p>
              <ul className="space-y-2.5">
                {collections.map((c, i) => (
                  <li
                    key={c.slug}
                    className={clsx("transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]", mega ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0")}
                    style={{ transitionDelay: mega ? `${180 + i * 35}ms` : "0ms" }}
                  >
                    <Link href={`/collections/${c.slug}`} className={clsx("link-u text-[1.05rem]", c.slug === "archive-sale" && "text-cobalt")}>
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { href: "/lookbook", img: "/images/ed/lookbook-01.jpg", k: "FW26", t: "The lookbook" },
                { href: "/collections/archive-sale", img: "/images/ed/lookbook-05.jpg", k: "Up to 30% off", t: "Archive Sale" },
              ].map((f, i) => (
                <Link key={f.href} href={f.href} className="group block" tabIndex={mega ? 0 : -1}>
                  <div
                    className={clsx(
                      "media aspect-[4/5] transition-[clip-path] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                      mega ? "[clip-path:inset(0_0_0_0)]" : "[clip-path:inset(100%_0_0_0)]",
                    )}
                    style={{ transitionDelay: mega ? `${120 + i * 90}ms` : "0ms" }}
                  >
                    <Image src={f.img} alt="" fill sizes="16vw" className="object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
                  </div>
                  <p className="t-mono mt-3 text-muted">{f.k}</p>
                  <p className="font-display text-lg font-bold uppercase">{f.t}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      <MobileMenu open={menu} onClose={() => setMenu(false)} />
    </>
  );
}

function WishLink() {
  const w = useWishlist();
  const mounted = useMounted();
  const n = mounted ? w.length : 0;
  return (
    <Link href="/wishlist" className="icon-btn relative hidden sm:inline-grid" aria-label={`Wishlist${n ? `, ${n} saved` : ""}`}>
      <IconHeart />
      {n > 0 && <span className="absolute right-1.5 top-2 h-1.5 w-1.5 rounded-full bg-cobalt" />}
    </Link>
  );
}

function BagButton() {
  const { lines } = useCart();
  const { bump } = useUi();
  const mounted = useMounted();
  const count = mounted ? lines.reduce((a, l) => a + l.qty, 0) : 0;
  return (
    <button type="button" className="icon-btn relative -mr-2" aria-label={`Bag, ${count} ${count === 1 ? "item" : "items"}`} onClick={() => ui.openCart()}>
      <span data-bag-icon className="relative grid place-items-center">
        <IconBag size={22} />
      </span>
      <span
        key={bump}
        className={clsx(
          "t-mono absolute right-0.5 top-1 grid h-[1.15rem] min-w-[1.15rem] place-items-center rounded-full px-1 text-[0.6rem] leading-none tracking-normal",
          count ? "bg-cobalt text-bone" : "bg-transparent text-transparent",
        )}
        style={bump ? { animation: "bag-bump 0.6s cubic-bezier(0.16,1,0.3,1)" } : undefined}
        aria-hidden="true"
      >
        {count || ""}
      </span>
    </button>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    document.documentElement.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("button, a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panel.current) {
        const items = Array.from(panel.current.querySelectorAll<HTMLElement>("a, button"));
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [open, onClose]);

  const links = [
    ["Shop all", "/shop"],
    ["Women", "/shop?dept=women"],
    ["Men", "/shop?dept=men"],
    ["Accessories", "/shop/accessories"],
    ["Archive Sale", "/collections/archive-sale"],
    ["Lookbook", "/lookbook"],
    ["The studio", "/studio"],
    ["Visit the store", "/visit"],
  ];

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      inert={!open}
      className={clsx(
        "theme-char fixed inset-0 z-[150] flex flex-col overflow-y-auto transition-[clip-path] duration-700 ease-[cubic-bezier(0.87,0,0.13,1)] lg:hidden",
        open ? "[clip-path:circle(150%_at_1.5rem_2rem)]" : "pointer-events-none [clip-path:circle(0%_at_1.5rem_2rem)]",
      )}
    >
      <div className="container-x flex h-[var(--header-h)] items-center justify-between">
        <Wordmark className="text-[1.45rem]" />
        <button type="button" className="icon-btn -mr-2" aria-label="Close menu" onClick={onClose}>
          <IconClose size={22} />
        </button>
      </div>
      <nav aria-label="Mobile" className="container-x flex-1 pt-6">
        <ul>
          {links.map(([label, href], i) => (
            <li key={href} className="overflow-hidden border-b border-line-lt">
              <Link
                href={href}
                onClick={onClose}
                className={clsx(
                  "flex items-center justify-between py-3.5 font-display text-[2rem] font-extrabold uppercase leading-none tracking-tight transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  open ? "translate-y-0" : "translate-y-full",
                  label === "Archive Sale" && "text-cobalt-lt",
                )}
                style={{ transitionDelay: open ? `${200 + i * 45}ms` : "0ms" }}
              >
                {label}
                <IconArrowUpRight size={22} className="opacity-50" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="container-x space-y-2 py-8 text-sm text-mist">
        <p>{site.address.street}, Bishop Arts, Dallas</p>
        <p>
          <a href={site.phoneHref} className="link-line text-bone">
            {site.phone}
          </a>
        </p>
      </div>
    </div>
  );
}
