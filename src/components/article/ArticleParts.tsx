import Link from "next/link";
import type { Article, TocItem } from "@/lib/content";
import type { Author, Source } from "@/lib/schemas";
import { formatDate } from "@/lib/format";
import { PinterestIcon } from "@/components/ui/icons";
import { absoluteUrl } from "@/lib/site";
import { withUtm } from "@/lib/affiliate";
import { AuthorAvatar } from "@/components/ui/AuthorAvatar";

export function TableOfContents({ items }: { items: TocItem[] }) {
  const top = items.filter((i) => i.level === 2);
  if (top.length < 3) return null;
  return (
    <nav aria-labelledby="toc-heading" className="rounded-card border border-beige bg-white/70 p-5 text-sm">
      <h2 id="toc-heading" className="eyebrow">
        In this guide
      </h2>
      <ol className="mt-3 space-y-2 [counter-reset:toc]">
        {top.map((i) => (
          <li key={i.id} className="flex gap-3 leading-snug [counter-increment:toc] before:font-serif before:text-champagne-dark before:content-[counter(toc,decimal-leading-zero)]">
            <a href={`#${i.id}`} className="text-espresso/85 hover:text-champagne-dark">
              {i.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function SourceList({ sources }: { sources: Source[] }) {
  if (sources.length === 0) return null;
  return (
    <section aria-labelledby="sources" className="mt-16 border-t border-beige pt-8">
      <h2 id="sources" className="font-serif text-2xl">
        Sources
      </h2>
      <p className="mt-2 text-sm text-taupe-dark">Factual claims in this guide are based on the following references. Links open the original source.</p>
      <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-relaxed marker:text-champagne-dark">
        {sources.map((s) => (
          <li key={s.url}>
            <a href={s.url} rel="noopener" target="_blank" className="link-underline">
              {s.title}
            </a>{" "}
            <span className="text-taupe-dark">— {s.publisher}</span>
            {s.supports && <span className="block text-taupe-dark">Supports: {s.supports}</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Faq({ items }: { items: Article["faq"] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="faq" className="mt-16">
      <h2 id="faq" className="font-serif text-3xl">
        Frequently asked questions
      </h2>
      <div className="mt-6 divide-y divide-beige border-y border-beige">
        {items.map((f) => (
          <div key={f.question} className="py-5">
            <h3 className="font-serif text-xl">{f.question}</h3>
            <p className="mt-2 leading-relaxed text-espresso/85">{f.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const basisCopy: Record<Article["basis"], string> = {
  "independent-research":
    "This guide is based on independent research of the sources listed below. We did not conduct hands-on testing of products for this article.",
  "hands-on-testing": "This guide includes hands-on use by our editors, documented in our testing notes.",
};

export function HowWeResearched({ article }: { article: Article }) {
  return (
    <section aria-labelledby="methodology" className="mt-12 rounded-card bg-beige/40 p-6">
      <h2 id="methodology" className="eyebrow">
        How this guide was researched
      </h2>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-espresso/85">
        {basisCopy[article.basis]} Content is general information, not medical advice; talk to a dermatologist or other qualified clinician about
        specific skin concerns. Read our{" "}
        <Link href="/editorial-policy" className="link-underline">
          editorial policy
        </Link>
        .
      </p>
    </section>
  );
}

export function AuthorBox({ author, reviewer }: { author?: Author; reviewer?: Author }) {
  if (!author) return null;
  const href = author.isRealPerson ? `/author/${author.id}` : "/about";
  return (
    <section aria-label="About the author" className="mt-12 flex gap-5 border-t border-beige pt-8">
      <AuthorAvatar author={author} />
      <div>
        <p className="eyebrow">Written by</p>
        <p className="mt-1 font-serif text-2xl">
          <Link href={href} className="hover:text-champagne-dark">
            {author.name}
          </Link>
        </p>
        <p className="text-sm text-taupe-dark">{author.role}</p>
        <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-espresso/80">{author.bio}</p>
        {author.credentials.length > 0 && <p className="mt-2 text-sm text-espresso/80">{author.credentials.join(" · ")}</p>}
        {reviewer && (
          <p className="mt-3 text-sm">
            Reviewed by <strong className="font-medium">{reviewer.name}</strong>, {reviewer.role}
          </p>
        )}
        <Link href={href} className="mt-4 inline-flex items-center gap-2 text-sm font-medium hover:text-champagne-dark">
          More from {author.name.split(" ")[0]} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

export function ArticleDates({ article }: { article: Article }) {
  const updated = article.updatedAt !== article.publishedAt;
  return (
    <p className="text-xs uppercase tracking-[0.12em] text-taupe-dark">
      {updated ? (
        <>
          Updated <time dateTime={article.updatedAt}>{formatDate(article.updatedAt)}</time>
          <span aria-hidden="true"> · </span>
          <span className="normal-case tracking-normal">
            First published <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          </span>
        </>
      ) : (
        <>
          Published <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
        </>
      )}
      <span aria-hidden="true"> · </span>
      {article.readingMinutes} min read
    </p>
  );
}

/** Plain link to Pinterest's save dialog — no third-party script required. */
export function PinterestShare({ article, pinIndex = 0 }: { article: Article; pinIndex?: number }) {
  const pin = article.pinterest.pins[pinIndex];
  const pageUrl = withUtm(absoluteUrl(`/${article.slug}`), {
    source: "pinterest",
    medium: "social",
    campaign: "save-button",
    content: article.slug,
  });
  const media = absoluteUrl(`/pins/${article.slug}/${pinIndex + 1}`);
  const description = pin ? `${pin.title} — ${pin.description}` : article.excerpt;
  const href = `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(pageUrl)}&media=${encodeURIComponent(media)}&description=${encodeURIComponent(description)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      data-track="pinterest_save"
      data-item={article.slug}
      className="inline-flex items-center gap-2 rounded-pill border border-espresso/20 px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-espresso hover:border-espresso hover:bg-white"
    >
      <PinterestIcon /> Save to Pinterest
    </a>
  );
}
