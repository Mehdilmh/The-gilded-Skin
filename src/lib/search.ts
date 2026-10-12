import type { Article } from "./content";

/** Lightweight server-side search across published article fields. */
export function searchArticles(articles: Article[], query: string, limit = 20): Article[] {
  const terms = query
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1)
    .slice(0, 8);
  if (terms.length === 0) return [];
  const scored = articles.map((a) => {
    const fields: [string, number][] = [
      [a.title.toLowerCase(), 6],
      [a.primaryKeyword.toLowerCase(), 5],
      [a.secondaryKeywords.join(" ").toLowerCase(), 3],
      [a.tags.join(" ").toLowerCase(), 3],
      [a.excerpt.toLowerCase(), 2],
      [a.body.toLowerCase(), 1],
    ];
    let score = 0;
    for (const term of terms) {
      for (const [text, weight] of fields) if (text.includes(term)) score += weight;
    }
    return { a, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map((s) => s.a);
}
