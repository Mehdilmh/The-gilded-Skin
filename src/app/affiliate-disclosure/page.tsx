import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { AMAZON_ASSOCIATE_DISCLOSURE } from "@/lib/site";
import { ProsePage } from "@/components/ui/ProsePage";

export const metadata: Metadata = pageMetadata({
  title: "Affiliate Disclosure",
  description: "How The Gilded Skin earns money through affiliate links, including the Amazon Associates program, and how we keep recommendations independent.",
  path: "/affiliate-disclosure",
});

export default function AffiliateDisclosurePage() {
  return (
    <ProsePage title="Affiliate Disclosure" eyebrow="Transparency" path="/affiliate-disclosure" updated="2026-10-12">
      <div className="not-prose rounded-card border border-champagne bg-white p-6">
        <p className="font-serif text-2xl leading-snug" data-testid="amazon-disclosure-page">
          {AMAZON_ASSOCIATE_DISCLOSURE}
        </p>
      </div>

      <h2>What this means</h2>
      <p>
        The Gilded Skin is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means
        for sites to earn advertising fees by advertising and linking to Amazon.com. When you click certain links on our site and make a qualifying
        purchase, we may earn a commission. This comes at no additional cost to you.
      </p>
      <p>
        Using our links doesn&rsquo;t change the price you pay, and it doesn&rsquo;t give you access to special discounts. Prices and availability are
        set by the retailer and can change at any time.
      </p>

      <h2>How you&rsquo;ll recognize affiliate links</h2>
      <ul>
        <li>Articles with affiliate links show a short disclosure near the top, before any recommendation.</li>
        <li>
          Affiliate buttons are labeled, for example &ldquo;View product on Amazon,&rdquo; with &ldquo;Affiliate link&rdquo; shown beside them.
        </li>
        <li>Affiliate links go directly to the retailer. We don&rsquo;t hide them behind redirects or disguise them as ordinary navigation.</li>
        <li>Affiliate links are marked for search engines with <code>rel=&quot;sponsored&quot;</code>.</li>
      </ul>

      <h2>Our independence</h2>
      <p>
        Commissions never decide what we recommend or how we describe it. We include limitations and alternatives, including options we don&rsquo;t
        earn from. Brands can&rsquo;t pay for coverage, and we don&rsquo;t accept free products in exchange for positive reviews. If that ever
        changes for a specific article, the article will say so clearly.
      </p>

      <h2>No affiliation or endorsement</h2>
      <p>
        The Gilded Skin is an independent publication. We are not operated by, affiliated with or endorsed by Amazon or any brand we write about.
        Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates.
      </p>

      <h2>Questions</h2>
      <p>
        If anything about how we earn money is unclear, please <Link href="/contact">contact us</Link>. You can also read our{" "}
        <Link href="/editorial-policy">editorial policy</Link>.
      </p>
    </ProsePage>
  );
}
