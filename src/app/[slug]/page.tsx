import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllArticles, getArticle, isPublic } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { ArticleView } from "@/components/article/ArticleView";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllArticles()
    .filter(isPublic)
    .map((a) => ({ slug: a.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return pageMetadata({
    title: article.seoTitle,
    description: article.metaDescription,
    path: `/${article.slug}`,
    image: `/og/${article.slug}`,
    imageAlt: article.title,
    type: "article",
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    noindex: article.indexing === "noindex",
  });
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  return <ArticleView article={article} />;
}
