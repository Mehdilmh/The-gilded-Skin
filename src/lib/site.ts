/**
 * Site-wide configuration. Values that differ per environment come from env
 * variables; everything else is editable here.
 */
export const DEFAULT_SITE_URL = "https://thegildedskin.com";

function normalizeOrigin(url: string | undefined): string {
  const value = (url || DEFAULT_SITE_URL).trim().replace(/\/+$/, "");
  return value;
}

export const site = {
  name: "The Gilded Skin",
  shortName: "Gilded Skin",
  tagline: "Thoughtful beauty finds, elevated routines, and honest guides.",
  promise:
    "Thoughtful beauty finds, elevated routines, and honest guides to help you choose what belongs on your vanity.",
  description:
    "An independent beauty editorial publication with honest guides to skincare tools, beauty accessories, vanity organization and at-home self-care.",
  locale: "en_US",
  language: "en-US",
  get url() {
    return normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  },
  get contactEmail(): string | null {
    return process.env.CONTACT_EMAIL?.trim() || null;
  },
  social: {
    get pinterest() {
      return process.env.NEXT_PUBLIC_PINTEREST_URL?.trim() || null;
    },
    get instagram() {
      return process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || null;
    },
  },
  logo: "/brand/logo-mark.svg",
  defaultOgImage: "/og-default.png",
} as const;

/** True only for the real production deployment. Everything else is noindex. */
export function isIndexableEnvironment(): boolean {
  return process.env.SITE_ENV === "production";
}

/** Build an absolute, canonical URL for a site path. */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  // Canonical form: no trailing slash except the root.
  const normalized = clean.length > 1 ? clean.replace(/\/+$/, "") : clean;
  return `${site.url}${normalized === "/" ? "" : normalized}` || site.url;
}

export const AFFILIATE_SHORT_DISCLOSURE =
  "This article contains affiliate links. We may earn a commission if you make a qualifying purchase, at no additional cost to you.";

export const AMAZON_ASSOCIATE_DISCLOSURE = "As an Amazon Associate I earn from qualifying purchases.";
