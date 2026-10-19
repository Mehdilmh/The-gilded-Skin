import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, getCategory } from "@/lib/categories";
import { getAllProducts, getArticlesByCategory, getPublicProduct } from "@/lib/content";
import { ProductCard } from "@/components/affiliate/ProductCard";
import { AffiliateDisclosure } from "@/components/affiliate/AffiliateDisclosure";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { JsonLd } from "@/components/ui/JsonLd";
import { collectionPageJsonLd } from "@/lib/structured-data";
import { buildBrowseLink } from "@/lib/affiliate";
import { AFFILIATE_SHORT_DISCLOSURE, AMAZON_ASSOCIATE_DISCLOSURE } from "@/lib/site";
import { ExternalIcon } from "@/components/ui/icons";

// Re-render hourly so scheduled articles appear on their publish date without a rebuild.
export const revalidate = 3600;

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
  // The category's "start here" guide is featured first; the rest follow.
  const pillar = articles.find((a) => a.slug === category.pillar);
  const rest = pillar ? articles.filter((a) => a !== pillar) : articles;
  const others = categories.filter((c) => c.slug !== slug);
  const products = getAllProducts().filter((p) => p.category === slug && getPublicProduct(p.id));
  const browse = category.amazonBrowse ? buildBrowseLink(category.amazonBrowse.url) : null;

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
        {pillar && (
          <section aria-labelledby="start-here" className="mb-16 border-b border-beige pb-16" data-testid="category-pillar">
            <h2 id="start-here" className="eyebrow mb-6">
              Start here
            </h2>
            <div className="max-w-3xl">
              <ArticleCard article={pillar} variant="feature" headingLevel="h3" priority />
            </div>
          </section>
        )}
        {articles.length > 0 ? (
          <div className="grid gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((a, i) => (
              <ArticleCard key={a.slug} article={a} headingLevel="h2" priority={!pillar && i < 3} />
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
        {products.length > 0 && (
          <section aria-labelledby="selected-products" className="mx-auto mt-16 max-w-4xl">
            <h2 id="selected-products" className="font-serif text-3xl md:text-4xl">
              Selected {category.name.toLowerCase()} products
            </h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-espresso/80">
              Products we&rsquo;ve researched for this category, with their strengths, limitations and who may want to skip them.
            </p>
            <div className="mt-6">
              <AffiliateDisclosure hasAffiliateLinks context="page" />
            </div>
            {products.map((p) => (
              <ProductCard key={p.id} id={p.id} />
            ))}
          </section>
        )}
        {browse && category.amazonBrowse && (
          <aside aria-label="Shop on Amazon" className="mx-auto mt-6 max-w-xl rounded-card border border-beige bg-white p-6 text-center" data-testid="category-browse">
            <p className="text-sm leading-relaxed text-espresso/80">
              Prefer to browse on your own? You can explore the {category.name.toLowerCase()} selection on Amazon.
            </p>
            <a
              href={browse.href}
              rel={browse.rel}
              target="_blank"
              aria-label={browse.label}
              data-affiliate="amazon"
              data-track="affiliate_click"
              data-item={`category:${category.slug}`}
              data-placement="category-browse"
              className="btn-gold mt-4"
            >
              {category.amazonBrowse.label} <ExternalIcon />
            </a>
            <p className="mt-4 text-xs leading-relaxed text-taupe-dark">
              Affiliate link. {AFFILIATE_SHORT_DISCLOSURE.replace("This article contains affiliate links. ", "")} {AMAZON_ASSOCIATE_DISCLOSURE}
            </p>
          </aside>
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
