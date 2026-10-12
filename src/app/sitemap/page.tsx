import type { Metadata } from "next";
import Link from "next/link";
import { categories } from "@/lib/categories";
import { getArticlesByCategory } from "@/lib/content";
import { legalNav } from "@/lib/navigation";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = pageMetadata({
  title: "Sitemap",
  description: "Every published guide and page on The Gilded Skin, organized by category.",
  path: "/sitemap",
});

export default function HtmlSitemap() {
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Sitemap", path: "/sitemap" },
        ]}
        title="Sitemap"
        intro={<p>Every published guide and page, organized by category.</p>}
      />
      <div className="container grid max-w-wide gap-12 py-14 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => {
          const articles = getArticlesByCategory(c.slug);
          return (
            <section key={c.slug} aria-labelledby={`sm-${c.slug}`}>
              <h2 id={`sm-${c.slug}`} className="font-serif text-2xl">
                <Link href={`/category/${c.slug}`} className="hover:text-champagne-dark">
                  {c.name}
                </Link>
              </h2>
              <ul className="mt-4 space-y-2.5 text-[0.95rem]">
                {articles.map((a) => (
                  <li key={a.slug}>
                    <Link href={`/${a.slug}`} className="link-underline">
                      {a.title}
                    </Link>
                  </li>
                ))}
                {articles.length === 0 && <li className="text-taupe-dark">Guides coming soon.</li>}
              </ul>
            </section>
          );
        })}
        <section aria-labelledby="sm-pages">
          <h2 id="sm-pages" className="font-serif text-2xl">
            The publication
          </h2>
          <ul className="mt-4 space-y-2.5 text-[0.95rem]">
            {[{ href: "/", label: "Home" }, { href: "/blog", label: "All guides" }, { href: "/about", label: "About" }, { href: "/contact", label: "Contact" }, ...legalNav.filter((l) => l.href !== "/sitemap")].map(
              (l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-underline">
                    {l.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </section>
      </div>
    </>
  );
}
