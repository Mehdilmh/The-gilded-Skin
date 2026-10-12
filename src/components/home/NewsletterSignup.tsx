/**
 * Renders only when a real email provider's hosted form endpoint is
 * configured (NEWSLETTER_FORM_ACTION). No fake signup forms.
 */
export function NewsletterSignup() {
  const action = process.env.NEWSLETTER_FORM_ACTION?.trim();
  if (!action) return null;
  const provider = process.env.NEWSLETTER_PROVIDER_NAME?.trim();
  return (
    <section aria-labelledby="newsletter" className="border-t border-beige bg-white/60 py-20">
      <div className="container max-w-2xl text-center">
        <p className="eyebrow">The letter</p>
        <h2 id="newsletter" className="mt-3 font-serif text-4xl">
          New guides, occasionally
        </h2>
        <p className="mt-4 leading-relaxed text-espresso/80">
          A short note when we publish something useful. No daily emails; unsubscribe anytime.
        </p>
        <form action={action} method="post" className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="h-12 flex-1 rounded-pill border border-taupe/50 bg-white px-5 text-espresso placeholder:text-taupe-dark focus:border-espresso"
          />
          <button type="submit" className="btn-primary h-12">
            Subscribe
          </button>
        </form>
        <p className="mt-3 text-xs text-taupe-dark">
          {provider ? `Sign-ups are handled by ${provider}. ` : ""}See our privacy policy for how we use your email.
        </p>
      </div>
    </section>
  );
}
