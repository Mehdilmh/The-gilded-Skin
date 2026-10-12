import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { LegalReviewNote, ProsePage } from "@/components/ui/ProsePage";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Use",
  description: "The terms that apply when you use The Gilded Skin, including our content, medical disclaimer, affiliate links and limitations.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <ProsePage title="Terms of Use" path="/terms" updated="2026-10-12">
      <LegalReviewNote />
      <p>By using {site.name}, you agree to these terms. If you don&rsquo;t agree, please don&rsquo;t use the site.</p>
      <h2>Information, not advice</h2>
      <p>
        Our content is for general information. It isn&rsquo;t medical, dermatological or professional advice, and it isn&rsquo;t a substitute for
        consultation with a qualified clinician. Always read product labels and manufacturers&rsquo; instructions, and stop using any product that
        causes a reaction.
      </p>
      <h2>Accuracy</h2>
      <p>
        We work to keep guides accurate and current, but product details, prices and availability change. Retailer listings are the source of truth
        for current price and availability. If you spot an error, please <Link href="/contact">tell us</Link>.
      </p>
      <h2>Affiliate links</h2>
      <p>
        Some links are affiliate links, as explained in our <Link href="/affiliate-disclosure">affiliate disclosure</Link>. Purchases are made with
        the retailer, under the retailer&rsquo;s terms. We are not responsible for products, orders, shipping, returns or warranties.
      </p>
      <h2>Intellectual property</h2>
      <p>
        Text, illustrations, logos and design on this site belong to {site.name} or are used under license. You may share links and short quotations
        with attribution. Please don&rsquo;t republish our articles or images without permission. Saving our pins to Pinterest using the provided
        links is welcome.
      </p>
      <h2>Third-party links</h2>
      <p>We link to external sites for sources and products. We don&rsquo;t control them and aren&rsquo;t responsible for their content or practices.</p>
      <h2>Acceptable use</h2>
      <p>Please don&rsquo;t attempt to disrupt the site, access non-public areas, scrape it at a volume that affects performance, or misuse the contact form.</p>
      <h2>Limitation of liability</h2>
      <p>
        To the extent permitted by law, the site is provided &ldquo;as is&rdquo;, and we are not liable for losses arising from your use of it or of
        products you choose to buy.
      </p>
      <h2>Changes</h2>
      <p>We may update these terms. The date at the top shows the latest version.</p>
    </ProsePage>
  );
}
