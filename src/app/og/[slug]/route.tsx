import { getArticle, getPublishedArticles } from "@/lib/content";
import { getCategory } from "@/lib/categories";
import { renderOgImage } from "@/lib/social-images";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedArticles().map((a) => ({ slug: a.slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return new Response("Not found", { status: 404 });
  const image = article.socialImage ?? article.featuredImage;
  return renderOgImage({ title: article.title, eyebrow: getCategory(article.category)?.name ?? "Beauty Guide", image });
}
