"use client";

import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import type { Product } from "@/lib/commerce/types";
import { Sheet } from "@/components/ui/Sheet";
import { MORPH_NAME, clearMorph } from "@/lib/morph";
import { IconClose, IconZoom } from "@/components/ui/Icons";

type Shot = { src: string; alt: string; focal?: string; detail?: boolean };

export function shotsFor(p: Product, color: string): Shot[] {
  const c = p.colors.find((x) => x.name === color) ?? p.colors[0];
  const first = c.image;
  const list: Shot[] = [{ src: first, alt: `${p.name} in ${c.name} — ${p.images[0].alt}`, focal: p.images[0].focal }];
  list.push({ src: p.images[1].src, alt: p.images[1].alt, focal: p.images[1].focal });
  list.push({ src: first, alt: `${p.name} — fabric and construction detail`, focal: p.images[0].focal, detail: true });
  return list;
}

export type GalleryHandle = { hero: () => HTMLElement | null };

/**
 * Product gallery. Desktop: a vertical stack that scrolls beside the sticky
 * buy box, with a hover magnifier. Mobile: a swipeable strip with dots.
 * Any image opens a fullscreen viewer (swipe between shots, tap to zoom).
 * Changing colour wipes the new hero in from the swatch side.
 */
export const Gallery = forwardRef<GalleryHandle, { product: Product; color: string }>(function Gallery({ product: p, color }, ref) {
  const heroD = useRef<HTMLDivElement>(null);
  const heroM = useRef<HTMLDivElement>(null);
  const visibleHero = () => (heroD.current?.offsetParent ? heroD.current : heroM.current);
  const strip = useRef<HTMLDivElement>(null);
  const [full, setFull] = useState<number | null>(null);
  const [slide, setSlide] = useState(0);
  const [prev, setPrev] = useState<{ color: string; k: number }>({ color, k: 0 });
  const [shownColor, setShownColor] = useState(color);
  const shots = shotsFor(p, color);
  const prevShots = shotsFor(p, prev.color);

  useImperativeHandle(ref, () => ({ hero: visibleHero }));

  // Shared-element morph target: the visible hero holds the view-transition name.
  useLayoutEffect(() => {
    const el = visibleHero();
    if (!el) return;
    clearMorph();
    el.style.viewTransitionName = MORPH_NAME;
    el.setAttribute("data-morph", "");
    return () => {
      el.style.viewTransitionName = "";
    };
  }, []);

  if (color !== shownColor) {
    setPrev({ color: shownColor, k: prev.k + 1 });
    setShownColor(color);
  }

  const onStrip = () => {
    const el = strip.current;
    if (!el) return;
    setSlide(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div>
      {/* Mobile: swipe strip */}
      <div className="relative md:hidden">
        <div ref={strip} onScroll={onStrip} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto" aria-label="Product images" role="region">
          {shots.map((s, i) => (
            <button
              key={`${s.src}-${i}`}
              type="button"
              onClick={() => setFull(i)}
              className="relative aspect-[4/5] w-full shrink-0 snap-center"
              aria-label={`Open image ${i + 1} of ${shots.length} fullscreen`}
            >
              <div ref={i === 0 ? heroM : undefined} className="media absolute inset-0">
                {i === 0 && prev.k > 0 && <Image src={prevShots[0].src} alt="" fill sizes="100vw" className="object-cover" />}
                <span key={i === 0 ? `${color}-${prev.k}` : undefined} className="absolute inset-0" style={i === 0 && prev.k ? { animation: "swatch-wipe 0.9s cubic-bezier(0.16,1,0.3,1) both" } : undefined}>
                  <Shot s={s} sizes="100vw" priority={i === 0} />
                </span>
              </div>
            </button>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5" aria-hidden="true">
          {shots.map((_, i) => (
            <span key={i} className={clsx("h-1 rounded-full bg-bone transition-all duration-500", slide === i ? "w-6 opacity-100" : "w-1.5 opacity-60")} />
          ))}
        </div>
      </div>

      {/* Desktop: vertical stack */}
      <div className="hidden gap-3 md:grid md:grid-cols-2">
        {shots.map((s, i) => (
          <Lens key={`${s.src}-${i}-${s.detail ? "d" : ""}`} s={s} className={i === 0 ? "col-span-2" : ""} onOpen={() => setFull(i)}>
            {i === 0 ? (
              <div ref={heroD} className="media absolute inset-0">
                {prev.k > 0 && <Image src={prevShots[0].src} alt="" fill sizes="60vw" className="object-cover" />}
                <span key={`${color}-${prev.k}`} className="absolute inset-0" style={prev.k ? { animation: "swatch-wipe 1s cubic-bezier(0.16,1,0.3,1) both" } : undefined}>
                  <Shot s={s} sizes="(min-width: 1024px) 58vw, 60vw" priority />
                </span>
              </div>
            ) : (
              <Shot s={s} sizes="(min-width: 1024px) 29vw, 30vw" />
            )}
          </Lens>
        ))}
      </div>

      <Sheet open={full !== null} onClose={() => setFull(null)} label={`${p.name} images`} variant="full" className="!bg-char">
        <FullViewer shots={shots} start={full ?? 0} onClose={() => setFull(null)} />
      </Sheet>
    </div>
  );
});

function Shot({ s, sizes, priority }: { s: Shot; sizes: string; priority?: boolean }) {
  return (
    <Image
      src={s.src}
      alt={s.alt}
      fill
      sizes={sizes}
      preload={priority}
      loading={priority ? "eager" : "lazy"}
      quality={priority ? 75 : 70}
      className={clsx("object-cover", s.detail && "scale-[2.1]")}
      style={{ objectPosition: s.focal, transformOrigin: s.detail ? "50% 38%" : undefined }}
    />
  );
}

/** Hover magnifier (desktop, fine pointers). */
function Lens({ s, children, className, onOpen }: { s: Shot; children: React.ReactNode; className?: string; onOpen: () => void }) {
  const box = useRef<HTMLButtonElement>(null);
  const [pt, setPt] = useState<{ x: number; y: number } | null>(null);
  const src = `/_next/image?url=${encodeURIComponent(s.src)}&w=1920&q=75`;
  return (
    <button
      ref={box}
      type="button"
      onClick={onOpen}
      data-cursor="Zoom"
      aria-label={`Open ${s.alt} fullscreen`}
      className={clsx("media group relative block aspect-[4/5] w-full cursor-zoom-in overflow-hidden rounded-[2px]", className)}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = box.current!.getBoundingClientRect();
        setPt({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      onPointerLeave={() => setPt(null)}
    >
      {children}
      {pt && !s.detail && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute z-10 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-bone/70 shadow-2xl"
          style={{
            left: `${pt.x}%`,
            top: `${pt.y}%`,
            backgroundImage: `url("${src}")`,
            backgroundSize: "280%",
            backgroundPosition: `${pt.x}% ${pt.y}%`,
          }}
        />
      )}
      <span className="t-mono absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-bone/85 px-3 py-1.5 text-[0.6rem] text-char opacity-0 transition-opacity group-hover:opacity-100">
        <IconZoom size={14} /> Fullscreen
      </span>
    </button>
  );
}

function FullViewer({ shots, start, onClose }: { shots: Shot[]; start: number; onClose: () => void }) {
  const rail = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number | null>(null);
  const [i, setI] = useState(start);
  useEffect(() => {
    const el = rail.current;
    if (el) el.scrollLeft = start * el.clientWidth;
  }, [start]);
  return (
    <div className="relative flex h-full flex-col text-bone">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="t-mono" aria-live="polite">
          {i + 1} / {shots.length}
        </span>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close fullscreen images">
          <IconClose size={22} />
        </button>
      </div>
      <div
        ref={rail}
        className="no-scrollbar flex flex-1 snap-x snap-mandatory overflow-x-auto"
        onScroll={(e) => setI(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        onKeyDown={(e) => {
          const el = rail.current!;
          if (e.key === "ArrowRight") el.scrollBy({ left: el.clientWidth, behavior: "smooth" });
          if (e.key === "ArrowLeft") el.scrollBy({ left: -el.clientWidth, behavior: "smooth" });
        }}
        tabIndex={0}
        aria-label="Images — use arrow keys to move"
        role="region"
      >
        {shots.map((s, k) => (
          <div key={k} className={clsx("relative h-full w-full shrink-0 snap-center", zoom === k ? "overflow-auto" : "overflow-hidden")} style={{ touchAction: "pan-x pan-y pinch-zoom" }}>
            <button
              type="button"
              className={clsx("relative block cursor-zoom-in", zoom === k ? "h-[200%] w-[200%] cursor-zoom-out" : "h-full w-full")}
              onClick={() => setZoom(zoom === k ? null : k)}
              aria-label={zoom === k ? "Zoom out" : "Zoom in"}
            >
              <Image src={s.src} alt={s.alt} fill sizes={zoom === k ? "200vw" : "100vw"} className={clsx("object-contain", s.detail && zoom !== k && "scale-150")} />
            </button>
          </div>
        ))}
      </div>
      <p className="t-mono py-3 text-center text-bone/70">Swipe · tap to zoom</p>
    </div>
  );
}
