import Link from "next/link";
import type { Article } from "@/lib/content";
import { getCategory } from "@/lib/categories";
import { EditorialImage } from "./EditorialImage";
import { formatDate } from "@/lib/format";

const typeLabel: Record<Article["articleType"], string> = {
  review: "Review",
  comparison: "Comparison",
  roundup: "Buying Guide",
  "beginners-guide": "Beginner's Guide",
  "how-to": "How-To",
  "category-guide": "Category Guide",
  "buying-checklist": "Buying Checklist",
  "gift-guide": "Gift Guide",
  routine: "Routine",
};

export function articleTypeLabel(type: Article["articleType"]) {
  return typeLabel[type];
}

interface Props {
  article: Article;
  variant?: "default" | "compact" | "feature";
  headingLevel?: "h2" | "h3";
  priority?: boolean;
}

export function ArticleCard({ article, variant = "default", headingLevel = "h3", priority }: Props) {
  const H = headingLevel;
  const category = getCategory(article.category);
  const href = `/${article.slug}`;

  if (variant === "compact") {
    return (
      <article className="group flex gap-4">
        <Link href={href} className="w-28 shrink-0 sm:w-32" tabIndex={-1} aria-hidden="true">
          <EditorialImage src={article.featuredImage} alt="" hideCredit sizes="128px" aspect="square" imgClassName="transition duration-500 group-hover:scale-[1.03]" />
        </Link>
        <div>
          <p className="eyebrow">{articleTypeLabel(article.articleType)}</p>
          <H className="mt-1.5 font-serif text-xl leading-snug">
            <Link href={href} className="hover:text-champagne-dark">
              {article.title}
            </Link>
          </H>
          <p className="mt-1 text-xs text-taupe-dark">{article.readingMinutes} min read</p>
        </div>
      </article>
    );
  }

  const feature = variant === "feature";
  return (
    <article className="group flex flex-col">
      <Link href={href} tabIndex={-1} aria-hidden="true" className="block overflow-hidden rounded-card">
        <EditorialImage
          src={article.featuredImage}
          alt=""
          hideCredit
          sizes={feature ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
          aspect={feature ? "editorial" : "card"}
          priority={priority}
          imgClassName="transition duration-700 group-hover:scale-[1.03]"
        />
      </Link>
      <div className="mt-5 flex flex-1 flex-col">
        <p className="eyebrow">
          {articleTypeLabel(article.articleType)}
          {category && <span className="text-taupe-dark"> · {category.shortName}</span>}
        </p>
        <H className={`mt-2 font-serif leading-tight ${feature ? "text-3xl md:text-4xl" : "text-2xl"}`}>
          <Link href={href} className="hover:text-champagne-dark">
            {article.title}
          </Link>
        </H>
        <p className={`mt-3 leading-relaxed text-espresso/80 ${feature ? "text-base" : "text-[0.95rem]"}`}>{article.excerpt}</p>
        <p className="mt-4 text-xs uppercase tracking-[0.12em] text-taupe-dark">
          <time dateTime={article.updatedAt}>Updated {formatDate(article.updatedAt)}</time> · {article.readingMinutes} min read
        </p>
      </div>
    </article>
  );
}
