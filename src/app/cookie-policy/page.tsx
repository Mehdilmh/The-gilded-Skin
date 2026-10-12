import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { LegalReviewNote, ProsePage } from "@/components/ui/ProsePage";
import { ConsentSettingsButton } from "@/components/analytics/ConsentSettingsButton";

export const metadata: Metadata = pageMetadata({
  title: "Cookie Policy",
  description: "Which cookies and similar technologies The Gilded Skin uses, why, and how to change your preferences.",
  path: "/cookie-policy",
});

export default function CookiePolicyPage() {
  const analytics = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
  return (
    <ProsePage title="Cookie Policy" eyebrow="Your choices" path="/cookie-policy" updated="2026-10-12">
      <LegalReviewNote />
      <h2>Essential storage</h2>
      <p>
        The site works without cookies. If analytics is enabled, we store your consent choice in your browser&rsquo;s local storage so we don&rsquo;t
        ask on every page. This contains only the word &ldquo;granted&rdquo; or &ldquo;denied&rdquo;.
      </p>
      <h2>Analytics cookies</h2>
      {analytics ? (
        <>
          <p>
            Only if you choose &ldquo;Allow analytics&rdquo;, Google Analytics 4 sets first-party cookies (such as <code>_ga</code>) to count visits
            and understand aggregate usage. Advertising features are disabled. If you decline, Google Analytics is not loaded.
          </p>
          <div className="not-prose my-6">
            <ConsentSettingsButton />
          </div>
        </>
      ) : (
        <p>We do not currently use analytics cookies.</p>
      )}
      <h2>Third-party sites</h2>
      <p>
        Retailers such as Amazon, and services such as Pinterest, set their own cookies when you visit their sites through our links. Those cookies
        are governed by their policies.
      </p>
      <h2>Managing cookies in your browser</h2>
      <p>
        You can also delete or block cookies in your browser settings. Blocking cookies won&rsquo;t stop our guides from working.
      </p>
    </ProsePage>
  );
}
