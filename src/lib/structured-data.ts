/**
 * JSON-LD builders. Every value must mirror visible page content. There are
 * intentionally no builders for Review, AggregateRating or Offer: add those
 * only once genuine reviews and permitted price data exist.
 */
import type { Article } from "./content";
import type { Author, ImageRecord } from "./schemas";
import { absoluteUrl, site } from "./site";

type JsonLd = Record<string, unknown>;

export function organizationJsonLd(): JsonLd {
  const sameAs = [site.social.pinterest, site.social.instagram].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site.url}/#organization`,
    name: site.name,
    url: site.url,
    logo: { "@type": "ImageObject", url: absoluteUrl("/brand/logo-512.png"), width: 512, height: 512 },
    description: site.description,
    ...(sameAs.length ? { sameAs } : {}),
    ...(site.contactEmail ? { email: site.contactEmail } : {}),
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: site.name,
    url: site.url,
    inLanguage: site.language,
    publisher: { "@id": `${site.url}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${site.url}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(crumbs: Crumb[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

function authorNode(author: Author | undefined): JsonLd {
  if (author?.isRealPerson) {
    return {
      "@type": "Person",
      name: author.name,
      url: absoluteUrl(`/author/${author.id}`),
      ...(author.sameAs.length ? { sameAs: author.sameAs } : {}),
      jobTitle: author.role,
    };
  }
  // Collective editorial byline: attribute to the organization, not a fictional person.
  return { "@type": "Organization", name: author?.name ?? site.name, url: absoluteUrl("/about") };
}

export function articleJsonLd(article: Article, author: Author | undefined, image: ImageRecord | undefined): JsonLd {
  const url = absoluteUrl(`/${article.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    inLanguage: site.language,
    wordCount: article.wordCount,
    articleSection: article.category,
    keywords: [article.primaryKeyword, ...article.secondaryKeywords].join(", "),
    author: authorNode(author),
    publisher: { "@id": `${site.url}/#organization` },
    ...(image
      ? {
          image: {
            "@type": "ImageObject",
            url: absoluteUrl(image.src),
            width: image.width,
            height: image.height,
            caption: article.imageCaption ?? image.alt,
          },
        }
      : {}),
    ...(article.sources.length ? { citation: article.sources.map((s) => s.url) } : {}),
  };
}

/** FAQPage only when the same Q&A is visible on the page. */
export function faqJsonLd(faq: Article["faq"]): JsonLd | null {
  if (faq.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function collectionPageJsonLd(name: string, description: string, path: string, items: Article[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: { "@id": `${site.url}/#website` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((a, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(`/${a.slug}`), name: a.title })),
    },
  };
}

/** Serialize JSON-LD safely for inline <script> tags. */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function authorPageJsonLd(author: Author): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: absoluteUrl(`/author/${author.id}`),
    mainEntity: {
      "@type": "Person",
      name: author.name,
      jobTitle: author.role,
      description: author.bio,
      url: absoluteUrl(`/author/${author.id}`),
      worksFor: { "@id": `${site.url}/#organization` },
      ...(author.sameAs.length ? { sameAs: author.sameAs } : {}),
    },
  };
}
