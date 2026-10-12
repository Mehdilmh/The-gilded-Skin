import type { MetadataRoute } from "next";
import { getArticlesByCategory, getAuthors, getPublishedArticles } from "./content";
import { categories } from "./categories";
import { absoluteUrl } from "./site";

/** Static pages that should be indexed, with the date their content last changed. */
export const STATIC_PAGES: { path: string; lastModified: string }[] = [
  { path: "/", lastModified: "2026-10-12" },
  { path: "/blog", lastModified: "2026-10-12" },
  { path: "/about", lastModified: "2026-10-12" },
  { path: "/contact", lastModified: "2026-10-12" },
  { path: "/editorial-policy", lastModified: "2026-10-12" },
  { path: "/affiliate-disclosure", lastModified: "2026-10-12" },
  { path: "/privacy-policy", lastModified: "2026-10-12" },
  { path: "/terms", lastModified: "2026-10-12" },
  { path: "/cookie-policy", lastModified: "2026-10-12" },
  { path: "/sitemap", lastModified: "2026-10-12" },
];

export function buildSitemap(): MetadataRoute.Sitemap {
  const articles = getPublishedArticles().filter((a) => a.indexing === "index");
  const latest = articles.map((a) => a.updatedAt).sort().at(-1);
  return [
    ...STATIC_PAGES.map((p) => ({
      url: absoluteUrl(p.path),
      lastModified: p.path === "/" || p.path === "/blog" ? (latest ?? p.lastModified) : p.lastModified,
    })),
    ...categories
      .filter((c) => getArticlesByCategory(c.slug).length > 0)
      .map((c) => ({
        url: absoluteUrl(`/category/${c.slug}`),
        lastModified: getArticlesByCategory(c.slug)
          .map((a) => a.updatedAt)
          .sort()
          .at(-1),
      })),
    ...getAuthors()
      .filter((au) => au.isRealPerson && articles.some((a) => a.author === au.id))
      .map((au) => ({ url: absoluteUrl(`/author/${au.id}`), lastModified: latest })),
    ...articles.map((a) => ({
      url: absoluteUrl(`/${a.slug}`),
      lastModified: a.updatedAt,
      images: [absoluteUrl(a.featuredImage)],
    })),
  ];
}
