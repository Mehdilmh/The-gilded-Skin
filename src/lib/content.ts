import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import GithubSlugger from "github-slugger";
import {
  articleFrontmatterSchema,
  authorSchema,
  imageRecordSchema,
  productSchema,
  type ArticleFrontmatter,
  type Author,
  type ImageRecord,
  type Product,
} from "./schemas";

export const CONTENT_DIR = path.join(process.cwd(), "content");
const ARTICLES_DIR = path.join(CONTENT_DIR, "articles");
const PRODUCTS_DIR = path.join(CONTENT_DIR, "products");

/** Top-level routes an article slug must never shadow. */
export const RESERVED_SLUGS = new Set([
  "about",
  "affiliate-disclosure",
  "api",
  "author",
  "og",
  "blog",
  "category",
  "contact",
  "cookie-policy",
  "editorial-policy",
  "pins",
  "privacy-policy",
  "search",
  "sitemap",
  "studio",
  "terms",
  "tag",
]);

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface Article extends ArticleFrontmatter {
  body: string;
  file: string;
  readingMinutes: number;
  wordCount: number;
  toc: TocItem[];
}

export class ContentError extends Error {}

function readDir(dir: string, ext: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(ext) && !f.startsWith("_"))
    .sort()
    .map((f) => path.join(dir, f));
}

/** Strip MDX components, code and link targets so prose metrics are honest. */
export function plainText(body: string): string {
  return body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
    // Keep reader-visible strings passed to components (table cells, checklist items).
    .replace(/<[A-Z][\s\S]*?\/>|<[A-Za-z][^>]*>/g, (tag) =>
      (tag.match(/"([^"\n]*)"/g) ?? [])
        .map((s) => s.slice(1, -1))
        .filter((s) => s.includes(" "))
        .join(". "),
    )
    .replace(/<\/[A-Za-z]+>/g, " ")
    .replace(/\{[^}]*\}/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`|~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractToc(body: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  let inFence = false;
  for (const line of body.split("\n")) {
    if (line.trim().startsWith("```")) inFence = !inFence;
    if (inFence) continue;
    const m = /^(##|###)\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const text = m[2]!.replace(/[*_`]/g, "");
    items.push({ id: slugger.slug(text), text, level: m[1] === "##" ? 2 : 3 });
  }
  return items;
}

export function parseArticle(raw: string, file: string): Article {
  const { data, content } = matter(raw);
  // gray-matter turns YAML dates into Date objects; normalize back to strings.
  for (const key of ["publishedAt", "updatedAt"]) {
    if (data[key] instanceof Date) data[key] = (data[key] as Date).toISOString().slice(0, 10);
  }
  if (data.editorialReview) {
    for (const key of ["factCheckedAt", "approvedAt"]) {
      const v = data.editorialReview[key];
      if (v instanceof Date) data.editorialReview[key] = v.toISOString().slice(0, 10);
    }
  }
  if (Array.isArray(data.sources)) {
    for (const s of data.sources) if (s.accessed instanceof Date) s.accessed = s.accessed.toISOString().slice(0, 10);
  }
  const parsed = articleFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new ContentError(`Invalid frontmatter in ${path.basename(file)}:\n${issues}`);
  }
  const fm = parsed.data;
  const expected = path.basename(file, ".mdx");
  if (fm.slug !== expected) {
    throw new ContentError(`Slug "${fm.slug}" must match file name "${expected}.mdx"`);
  }
  if (RESERVED_SLUGS.has(fm.slug)) {
    throw new ContentError(`Slug "${fm.slug}" is reserved by a site route`);
  }
  // Count everything the reader sees: body plus quick answer, takeaways and FAQ.
  const text = [plainText(content), fm.quickAnswer ?? "", ...fm.keyTakeaways, ...fm.faq.flatMap((f) => [f.question, f.answer])].join(" ");
  const stats = readingTime(text);
  return {
    ...fm,
    body: content,
    file,
    wordCount: stats.words,
    readingMinutes: Math.max(1, Math.round(stats.minutes)),
    toc: extractToc(content),
  };
}

let articleCache: Article[] | null = null;

export function getAllArticles(): Article[] {
  if (articleCache && process.env.NODE_ENV === "production") return articleCache;
  const articles = readDir(ARTICLES_DIR, ".mdx").map((file) => parseArticle(fs.readFileSync(file, "utf8"), file));
  articles.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : a.title.localeCompare(b.title)));
  articleCache = articles;
  return articles;
}

/** Today's date in UTC (YYYY-MM-DD). */
export function todayIso(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/**
 * Live on the site: published, and its publish date has arrived. A published
 * article with a future `publishedAt` is scheduled — hidden until that date.
 */
export function isPublic(article: Pick<Article, "status" | "publishedAt">, now: Date = new Date()): boolean {
  return article.status === "published" && article.publishedAt <= todayIso(now);
}

export function isScheduled(article: Pick<Article, "status" | "publishedAt">, now: Date = new Date()): boolean {
  return article.status === "published" && article.publishedAt > todayIso(now);
}

export function getPublishedArticles(): Article[] {
  return getAllArticles().filter((a) => isPublic(a));
}

export function getArticle(slug: string, opts: { includeDrafts?: boolean } = {}): Article | undefined {
  const article = getAllArticles().find((a) => a.slug === slug);
  if (!article) return undefined;
  if (!opts.includeDrafts && !isPublic(article)) return undefined;
  return article;
}

export function getArticlesByCategory(category: string): Article[] {
  return getPublishedArticles().filter((a) => a.category === category);
}

/** Explicit related articles first, then same-category, then shared tags. */
export function getRelatedArticles(article: Article, limit = 3): Article[] {
  const published = getPublishedArticles().filter((a) => a.slug !== article.slug);
  const explicit = article.relatedArticles
    .map((slug) => published.find((a) => a.slug === slug))
    .filter((a): a is Article => Boolean(a));
  const scored = published
    .filter((a) => !explicit.includes(a))
    .map((a) => ({
      a,
      score: (a.category === article.category ? 2 : 0) + a.tags.filter((t) => article.tags.includes(t)).length,
    }))
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .map((x) => x.a);
  return [...explicit, ...scored].slice(0, limit);
}

/* ------------------------------------------------------------------ */

let productCache: Product[] | null = null;
export function getAllProducts(): Product[] {
  if (productCache && process.env.NODE_ENV === "production") return productCache;
  productCache = readDir(PRODUCTS_DIR, ".json").map((file) => {
    const parsed = productSchema.safeParse(JSON.parse(fs.readFileSync(file, "utf8")));
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
      throw new ContentError(`Invalid product record ${path.basename(file)}:\n${issues}`);
    }
    if (parsed.data.id !== path.basename(file, ".json")) {
      throw new ContentError(`Product id "${parsed.data.id}" must match file name ${path.basename(file)}`);
    }
    return parsed.data;
  });
  return productCache;
}

export function getProduct(id: string): Product | undefined {
  return getAllProducts().find((p) => p.id === id);
}

/** Products a reader may see: published with a verified link. */
export function getPublicProduct(id: string): Product | undefined {
  const p = getProduct(id);
  return p && p.status === "published" && p.linkStatus === "verified" ? p : undefined;
}

/* ------------------------------------------------------------------ */

let imageCache: Map<string, ImageRecord> | null = null;
export function getImageRegistry(): Map<string, ImageRecord> {
  if (imageCache && process.env.NODE_ENV === "production") return imageCache;
  const raw = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, "images.json"), "utf8")) as unknown[];
  imageCache = new Map(
    raw.map((entry) => {
      const parsed = imageRecordSchema.safeParse(entry);
      if (!parsed.success) {
        throw new ContentError(
          `Invalid image record ${JSON.stringify((entry as { src?: string }).src)}: ${parsed.error.issues
            .map((i) => i.message)
            .join("; ")}`,
        );
      }
      return [parsed.data.src, parsed.data];
    }),
  );
  return imageCache;
}

export function getImage(src: string): ImageRecord | undefined {
  return getImageRegistry().get(src);
}

/* ------------------------------------------------------------------ */

let authorCache: Author[] | null = null;
export function getAuthors(): Author[] {
  if (authorCache) return authorCache;
  const raw = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, "authors.json"), "utf8")) as unknown[];
  authorCache = raw.map((a) => authorSchema.parse(a));
  return authorCache;
}

export function getAuthor(id: string): Author | undefined {
  return getAuthors().find((a) => a.id === id);
}

/** True when an article renders any affiliate link (verified product or tagged Amazon search). */
export function articleHasAffiliateLinks(article: Pick<Article, "products" | "body">): boolean {
  return article.products.some((id) => getPublicProduct(id)) || /<ShopOnAmazon\b/.test(article.body);
}
