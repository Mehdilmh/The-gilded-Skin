/**
 * Editorial quality controls. Used by `npm run audit:content`, the dev-only
 * /studio dashboard and the test suite. Errors on published content block a
 * release; warnings are surfaced for editors.
 */
import fs from "node:fs";
import path from "node:path";
import {
  ContentError,
  getAllArticles,
  getAllProducts,
  getImageRegistry,
  plainText,
  type Article,
} from "./content";
import { categories } from "./categories";
import { getAssociateTag, isAmazonUrl, isValidTag, validateAffiliateUrl } from "./affiliate";

export type Level = "error" | "warning" | "info";
export interface AuditIssue {
  level: Level;
  scope: string; // article slug, product id, image src or "site"
  code: string;
  message: string;
}

export interface AuditOptions {
  /** Treat launch-gate items (human approval) as errors. */
  launch?: boolean;
  today?: string;
}

/** Phrases implying firsthand testing or experience. Only allowed with documented hands-on testing. */
export const FABRICATED_EXPERIENCE_PATTERNS: RegExp[] = [
  /\bwe tested\b/i,
  /\bwe've tested\b/i,
  /\bour (lab|testing lab|testers?)\b/i,
  /\bin our tests?\b/i,
  /\bafter (using|testing) (it|this|them) for \d+/i,
  /\bI (tried|tested|used) (it|this|them)\b/i,
  /\bour editors? (tried|tested|loved)\b/i,
  /\bhands-on test(ing)? (showed|found|revealed)\b/i,
];

/** Claims that need strong support or should not appear at all. */
export const RISKY_CLAIM_PATTERNS: RegExp[] = [
  /\bguarantee[sd]?\b/i,
  /\bclinically proven\b/i,
  /\bcures?\b/i,
  /\bmiracle\b/i,
  /\bdermatologist[- ]approved\b/i,
  /\b(heals?|treats?) (acne|eczema|rosacea|psoriasis)\b/i,
  /\b#1\b|\bnumber one\b|\bbest[- ]selling\b|\bbestseller\b/i,
  /\$\s?\d/,
];

const INTERNAL_LINK = /\]\((\/[^)\s#?]*)(?:[#?][^)]*)?\)/g;
const ANY_LINK = /\]\((https?:\/\/[^)\s]+)\)/g;
const JSX_HREF = /href="(\/[^"#?]*)/g;
const FIGURE_SRC = /<Figure[^>]*src="([^"]+)"/g;
const PRODUCT_REF = /<Product(?:Card|Comparison)[^>]*?(?:id="([^"]+)"|ids=\{\[([^\]]*)\]\})/g;

function shingles(text: string, size = 5): Set<string> {
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  const out = new Set<string>();
  for (let i = 0; i + size <= words.length; i++) out.add(words.slice(i, i + size).join(" "));
  return out;
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const s of a) if (b.has(s)) inter++;
  return inter / (a.size + b.size - inter);
}

const STATIC_ROUTES = new Set([
  "/",
  "/blog",
  "/about",
  "/contact",
  "/editorial-policy",
  "/affiliate-disclosure",
  "/privacy-policy",
  "/terms",
  "/cookie-policy",
  "/sitemap",
  "/search",
]);

export function extractInternalLinks(body: string): string[] {
  const links = new Set<string>();
  for (const re of [INTERNAL_LINK, JSX_HREF]) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(body))) links.add(m[1]!.replace(/\/+$/, "") || "/");
  }
  return [...links];
}

export function extractProductRefs(body: string): string[] {
  const ids = new Set<string>();
  PRODUCT_REF.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = PRODUCT_REF.exec(body))) {
    if (m[1]) ids.add(m[1]);
    if (m[2]) for (const id of m[2].matchAll(/"([^"]+)"/g)) ids.add(id[1]!);
  }
  return [...ids];
}

export function auditArticles(articles: Article[], opts: AuditOptions = {}): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const today = opts.today ?? new Date().toISOString().slice(0, 10);
  const registry = getImageRegistry();
  const products = new Map(getAllProducts().map((p) => [p.id, p]));
  // Scheduled articles (published, future date) are audited as published.
  const published = articles.filter((a) => a.status === "published");
  const releaseDate = new Map(published.map((a) => [`/${a.slug}`, a.publishedAt]));
  const publishedPaths = new Set(published.map((a) => `/${a.slug}`));
  const allPaths = new Set(articles.map((a) => `/${a.slug}`));
  const categoryPaths = new Set(categories.map((c) => `/category/${c.slug}`));
  const inbound = new Map<string, number>(published.map((a) => [a.slug, 0]));

  for (const a of articles) {
    const pub = a.status === "published";
    const add = (level: Level, code: string, message: string) =>
      // Drafts are work in progress: downgrade their errors to info.
      issues.push({ level: pub ? level : level === "error" ? "info" : level, scope: a.slug, code, message });

    // Images
    const img = registry.get(a.featuredImage);
    if (!img) add("error", "image-missing-record", `Featured image ${a.featuredImage} has no rights record in content/images.json`);
    FIGURE_SRC.lastIndex = 0;
    for (const m of a.body.matchAll(FIGURE_SRC)) {
      if (!registry.get(m[1]!)) add("error", "image-missing-record", `Inline image ${m[1]} has no rights record`);
    }
    if (/!\[[^\]]*\]\(/.test(a.body)) add("error", "markdown-image", "Use <Figure src=...> so images get registry alt text, dimensions and rights");

    // Products & affiliate links
    const refs = new Set([...a.products, ...extractProductRefs(a.body)]);
    for (const id of refs) {
      const p = products.get(id);
      if (!p) add("error", "product-missing", `Product "${id}" does not exist`);
      else if (p.status !== "published" || p.linkStatus !== "verified")
        add("error", "product-unverified", `Product "${id}" is ${p.status}/${p.linkStatus}; it will be hidden from readers`);
    }
    for (const m of a.body.matchAll(ANY_LINK)) {
      if (isAmazonUrl(m[1]!)) add("error", "raw-affiliate-link", `Raw Amazon link in body (${m[1]}); use a product record instead`);
      else if (!m[1]!.startsWith("https://")) add("warning", "insecure-link", `Non-HTTPS link: ${m[1]}`);
    }

    // Fabricated experience and risky claims
    const text = `${a.title}\n${a.excerpt}\n${a.quickAnswer ?? ""}\n${a.keyTakeaways.join("\n")}\n${a.body}`;
    if (a.basis !== "hands-on-testing") {
      for (const re of FABRICATED_EXPERIENCE_PATTERNS) {
        const m = re.exec(text);
        if (m) add("error", "unsupported-experience", `"${m[0]}" implies firsthand testing, but basis is independent research`);
      }
    }
    for (const re of RISKY_CLAIM_PATTERNS) {
      const m = re.exec(a.body);
      if (m) add("warning", "risky-claim", `Review claim: "${m[0]}" — make sure it's sourced or framed as a caution`);
    }

    // Completeness
    if (/\bTODO\b|\bTBD\b|lorem ipsum/i.test(a.body)) add("error", "placeholder-text", "Placeholder text (TODO/TBD) remains in body");
    if (pub && a.wordCount < 600) add("warning", "thin-content", `Only ${a.wordCount} words; make sure the article is genuinely useful`);
    if (a.seoTitle.length > 60) add("warning", "seo-title-length", `SEO title is ${a.seoTitle.length} characters; may be truncated (~60)`);
    if (a.metaDescription.length < 110) add("warning", "meta-description-short", `Meta description is ${a.metaDescription.length} characters`);
    if (a.toc.filter((t) => t.level === 2).length < 3) add("warning", "structure", "Fewer than three H2 sections");
    if (!a.quickAnswer && pub) add("warning", "quick-answer", "No quick answer near the top");
    for (const s of a.sources) if (!s.url.startsWith("https://")) add("warning", "source-insecure", `Source not HTTPS: ${s.url}`);

    // Internal links
    for (const link of extractInternalLinks(a.body)) {
      if (link === `/${a.slug}`) continue;
      if (STATIC_ROUTES.has(link) || categoryPaths.has(link)) continue;
      if (publishedPaths.has(link)) {
        const target = link.slice(1);
        // A link is broken if its target goes live after this article does.
        const liveFrom = a.publishedAt > today ? a.publishedAt : today;
        if (pub && releaseDate.get(link)! > liveFrom) {
          add("error", "link-to-scheduled", `Links to ${link}, which goes live on ${releaseDate.get(link)} — after this article (${liveFrom})`);
        }
        if (pub) inbound.set(target, (inbound.get(target) ?? 0) + 1);
        continue;
      }
      if (allPaths.has(link)) add("error", "link-to-draft", `Links to unpublished article ${link}`);
      else add("error", "broken-internal-link", `Broken internal link ${link}`);
    }
    for (const rel of a.relatedArticles) {
      if (!allPaths.has(`/${rel}`)) add("error", "related-missing", `Related article "${rel}" does not exist`);
      else if (pub && !publishedPaths.has(`/${rel}`)) add("warning", "related-draft", `Related article "${rel}" is not published (hidden)`);
    }

    // Review & freshness
    if (pub && !a.editorialReview.humanApprovedBy) {
      add(opts.launch ? "error" : "warning", "awaiting-human-approval", "Published without recorded human editorial approval");
    }
    if (pub && !a.editorialReview.factCheckedAt) add("error", "not-fact-checked", "No fact-check date recorded");
    const ageDays = (Date.parse(today) - Date.parse(a.updatedAt)) / 86_400_000;
    if (pub && ageDays > 365) add("warning", "stale", `Not updated in ${Math.round(ageDays)} days`);
  }

  // Cross-article checks (published only)
  const seen = (key: (a: Article) => string, code: string, label: string) => {
    const map = new Map<string, string>();
    for (const a of published) {
      const k = key(a).toLowerCase().trim();
      const prev = map.get(k);
      if (prev) issues.push({ level: "error", scope: a.slug, code, message: `${label} duplicates "${prev}"` });
      else map.set(k, a.slug);
    }
  };
  seen((a) => a.seoTitle, "duplicate-title", "SEO title");
  seen((a) => a.metaDescription, "duplicate-description", "Meta description");
  seen((a) => a.primaryKeyword, "keyword-cannibalization", "Primary keyword");

  const sh = published.map((a) => ({ a, s: shingles(plainText(a.body)) }));
  for (let i = 0; i < sh.length; i++) {
    for (let j = i + 1; j < sh.length; j++) {
      const score = jaccard(sh[i]!.s, sh[j]!.s);
      if (score > 0.3) {
        issues.push({
          level: "error",
          scope: sh[j]!.a.slug,
          code: "near-duplicate",
          message: `Body is ${(score * 100).toFixed(0)}% similar to "${sh[i]!.a.slug}"`,
        });
      }
    }
  }
  for (const [slug, count] of inbound) {
    if (count === 0 && published.length > 1) {
      issues.push({ level: "warning", scope: slug, code: "orphan", message: "No other published article links here" });
    }
  }
  for (const c of categories) {
    if (!published.some((a) => a.category === c.slug)) {
      issues.push({ level: "warning", scope: `/category/${c.slug}`, code: "empty-category", message: "No published articles (page is noindexed)" });
    }
  }
  return issues;
}

export function auditProducts(opts: AuditOptions = {}): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const today = opts.today ?? new Date().toISOString().slice(0, 10);
  const tag = getAssociateTag();
  if (!isValidTag(tag)) issues.push({ level: "error", scope: "site", code: "missing-tag", message: "AMAZON_ASSOCIATE_TAG is not set or invalid" });
  const referenced = new Set(getAllArticles().flatMap((a) => [...a.products, ...extractProductRefs(a.body)]));
  for (const p of getAllProducts()) {
    const add = (level: Level, code: string, message: string) =>
      issues.push({ level: p.status === "published" ? level : level === "error" ? "info" : level, scope: p.id, code, message });
    const url = p.affiliateUrl ?? p.amazonUrl;
    if (p.status === "published") {
      if (url) {
        for (const i of validateAffiliateUrl(p.affiliateUrl ? url : `${url}${url.includes("?") ? "&" : "?"}tag=${tag ?? ""}`, {
          expectedTag: tag,
          marketplace: p.marketplace,
          asin: p.asin,
        })) {
          add(i.level, `link-${i.code}`, i.message);
        }
      }
      if (p.lastVerified && (Date.parse(today) - Date.parse(p.lastVerified)) / 86_400_000 > 90) {
        add("warning", "stale-product", `Product details last verified ${p.lastVerified}; re-check listing and specifications`);
      }
      if (p.image && !getImageRegistry().get(p.image)) add("error", "image-missing-record", `Image ${p.image} has no rights record`);
    } else {
      add("info", "unverified-product", `Product is ${p.status} with link status "${p.linkStatus}"`);
    }
    if (p.linkStatus === "broken") add("error", "broken-link", "Link marked broken — replace or remove the product from articles");
    if (!referenced.has(p.id)) add("info", "unused-product", "Not referenced by any article");
  }
  return issues;
}

export function auditImages(): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const registry = getImageRegistry();
  const pub = path.join(process.cwd(), "public");
  for (const [src, img] of registry) {
    if (!fs.existsSync(path.join(pub, src))) issues.push({ level: "error", scope: src, code: "image-file-missing", message: "File not found" });
    if (/\.(webp|png|jpe?g|avif)$/i.test(img.alt) || /^(image|photo|picture|img)\b/i.test(img.alt)) {
      issues.push({ level: "error", scope: src, code: "alt-not-descriptive", message: "Alt text looks like a filename or generic label" });
    }
    const words = img.alt.toLowerCase().match(/[a-z]+/g) ?? [];
    const counts = new Map<string, number>();
    for (const w of words) if (w.length > 4) counts.set(w, (counts.get(w) ?? 0) + 1);
    for (const [w, n] of counts) if (n >= 3) issues.push({ level: "warning", scope: src, code: "alt-keyword-stuffing", message: `"${w}" repeated ${n} times in alt text` });
  }
  const dir = path.join(pub, "images");
  const walk = (d: string): string[] =>
    fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])) : [];
  for (const file of walk(dir)) {
    const src = "/" + path.relative(pub, file).split(path.sep).join("/");
    if (!registry.has(src)) issues.push({ level: "error", scope: src, code: "image-unregistered", message: "Image file has no rights record" });
  }
  return issues;
}

export function runFullAudit(opts: AuditOptions = {}): AuditIssue[] {
  let articles: Article[];
  try {
    articles = getAllArticles();
  } catch (e) {
    if (e instanceof ContentError) return [{ level: "error", scope: "content", code: "invalid-content", message: e.message }];
    throw e;
  }
  return [...auditArticles(articles, opts), ...auditProducts(opts), ...auditImages()];
}

export function summarize(issues: AuditIssue[]) {
  return {
    errors: issues.filter((i) => i.level === "error").length,
    warnings: issues.filter((i) => i.level === "warning").length,
    info: issues.filter((i) => i.level === "info").length,
  };
}
