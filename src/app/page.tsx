import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getPublishedArticles } from "@/lib/content";
import { categories } from "@/lib/categories";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { ArrowIcon, StarMark } from "@/components/ui/icons";
import { ComparisonTable } from "@/components/article/Blocks";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";
import { collectionPageJsonLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/ui/JsonLd";

export const metadata: Metadata = pageMetadata({
  title: `${site.name} — Honest Beauty Guides, Skincare Tools & Vanity Edits`,
  description:
    "Thoughtful beauty finds, elevated routines and honest, research-led guides to skincare tools, beauty devices and vanity organization.",
  path: "/",
  absoluteTitle: true,
});

const commercialTypes = new Set(["roundup", "comparison", "buying-checklist", "category-guide", "gift-guide", "review"]);

function SectionHeading({ id, eyebrow, title, href, linkLabel }: { id: string; eyebrow: string; title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className="mt-3 font-serif text-4xl md:text-5xl">
          {title}
        </h2>
      </div>
      {href && (
        <Link href={href} className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.12em] hover:text-champagne-dark">
          {linkLabel} <ArrowIcon />
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  const articles = getPublishedArticles();
  const featured = articles.filter((a) => a.featured);
  const lead = featured[0] ?? articles[0];
  const picks = articles.filter((a) => a.slug !== lead?.slug && a.featured).concat(articles.filter((a) => !a.featured)).slice(0, 3);
  const guides = articles.filter((a) => commercialTypes.has(a.articleType)).slice(0, 3);
  const latest = articles.slice(0, 6);
  const pinArticles = articles.filter((a) => a.pinterest.pins.length > 0).slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-beige">
        <div className="container grid max-w-wide items-center gap-12 py-12 md:py-16 lg:grid-cols-12 lg:gap-16 lg:py-20">
          <div className="lg:col-span-6">
            <p className="eyebrow flex items-center gap-2">
              <StarMark className="h-3.5 w-3.5 text-champagne" /> Independent beauty editorial
            </p>
            <h1 className="mt-6 font-serif text-[3rem] leading-[1.02] sm:text-display lg:text-display-lg">
              Beauty, <em className="font-normal italic text-champagne-dark">considered.</em>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-espresso/80 md:text-xl">{site.promise}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/blog" className="btn-primary">
                Read the latest guides <ArrowIcon />
              </Link>
              <Link href="/editorial-policy" className="btn-secondary">
                How we research
              </Link>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-beige pt-6 text-sm">
              <div>
                <dt className="eyebrow">Sourced</dt>
                <dd className="mt-1 text-espresso/75">Claims linked to primary references</dd>
              </div>
              <div>
                <dt className="eyebrow">Balanced</dt>
                <dd className="mt-1 text-espresso/75">Limitations alongside strengths</dd>
              </div>
              <div>
                <dt className="eyebrow">Transparent</dt>
                <dd className="mt-1 text-espresso/75">Clear about how we earn</dd>
              </div>
            </dl>
          </div>
          <div className="relative lg:col-span-6">
            <EditorialImage
              src="/images/photos/vintage-perfume-bottles-dresser-mirror.webp"
              sizes="(min-width: 1024px) 45vw, 100vw"
              priority
              aspect="editorial"
              imgClassName="rounded-t-[999px]"
              className="mx-auto max-w-md overflow-hidden rounded-t-[999px] lg:max-w-none"
            />
            {lead && (
              <Link
                href={`/${lead.slug}`}
                className="absolute -bottom-4 left-0 hidden max-w-xs rounded-card bg-white p-5 shadow-soft transition hover:-translate-y-0.5 sm:block lg:-left-10"
              >
                <span className="eyebrow">Now reading</span>
                <span className="mt-2 block font-serif text-xl leading-snug">{lead.title}</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section aria-labelledby="explore" className="container max-w-wide py-20">
        <SectionHeading id="explore" eyebrow="Explore" title="Find your corner of the vanity" />
        <ul className="mt-12 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/category/${c.slug}`} className="group block">
                <div className="overflow-hidden rounded-card">
                  <EditorialImage src={c.image} alt="" sizes="(min-width: 1024px) 25vw, 50vw" aspect="editorial" imgClassName="transition duration-700 group-hover:scale-[1.04]" />
                </div>
                <p className="mt-4 font-serif text-2xl leading-tight group-hover:text-champagne-dark">{c.name}</p>
                <p className="mt-1 hidden text-sm leading-relaxed text-espresso/70 md:block">{c.intro.split(". ")[0]}.</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Editor's picks */}
      {lead && (
        <section aria-labelledby="picks" className="border-y border-beige bg-white/60 py-20">
          <div className="container max-w-wide">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Editor&rsquo;s picks</p>
                <h2 id="picks" className="mt-3 font-serif text-4xl md:text-5xl">
                  Worth your time this season
                </h2>
              </div>
            </div>
            <div className="mt-12 grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <ArticleCard article={lead} variant="feature" />
              </div>
              <div className="space-y-8 lg:col-span-5 lg:border-l lg:border-beige lg:pl-12">
                {picks.map((a) => (
                  <ArticleCard key={a.slug} article={a} variant="compact" />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Buying guides */}
      {guides.length > 0 && (
        <section aria-labelledby="guides" className="container max-w-wide py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Before you buy</p>
              <h2 id="guides" className="mt-3 font-serif text-4xl md:text-5xl">
                Latest buying guides
              </h2>
            </div>
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.12em] hover:text-champagne-dark">
              All guides <ArrowIcon />
            </Link>
          </div>
          <div className="mt-12 grid gap-12 md:grid-cols-3">
            {guides.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      )}

      {/* Comparison feature */}
      <section aria-labelledby="compare" className="bg-espresso py-20 text-ivory">
        <div className="container grid max-w-wide gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow !text-champagne-light">At a glance</p>
            <h2 id="compare" className="mt-3 font-serif text-4xl !text-ivory md:text-5xl">
              Beauty tools, compared honestly
            </h2>
            <p className="mt-6 leading-relaxed text-ivory/80">
              Before you add a tool to your routine, it helps to know how much effort it asks for and how strong the evidence is. Each row links to
              the full, sourced guide.
            </p>
          </div>
          <div className="min-w-0 rounded-card bg-ivory p-4 text-espresso md:p-8 lg:col-span-8">
            <ComparisonTable
              caption="Popular beauty tools at a glance"
              columns={["Tool", "Effort", "What the evidence says", "Read the guide"]}
              rows={[
                ["Facial roller", "Low — quick, no technique", "One small 2025 trial; short-term changes only", "Facial rollers vs. gua sha"],
                ["Gua sha", "Moderate — technique takes practice", "Same small trial; lasting effects unproven", "Facial rollers vs. gua sha"],
                ["Cleansing brush", "Low to moderate", "Optional — dermatologists' baseline is fingertips", "Cleansing brushes guide"],
                ["LED mask", "Ongoing sessions for weeks", "Mixed; strongest for acne in a 2018 trial review", "LED masks guide"],
              ]}
            />
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Link href="/facial-rollers-vs-gua-sha" className="link-underline">Rollers vs. gua sha</Link>
              <Link href="/facial-cleansing-brushes-what-to-compare" className="link-underline">Cleansing brushes</Link>
              <Link href="/led-face-masks-what-to-compare" className="link-underline">LED masks</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Education */}
      <section aria-labelledby="basics" className="container max-w-wide py-20">
        <SectionHeading id="basics" eyebrow="Beauty education" title="Skincare basics, properly sourced" href="/category/skincare" linkLabel="Skincare essentials" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              n: "01",
              title: "Order matters",
              body: "The American Academy of Dermatology suggests cleanser, then treatment, then moisturizer and/or sunscreen, then makeup.",
              href: "/how-to-build-a-simple-morning-skincare-routine",
              link: "Build a simple routine",
            },
            {
              n: "02",
              title: "Heat and light shorten shelf life",
              body: "FDA notes that products exposed to high temperatures or sunlight can deteriorate before their expiration date.",
              href: "/how-to-organize-a-skincare-routine",
              link: "Store products well",
            },
            {
              n: "03",
              title: "'Cleared' isn't 'approved'",
              body: "Most at-home light devices are FDA cleared through the 510(k) process — useful, but not proof of every claim.",
              href: "/led-face-masks-what-to-compare",
              link: "Read the LED guide",
            },
          ].map((item) => (
            <div key={item.n} className="flex flex-col rounded-card border border-beige bg-white p-7">
              <span className="font-serif text-4xl text-champagne-dark">{item.n}</span>
              <h3 className="mt-4 font-serif text-2xl">{item.title}</h3>
              <p className="mt-3 flex-1 leading-relaxed text-espresso/80">{item.body}</p>
              <Link href={item.href} className="mt-6 inline-flex items-center gap-2 text-sm font-medium hover:text-champagne-dark">
                {item.link} <ArrowIcon />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <NewsletterSignup />

      {/* Latest */}
      <section aria-labelledby="latest" className="border-t border-beige py-20">
        <div className="container max-w-wide">
          <SectionHeading id="latest" eyebrow="The journal" title="Latest articles" href="/blog" linkLabel="View all" />
          <div className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2">
            {latest.map((a) => (
              <ArticleCard key={a.slug} article={a} variant="compact" />
            ))}
          </div>
        </div>
      </section>

      {/* Pinterest */}
      {pinArticles.length > 0 && (
        <section aria-labelledby="pinterest" className="bg-beige/50 py-20">
          <div className="container max-w-wide">
            <SectionHeading id="pinterest" eyebrow="Save for later" title="Pin-worthy guides" />
            <p className="mt-4 max-w-2xl leading-relaxed text-espresso/80">
              Every guide comes with clean, vertical pin designs so you can save the ideas you want to come back to.
              {site.social.pinterest && (
                <>
                  {" "}
                  <a href={site.social.pinterest} target="_blank" rel="noopener me" className="link-underline">
                    Follow us on Pinterest
                  </a>
                  .
                </>
              )}
            </p>
            <ul className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {pinArticles.map((a) => (
                <li key={a.slug}>
                  <Link href={`/${a.slug}`} className="group block">
                    <div className="overflow-hidden rounded-card shadow-soft">
                      <Image
                        src={`/pins/${a.slug}/1`}
                        alt={`Pinterest graphic: ${a.pinterest.pins[0]!.title}`}
                        width={1000}
                        height={1500}
                        sizes="(min-width: 768px) 25vw, 50vw"
                        loading="lazy"
                        className="aspect-pin w-full bg-beige object-cover transition duration-700 group-hover:scale-[1.03]"
                      />
                    </div>
                    <span className="mt-3 block text-sm font-medium leading-snug group-hover:text-champagne-dark">{a.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Trust */}
      <section aria-labelledby="trust" className="container max-w-wide py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow">Our standards</p>
            <h2 id="trust" className="mt-3 font-serif text-4xl md:text-5xl">
              How we research recommendations
            </h2>
            <p className="mt-6 leading-relaxed text-espresso/80">
              We&rsquo;re a small, independent publication. We earn commissions from some retailer links, and we explain exactly how that works. It never
              decides what we recommend.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/editorial-policy" className="btn-secondary">
                Editorial policy
              </Link>
              <Link href="/affiliate-disclosure" className="btn-secondary">
                Affiliate disclosure
              </Link>
            </div>
          </div>
          <ol className="grid gap-8 sm:grid-cols-2 lg:col-span-7">
            {[
              ["Primary sources first", "We cite dermatology associations, regulators and peer-reviewed research for factual claims."],
              ["Research, not invented tests", "We say plainly when a guide is based on research. We never claim testing that didn't happen."],
              ["Who should skip it", "Every recommendation explains its limitations and who may be better served by something else."],
              ["No fabricated numbers", "We don't invent prices, ratings or review counts, and we don't copy customer reviews."],
            ].map(([title, body], i) => (
              <li key={title} className="border-t border-champagne/60 pt-5">
                <span className="font-serif text-xl text-champagne-dark">0{i + 1}</span>
                <h3 className="mt-2 font-serif text-2xl">{title}</h3>
                <p className="mt-2 leading-relaxed text-espresso/80">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <JsonLd data={collectionPageJsonLd("Latest articles", site.description, "/", latest)} />
    </>
  );
}
