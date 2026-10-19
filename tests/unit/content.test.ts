import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  getAllArticles,
  getAllProducts,
  getArticle,
  getImageRegistry,
  getPublishedArticles,
  parseArticle,
  RESERVED_SLUGS,
  ContentError,
} from "@/lib/content";
import { imageRecordSchema, productSchema } from "@/lib/schemas";

const validFrontmatter = `---
title: "A Valid Test Article Title"
slug: test-article
excerpt: "An excerpt that is long enough to pass validation for this test article."
seoTitle: "A Valid Test Article Title"
metaDescription: "A meta description that is long enough to pass the minimum length rule used by the schema validation."
primaryKeyword: test keyword
searchIntent: informational
articleType: how-to
category: skincare
author: editorial-team
publishedAt: 2026-10-01
updatedAt: 2026-10-02
featuredImage: /images/editorial/hero-vanity.webp
status: draft
basis: independent-research
---

## First

Body text.
`;

describe("article content", () => {
  const articles = getAllArticles();

  it("parses every article file", () => {
    const files = fs.readdirSync(path.join(process.cwd(), "content/articles")).filter((f) => f.endsWith(".mdx"));
    expect(articles).toHaveLength(files.length);
  });

  it("has unique slugs that don't collide with site routes", () => {
    const slugs = articles.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(RESERVED_SLUGS.has(s)).toBe(false);
  });

  it("publishes complete metadata for every public article", () => {
    for (const a of getPublishedArticles()) {
      expect(a.seoTitle.length).toBeGreaterThan(0);
      expect(a.metaDescription.length).toBeGreaterThanOrEqual(70);
      expect(a.sources.length).toBeGreaterThan(0);
      expect(a.pinterest.pins).toHaveLength(3);
      expect(a.toc.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("excludes drafts from public queries", () => {
    const draft = articles.find((a) => a.status !== "published");
    expect(draft).toBeDefined();
    expect(getPublishedArticles().some((a) => a.slug === draft!.slug)).toBe(false);
    expect(getArticle(draft!.slug)).toBeUndefined();
    expect(getArticle(draft!.slug, { includeDrafts: true })).toBeDefined();
  });

  it("accepts valid frontmatter and computes reading time and TOC", () => {
    const a = parseArticle(validFrontmatter, "/x/test-article.mdx");
    expect(a.readingMinutes).toBeGreaterThanOrEqual(1);
    expect(a.toc[0]).toEqual({ id: "first", text: "First", level: 2 });
  });

  it("rejects articles with missing metadata", () => {
    const broken = validFrontmatter.replace(/^metaDescription:.*\n/m, "");
    expect(() => parseArticle(broken, "/x/test-article.mdx")).toThrow(ContentError);
  });

  it("rejects slug/file mismatches and reserved slugs", () => {
    expect(() => parseArticle(validFrontmatter, "/x/other.mdx")).toThrow(/must match/);
    const reserved = validFrontmatter.replace("slug: test-article", "slug: about");
    expect(() => parseArticle(reserved, "/x/about.mdx")).toThrow(/reserved/);
  });

  it("requires documented testing notes for hands-on claims", () => {
    const handsOn = validFrontmatter.replace("basis: independent-research", "basis: hands-on-testing");
    expect(() => parseArticle(handsOn, "/x/test-article.mdx")).toThrow(/testingNotes/);
  });

  it("requires sources and pin concepts before publishing", () => {
    const pub = validFrontmatter.replace("status: draft", "status: published");
    expect(() => parseArticle(pub, "/x/test-article.mdx")).toThrow(/sources/);
  });
});

describe("product records", () => {
  const minimal = {
    id: "p",
    name: "Product",
    category: "skincare",
    editorialDescription: "A description long enough for validation.",
    lastVerified: null,
    availabilityStatus: "unverified",
    linkStatus: "pending",
    status: "draft",
  };

  it("all product files validate", () => {
    expect(() => getAllProducts()).not.toThrow();
  });

  it("allows drafts without links", () => {
    expect(productSchema.safeParse(minimal).success).toBe(true);
  });

  it("rejects published products without a verified link, sources, or limitations", () => {
    const r = productSchema.safeParse({ ...minimal, status: "published" });
    expect(r.success).toBe(false);
    const messages = r.error!.issues.map((i) => i.message).join(" ");
    expect(messages).toMatch(/ASIN or Amazon URL/);
    expect(messages).toMatch(/verified link/);
    expect(messages).toMatch(/source/);
    expect(messages).toMatch(/limitations/);
  });

  it("rejects malformed ASINs", () => {
    expect(productSchema.safeParse({ ...minimal, asin: "abc" }).success).toBe(false);
  });

  it("has no field for hand-entered prices, ratings counts or stock", () => {
    const parsed = productSchema.parse({ ...minimal, price: "$19.99", reviewCount: 1200, rating: 4.8 });
    expect(parsed).not.toHaveProperty("price");
    expect(parsed).not.toHaveProperty("reviewCount");
    expect(parsed).not.toHaveProperty("rating");
    expect(productSchema.safeParse({ ...minimal, priceDisplay: "manual" }).success).toBe(false);
  });
});

describe("image rights registry", () => {
  const ok = {
    src: "/images/x.webp",
    alt: "A descriptive alternative text",
    width: 10,
    height: 10,
    kind: "photograph",
    source: "unsplash",
    sourceUrl: "https://unsplash.com/photos/x",
    creator: "Someone",
    license: "Unsplash License",
    attributionRequired: false,
    rightsVerifiedAt: "2026-10-01",
  };
  it("every registered image validates and has meaningful alt text", () => {
    for (const img of getImageRegistry().values()) {
      expect(img.alt.length).toBeGreaterThanOrEqual(8);
      expect(img.alt).not.toMatch(/\.(webp|png|jpe?g)$/);
    }
  });
  it("rejects missing alt text", () => {
    expect(imageRecordSchema.safeParse({ ...ok, alt: "" }).success).toBe(false);
  });
  it("requires a source URL for third-party images", () => {
    expect(imageRecordSchema.safeParse({ ...ok, sourceUrl: undefined }).success).toBe(false);
  });
  it("forbids presenting illustrations as specific products", () => {
    expect(imageRecordSchema.safeParse({ ...ok, kind: "illustration", depictsSpecificProduct: true }).success).toBe(false);
  });
});

describe("scheduled publishing", () => {
  it("hides published articles until their publish date (UTC)", async () => {
    const { isPublic, isScheduled } = await import("@/lib/content");
    const article = { status: "published" as const, publishedAt: "2026-10-20" };
    expect(isPublic(article, new Date("2026-10-19T23:59:00Z"))).toBe(false);
    expect(isScheduled(article, new Date("2026-10-19T23:59:00Z"))).toBe(true);
    expect(isPublic(article, new Date("2026-10-20T00:00:00Z"))).toBe(true);
    expect(isScheduled(article, new Date("2026-10-20T00:00:00Z"))).toBe(false);
  });

  it("never shows drafts, whatever the date", async () => {
    const { isPublic, isScheduled } = await import("@/lib/content");
    const draft = { status: "draft" as const, publishedAt: "2020-01-01" };
    expect(isPublic(draft)).toBe(false);
    expect(isScheduled(draft)).toBe(false);
  });
});
