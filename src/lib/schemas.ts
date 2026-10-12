import { z } from "zod";
import { categorySlugs } from "./categories";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
const url = z.string().url();

export const sourceSchema = z.object({
  title: z.string().min(3),
  publisher: z.string().min(2),
  url,
  /** What this source supports, so fact-checkers know why it is cited. */
  supports: z.string().optional(),
  accessed: isoDate.optional(),
});
export type Source = z.infer<typeof sourceSchema>;

/* ------------------------------------------------------------------ */
/* Images                                                               */
/* ------------------------------------------------------------------ */

export const imageKinds = ["illustration", "photograph", "product-photo", "graphic"] as const;

export const imageRecordSchema = z
  .object({
    src: z.string().startsWith("/images/"),
    alt: z.string().min(8, "Alt text should describe the image").max(180),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    kind: z.enum(imageKinds),
    /** "original" = created for The Gilded Skin. Otherwise the provider name. */
    source: z.enum(["original", "unsplash", "pexels", "pixabay", "amazon-api", "brand-press-kit", "other"]),
    sourceUrl: url.optional(),
    creator: z.string().optional(),
    license: z.string().min(2),
    licenseUrl: url.optional(),
    attributionRequired: z.boolean(),
    /** True when the image depicts a specific recommended product. */
    depictsSpecificProduct: z.boolean().default(false),
    rightsVerifiedAt: isoDate,
    notes: z.string().optional(),
  })
  .superRefine((img, ctx) => {
    if (img.source !== "original" && !img.sourceUrl) {
      ctx.addIssue({ code: "custom", message: "Third-party images need the original sourceUrl", path: ["sourceUrl"] });
    }
    if (img.attributionRequired && !img.creator) {
      ctx.addIssue({ code: "custom", message: "Attribution required but creator missing", path: ["creator"] });
    }
    if (img.kind === "illustration" && img.depictsSpecificProduct) {
      ctx.addIssue({
        code: "custom",
        message: "Illustrations must not be presented as a specific product",
        path: ["depictsSpecificProduct"],
      });
    }
  });
export type ImageRecord = z.infer<typeof imageRecordSchema>;

/* ------------------------------------------------------------------ */
/* Authors                                                              */
/* ------------------------------------------------------------------ */

export const authorSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(2),
  /** Only real, identifiable people get Person structured data. */
  isRealPerson: z.boolean(),
  role: z.string(),
  bio: z.string().min(20),
  /** Only list credentials that are true and verifiable. */
  credentials: z.array(z.string()).default([]),
  sameAs: z.array(url).default([]),
  /** Internal record: true when the byline is a pen name for a real editor. Not displayed. */
  penName: z.boolean().default(false),
  /** Topics shown on the author page. */
  focus: z.array(z.string()).default([]),
});
export type Author = z.infer<typeof authorSchema>;

/* ------------------------------------------------------------------ */
/* Products                                                             */
/* ------------------------------------------------------------------ */

export const productSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    name: z.string().min(2),
    brand: z.string().optional(),
    marketplace: z.enum(["US"]).default("US"),
    category: z.enum(categorySlugs),
    /** Product detail page on Amazon (untagged is fine — tag is applied centrally). */
    amazonUrl: url.optional(),
    /** A link generated with Amazon Associates tools (SiteStripe / Special Link). */
    affiliateUrl: url.optional(),
    asin: z
      .string()
      .regex(/^[A-Z0-9]{10}$/, "ASINs are 10 uppercase letters/digits")
      .optional(),
    editorialDescription: z.string().min(20),
    keyFeatures: z.array(z.string()).default([]),
    advantages: z.array(z.string()).default([]),
    disadvantages: z.array(z.string()).default([]),
    suits: z.array(z.string()).default([]),
    skipIf: z.array(z.string()).default([]),
    buyingConsiderations: z.array(z.string()).default([]),
    image: z.string().optional(),
    sources: z.array(sourceSchema).default([]),
    lastVerified: isoDate.nullable(),
    availabilityStatus: z.enum(["unverified", "verified-available", "unavailable"]),
    /**
     * Prices are hidden unless delivered by a permitted, current API source.
     * There is deliberately no field for a hand-typed price.
     */
    priceDisplay: z.enum(["hidden", "api"]).default("hidden"),
    editorialRating: z
      .object({ score: z.number().min(1).max(5), methodologyUrl: z.string().startsWith("/") })
      .nullable()
      .default(null),
    linkStatus: z.enum(["pending", "verified", "broken"]),
    status: z.enum(["draft", "published"]),
    researchNotes: z.string().optional(),
  })
  .superRefine((p, ctx) => {
    if (p.status === "published") {
      if (!p.asin && !p.affiliateUrl && !p.amazonUrl) {
        ctx.addIssue({ code: "custom", message: "Published products need an ASIN or Amazon URL", path: ["asin"] });
      }
      if (p.linkStatus !== "verified") {
        ctx.addIssue({ code: "custom", message: "Published products need a verified link", path: ["linkStatus"] });
      }
      if (!p.lastVerified) {
        ctx.addIssue({ code: "custom", message: "Published products need lastVerified", path: ["lastVerified"] });
      }
      if (p.sources.length === 0) {
        ctx.addIssue({ code: "custom", message: "Published products need at least one source", path: ["sources"] });
      }
      if (p.advantages.length === 0 || p.disadvantages.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "Published products need both advantages and limitations",
          path: ["disadvantages"],
        });
      }
    }
  });
export type Product = z.infer<typeof productSchema>;

/* ------------------------------------------------------------------ */
/* Articles                                                             */
/* ------------------------------------------------------------------ */

export const articleTypes = [
  "review",
  "comparison",
  "roundup",
  "beginners-guide",
  "how-to",
  "category-guide",
  "buying-checklist",
  "gift-guide",
  "routine",
] as const;

export const pinTemplates = ["roundup", "comparison", "routine", "checklist", "gift-guide", "organization"] as const;

export const pinConceptSchema = z.object({
  title: z.string().min(10).max(100),
  description: z.string().min(40).max(500),
  template: z.enum(pinTemplates),
  board: z.string().min(3),
  topics: z.array(z.string()).min(1).max(10),
  imageConcept: z.string().min(10),
  /** Kicker line shown above the headline on the generated pin graphic. */
  kicker: z.string().max(40).optional(),
});
export type PinConcept = z.infer<typeof pinConceptSchema>;

export const faqSchema = z.object({ question: z.string().min(8), answer: z.string().min(20) });

export const articleFrontmatterSchema = z
  .object({
    title: z.string().min(10).max(110),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase words separated by hyphens"),
    excerpt: z.string().min(40).max(300),
    seoTitle: z.string().min(15).max(70),
    metaDescription: z.string().min(70).max(165),
    primaryKeyword: z.string().min(3),
    secondaryKeywords: z.array(z.string()).default([]),
    searchIntent: z.enum(["informational", "commercial", "transactional", "navigational"]),
    articleType: z.enum(articleTypes),
    category: z.enum(categorySlugs),
    tags: z.array(z.string()).default([]),
    author: z.string(),
    reviewer: z.string().optional(),
    publishedAt: isoDate,
    updatedAt: isoDate,
    featuredImage: z.string().startsWith("/images/"),
    imageCaption: z.string().optional(),
    quickAnswer: z.string().min(40).optional(),
    keyTakeaways: z.array(z.string()).default([]),
    faq: z.array(faqSchema).default([]),
    products: z.array(z.string()).default([]),
    relatedArticles: z.array(z.string()).default([]),
    status: z.enum(["draft", "review", "published"]),
    indexing: z.enum(["index", "noindex"]).default("index"),
    /** How the article's conclusions were reached. Shown to readers. */
    basis: z.enum(["independent-research", "hands-on-testing"]),
    testingNotes: z.string().optional(),
    researchNotes: z.string().optional(),
    sources: z.array(sourceSchema).default([]),
    editorialReview: z
      .object({
        aiAssisted: z.boolean(),
        factCheckedAt: isoDate.nullable(),
        humanApprovedBy: z.string().nullable(),
        approvedAt: isoDate.nullable(),
      })
      .default({ aiAssisted: false, factCheckedAt: null, humanApprovedBy: null, approvedAt: null }),
    pinterest: z.object({ pins: z.array(pinConceptSchema).max(5) }).default({ pins: [] }),
    socialImage: z.string().optional(),
    featured: z.boolean().default(false),
  })
  .superRefine((a, ctx) => {
    if (a.updatedAt < a.publishedAt) {
      ctx.addIssue({ code: "custom", message: "updatedAt cannot be before publishedAt", path: ["updatedAt"] });
    }
    if (a.basis === "hands-on-testing" && !a.testingNotes) {
      ctx.addIssue({
        code: "custom",
        message: "Hands-on claims need documented testingNotes",
        path: ["testingNotes"],
      });
    }
    if (a.status === "published") {
      if (a.sources.length === 0) {
        ctx.addIssue({ code: "custom", message: "Published articles need sources", path: ["sources"] });
      }
      if (a.pinterest.pins.length < 3) {
        ctx.addIssue({ code: "custom", message: "Prepare three pin concepts before publishing", path: ["pinterest"] });
      }
    }
  });
export type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>;
