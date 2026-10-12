import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { ProsePage } from "@/components/ui/ProsePage";

export const metadata: Metadata = pageMetadata({
  title: "Editorial Policy",
  description: "How The Gilded Skin researches, writes, fact-checks and updates its beauty guides, and how we keep commercial interests separate from recommendations.",
  path: "/editorial-policy",
});

export default function EditorialPolicyPage() {
  return (
    <ProsePage
      title="Editorial Policy"
      eyebrow="How we work"
      path="/editorial-policy"
      updated="2026-10-12"
      intro={<p>How we choose topics, research claims, use technology responsibly and keep recommendations independent of commissions.</p>}
    >
      <h2>Our principles</h2>
      <ul>
        <li>Help readers first; monetize second.</li>
        <li>Explain who a product or approach may suit, and who should skip it.</li>
        <li>Discuss meaningful differences rather than listing features.</li>
        <li>Distinguish verified facts, editorial judgment and personal experience.</li>
        <li>Never promise skincare results or make unsupported medical claims.</li>
      </ul>

      <h2>Who writes our guides</h2>
      <p>
        Guides are written and edited by our editor, <Link href="/author/elise-marlowe">Elise Marlowe</Link>. Some of our bylines are pen names; every
        byline represents a real editor who researches and reviews the article. Pen names never come with invented credentials, testimonials or
        experience, and our author pages only state what is true.
      </p>

      <h2>How we research</h2>
      <p>
        Factual claims are supported by primary or authoritative sources — dermatology associations, government regulators such as the U.S. Food and
        Drug Administration, peer-reviewed research and manufacturers&rsquo; official documentation for product specifications. Each guide lists its
        sources so you can check them.
      </p>
      <p>
        When we discuss research, we describe its limits: study size, duration, who funded it and whether results apply to products you can buy.
      </p>

      <h2>Research versus hands-on testing</h2>
      <p>
        Every guide states its basis. Most of our guides are based on <strong>independent research</strong>. We only describe hands-on testing when
        it actually happened and is documented. We never write &ldquo;we tested&rdquo; or describe personal results that didn&rsquo;t occur, and we
        never invent testimonials or expert quotes.
      </p>

      <h2>Product information</h2>
      <ul>
        <li>We don&rsquo;t invent product names, specifications, prices, ratings, review counts or bestseller status.</li>
        <li>
          We don&rsquo;t display prices or availability unless they come from a permitted, current source with a timestamp. Retailer prices change
          constantly, so we link to the listing instead.
        </li>
        <li>We don&rsquo;t copy customer reviews from retailers.</li>
        <li>We record when product details were last verified, and we revisit guides when information changes.</li>
        <li>
          We assign editorial ratings only when a documented methodology exists. Rankings are based on transparent criteria explained in the article.
        </li>
      </ul>

      <h2>Images</h2>
      <p>
        We use original illustrations and properly licensed images, and we keep a record of each image&rsquo;s source and license. Illustrations are
        labeled as such and depict general product types — we never present an illustration as a photograph of a specific product we recommend.
      </p>

      <h2>Use of AI tools</h2>
      <p>
        We may use AI tools to help organize research or prepare first drafts. Every article is reviewed by a person for accuracy, originality and
        usefulness before publication, and sources are checked against the original documents. We do not mass-publish unreviewed AI-generated
        content, and AI tools are never used to invent sources, specifications, prices or reviews.
      </p>

      <h2>Independence and affiliate links</h2>
      <p>
        We may earn a commission when you buy through some links on this site. Commissions never determine which products we include or how we
        describe them. Brands cannot pay for a positive mention. See our <Link href="/affiliate-disclosure">affiliate disclosure</Link>.
      </p>

      <h2>Corrections and updates</h2>
      <p>
        If we get something wrong, we fix it. Articles show both their original publication date and the date of their last substantial update.
        To report an error, please use our <Link href="/contact">contact page</Link>.
      </p>

      <h2>Medical disclaimer</h2>
      <p>
        Content on The Gilded Skin is general information and not medical advice. It isn&rsquo;t a substitute for diagnosis or treatment from a
        qualified clinician.
      </p>
    </ProsePage>
  );
}
