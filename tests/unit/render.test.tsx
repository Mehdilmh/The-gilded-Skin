import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { productSchema } from "@/lib/schemas";
import { AMAZON_ASSOCIATE_DISCLOSURE } from "@/lib/site";

const fixture = productSchema.parse({
  id: "fixture-brush",
  name: "Fixture Silicone Brush",
  category: "beauty-tools",
  asin: "B0FIXTURE1",
  editorialDescription: "A fixture product used to verify how product cards render.",
  keyFeatures: ["Silicone head"],
  advantages: ["Easy to clean"],
  disadvantages: ["Needs charging"],
  suits: ["People who like a ritual"],
  skipIf: ["Sensitive skin"],
  buyingConsiderations: ["Check water resistance"],
  sources: [{ title: "Official page", publisher: "Brand", url: "https://example.com" }],
  lastVerified: "2026-10-01",
  availabilityStatus: "verified-available",
  linkStatus: "verified",
  status: "published",
});

vi.mock("@/lib/content", async (orig) => {
  const actual = await orig<typeof import("@/lib/content")>();
  return {
    ...actual,
    getProduct: (id: string) => (id === fixture.id ? fixture : id === "draft" ? { ...fixture, id: "draft", status: "draft" } : undefined),
  };
});

const { ProductCard, ProductComparison } = await import("@/components/affiliate/ProductCard");
const { AffiliateDisclosure } = await import("@/components/affiliate/AffiliateDisclosure");
const { SiteFooter } = await import("@/components/layout/SiteFooter");

describe("rendered affiliate components", () => {
  const html = renderToStaticMarkup(<ProductCard id="fixture-brush" />);

  it("links directly to the Amazon product page with the configured tag", () => {
    expect(html).toContain('href="https://www.amazon.com/dp/B0FIXTURE1?tag=gettse00-20"');
    expect(html).toContain('rel="sponsored nofollow noopener noreferrer"');
    expect(html).toContain("View product on Amazon");
    expect(html).toMatch(/Affiliate link/);
  });

  it("shows limitations and who should skip it", () => {
    expect(html).toContain("Needs charging");
    expect(html).toContain("Sensitive skin");
  });

  it("never displays prices, star ratings or review counts", () => {
    expect(html).not.toMatch(/\$\s?\d/);
    expect(html).not.toMatch(/★|stars?\b|reviews?\)/i);
  });

  it("renders nothing for unverified products in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(renderToStaticMarkup(<ProductCard id="draft" />)).toBe("");
    expect(renderToStaticMarkup(<ProductComparison ids={["draft", "fixture-brush"]} caption="x" />)).toBe("");
    vi.unstubAllEnvs();
  });

  it("shows the affiliate disclosure text", () => {
    const d = renderToStaticMarkup(<AffiliateDisclosure hasAffiliateLinks />);
    expect(d).toContain("This article contains affiliate links.");
    expect(d).toContain(AMAZON_ASSOCIATE_DISCLOSURE);
  });

  it("includes the exact Amazon Associates statement in the footer", () => {
    expect(renderToStaticMarkup(<SiteFooter />)).toContain("As an Amazon Associate I earn from qualifying purchases.");
  });
});
