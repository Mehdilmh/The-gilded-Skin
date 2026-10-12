import type { Metadata } from "next";
import { getPublishedArticles } from "@/lib/content";
import { searchArticles } from "@/lib/search";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { SearchIcon } from "@/components/ui/icons";

// Internal search results are never indexed.
export const metadata: Metadata = pageMetadata({
  title: "Search",
  description: "Search The Gilded Skin's beauty guides.",
  path: "/search",
  noindex: true,
});

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.slice(0, 100).trim() ?? "";
  const results = q ? searchArticles(getPublishedArticles(), q) : [];

  return (
    <>
      <PageHeader
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Search", path: "/search" },
        ]}
        title="Search the guides"
      />
      <div className="container max-w-wide py-12">
        <form action="/search" method="get" role="search" className="flex max-w-2xl gap-3">
          <label htmlFor="q" className="sr-only">
            Search guides
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            maxLength={100}
            placeholder="Try “gua sha”, “travel” or “sunscreen”"
            className="h-12 flex-1 rounded-pill border border-taupe/50 bg-white px-5 placeholder:text-taupe-dark focus:border-espresso"
          />
          <button type="submit" className="btn-primary h-12">
            <SearchIcon /> Search
          </button>
        </form>
        <div className="mt-12" aria-live="polite">
          {q && (
            <p className="text-sm text-taupe-dark">
              {results.length} {results.length === 1 ? "result" : "results"} for <strong className="text-espresso">“{q}”</strong>
            </p>
          )}
          {q && results.length === 0 && (
            <p className="mt-6 max-w-xl leading-relaxed">Nothing matched that search. Try a broader term, or browse all guides from the menu.</p>
          )}
          <div className="mt-8 grid gap-x-10 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {results.map((a) => (
              <ArticleCard key={a.slug} article={a} headingLevel="h2" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
