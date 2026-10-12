import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedArticles } from "@/lib/content";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { StarMark } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  const suggestions = getPublishedArticles().slice(0, 3);
  return (
    <div className="container max-w-wide py-20 md:py-28">
      <div className="mx-auto max-w-xl text-center">
        <StarMark className="mx-auto h-8 w-8 text-champagne" />
        <p className="eyebrow mt-6">Error 404</p>
        <h1 className="mt-4 font-serif text-display-sm md:text-display">This page has wandered off</h1>
        <p className="mt-6 text-lg leading-relaxed text-espresso/80">
          The page you&rsquo;re looking for may have moved or no longer exists. Try a search, or start with one of our guides.
        </p>
        <form action="/search" method="get" role="search" className="mx-auto mt-8 flex max-w-md gap-3">
          <label htmlFor="nf-q" className="sr-only">
            Search guides
          </label>
          <input id="nf-q" name="q" type="search" placeholder="Search guides" className="h-12 flex-1 rounded-pill border border-taupe/50 bg-white px-5" />
          <button type="submit" className="btn-primary h-12">
            Search
          </button>
        </form>
        <Link href="/" className="mt-6 inline-block link-underline">
          Back to the homepage
        </Link>
      </div>
      {suggestions.length > 0 && (
        <div className="mt-20 grid gap-10 md:grid-cols-3">
          {suggestions.map((a) => (
            <ArticleCard key={a.slug} article={a} headingLevel="h2" />
          ))}
        </div>
      )}
    </div>
  );
}
