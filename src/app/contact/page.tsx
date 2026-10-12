import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { isContactDeliveryConfigured } from "@/lib/contact";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "Contact The Gilded Skin with questions, corrections or feedback about our beauty guides.",
  path: "/contact",
});

const messages: Record<string, { tone: "ok" | "err"; text: string }> = {
  sent: { tone: "ok", text: "Thank you — your message has been sent. We'll reply as soon as we can." },
  invalid: { tone: "err", text: "Please check the form: a name, a valid email address and a message of at least 10 characters are required." },
  "rate-limited": { tone: "err", text: "You've sent several messages recently. Please try again later." },
  error: { tone: "err", text: "Something went wrong sending your message. Please try again later." },
  unavailable: { tone: "err", text: "Our contact form isn't accepting messages yet. Please email us directly instead." },
};

const field = "mt-2 w-full rounded-card border border-taupe/50 bg-white px-4 py-3 text-espresso placeholder:text-taupe-dark focus:border-espresso";

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const notice = status ? messages[status] : undefined;
  const formEnabled = isContactDeliveryConfigured();
  const email = site.contactEmail;
  // Rendered per request (this page is dynamic), so the time trap works without JavaScript.
  const renderedAt = String(Date.now());

  return (
    <>
      <PageHeader
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ]}
        eyebrow="Get in touch"
        title="Contact"
        intro={<p>Questions about a guide, a correction or general feedback — we read every message.</p>}
      />
      <div className="container grid max-w-wide gap-14 py-14 lg:grid-cols-12">
        <div className="space-y-6 text-[0.98rem] leading-relaxed lg:col-span-4">
          <div>
            <h2 className="font-serif text-2xl">Corrections</h2>
            <p className="mt-2 text-espresso/80">If you think something in a guide is inaccurate, tell us which article and what you found. We review every report.</p>
          </div>
          <div>
            <h2 className="font-serif text-2xl">Brands and PR</h2>
            <p className="mt-2 text-espresso/80">We don&rsquo;t accept payment for coverage or positive mentions. Product information is welcome, but inclusion is an editorial decision.</p>
          </div>
          {email && (
            <div>
              <h2 className="font-serif text-2xl">Email</h2>
              <p className="mt-2">
                <a href={`mailto:${email}`} className="link-underline">
                  {email}
                </a>
              </p>
            </div>
          )}
        </div>
        <div className="lg:col-span-7 lg:col-start-6" id="contact-form">
          {notice && (
            <p
              role={notice.tone === "err" ? "alert" : "status"}
              className={`mb-8 rounded-card border p-4 ${notice.tone === "ok" ? "border-champagne bg-white" : "border-espresso/40 bg-white"}`}
            >
              {notice.text}
            </p>
          )}
          {formEnabled ? (
            <form action="/api/contact" method="post" className="space-y-6 rounded-card bg-white p-6 shadow-soft md:p-10">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="text-sm font-medium">Name</label>
                  <input id="name" name="name" required maxLength={100} autoComplete="name" className={field} />
                </div>
                <div>
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <input id="email" name="email" type="email" required maxLength={200} autoComplete="email" className={field} />
                </div>
              </div>
              <div>
                <label htmlFor="topic" className="text-sm font-medium">Topic</label>
                <select id="topic" name="topic" className={field} defaultValue="general">
                  <option value="general">General question or feedback</option>
                  <option value="correction">Correction</option>
                  <option value="partnership">Brand or PR</option>
                  <option value="privacy">Privacy request</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="text-sm font-medium">Message</label>
                <textarea id="message" name="message" required minLength={10} maxLength={5000} rows={7} className={field} />
              </div>
              <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
                <label htmlFor="website">Leave this field empty</label>
                <input id="website" name="website" tabIndex={-1} autoComplete="off" />
              </div>
              <input type="hidden" name="startedAt" value={renderedAt} />
              <p className="text-xs text-taupe-dark">We use your details only to reply. See our privacy policy.</p>
              <button type="submit" className="btn-primary">
                Send message
              </button>
            </form>
          ) : (
            <div className="rounded-card border border-beige bg-white p-8">
              <h2 className="font-serif text-2xl">Write to us</h2>
              <p className="mt-3 leading-relaxed text-espresso/80">
                {email ? (
                  <>
                    The quickest way to reach us is by email at{" "}
                    <a href={`mailto:${email}`} className="link-underline">
                      {email}
                    </a>
                    .
                  </>
                ) : (
                  "Our contact details are being set up. Please check back soon."
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
