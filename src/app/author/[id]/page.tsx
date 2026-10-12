import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAuthor, getAuthors, getPublishedArticles } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { authorPageJsonLd } from "@/lib/structured-data";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AuthorAvatar } from "@/components/ui/AuthorAvatar";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { JsonLd } from "@/components/ui/JsonLd";
import Link from "next/link";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAuthors()
    .filter((a) => a.isRealPerson)
    .map((a) => ({ id: a.id }));
}

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const author = getAuthor(id);
  if (!author) return {};
  return pageMetadata({
    title: `${author.name}, ${author.role}`,
    description: author.bio.slice(0, 155).replace(/\s\S*$/, "") + "…",
    path: `/author/${author.id}`,
  });
}

export default async function AuthorPage({ params }: Params) {
  const { id } = await params;
  const author = getAuthor(id);
  if (!author || !author.isRealPerson) notFound();
  const articles = getPublishedArticles().filter((a) => a.author === author.id || a.reviewer === author.id);

  return (
    <>
      <header className="border-b border-beige bg-gradient-to-b from-white/60 to-ivory">
        <div className="container max-w-wide pb-14 pt-10 md:pb-20 md:pt-14">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "About", path: "/about" },
              { name: author.name, path: `/author/${author.id}` },
            ]}
          />
          <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-center">
            <AuthorAvatar author={author} size="lg" />
            <div>
              <p className="eyebrow">{author.role}</p>
              <h1 className="mt-3 font-serif text-display-sm md:text-display">{author.name}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-espresso/80">{author.bio}</p>
              {author.focus.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-2" aria-label="Writes about">
                  {author.focus.map((f) => (
                    <li key={f} className="rounded-pill border border-champagne/60 bg-white px-3 py-1 text-xs uppercase tracking-[0.12em] text-espresso/80">
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              {author.credentials.length > 0 && <p className="mt-4 text-sm">{author.credentials.join(" · ")}</p>}
              <p className="mt-6 text-sm text-taupe-dark">
                How {author.name.split(" ")[0]} researches: read our{" "}
                <Link href="/editorial-policy" className="link-underline">
                  editorial policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </header>
      <section aria-labelledby="by-author" className="container max-w-wide py-14">
        <h2 id="by-author" className="font-serif text-3xl md:text-4xl">
          Guides by {author.name}
        </h2>
        <div className="mt-10 grid gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </section>
      <JsonLd data={authorPageJsonLd(author)} />
    </>
  );
}
