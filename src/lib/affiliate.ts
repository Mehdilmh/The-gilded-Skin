/**
 * Central Amazon Associates link handling.
 *
 * - The tracking ID comes from the server-side AMAZON_ASSOCIATE_TAG variable.
 * - Links point directly at Amazon product detail pages (no cloaking, no
 *   interstitial redirects through this site).
 * - Products store an ASIN and/or an Associates-generated link once; every
 *   article renders from that single record, so replacing a link is one edit.
 */
import type { Product } from "./schemas";

export const MARKETPLACES = {
  US: { host: "www.amazon.com", tagSuffix: "-20" },
} as const;
export type Marketplace = keyof typeof MARKETPLACES;

const AMAZON_HOST = /(^|\.)amazon\.(com|ca|co\.uk|de|fr|it|es|co\.jp|com\.au|com\.mx|in|com\.br|nl|se|pl|sg|ae|sa|com\.tr|com\.be|eg)$/i;
const AMAZON_SHORT_HOST = /^(amzn\.to|a\.co)$/i;
const PRODUCT_PATH = /\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})(?:[/?]|$)/i;
const TAG_PATTERN = /^[a-z0-9][a-z0-9-]{1,60}-\d{2}$/i;

export const AFFILIATE_REL = "sponsored nofollow noopener noreferrer";

export function isValidTag(tag: string | undefined | null): tag is string {
  return Boolean(tag && TAG_PATTERN.test(tag));
}

/** Read the configured tracking ID. Server-side only. */
export function getAssociateTag(): string | null {
  const tag = process.env.AMAZON_ASSOCIATE_TAG?.trim();
  return isValidTag(tag) ? tag : null;
}

export function getMarketplaceHost(marketplace: Marketplace = "US"): string {
  const override = process.env.AMAZON_MARKETPLACE?.trim();
  if (override && AMAZON_HOST.test(override)) return override;
  return MARKETPLACES[marketplace].host;
}

export function isAmazonUrl(href: string): boolean {
  try {
    const u = new URL(href);
    return AMAZON_HOST.test(u.hostname) || AMAZON_SHORT_HOST.test(u.hostname);
  } catch {
    return false;
  }
}

export function extractAsin(href: string): string | null {
  try {
    const m = PRODUCT_PATH.exec(new URL(href).pathname);
    return m ? m[1]!.toUpperCase() : null;
  } catch {
    return null;
  }
}

/** Canonical tagged product detail page link built from an ASIN. */
export function buildProductUrl(asin: string, tag: string, marketplace: Marketplace = "US"): string {
  if (!/^[A-Z0-9]{10}$/.test(asin)) throw new Error(`Invalid ASIN: ${asin}`);
  if (!isValidTag(tag)) throw new Error(`Invalid Associates tag: ${tag}`);
  return `https://${getMarketplaceHost(marketplace)}/dp/${asin}?tag=${encodeURIComponent(tag)}`;
}

/**
 * Ensure an Amazon URL carries the configured tag. Leaves Associates-generated
 * short links (amzn.to) untouched because their tag is embedded server-side by
 * Amazon; those are flagged for manual verification by the audit instead.
 */
export function applyTag(href: string, tag: string): string {
  const u = new URL(href);
  if (AMAZON_SHORT_HOST.test(u.hostname)) return href;
  if (!AMAZON_HOST.test(u.hostname)) throw new Error(`Not an Amazon URL: ${href}`);
  u.protocol = "https:";
  u.searchParams.set("tag", tag);
  return u.toString();
}

export type LinkIssueLevel = "error" | "warning";
export interface LinkIssue {
  level: LinkIssueLevel;
  code:
    | "missing-tag"
    | "wrong-tag"
    | "invalid-url"
    | "not-amazon"
    | "not-product-page"
    | "insecure"
    | "short-link-unverified"
    | "marketplace-mismatch"
    | "asin-mismatch";
  message: string;
}

/** Static validation of an affiliate URL (no network). */
export function validateAffiliateUrl(
  href: string,
  opts: { expectedTag: string | null; marketplace?: Marketplace; asin?: string },
): LinkIssue[] {
  const issues: LinkIssue[] = [];
  let u: URL;
  try {
    u = new URL(href);
  } catch {
    return [{ level: "error", code: "invalid-url", message: `Not a valid URL: ${href}` }];
  }
  if (u.protocol !== "https:") issues.push({ level: "error", code: "insecure", message: "Use https links" });
  if (AMAZON_SHORT_HOST.test(u.hostname)) {
    issues.push({
      level: "warning",
      code: "short-link-unverified",
      message: "Short links hide the tag; confirm in Associates Central that it was generated with your tracking ID",
    });
    return issues;
  }
  if (!AMAZON_HOST.test(u.hostname)) {
    issues.push({ level: "error", code: "not-amazon", message: `Unexpected host ${u.hostname}` });
    return issues;
  }
  const expectedHost = MARKETPLACES[opts.marketplace ?? "US"].host;
  if (u.hostname !== expectedHost && u.hostname !== expectedHost.replace(/^www\./, "")) {
    issues.push({
      level: "error",
      code: "marketplace-mismatch",
      message: `Link host ${u.hostname} does not match marketplace ${expectedHost}`,
    });
  }
  const asin = extractAsin(href);
  if (!asin) {
    issues.push({ level: "error", code: "not-product-page", message: "Link should point to a product detail page (/dp/ASIN)" });
  } else if (opts.asin && asin !== opts.asin) {
    issues.push({ level: "error", code: "asin-mismatch", message: `URL ASIN ${asin} differs from record ASIN ${opts.asin}` });
  }
  const tag = u.searchParams.get("tag");
  if (!tag) {
    issues.push({ level: "error", code: "missing-tag", message: "Missing tracking ID (tag parameter)" });
  } else if (opts.expectedTag && tag !== opts.expectedTag) {
    issues.push({ level: "error", code: "wrong-tag", message: `Tag "${tag}" differs from configured "${opts.expectedTag}"` });
  }
  return issues;
}

export interface ResolvedAffiliateLink {
  href: string;
  rel: string;
  label: string;
}

/**
 * Resolve the outbound link for a product, or null when the product must not
 * be linked (unpublished, unverified, or no tag configured).
 */
export function resolveProductLink(product: Product, tag: string | null = getAssociateTag()): ResolvedAffiliateLink | null {
  if (product.status !== "published" || product.linkStatus !== "verified" || !tag) return null;
  let href: string | null = null;
  if (product.affiliateUrl) {
    href = isAmazonUrl(product.affiliateUrl) ? applyTag(product.affiliateUrl, tag) : null;
  } else if (product.asin) {
    href = buildProductUrl(product.asin, tag, product.marketplace);
  } else if (product.amazonUrl) {
    href = applyTag(product.amazonUrl, tag);
  }
  if (!href) return null;
  return {
    href,
    rel: AFFILIATE_REL,
    label: `View ${product.name} on Amazon (affiliate link, opens in a new tab)`,
  };
}

/**
 * Tagged link to an Amazon category or search page (Associates permits these).
 * Strips Amazon's internal ref/tracking parameters and applies our tag.
 */
export function buildBrowseLink(url: string, tag: string | null = getAssociateTag()): ResolvedAffiliateLink | null {
  if (!tag || !isAmazonUrl(url)) return null;
  const u = new URL(applyTag(url, tag));
  if (u.hostname !== MARKETPLACES.US.host) return null;
  for (const key of [...u.searchParams.keys()]) {
    if (key === "ref" || key.startsWith("pf_rd") || key === "qid" || key === "crid" || key === "sprefix") u.searchParams.delete(key);
  }
  return { href: u.toString(), rel: AFFILIATE_REL, label: "Browse on Amazon (affiliate link, opens in a new tab)" };
}

/**
 * Add campaign parameters to a link to *this site* (e.g. Pinterest pins).
 * UTM parameters only ever go on our own URLs, never on Amazon links, so they
 * can't interfere with Associates tracking.
 */
export function withUtm(siteUrl: string, params: { source: string; medium: string; campaign: string; content?: string }): string {
  if (isAmazonUrl(siteUrl)) throw new Error("Do not add UTM parameters to Amazon links");
  const u = new URL(siteUrl);
  u.searchParams.set("utm_source", params.source);
  u.searchParams.set("utm_medium", params.medium);
  u.searchParams.set("utm_campaign", params.campaign);
  if (params.content) u.searchParams.set("utm_content", params.content);
  return u.toString();
}
