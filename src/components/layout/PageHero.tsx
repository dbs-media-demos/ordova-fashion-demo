import type { ReactNode, CSSProperties } from "react";
import Image from "next/image";
import clsx from "clsx";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { LetterTitle } from "@/components/shop/ShopParts";

/** Standard inner-page header: breadcrumbs, kicker, a title that assembles letter by letter, intro, optional photo. */
export function PageHero({
  crumbs,
  kicker,
  title,
  intro,
  image,
  imageAlt = "",
  dark,
  children,
  size = "lg",
}: {
  crumbs: Crumb[];
  kicker?: string;
  title: string;
  intro?: ReactNode;
  image?: string;
  imageAlt?: string;
  dark?: boolean;
  children?: ReactNode;
  size?: "md" | "lg";
}) {
  return (
    <header className={clsx("relative overflow-hidden pb-14 pt-[calc(var(--header-h)+2rem)] md:pb-20", dark && "theme-char")}>
      <div className="container-x relative z-[1]">
        <Breadcrumbs items={crumbs} tone={dark ? "dark" : "light"} />
        <div className={clsx("mt-8 grid gap-10", image && "md:grid-cols-12 md:items-end")}>
          <div className={image ? "md:col-span-7" : undefined}>
            {kicker && <p className={clsx("t-mono anim-fade", dark ? "text-bone/80" : "text-muted")}>{kicker}</p>}
            <LetterTitle text={title} className={clsx("mt-3", size === "lg" ? "text-[clamp(2.1rem,8vw,8rem)]" : "text-[clamp(2rem,6vw,5.5rem)]")} />
            {intro && (
              <div className={clsx("anim-fade t-lead mt-6 max-w-xl text-pretty", dark ? "text-bone/85" : "text-muted")} style={{ "--d": "0.3s" } as CSSProperties}>
                {intro}
              </div>
            )}
            {children}
          </div>
          {image && (
            <div className="anim-rise media aspect-[4/5] overflow-hidden rounded-[2px] md:col-span-4 md:col-start-9" style={{ "--d": "0.15s" } as CSSProperties}>
              <Image src={image} alt={imageAlt} fill preload sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
