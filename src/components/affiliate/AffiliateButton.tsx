import { ExternalIcon } from "@/components/ui/icons";
import type { ResolvedAffiliateLink } from "@/lib/affiliate";

const ctas = {
  view: "View product on Amazon",
  listing: "Check the current listing",
  details: "Compare product details",
} as const;

/**
 * The only way an affiliate link is rendered. Always: direct to Amazon,
 * rel="sponsored", visibly labeled, opens in a new tab with a warning label.
 */
export function AffiliateButton({
  link,
  productId,
  placement,
  cta = "view",
  variant = "primary",
}: {
  link: ResolvedAffiliateLink;
  productId: string;
  placement: string;
  cta?: keyof typeof ctas;
  variant?: "primary" | "text";
}) {
  return (
    <span className="inline-flex flex-col items-start gap-1.5">
      <a
        href={link.href}
        rel={link.rel}
        target="_blank"
        aria-label={link.label}
        data-affiliate="amazon"
        data-track="affiliate_click"
        data-item={productId}
        data-placement={placement}
        className={variant === "primary" ? "btn-gold" : "link-underline font-medium"}
      >
        {ctas[cta]}
        <ExternalIcon />
      </a>
      <span className="text-[0.7rem] uppercase tracking-[0.14em] text-taupe-dark">Affiliate link · Opens Amazon</span>
    </span>
  );
}
