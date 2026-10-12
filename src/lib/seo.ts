import type { Metadata } from "next";
import { absoluteUrl, isIndexableEnvironment, site } from "./site";

export interface PageSeoInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  noindex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  /** Use the title exactly (skip the "| The Gilded Skin" suffix). */
  absoluteTitle?: boolean;
}

/** Titles longer than this tend to be truncated in search results. */
export const MAX_TITLE_LENGTH = 70;

/**
 * Build Next.js metadata for a page. Every indexable page gets a canonical URL
 * on the production domain, Open Graph and Twitter tags, and robots rules that
 * automatically become noindex outside production.
 */
export function pageMetadata(input: PageSeoInput): Metadata {
  const canonical = absoluteUrl(input.path);
  const index = !input.noindex && isIndexableEnvironment();
  const image = absoluteUrl(input.image ?? site.defaultOgImage);
  // Long titles drop the brand suffix so search results don't truncate them.
  const suffixed = `${input.title} | ${site.name}`;
  const absolute = input.absoluteTitle || suffixed.length > MAX_TITLE_LENGTH;
  const fullTitle = absolute ? input.title : suffixed;
  return {
    title: absolute ? { absolute: input.title } : input.title,
    description: input.description,
    alternates: { canonical },
    robots: index
      ? { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 }
      : { index: false, follow: !input.noindex },
    openGraph: {
      type: input.type ?? "website",
      url: canonical,
      siteName: site.name,
      locale: site.locale,
      title: fullTitle,
      description: input.description,
      images: [{ url: image, width: 1200, height: 630, alt: input.imageAlt ?? site.name }],
      ...(input.type === "article"
        ? { publishedTime: input.publishedTime, modifiedTime: input.modifiedTime }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: input.description,
      images: [image],
    },
  };
}
