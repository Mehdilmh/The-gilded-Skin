import { describe, expect, it } from "vitest";
import { normalizeCategory, parseAmazonInput, rowToProduct, slugify } from "@/lib/product-import";

describe("parseAmazonInput", () => {
  it("extracts the ASIN from long Amazon URLs and bare ASINs", () => {
    expect(parseAmazonInput("https://www.amazon.com/Brand-Name/dp/B0TESTAAAA/ref=sr_1_3?keywords=x")).toEqual({ asin: "B0TESTAAAA" });
    expect(parseAmazonInput("https://www.amazon.com/gp/product/B0TESTAAAA")).toEqual({ asin: "B0TESTAAAA" });
    expect(parseAmazonInput(" b0testaaaa ")).toEqual({ asin: "B0TESTAAAA" });
  });
  it("rejects short links, other stores, non-Amazon and search pages", () => {
    expect(parseAmazonInput("https://amzn.to/abc")).toHaveProperty("error");
    expect(parseAmazonInput("https://www.amazon.co.uk/dp/B0TESTAAAA")).toHaveProperty("error");
    expect(parseAmazonInput("https://example.com/dp/B0TESTAAAA")).toHaveProperty("error");
    expect(parseAmazonInput("https://www.amazon.com/s?k=brush")).toHaveProperty("error");
    expect(parseAmazonInput("hello")).toHaveProperty("error");
  });
});

describe("normalizeCategory", () => {
  it("accepts friendly names and slugs", () => {
    expect(normalizeCategory("Beauty Tools")).toBe("beauty-tools");
    expect(normalizeCategory("vanity & organization")).toBe("vanity-organization");
    expect(normalizeCategory("gift-guides")).toBe("gift-guides");
    expect(normalizeCategory("shoes")).toBeNull();
  });
});

describe("rowToProduct", () => {
  it("creates an untagged draft that never goes live on its own", () => {
    const r = rowToProduct({ category: "beauty tools", amazonLink: "https://www.amazon.com/dp/B0TESTAAAA", productName: "Sonic Brush", brand: "Acme" }, 2, new Set());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.product).toMatchObject({
      id: "acme-sonic-brush",
      asin: "B0TESTAAAA",
      amazonUrl: "https://www.amazon.com/dp/B0TESTAAAA",
      status: "draft",
      linkStatus: "pending",
      priceDisplay: "hidden",
    });
  });
  it("avoids id collisions and reports bad rows", () => {
    const r = rowToProduct({ category: "skincare", amazonLink: "B0TESTAAAA", productName: "Jar", brand: "X" }, 3, new Set(["x-jar"]));
    expect(r.ok && r.product.id).toBe("x-jar-b0testaaaa");
    const bad = rowToProduct({ category: "cars", amazonLink: "B0TESTAAAA" }, 4, new Set());
    expect(bad).toMatchObject({ ok: false, row: 4 });
  });
  it("slugifies safely", () => {
    expect(slugify("  Café Brush™ — Pro!  ")).toBe("cafe-brush-pro");
  });
});

describe("sponsored and browse links", () => {
  it("unwraps sponsored-result click links", () => {
    expect(
      parseAmazonInput("https://www.amazon.com/sspa/click?ie=UTF8&spc=x&url=%2FBrand-Name%2Fdp%2FB01H1V7WV0%2Fref%3Dsr_1_1_sspa%3Fqid%3D1%26psc%3D1"),
    ).toEqual({ asin: "B01H1V7WV0" });
  });
  it("builds clean ids without repeated brands or notes", () => {
    const r = rowToProduct({ category: "makeup", amazonLink: "B01LXR6JOG", productName: "sara happ rose lip gloss (to confirm)", brand: "sara happ" }, 2, new Set());
    expect(r.ok && r.product.id).toBe("sara-happ-rose-lip-gloss");
  });
});
