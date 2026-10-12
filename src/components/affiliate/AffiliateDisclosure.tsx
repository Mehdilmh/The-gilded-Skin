import Link from "next/link";
import { AFFILIATE_SHORT_DISCLOSURE, AMAZON_ASSOCIATE_DISCLOSURE } from "@/lib/site";

/** Short disclosure placed before any commercial recommendation. */
export function AffiliateDisclosure({ hasAffiliateLinks, context = "article" }: { hasAffiliateLinks: boolean; context?: "article" | "page" }) {
  return (
    <aside
      aria-label="Affiliate disclosure"
      data-testid="article-disclosure"
      className="not-prose rounded-card border border-beige bg-white/70 px-5 py-4 text-sm leading-relaxed text-espresso/80"
    >
      {hasAffiliateLinks ? (
        <p>
          <strong className="font-semibold text-espresso">Disclosure:</strong>{" "}
          {context === "page" ? AFFILIATE_SHORT_DISCLOSURE.replace("This article", "This page") : AFFILIATE_SHORT_DISCLOSURE} {AMAZON_ASSOCIATE_DISCLOSURE}{" "}
          <Link href="/affiliate-disclosure" className="link-underline">
            Learn more
          </Link>
          .
        </p>
      ) : (
        <p>
          <strong className="font-semibold text-espresso">Disclosure:</strong> This guide contains no affiliate product links. The Gilded Skin is
          reader-supported: when other articles link to retailers, we may earn a commission on qualifying purchases.{" "}
          <Link href="/affiliate-disclosure" className="link-underline">
            How we make money
          </Link>
          .
        </p>
      )}
    </aside>
  );
}
