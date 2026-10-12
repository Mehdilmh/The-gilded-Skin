/**
 * Turns rows from the product spreadsheet (category, Amazon link, notes)
 * into draft product records. Links are pasted by a person from amazon.com —
 * nothing here scrapes or queries Amazon.
 */
import { extractAsin, isAmazonUrl, MARKETPLACES } from "./affiliate";
import { categorySlugs, type CategorySlug } from "./categories";
import { productSchema, type Product } from "./schemas";

export interface ImportRow {
  category: string;
  amazonLink: string;
  productName?: string;
  brand?: string;
  article?: string;
  notes?: string;
}

export type ImportResult =
  | { ok: true; product: Product; article?: string }
  | { ok: false; row: number; error: string };

const ASIN_ONLY = /^[A-Z0-9]{10}$/;

/** Accepts a full Amazon URL (any length) or a bare ASIN. */
export function parseAmazonInput(input: string): { asin: string } | { error: string } {
  const value = input.trim();
  if (ASIN_ONLY.test(value.toUpperCase()) && !value.includes("/")) return { asin: value.toUpperCase() };
  if (!/^https?:\/\//i.test(value)) return { error: "Not a link or ASIN" };
  if (!isAmazonUrl(value)) return { error: "Not an Amazon link" };
  const host = new URL(value).hostname;
  if (/^(amzn\.to|a\.co)$/i.test(host)) {
    return { error: "Short link — open it in a browser and paste the full amazon.com address instead" };
  }
  if (host !== MARKETPLACES.US.host && host !== "amazon.com") {
    return { error: `Link is for ${host}; use the US store (www.amazon.com)` };
  }
  const asin = extractAsin(value);
  return asin ? { asin } : { error: "No product ID (ASIN) in this link — open the product page and copy its address" };
}

export function normalizeCategory(input: string): CategorySlug | null {
  const v = input.trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z]+/g, " ").trim();
  const aliases: Record<string, CategorySlug> = {
    "beauty tools": "beauty-tools",
    tools: "beauty-tools",
    skincare: "skincare",
    "skincare essentials": "skincare",
    "skin care": "skincare",
    "vanity organization": "vanity-organization",
    "vanity and organization": "vanity-organization",
    vanity: "vanity-organization",
    organization: "vanity-organization",
    "gift guides": "gift-guides",
    gifts: "gift-guides",
    gift: "gift-guides",
  };
  if (aliases[v]) return aliases[v]!;
  const slug = v.replace(/ /g, "-");
  return (categorySlugs as readonly string[]).includes(slug) ? (slug as CategorySlug) : null;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

/** Build a draft record. Editorial fields stay empty until a person researches the product. */
export function rowToProduct(row: ImportRow, rowNumber: number, existingIds: Set<string>): ImportResult {
  const category = normalizeCategory(row.category ?? "");
  if (!category) return { ok: false, row: rowNumber, error: `Unknown category "${row.category}" (use: ${categorySlugs.join(", ")})` };
  const parsed = parseAmazonInput(row.amazonLink ?? "");
  if ("error" in parsed) return { ok: false, row: rowNumber, error: parsed.error };

  const name = row.productName?.trim() || `Product ${parsed.asin} (name needed)`;
  let id = slugify(row.productName?.trim() ? `${row.brand ?? ""} ${name}` : `amazon-${parsed.asin}`) || `amazon-${parsed.asin.toLowerCase()}`;
  if (existingIds.has(id)) id = `${id}-${parsed.asin.toLowerCase()}`;

  const product = productSchema.parse({
    id,
    name,
    ...(row.brand?.trim() ? { brand: row.brand.trim() } : {}),
    marketplace: "US",
    category,
    asin: parsed.asin,
    amazonUrl: `https://${MARKETPLACES.US.host}/dp/${parsed.asin}`,
    editorialDescription: "Draft — write original analysis from the brand's official specifications before publishing.",
    lastVerified: null,
    availabilityStatus: "unverified",
    priceDisplay: "hidden",
    linkStatus: "pending",
    status: "draft",
    researchNotes: [row.notes?.trim(), `Imported from spreadsheet row ${rowNumber}.`].filter(Boolean).join(" "),
  });
  return { ok: true, product, article: row.article?.trim() || undefined };
}
