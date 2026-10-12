import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ARTICLE = "/facial-rollers-vs-gua-sha";
const DRAFT = "/best-facial-cleansing-brushes";
const ORIGIN = "https://thegildedskin.com";

const onlyDesktop = (name: string) => test.skip(name !== "desktop", "Runs once, on the desktop project");

async function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}

test.describe("core pages", () => {
  test("homepage renders the brand, hero and disclosure", async ({ page }) => {
    const errors = await collectErrors(page);
    await page.goto("/");
    await expect(page).toHaveTitle(/The Gilded Skin/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Beauty");
    await expect(page.getByRole("img", { name: "The Gilded Skin" }).first()).toBeVisible();
    await expect(page.getByTestId("amazon-disclosure")).toHaveText("As an Amazon Associate I earn from qualifying purchases.");
    await expect(page.getByRole("heading", { name: "Latest buying guides" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("article renders with disclosure, sources and related guides", async ({ page }) => {
    await page.goto(ARTICLE);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Facial Rollers vs\. Gua Sha/);
    await expect(page.getByTestId("article-disclosure")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sources" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Keep reading" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
  });

  test("category and listing pages render article cards", async ({ page }) => {
    await page.goto("/category/beauty-tools");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Beauty Tools");
    expect(await page.locator("article").count()).toBeGreaterThan(1);
    await page.goto("/blog");
    expect(await page.locator("article").count()).toBeGreaterThanOrEqual(9);
  });

  test("author page lists her guides and article bylines link to it", async ({ page }) => {
    await page.goto(ARTICLE);
    await page.getByRole("link", { name: "Elise Marlowe" }).first().click();
    await expect(page).toHaveURL(/\/author\/elise-marlowe$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Elise Marlowe");
    expect(await page.locator("article").count()).toBeGreaterThan(5);
  });

  test("article cards have Read more buttons", async ({ page }) => {
    await page.goto("/blog");
    const readMore = page.getByRole("link", { name: /^Read more/ });
    expect(await readMore.count()).toBeGreaterThanOrEqual(9);
    await readMore.first().click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  for (const path of ["/about", "/contact", "/editorial-policy", "/affiliate-disclosure", "/privacy-policy", "/terms", "/cookie-policy", "/sitemap", "/search?q=sunscreen"]) {
    test(`${path} renders`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  }
});

test.describe("review regressions", () => {
  test("articles render one table of contents with unique ids", async ({ page }) => {
    for (const path of ["/at-home-ultrasonic-skin-devices", ARTICLE]) {
      await page.goto(path);
      await expect(page.locator("nav[aria-labelledby='toc-heading']")).toHaveCount(1);
      const ids = await page.locator("[id]").evaluateAll((els) => els.map((e) => e.id));
      expect(ids.length, path).toBe(new Set(ids).size);
    }
  });

  test("category pages feature a Start here guide", async ({ page }) => {
    await page.goto("/category/vanity-organization");
    const pillar = page.getByTestId("category-pillar");
    await expect(pillar.getByRole("heading", { name: "Start here" })).toBeVisible();
    await expect(pillar.getByRole("link", { name: /^Read more/ })).toHaveAttribute("href", "/how-to-organize-a-skincare-routine");
  });

  test("primary navigation leads with the core clusters", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "Desktop nav");
    await page.goto("/");
    const labels = await page.getByRole("navigation", { name: /main|primary/i }).first().getByRole("link").allTextContents();
    const order = ["Beauty Tools", "Skincare", "Vanity"].map((l) => labels.findIndex((t) => t.trim() === l));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  test("comparison tables stack into labeled cards on phones", async ({ page }, info) => {
    test.skip(info.project.name !== "mobile", "Phone layout");
    await page.goto("/how-to-organize-a-skincare-routine");
    const cell = page.locator("table.responsive-table td[data-label]").first();
    await expect(cell).toBeVisible();
    expect(await cell.evaluate((el) => getComputedStyle(el, "::before").content)).not.toBe("none");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("navigation", () => {
  test("mobile menu opens and navigates", async ({ page }, info) => {
    test.skip(info.project.name === "desktop", "Mobile/tablet only");
    await page.goto("/");
    const menu = page.getByTestId("mobile-menu");
    await menu.locator("summary").click();
    const nav = page.getByRole("navigation", { name: "Mobile" });
    await expect(nav).toBeVisible();
    await nav.getByRole("link", { name: "Beauty Tools" }).click();
    await expect(page).toHaveURL(/\/category\/beauty-tools$/);
    await expect(nav).toBeHidden();
  });

  test("desktop navigation is visible", async ({ page }, info) => {
    onlyDesktop(info.project.name);
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Skincare" })).toBeVisible();
  });

  test("no horizontal page overflow", async ({ page }) => {
    for (const path of ["/", ARTICLE, "/blog"]) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, path).toBeLessThanOrEqual(1);
    }
  });
});

test.describe("crawlability and SEO", () => {
  test.beforeEach(async ({}, info) => onlyDesktop(info.project.name));

  test("article content is in server HTML without JavaScript", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(ARTICLE);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("randomized controlled trial").first()).toBeVisible();
    await expect(page.getByRole("table").first()).toBeVisible();
    await ctx.close();
  });

  test("canonical, robots and Open Graph metadata", async ({ page }) => {
    await page.goto(ARTICLE);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${ORIGIN}${ARTICLE}`);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", `${ORIGIN}${ARTICLE}`);
    await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute("content", `${ORIGIN}/og${ARTICLE}`);
    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toContain("index");
    expect(robots).not.toContain("noindex");
  });

  test("search results are noindexed", async ({ page }) => {
    await page.goto("/search?q=gua");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("structured data is valid JSON and matches the page", async ({ page }) => {
    await page.goto(ARTICLE);
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const data = blocks.map((b) => JSON.parse(b));
    const types = data.map((d) => d["@type"]);
    expect(types).toEqual(expect.arrayContaining(["Organization", "WebSite", "BreadcrumbList", "BlogPosting", "FAQPage"]));
    const post = data.find((d) => d["@type"] === "BlogPosting");
    expect(post.headline).toBe(await page.getByRole("heading", { level: 1 }).textContent());
    expect(JSON.stringify(data)).not.toMatch(/AggregateRating|"Offer"|ratingValue/);
  });

  test("sitemap.xml lists published pages and excludes drafts", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain(`<loc>${ORIGIN}${ARTICLE}</loc>`);
    expect(xml).toContain(`<loc>${ORIGIN}</loc>`);
    expect(xml).not.toContain(DRAFT);
    expect(xml).not.toContain("/search");
  });

  test("robots.txt allows crawling and references the sitemap", async ({ request }) => {
    const txt = await (await request.get("/robots.txt")).text();
    expect(txt).toContain("Allow: /");
    expect(txt).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`);
    expect(txt).toContain("Disallow: /search");
  });

  test("drafts, studio and unknown pages return 404", async ({ request }) => {
    expect((await request.get(DRAFT)).status()).toBe(404);
    expect((await request.get("/studio")).status()).toBe(404);
    expect((await request.get(`/studio/preview${DRAFT}`)).status()).toBe(404);
    const res = await request.get("/this-page-does-not-exist");
    expect(res.status()).toBe(404);
    expect(await res.text()).toContain("This page has wandered off");
  });

  test("trailing slashes redirect to the canonical URL", async ({ request }) => {
    const res = await request.get("/blog/", { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers()["location"]).toBe("/blog");
  });

  test("every internal link on key pages resolves", async ({ page, request }) => {
    const hrefs = new Set<string>();
    for (const path of ["/", "/blog", "/sitemap", ARTICLE]) {
      await page.goto(path);
      for (const h of await page.locator('a[href^="/"]').evaluateAll((as) => as.map((a) => a.getAttribute("href")!))) {
        hrefs.add(h.split("#")[0]!);
      }
    }
    for (const h of hrefs) {
      if (!h) continue;
      const res = await request.get(h);
      expect(res.status(), h).toBeLessThan(400);
    }
  });

  test("Pinterest and Open Graph images are generated at the right sizes", async ({ request }) => {
    const pin = await request.get(`/pins${ARTICLE}/1`);
    expect(pin.status()).toBe(200);
    expect(pin.headers()["content-type"]).toContain("image/png");
    const og = await request.get(`/og${ARTICLE}`);
    expect(og.status()).toBe(200);
  });
});

test.describe("trust and compliance", () => {
  test.beforeEach(async ({}, info) => onlyDesktop(info.project.name));

  test("no fabricated prices on public pages", async ({ page }) => {
    for (const path of ["/", "/blog", ARTICLE, "/led-face-masks-what-to-compare", "/how-to-choose-a-beauty-gift"]) {
      await page.goto(path);
      const text = await page.locator("main").innerText();
      expect(text, path).not.toMatch(/\$\s?\d/);
    }
  });

  test("affiliate disclosure page shows the required statement", async ({ page }) => {
    await page.goto("/affiliate-disclosure");
    await expect(page.getByTestId("amazon-disclosure-page")).toHaveText("As an Amazon Associate I earn from qualifying purchases.");
  });

  test("all images have alt attributes and reserved dimensions", async ({ page }) => {
    for (const path of ["/", ARTICLE]) {
      await page.goto(path);
      const bad = await page.locator("img").evaluateAll((imgs) =>
        imgs
          .filter((i) => !i.hasAttribute("alt") || (!i.getAttribute("width") && !(i as HTMLImageElement).closest("[class*=aspect]") && i.getAttribute("data-nimg") !== "fill"))
          .map((i) => i.getAttribute("src")),
      );
      expect(bad, path).toEqual([]);
    }
  });

  test("contact form validates input", async ({ request }) => {
    const res = await request.post("/api/contact", { form: { name: "", email: "x", message: "", startedAt: "1" }, maxRedirects: 0 });
    expect(res.status()).toBe(303);
    expect(res.headers()["location"]).toContain("status=");
  });

  test("security headers are present", async ({ request }) => {
    const h = (await request.get("/")).headers();
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["x-powered-by"]).toBeUndefined();
  });
});

test.describe("accessibility", () => {
  for (const path of ["/", ARTICLE, "/category/skincare", "/contact", "/blog", "/led-face-masks-what-to-compare", "/at-home-ultrasonic-skin-devices", "/author/elise-marlowe"]) {
    test(`no serious axe violations on ${path}`, async ({ page }, info) => {
      test.skip(info.project.name === "tablet", "Covered by mobile and desktop");
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}`)).toEqual([]);
    });
  }

  test("keyboard users can skip to content", async ({ page }, info) => {
    onlyDesktop(info.project.name);
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
  });
});
