import { getProduct } from "@/lib/content";
import { resolveProductLink } from "@/lib/affiliate";
import type { Product } from "@/lib/schemas";
import { AffiliateButton } from "./AffiliateButton";
import { ProsCons, SuitsSkip } from "@/components/article/ProsCons";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { formatDate } from "@/lib/format";
import { StarMark } from "@/components/ui/icons";

/** Shown only in development so editors can see where pending products sit. */
function PendingProduct({ product, id }: { product?: Product; id: string }) {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <div className="not-prose my-8 rounded-card border-2 border-dashed border-champagne bg-white/60 p-5 text-sm" data-testid="pending-product">
      <p className="eyebrow">Editor preview · not shown to readers</p>
      <p className="mt-2">
        Product <code>{id}</code> {product ? `(${product.name}) is ${product.status}, link ${product.linkStatus}` : "does not exist"}. Verify the
        product and link, then set <code>status: &quot;published&quot;</code> and <code>linkStatus: &quot;verified&quot;</code>.
      </p>
    </div>
  );
}

/** Editorial product card. Never displays prices, ratings or review counts. */
export function ProductCard({ id, rank, heading }: { id: string; rank?: number; heading?: string }) {
  const product = getProduct(id);
  const link = product ? resolveProductLink(product) : null;
  if (!product || !link) return <PendingProduct product={product} id={id} />;

  return (
    <section className="not-prose my-12 overflow-hidden rounded-card border border-beige bg-white shadow-soft" data-testid="product-card" data-product={product.id}>
      <div className="grid gap-0 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="bg-beige/40 p-6">
          {product.image ? (
            <EditorialImage src={product.image} sizes="(min-width: 768px) 40vw, 100vw" showKindLabel />
          ) : (
            <div className="flex aspect-square flex-col items-center justify-center gap-4 rounded-card border border-champagne/40 bg-ivory p-6 text-center">
              <StarMark className="h-8 w-8 text-champagne" />
              <p className="font-serif text-xl leading-snug">{product.brand ?? product.name}</p>
              <a
                href={link.href}
                rel={link.rel}
                target="_blank"
                aria-label={`See photos of ${product.name} on Amazon (affiliate link, opens in a new tab)`}
                data-affiliate="amazon"
                data-track="affiliate_click"
                data-item={product.id}
                data-placement="product-photos"
                className="link-underline text-sm font-medium"
              >
                See product photos on Amazon
              </a>
            </div>
          )}
        </div>
        <div className="p-6 md:p-8">
          {rank !== undefined && <p className="eyebrow">Option {rank}</p>}
          <h3 className="mt-1 font-serif text-3xl leading-tight">{heading ?? product.name}</h3>
          {product.brand && <p className="mt-1 text-sm text-taupe-dark">by {product.brand}</p>}
          <p className="mt-4 leading-relaxed text-espresso/85">{product.editorialDescription}</p>
          {product.keyFeatures.length > 0 && (
            <ul className="mt-4 list-disc space-y-1.5 pl-5 text-[0.95rem] marker:text-champagne">
              {product.keyFeatures.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}
          <div className="mt-6">
            <AffiliateButton link={link} productId={product.id} placement="product-card" />
          </div>
          {product.lastVerified && (
            <p className="mt-4 text-xs text-taupe-dark">
              Product details last checked {formatDate(product.lastVerified)}. Price and availability can change — check the listing.
            </p>
          )}
        </div>
      </div>
      <div className="border-t border-beige px-6 md:px-8">
        <ProsCons pros={product.advantages} cons={product.disadvantages} headingLevel="h4" />
        {(product.suits.length > 0 || product.skipIf.length > 0) && <SuitsSkip suits={product.suits} skip={product.skipIf} subject="it" headingLevel="h4" />}
      </div>
    </section>
  );
}

/** Side-by-side comparison of real, verified product records. */
export function ProductComparison({ ids, caption }: { ids: string[]; caption: string }) {
  const rows = ids
    .map((id) => getProduct(id))
    .map((p) => (p ? { p, link: resolveProductLink(p) } : null))
    .filter((x): x is { p: Product; link: NonNullable<ReturnType<typeof resolveProductLink>> } => Boolean(x?.link));
  if (rows.length < 2) {
    return process.env.NODE_ENV === "production" ? null : (
      <div className="not-prose my-8 rounded-card border-2 border-dashed border-champagne p-5 text-sm" data-testid="pending-product">
        Comparison table hidden: fewer than two verified products ({ids.join(", ")}).
      </div>
    );
  }
  return (
    <div className="not-prose my-10" data-testid="product-comparison">
      <div className="scroll-region" role="region" aria-label={caption} tabIndex={0}>
        <table className="w-full min-w-[44rem] border-collapse text-left text-[0.92rem] leading-relaxed">
          <caption className="mb-3 text-left font-serif text-xl">{caption}</caption>
          <thead>
            <tr className="border-b border-champagne text-eyebrow font-semibold uppercase text-champagne-dark">
              <th scope="col" className="sticky left-0 bg-ivory px-4 py-3">Product</th>
              <th scope="col" className="px-4 py-3">Best for</th>
              <th scope="col" className="px-4 py-3">Strengths</th>
              <th scope="col" className="px-4 py-3">Limitations</th>
              <th scope="col" className="px-4 py-3">Before you buy</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">Retailer link</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ p, link }) => (
              <tr key={p.id} className="border-b border-beige align-top">
                <th scope="row" className="sticky left-0 bg-ivory px-4 py-4 font-serif text-lg font-medium">{p.name}</th>
                <td className="px-4 py-4">{p.suits[0] ?? "—"}</td>
                <td className="px-4 py-4">{p.advantages.slice(0, 2).join("; ")}</td>
                <td className="px-4 py-4">{p.disadvantages.slice(0, 2).join("; ")}</td>
                <td className="px-4 py-4">{p.buyingConsiderations[0] ?? "—"}</td>
                <td className="px-4 py-4">
                  <AffiliateButton link={link} productId={p.id} placement="comparison-table" cta="listing" variant="text" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
