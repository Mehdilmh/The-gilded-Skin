import { afterEach, describe, expect, it, vi } from "vitest";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { buildSitemap } from "@/lib/sitemap";
import { buildRobots } from "@/lib/robots";
import { getAllArticles, getAuthor, getImage, getPublishedArticles } from "@/lib/content";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, organizationJsonLd, serializeJsonLd, websiteJsonLd } from "@/lib/structured-data";

afterEach(() => vi.unstubAllEnvs());

describe("canonical URLs and metadata", () => {
  it("builds absolute canonical URLs on the production domain without trailing slashes", () => {
    expect(absoluteUrl("/")).toBe("https://thegildedskin.com");
    expect(absoluteUrl("/blog/")).toBe("https://thegildedskin.com/blog");
    expect(absoluteUrl("about")).toBe("https://thegildedskin.com/about");
  });

  it("sets canonical, Open Graph and robots for indexable pages", () => {
    const m = pageMetadata({ title: "T", description: "D", path: "/x" });
    expect(m.alternates?.canonical).toBe("https://thegildedskin.com/x");
    expect(m.openGraph?.url).toBe("https://thegildedskin.com/x");
    expect(m.robots).toMatchObject({ index: true, follow: true });
  });

  it("noindexes explicitly excluded pages", () => {
    expect(pageMetadata({ title: "T", description: "D", path: "/search", noindex: true }).robots).toMatchObject({ index: false });
  });

  it("noindexes everything outside production", () => {
    vi.stubEnv("SITE_ENV", "staging");
    expect(pageMetadata({ title: "T", description: "D", path: "/x" }).robots).toMatchObject({ index: false });
  });

  it("uses unique titles and descriptions across published articles", () => {
    const pub = getPublishedArticles();
    expect(new Set(pub.map((a) => a.seoTitle)).size).toBe(pub.length);
    expect(new Set(pub.map((a) => a.metaDescription)).size).toBe(pub.length);
  });
});

describe("sitemap", () => {
  const urls = buildSitemap().map((e) => e.url);

  it("includes the homepage, published articles and populated categories", () => {
    expect(urls).toContain("https://thegildedskin.com");
    for (const a of getPublishedArticles()) expect(urls).toContain(`https://thegildedskin.com/${a.slug}`);
    expect(urls).toContain("https://thegildedskin.com/category/beauty-tools");
  });

  it("excludes drafts, search and studio", () => {
    for (const a of getAllArticles().filter((x) => x.status !== "published")) {
      expect(urls).not.toContain(`https://thegildedskin.com/${a.slug}`);
    }
    expect(urls.some((u) => u.includes("/search") || u.includes("/studio"))).toBe(false);
  });

  it("uses absolute URLs only, without duplicates", () => {
    expect(urls.every((u) => u.startsWith("https://thegildedskin.com"))).toBe(true);
    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe("robots.txt", () => {
  it("allows crawling in production and points to the sitemap", () => {
    const r = buildRobots(true);
    expect(r.sitemap).toBe("https://thegildedskin.com/sitemap.xml");
    const rule = Array.isArray(r.rules) ? r.rules[0]! : r.rules;
    expect(rule.allow).toBe("/");
    expect(rule.disallow).toContain("/search");
    expect(JSON.stringify(rule.disallow)).not.toContain("_next");
  });
  it("blocks everything on staging", () => {
    const r = buildRobots(false);
    const rule = Array.isArray(r.rules) ? r.rules[0]! : r.rules;
    expect(rule.disallow).toBe("/");
    expect(r.sitemap).toBeUndefined();
  });
});

describe("structured data", () => {
  const article = getPublishedArticles()[0]!;
  const ld = articleJsonLd(article, getAuthor(article.author), getImage(article.featuredImage));

  it("produces valid, serializable JSON-LD", () => {
    for (const data of [ld, organizationJsonLd(), websiteJsonLd(), breadcrumbJsonLd([{ name: "Home", path: "/" }])]) {
      const parsed = JSON.parse(serializeJsonLd(data));
      expect(parsed["@context"]).toBe("https://schema.org");
      expect(parsed["@type"]).toBeTruthy();
    }
  });

  it("matches visible article content", () => {
    expect(ld.headline).toBe(article.title);
    expect(ld.datePublished).toBe(article.publishedAt);
    expect(ld.dateModified).toBe(article.updatedAt);
    expect((ld.mainEntityOfPage as { "@id": string })["@id"]).toBe(`https://thegildedskin.com/${article.slug}`);
  });

  it("does not invent reviews, ratings, offers or people", () => {
    const text = JSON.stringify(ld);
    expect(text).not.toMatch(/AggregateRating|"Review"|"Offer"|ratingValue|"price"/);
    // The collective editorial byline is an Organization, not a fictional Person.
    expect((ld.author as { "@type": string })["@type"]).toBe("Organization");
  });

  it("only emits FAQPage when FAQ content exists", () => {
    expect(faqJsonLd([])).toBeNull();
    const withFaq = getPublishedArticles().find((a) => a.faq.length > 0)!;
    expect((faqJsonLd(withFaq.faq)!.mainEntity as unknown[]).length).toBe(withFaq.faq.length);
  });

  it("escapes < to prevent script injection", () => {
    expect(serializeJsonLd({ x: "</script>" })).not.toContain("</script>");
  });
});
