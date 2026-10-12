import { articleHasAffiliateLinks, getAuthor, getImage, getRelatedArticles, type Article } from "@/lib/content";
import { getCategory } from "@/lib/categories";
import { articleJsonLd, faqJsonLd } from "@/lib/structured-data";
import { MdxContent } from "./MdxContent";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { JsonLd } from "@/components/ui/JsonLd";
import { ArticleCard, articleTypeLabel } from "@/components/ui/ArticleCard";
import { KeyTakeaways, QuickAnswer } from "./Blocks";
import { AffiliateDisclosure } from "@/components/affiliate/AffiliateDisclosure";
import {
  ArticleDates,
  AuthorBox,
  Faq,
  HowWeResearched,
  PinterestShare,
  SourceList,
  TableOfContents,
} from "./ArticleParts";


/** Full article layout, shared by the public route and the dev-only draft preview. */
export function ArticleView({ article }: { article: Article }) {
  const category = getCategory(article.category)!;
  const author = getAuthor(article.author);
  const reviewer = article.reviewer ? getAuthor(article.reviewer) : undefined;
  const image = getImage(article.featuredImage);
  const related = getRelatedArticles(article);
  const hasAffiliateLinks = articleHasAffiliateLinks(article);

  return (
    <article>
      <header className="border-b border-beige bg-gradient-to-b from-white/70 to-ivory">
        <div className="container max-w-wide pt-8 md:pt-12">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: category.name, path: `/category/${category.slug}` },
              { name: article.title, path: `/${article.slug}` },
            ]}
          />
          <div className="grid gap-10 pb-12 pt-8 lg:grid-cols-12 lg:items-end lg:gap-14 lg:pb-16">
            <div className="lg:col-span-7">
              <p className="eyebrow">
                {articleTypeLabel(article.articleType)} · {category.name}
              </p>
              <h1 className="mt-4 font-serif text-[2.4rem] leading-[1.08] md:text-display">{article.title}</h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-espresso/80">{article.excerpt}</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <p className="text-sm">
                  By <span className="font-medium">{author?.name ?? "The Gilded Skin"}</span>
                  {reviewer && (
                    <>
                      {" "}
                      · Reviewed by <span className="font-medium">{reviewer.name}</span>
                    </>
                  )}
                </p>
                <ArticleDates article={article} />
              </div>
            </div>
            <div className="lg:col-span-5">
              <EditorialImage
                src={article.featuredImage}
                sizes="(min-width: 1024px) 40vw, 100vw"
                priority
                caption={article.imageCaption}
                showKindLabel
                imgClassName="rounded-card"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-wide">
        <div className="grid gap-12 py-12 lg:grid-cols-12 lg:gap-14">
          <aside className="order-2 hidden lg:order-1 lg:col-span-3 lg:block">
            <div className="sticky top-32 space-y-6">
              <TableOfContents items={article.toc} />
              <PinterestShare article={article} />
            </div>
          </aside>
          <div className="order-1 min-w-0 lg:order-2 lg:col-span-8 lg:col-start-5">
            <div className="max-w-prose space-y-8">
              <AffiliateDisclosure hasAffiliateLinks={hasAffiliateLinks} />
              {article.quickAnswer && <QuickAnswer>{article.quickAnswer}</QuickAnswer>}
              <KeyTakeaways items={article.keyTakeaways} />
              <div className="lg:hidden">
                <TableOfContents items={article.toc} />
              </div>
            </div>
            <div className="mt-10">
              <MdxContent source={article.body} />
            </div>
            <div className="max-w-prose">
              <Faq items={article.faq} />
              <HowWeResearched article={article} />
              <SourceList sources={article.sources} />
              <div className="mt-10 flex flex-wrap items-center gap-4 lg:hidden">
                <PinterestShare article={article} />
              </div>
              <AuthorBox author={author} reviewer={reviewer} />
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related" className="border-t border-beige bg-white/50 py-16">
          <div className="container max-w-wide">
            <h2 id="related" className="font-serif text-3xl md:text-4xl">
              Keep reading
            </h2>
            <div className="mt-10 grid gap-10 md:grid-cols-3">
              {related.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}

      <JsonLd data={articleJsonLd(article, author, image)} />
      <JsonLd data={faqJsonLd(article.faq)} />
    </article>
  );
}
