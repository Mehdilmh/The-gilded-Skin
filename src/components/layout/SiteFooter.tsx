import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/categories";
import { legalNav } from "@/lib/navigation";
import { AMAZON_ASSOCIATE_DISCLOSURE, site } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const socials = [
    site.social.pinterest && { href: site.social.pinterest, label: "Pinterest" },
    site.social.instagram && { href: site.social.instagram, label: "Instagram" },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <footer className="mt-24 bg-espresso text-ivory/85">
      <div className="container max-w-wide py-16">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Image src="/brand/logo-mono-light.svg" alt="The Gilded Skin" width={573} height={76} unoptimized className="h-8 w-auto" />
            <p className="mt-6 max-w-sm font-serif text-xl leading-snug text-ivory">{site.promise}</p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-ivory/75">
              The Gilded Skin is an independent publication. We are not affiliated with, endorsed by or operated by Amazon or any brand we write about.
            </p>
          </div>
          <nav aria-label="Categories" className="md:col-span-2">
            <h2 className="eyebrow !text-champagne-light">Explore</h2>
            <ul className="mt-5 space-y-3 text-sm">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/category/${c.slug}`} className="hover:text-white">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/blog" className="hover:text-white">
                  All guides
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="About" className="md:col-span-2">
            <h2 className="eyebrow !text-champagne-light">The Publication</h2>
            <ul className="mt-5 space-y-3 text-sm">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/editorial-policy" className="hover:text-white">How we research</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              {socials.map((s) => (
                <li key={s.href}>
                  <a href={s.href} rel="me noopener" target="_blank" className="hover:text-white">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Legal" className="md:col-span-3">
            <h2 className="eyebrow !text-champagne-light">Policies</h2>
            <ul className="mt-5 space-y-3 text-sm">
              {legalNav.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-14 border-t border-ivory/15 pt-8 text-sm leading-relaxed">
          <p data-testid="amazon-disclosure" className="font-medium text-ivory">
            {AMAZON_ASSOCIATE_DISCLOSURE}
          </p>
          <p className="mt-2 text-ivory/70">
            Some links on this site are affiliate links. If you buy through them we may earn a commission at no additional cost to you.
            Content is for general information only and is not medical advice. Read our{" "}
            <Link href="/affiliate-disclosure" className="underline decoration-champagne underline-offset-2 hover:text-white">
              full disclosure
            </Link>
            .
          </p>
          <p className="mt-6 text-xs text-ivory/60">© {year} {site.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
