import { notFound } from "next/navigation";
import { getArticle } from "@/lib/content";
import { ArticleView } from "@/components/article/ArticleView";

export default async function DraftPreview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug, { includeDrafts: true });
  if (!article) notFound();
  return (
    <>
      <p className="mb-6 rounded-card border-2 border-dashed border-champagne p-4 text-sm">
        Draft preview — status <strong>{article.status}</strong>. Not linked, indexed or included in sitemaps.
      </p>
      <ArticleView article={article} />
    </>
  );
}
