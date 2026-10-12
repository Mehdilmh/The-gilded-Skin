import { buildBrowseLink } from "@/lib/affiliate";
import { ExternalIcon } from "@/components/ui/icons";

/**
 * A tagged link to Amazon search results for a product type. Used where no
 * individually verified product fits; it never implies we reviewed the results.
 */
export function ShopOnAmazon({ query, node, label, note }: { query?: string; node?: string; label: string; note?: string }) {
  // `node` links to an Amazon category page; `query` to search results.
  const url = node && /^\d+$/.test(node) ? `https://www.amazon.com/b?node=${node}` : query ? `https://www.amazon.com/s?k=${encodeURIComponent(query)}` : null;
  const link = url ? buildBrowseLink(url) : null;
  if (!link) return null;
  return (
    <aside className="not-prose my-10 rounded-card border border-beige bg-white p-6" data-testid="shop-on-amazon">
      <p className="eyebrow">Shopping for this?</p>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-espresso/85">
        {note ??
          "We haven't reviewed every product in these results. Use the checklist above, read the ingredient list or specifications, and check the return policy before you buy."}
      </p>
      <a
        href={link.href}
        rel={link.rel}
        target="_blank"
        aria-label={`${label} (affiliate link, opens in a new tab)`}
        data-affiliate="amazon"
        data-track="affiliate_click"
        data-item={node ? `node:${node}` : `search:${query}`}
        data-placement="shop-on-amazon"
        className="btn-gold mt-4"
      >
        {label} <ExternalIcon />
      </a>
      <p className="mt-2 text-[0.7rem] uppercase tracking-[0.14em] text-taupe-dark">Affiliate link · Opens Amazon {node ? "category page" : "search"}</p>
    </aside>
  );
}
