"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBag, IconPhone, IconSearch } from "@/components/ui/Icons";
import { site } from "@/lib/site";
import { ui, useCart, useMounted } from "@/lib/store";

/** Sticky mobile action bar: Call · Search · Shop · Bag. Hidden on product pages (they have a sticky add-to-bag) and checkout. */
export function MobileBar() {
  const pathname = usePathname();
  const { lines } = useCart();
  const mounted = useMounted();
  if (pathname.startsWith("/products/") || pathname.startsWith("/checkout")) return null;
  const count = mounted ? lines.reduce((a, l) => a + l.qty, 0) : 0;
  return (
    <div className="fixed inset-x-0 bottom-0 z-[95] border-t border-line bg-bone/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-2 px-3 py-2">
        <a href={site.phoneHref} className="icon-btn border border-line" aria-label={`Call the shop, ${site.phone}`}>
          <IconPhone />
        </a>
        <button type="button" className="icon-btn border border-line" aria-label="Search the shop" onClick={() => ui.openSearch()}>
          <IconSearch />
        </button>
        <Link href="/shop" className="btn btn-solid btn-sm">
          Shop the collection
        </Link>
        <button type="button" onClick={() => ui.openCart()} className="icon-btn relative border border-line" aria-label={`Open bag, ${count} items`}>
          <IconBag />
          {count > 0 && (
            <span className="t-mono absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-cobalt px-1 text-[0.6rem] text-bone" aria-hidden="true">
              {count}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
