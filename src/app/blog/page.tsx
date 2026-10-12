import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedArticles } from "@/lib/content";
import { categories } from "@/lib/categories";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { JsonLd } from "@/components/ui/JsonLd";
import { collectionPageJsonLd } from "@/lib/structured-data";

const title = "All Beauty Guides";
const description =
  "Every guide from The Gilded Skin: research-led beauty tool comparisons, skincare routine basics, vanity organization and thoughtful gift ideas.";

export const metadata: Metadata = pageMetadata({ title, description, path: "/blog" });

export default function BlogPage() {
  const articles = getPublishedArticles();
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "Home", path: "/" },
          { name: "All guides", path: "/blog" },
        ]}
        eyebrow="The journal"
        title={title}
        intro={<p>{description}</p>}
      />
      <div className="container max-w-wide">
        <nav aria-label="Categories" className="border-b border-beige py-6">
          <ul className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className="inline-block rounded-pill border border-espresso/20 px-4 py-2 text-sm hover:border-espresso hover:bg-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="grid gap-x-10 gap-y-16 py-14 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((a, i) => (
            <ArticleCard key={a.slug} article={a} headingLevel="h2" priority={i < 3} />
          ))}
        </div>
      </div>
      <JsonLd data={collectionPageJsonLd(title, description, "/blog", articles)} />
    </>
  );
}
