import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { ProsePage } from "@/components/ui/ProsePage";

export const metadata: Metadata = pageMetadata({
  title: "About The Gilded Skin",
  description: "The Gilded Skin is an independent beauty publication offering honest, research-led guides to skincare tools, routines, vanity organization and gifts.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <ProsePage
      title="About The Gilded Skin"
      eyebrow="Our story"
      path="/about"
      intro={<p>{site.promise}</p>}
    >
      <p>
        The Gilded Skin is an independent beauty publication for people who love a considered routine but are tired of hype. We write about skincare
        tools, beauty devices, vanity organization and the small rituals of self-care — and we try to answer the question that matters before any
        purchase: <em>is this actually right for me?</em>
      </p>
      <h2>What we publish</h2>
      <ul>
        <li>
          <strong>Buying guides and comparisons</strong> that explain what separates one option from another, including the limitations.
        </li>
        <li>
          <strong>Routine and how-to guides</strong> grounded in guidance from dermatology associations and regulators.
        </li>
        <li>
          <strong>Organization and gift ideas</strong> built around how people actually live, not around what&rsquo;s trending.
        </li>
      </ul>
      <h2>What we believe</h2>
      <p>
        Help readers first; monetize second. Every guide should be useful even if you never click a single retailer link. We say who a product or
        approach may suit — and who should skip it. We separate verified facts from editorial judgment, and we&rsquo;re clear when a guide is based
        on research rather than hands-on testing.
      </p>
      <h2>Who we are — and who we aren&rsquo;t</h2>
      <p>
        We&rsquo;re a small editorial team. We are not dermatologists, doctors or a testing laboratory, and we won&rsquo;t pretend to be. Our guides
        are general information, not medical advice. For specific skin concerns, please see a board-certified dermatologist.
      </p>
      <h2>How we make money</h2>
      <p>
        The Gilded Skin is reader-supported. Some articles contain affiliate links, including links to Amazon. As an Amazon Associate I earn from
        qualifying purchases. Commissions never change what we recommend, and we&rsquo;re not affiliated with or endorsed by Amazon or any brand we
        cover. Read our <Link href="/affiliate-disclosure">affiliate disclosure</Link> and our <Link href="/editorial-policy">editorial policy</Link>{" "}
        for details.
      </p>
      <h2>Say hello</h2>
      <p>
        Spotted an error, or have a question about a guide? We&rsquo;d genuinely like to hear from you on our <Link href="/contact">contact page</Link>.
      </p>
    </ProsePage>
  );
}
