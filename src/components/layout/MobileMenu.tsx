"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Built on <details> so the menu opens without JavaScript; the small client
 * layer only closes it after navigation and on Escape.
 */
export function MobileMenu({ items }: { items: { href: string; label: string }[] }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && ref.current?.open) {
        ref.current.open = false;
        ref.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <details ref={ref} className="group lg:hidden" data-testid="mobile-menu">
      <summary
        className="inline-flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-pill text-espresso hover:bg-beige/60 [&::-webkit-details-marker]:hidden"
        aria-label="Menu"
      >
        <span aria-hidden="true" className="relative block h-3 w-5">
          <span className="absolute left-0 top-0 h-px w-5 bg-current transition group-open:top-1.5 group-open:rotate-45" />
          <span className="absolute left-0 top-1.5 h-px w-5 bg-current transition group-open:opacity-0" />
          <span className="absolute left-0 top-3 h-px w-5 bg-current transition group-open:top-1.5 group-open:-rotate-45" />
        </span>
      </summary>
      <nav
        aria-label="Mobile"
        className="absolute inset-x-0 top-full border-b border-beige bg-ivory px-5 pb-8 pt-4 shadow-soft"
      >
        <ul className="divide-y divide-beige">
          {items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="block py-4 font-serif text-2xl text-espresso hover:text-champagne-dark">
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/search" className="block py-4 font-serif text-2xl text-espresso hover:text-champagne-dark">
              Search
            </Link>
          </li>
        </ul>
      </nav>
    </details>
  );
}
