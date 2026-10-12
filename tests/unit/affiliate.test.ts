import { describe, expect, it } from "vitest";
import {
  AFFILIATE_REL,
  applyTag,
  buildProductUrl,
  extractAsin,
  getAssociateTag,
  isValidTag,
  resolveProductLink,
  validateAffiliateUrl,
  withUtm,
} from "@/lib/affiliate";
import { productSchema, type Product } from "@/lib/schemas";

const base = productSchema.parse({
  id: "test-product",
  name: "Test Product",
  category: "beauty-tools",
  asin: "B0TESTTEST",
  editorialDescription: "A test product used only in automated tests.",
  advantages: ["One"],
  disadvantages: ["Two"],
  sources: [{ title: "Official page", publisher: "Brand", url: "https://example.com/product" }],
  lastVerified: "2026-10-01",
  availabilityStatus: "verified-available",
  linkStatus: "verified",
  status: "published",
});

describe("Associates tracking ID", () => {
  it("reads the configured tag from the server environment", () => {
    expect(getAssociateTag()).toBe("gettse00-20");
  });
  it("validates tag format", () => {
    expect(isValidTag("gettse00-20")).toBe(true);
    expect(isValidTag("")).toBe(false);
    expect(isValidTag("no tag here")).toBe(false);
  });
});

describe("affiliate link formatting", () => {
  it("builds a direct product detail page link with the tag", () => {
    expect(buildProductUrl("B0TESTTEST", "gettse00-20")).toBe("https://www.amazon.com/dp/B0TESTTEST?tag=gettse00-20");
  });
  it("rejects invalid ASINs and tags", () => {
    expect(() => buildProductUrl("bad", "gettse00-20")).toThrow();
    expect(() => buildProductUrl("B0TESTTEST", "x")).toThrow();
  });
  it("applies or replaces the tag on Amazon URLs and upgrades to https", () => {
    const url = applyTag("http://www.amazon.com/dp/B0TESTTEST?tag=someone-20&th=1", "gettse00-20");
    expect(url).toBe("https://www.amazon.com/dp/B0TESTTEST?tag=gettse00-20&th=1");
  });
  it("leaves Associates short links untouched", () => {
    expect(applyTag("https://amzn.to/abc123", "gettse00-20")).toBe("https://amzn.to/abc123");
  });
  it("refuses to tag non-Amazon URLs", () => {
    expect(() => applyTag("https://example.com/dp/B0TESTTEST", "gettse00-20")).toThrow();
  });
  it("extracts ASINs from product URLs", () => {
    expect(extractAsin("https://www.amazon.com/Some-Name/dp/B0TESTTEST/ref=x")).toBe("B0TESTTEST");
    expect(extractAsin("https://www.amazon.com/gp/product/B0TESTTEST")).toBe("B0TESTTEST");
    expect(extractAsin("https://www.amazon.com/s?k=brush")).toBeNull();
  });
});

describe("affiliate link validation", () => {
  const opts = { expectedTag: "gettse00-20", marketplace: "US" as const };
  const codes = (url: string, o: Parameters<typeof validateAffiliateUrl>[1] = opts) => validateAffiliateUrl(url, o).map((i) => i.code);

  it("accepts a correct link", () => {
    expect(codes("https://www.amazon.com/dp/B0TESTTEST?tag=gettse00-20")).toEqual([]);
  });
  it("flags a missing tracking ID", () => {
    expect(codes("https://www.amazon.com/dp/B0TESTTEST")).toContain("missing-tag");
  });
  it("flags a different tracking ID", () => {
    expect(codes("https://www.amazon.com/dp/B0TESTTEST?tag=other-20")).toContain("wrong-tag");
  });
  it("flags links that are not product detail pages", () => {
    expect(codes("https://www.amazon.com/s?k=brush&tag=gettse00-20")).toContain("not-product-page");
  });
  it("flags marketplace mismatches and insecure links", () => {
    const c = codes("http://www.amazon.co.uk/dp/B0TESTTEST?tag=gettse00-20");
    expect(c).toContain("insecure");
    expect(c).toContain("marketplace-mismatch");
  });
  it("flags ASIN mismatches against the product record", () => {
    expect(codes("https://www.amazon.com/dp/B0OTHEROTH?tag=gettse00-20", { ...opts, asin: "B0TESTTEST" })).toContain("asin-mismatch");
  });
  it("warns that short links need manual verification", () => {
    expect(codes("https://amzn.to/abc")).toEqual(["short-link-unverified"]);
  });
  it("rejects non-Amazon hosts", () => {
    expect(codes("https://amazon.example.com/dp/B0TESTTEST?tag=gettse00-20")).toContain("not-amazon");
  });
});

describe("resolveProductLink", () => {
  it("resolves verified, published products to a sponsored direct link", () => {
    const link = resolveProductLink(base)!;
    expect(link.href).toBe("https://www.amazon.com/dp/B0TESTTEST?tag=gettse00-20");
    expect(link.rel).toBe(AFFILIATE_REL);
    expect(link.rel).toContain("sponsored");
    expect(link.label).toMatch(/affiliate link/i);
  });
  it("prefers a stored Associates link and enforces the tag on it", () => {
    const p: Product = { ...base, affiliateUrl: "https://www.amazon.com/dp/B0TESTTEST?tag=wrong-20" };
    expect(resolveProductLink(p)!.href).toContain("tag=gettse00-20");
  });
  it("returns null for drafts, unverified or broken links, or without a tag", () => {
    expect(resolveProductLink({ ...base, status: "draft" })).toBeNull();
    expect(resolveProductLink({ ...base, linkStatus: "pending" })).toBeNull();
    expect(resolveProductLink({ ...base, linkStatus: "broken" })).toBeNull();
    expect(resolveProductLink(base, null)).toBeNull();
  });
});

describe("campaign tracking", () => {
  it("adds UTM parameters to site URLs", () => {
    const u = new URL(withUtm("https://thegildedskin.com/facial-rollers-vs-gua-sha", { source: "pinterest", medium: "social", campaign: "x" }));
    expect(u.searchParams.get("utm_source")).toBe("pinterest");
  });
  it("never adds UTM parameters to Amazon links", () => {
    expect(() => withUtm("https://www.amazon.com/dp/B0TESTTEST", { source: "a", medium: "b", campaign: "c" })).toThrow();
  });
});
