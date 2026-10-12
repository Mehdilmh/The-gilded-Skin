import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { LegalReviewNote, ProsePage } from "@/components/ui/ProsePage";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "What information The Gilded Skin collects, how it is used, which third parties are involved and the choices you have.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  const analytics = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
  const newsletter = Boolean(process.env.NEWSLETTER_FORM_ACTION);
  return (
    <ProsePage title="Privacy Policy" eyebrow="Your data" path="/privacy-policy" updated="2026-10-12">
      <LegalReviewNote />
      <p>
        We try to collect as little information as possible. This policy explains what {site.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects
        when you visit {site.url.replace(/^https?:\/\//, "")}, why, and the choices you have.
      </p>

      <h2>Information we collect</h2>
      <h3>When you browse</h3>
      <p>
        Like most websites, our hosting provider automatically processes technical information such as your IP address, browser type and the pages
        requested, in order to deliver the site, keep it secure and diagnose problems. We do not use this information to identify you.
      </p>
      <h3>When you contact us</h3>
      <p>
        If you use our contact form or email us, we receive your name, email address and message. We use them only to reply and keep a record of the
        conversation. We don&rsquo;t add you to any mailing list.
      </p>
      {newsletter && (
        <>
          <h3>Newsletter</h3>
          <p>
            If you subscribe to our newsletter, your email address is processed by our email provider to send you messages. You can unsubscribe at
            any time using the link in each email.
          </p>
        </>
      )}
      <h3>Analytics</h3>
      {analytics ? (
        <p>
          With your consent, we use Google Analytics 4 to understand aggregate usage, such as which guides are read and which outbound links are
          clicked. We configure it without advertising features, and we never send names, email addresses or other personal details to analytics.
          You can change your choice at any time on our <Link href="/cookie-policy">cookie policy</Link> page.
        </p>
      ) : (
        <p>We do not currently use third-party analytics. If that changes, we will ask for your consent where required and update this policy.</p>
      )}

      <h2>Affiliate links and third-party sites</h2>
      <p>
        When you click an affiliate link — for example to Amazon — you leave our site. Amazon may use cookies to attribute a qualifying purchase to
        our account, under Amazon&rsquo;s own privacy notice. The same applies to other sites we link to, such as Pinterest when you use a
        &ldquo;Save&rdquo; link. We don&rsquo;t control and aren&rsquo;t responsible for their practices.
      </p>

      <h2>How we use information</h2>
      <ul>
        <li>To operate, secure and improve the site.</li>
        <li>To respond to messages you send us.</li>
        <li>To understand, in aggregate, which content is useful (only with consent, where analytics is enabled).</li>
      </ul>
      <p>We do not sell personal information, and we do not use it for targeted advertising.</p>

      <h2>Retention</h2>
      <p>We keep messages only as long as needed to respond and maintain reasonable records, then delete them.</p>

      <h2>Your choices and rights</h2>
      <p>
        Depending on where you live, you may have rights to access, correct or delete personal information we hold about you, or to object to
        certain processing. To make a request, <Link href="/contact">contact us</Link>.
      </p>

      <h2>Children</h2>
      <p>This site is intended for adults and is not directed to children under 13. We do not knowingly collect information from children.</p>

      <h2>Changes</h2>
      <p>We will update this page if our practices change, and revise the date at the top.</p>
    </ProsePage>
  );
}
