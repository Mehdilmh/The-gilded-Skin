import { describe, expect, it } from "vitest";
import { auditArticles, extractInternalLinks, extractProductRefs, jaccard, runFullAudit } from "@/lib/audit";
import { getAllArticles, type Article } from "@/lib/content";

const articles = getAllArticles();
const pub = articles.find((a) => a.status === "published")!;
const clone = (patch: Partial<Article>): Article => ({ ...pub, ...patch });
const codesFor = (list: Article[], slug: string) =>
  auditArticles(list)
    .filter((i) => i.scope === slug && i.level === "error")
    .map((i) => i.code);

describe("content audit", () => {
  it("passes on the current content with no errors", () => {
    const errors = runFullAudit().filter((i) => i.level === "error");
    expect(errors, JSON.stringify(errors, null, 2)).toEqual([]);
  });

  it("detects broken internal links", () => {
    const a = clone({ body: `${pub.body}\n\nSee [this](/does-not-exist).` });
    const list = articles.map((x) => (x.slug === pub.slug ? a : x));
    expect(codesFor(list, pub.slug)).toContain("broken-internal-link");
  });

  it("detects links from published articles to drafts", () => {
    const draft = articles.find((x) => x.status === "draft")!;
    const a = clone({ body: `${pub.body}\n\nSee [draft](/${draft.slug}).` });
    const list = articles.map((x) => (x.slug === pub.slug ? a : x));
    expect(codesFor(list, pub.slug)).toContain("link-to-draft");
  });

  it("flags fabricated testing language", () => {
    const a = clone({ body: `${pub.body}\n\nAfter using it for 30 days, we tested it again.` });
    const list = articles.map((x) => (x.slug === pub.slug ? a : x));
    expect(codesFor(list, pub.slug)).toContain("unsupported-experience");
  });

  it("flags raw Amazon links in article bodies", () => {
    const a = clone({ body: `${pub.body}\n\n[Buy](https://www.amazon.com/dp/B0TESTTEST)` });
    const list = articles.map((x) => (x.slug === pub.slug ? a : x));
    expect(codesFor(list, pub.slug)).toContain("raw-affiliate-link");
  });

  it("flags unverified products referenced by published articles", () => {
    const a = clone({ products: ["silicone-cleansing-brush-pending"] });
    const list = articles.map((x) => (x.slug === pub.slug ? a : x));
    expect(codesFor(list, pub.slug)).toContain("product-unverified");
  });

  it("flags missing image rights records", () => {
    const a = clone({ featuredImage: "/images/unknown.webp" });
    const list = articles.map((x) => (x.slug === pub.slug ? a : x));
    expect(codesFor(list, pub.slug)).toContain("image-missing-record");
  });

  it("flags duplicate titles and keyword cannibalization", () => {
    const other = articles.find((x) => x.status === "published" && x.slug !== pub.slug)!;
    const list = articles.map((x) => (x.slug === other.slug ? { ...other, seoTitle: pub.seoTitle, primaryKeyword: pub.primaryKeyword } : x));
    const codes = auditArticles(list).map((i) => i.code);
    expect(codes).toContain("duplicate-title");
    expect(codes).toContain("keyword-cannibalization");
  });

  it("detects near-duplicate articles", () => {
    const other = articles.find((x) => x.status === "published" && x.slug !== pub.slug)!;
    const list = articles.map((x) => (x.slug === other.slug ? { ...other, body: pub.body } : x));
    expect(auditArticles(list).map((i) => i.code)).toContain("near-duplicate");
  });

  it("requires human approval in launch mode", () => {
    const issues = auditArticles([pub], { launch: true });
    expect(issues.some((i) => i.code === "awaiting-human-approval" && i.level === "error")).toBe(pub.editorialReview.humanApprovedBy === null);
  });

  it("extracts links and product references", () => {
    expect(extractInternalLinks("[a](/x) and [b](/y#z) and [c](https://e.com)")).toEqual(["/x", "/y"]);
    expect(extractProductRefs('<ProductCard id="a" /> <ProductComparison ids={["b", "c"]} caption="x" />')).toEqual(["a", "b", "c"]);
  });

  it("computes similarity", () => {
    expect(jaccard(new Set(["a", "b"]), new Set(["a", "b"]))).toBe(1);
    expect(jaccard(new Set(["a"]), new Set(["b"]))).toBe(0);
  });
});
