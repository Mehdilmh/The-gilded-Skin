import Image from "next/image";
import { getAllArticles, getPublicProduct } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";
import { withUtm } from "@/lib/affiliate";

export default function StudioPinterest() {
  const articles = getAllArticles().filter((a) => a.pinterest.pins.length > 0);
  return (
    <div>
      <h1 className="font-serif text-4xl">Pinterest assets</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-taupe-dark">
        Three distinct concepts per article. Export everything as CSV with <code>npm run pinterest:export</code>. Pin graphics use original
        illustrations only. Add &ldquo;This guide contains affiliate links&rdquo; to descriptions for articles with affiliate products (the export does
        this automatically).
      </p>
      <div className="mt-10 space-y-16">
        {articles.map((a) => {
          const affiliate = a.products.some((id) => getPublicProduct(id));
          return (
            <section key={a.slug}>
              <h2 className="font-serif text-2xl">{a.title}</h2>
              <p className="text-xs text-taupe-dark">
                {a.status} · {affiliate ? "contains affiliate links — disclose in pin description" : "no affiliate links"}
              </p>
              <div className="mt-6 grid gap-8 md:grid-cols-3">
                {a.pinterest.pins.map((pin, i) => (
                  <article key={pin.title} className="rounded-card bg-white p-4 text-sm shadow-soft">
                    {a.status === "published" ? (
                      <Image src={`/pins/${a.slug}/${i + 1}`} alt="" width={1000} height={1500} className="aspect-pin w-full rounded-card bg-beige" sizes="300px" />
                    ) : (
                      <p className="aspect-pin rounded-card bg-beige p-4">Pin graphic generated after publication.</p>
                    )}
                    <h3 className="mt-4 font-serif text-xl">{pin.title}</h3>
                    <p className="mt-2 leading-relaxed">{pin.description}</p>
                    <dl className="mt-3 space-y-1 text-xs text-taupe-dark">
                      <div><dt className="inline font-semibold">Template:</dt> <dd className="inline">{pin.template}</dd></div>
                      <div><dt className="inline font-semibold">Board:</dt> <dd className="inline">{pin.board}</dd></div>
                      <div><dt className="inline font-semibold">Topics:</dt> <dd className="inline">{pin.topics.join(", ")}</dd></div>
                      <div><dt className="inline font-semibold">Image concept:</dt> <dd className="inline">{pin.imageConcept}</dd></div>
                      <div className="break-all">
                        <dt className="inline font-semibold">Link:</dt>{" "}
                        <dd className="inline">
                          {withUtm(absoluteUrl(`/${a.slug}`), { source: "pinterest", medium: "social", campaign: a.slug, content: `pin-${i + 1}` })}
                        </dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
