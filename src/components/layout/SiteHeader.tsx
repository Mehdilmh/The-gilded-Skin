import Link from "next/link";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { primaryNav } from "@/lib/navigation";
import { SearchIcon } from "@/components/ui/icons";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-beige/80 bg-ivory/95 backdrop-blur supports-[backdrop-filter]:bg-ivory/85">
      <p className="bg-espresso px-4 py-2 text-center text-[0.72rem] tracking-[0.12em] text-ivory/90">
        <span className="hidden sm:inline">Independent, research-led beauty guides · </span>
        <Link href="/affiliate-disclosure" className="underline decoration-champagne underline-offset-2 hover:text-white">
          Reader-supported through affiliate links
        </Link>
      </p>
      <div className="container flex h-16 max-w-wide items-center justify-between gap-6 lg:h-20">
        <Logo />
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-7 text-[0.82rem] font-medium uppercase tracking-[0.12em]">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="py-2 text-espresso/85 transition-colors hover:text-champagne-dark">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1">
          <Link
            href="/search"
            className="inline-flex h-11 w-11 items-center justify-center rounded-pill text-espresso hover:bg-beige/60"
            aria-label="Search guides"
          >
            <SearchIcon />
          </Link>
          <MobileMenu items={primaryNav.map((i) => ({ href: i.href, label: i.label }))} />
        </div>
      </div>
    </header>
  );
}
