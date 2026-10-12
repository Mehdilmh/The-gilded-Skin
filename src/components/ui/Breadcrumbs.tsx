import Link from "next/link";
import type { Crumb } from "@/lib/structured-data";
import { breadcrumbJsonLd } from "@/lib/structured-data";
import { JsonLd } from "./JsonLd";

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-[0.14em] text-taupe-dark">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {items.map((c, i) => (
            <li key={c.path} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true" className="text-champagne">/</span>}
              {i === items.length - 1 ? (
                <span aria-current="page" className="text-espresso/80">{c.name}</span>
              ) : (
                <Link href={c.path} className="hover:text-espresso">
                  {c.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(items)} />
    </>
  );
}
