import { getArticle, getPublishedArticles } from "@/lib/content";
import { renderPin } from "@/lib/social-images";

export const dynamic = "force-static";
export const dynamicParams = true;
// Re-render hourly so scheduled articles appear on their publish date without a rebuild.
export const revalidate = 3600;

export function generateStaticParams() {
  return getPublishedArticles().flatMap((a) => a.pinterest.pins.map((_, i) => ({ slug: a.slug, n: String(i + 1) })));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string; n: string }> }) {
  const { slug, n } = await params;
  const article = getArticle(slug);
  const pin = article?.pinterest.pins[Number(n) - 1];
  if (!article || !pin) return new Response("Not found", { status: 404 });
  return renderPin(article, pin);
}
