import Link from "next/link";
import clsx from "clsx";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

export type Crumb = { name: string; path: string };

/** Visible breadcrumbs + BreadcrumbList JSON-LD. The last crumb is the current page. */
export function Breadcrumbs({ items, className, tone = "light" }: { items: Crumb[]; className?: string; tone?: "light" | "dark" }) {
  const all = [{ name: "Home", path: "/" }, ...items];
  return (
    <>
      <JsonLd data={breadcrumbSchema(all)} />
      <nav aria-label="Breadcrumb" className={clsx("t-mono text-[0.66rem]", tone === "dark" ? "text-bone/80" : "text-muted", className)}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {all.map((c, i) => (
            <li key={c.path} className="flex items-center gap-2">
              {i < all.length - 1 ? (
                <>
                  <Link href={c.path} className="link-u">
                    {c.name}
                  </Link>
                  <span aria-hidden="true">/</span>
                </>
              ) : (
                <span aria-current="page" className={tone === "dark" ? "text-bone" : "text-char"}>
                  {c.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
