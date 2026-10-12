import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, getCategory } from "@/lib/categories";
import { getArticlesByCategory } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { JsonLd } from "@/components/ui/JsonLd";
import { collectionPageJsonLd } from "@/lib/structured-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  const articles = getArticlesByCategory(slug);
  return pageMetadata({
    title: category.seoTitle,
    description: category.description,
    path: `/category/${slug}`,
    image: category.image,
    imageAlt: category.imageAlt,
    // Thin category pages stay out of the index until they have real content.
    noindex: articles.length === 0,
  });
}

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();
  const articles = getArticlesByCategory(slug);
  const others = categories.filter((c) => c.slug !== slug);

  return (
    <>
      <PageHeader
        crumbs={[
          { name: "Home", path: "/" },
          { name: category.name, path: `/category/${slug}` },
        ]}
        eyebrow="Category"
        title={category.name}
        intro={<p>{category.intro}</p>}
      />
      <div className="container max-w-wide py-14">
        {articles.length > 0 ? (
          <div className="grid gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((a, i) => (
              <ArticleCard key={a.slug} article={a} headingLevel="h2" priority={i < 3} />
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-xl py-10 text-center">
            <h2 className="font-serif text-3xl">New guides are on the way</h2>
            <p className="mt-4 leading-relaxed text-espresso/80">
              We publish only after research and fact-checking are complete. In the meantime, browse{" "}
              <Link href="/blog" className="link-underline">
                all guides
              </Link>
              .
            </p>
          </div>
        )}
        <nav aria-label="Other categories" className="mt-20 border-t border-beige pt-10">
          <h2 className="eyebrow">Explore more</h2>
          <ul className="mt-5 flex flex-wrap gap-3">
            {others.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className="btn-secondary">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <JsonLd data={collectionPageJsonLd(category.name, category.description, `/category/${slug}`, articles)} />
    </>
  );
}
