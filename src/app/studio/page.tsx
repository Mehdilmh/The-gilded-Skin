import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { getAllArticles, getAllProducts } from "@/lib/content";
import { runFullAudit, summarize, type AuditIssue } from "@/lib/audit";
import { getAssociateTag } from "@/lib/affiliate";

const badge: Record<AuditIssue["level"], string> = {
  error: "bg-red-100 text-red-900",
  warning: "bg-amber-100 text-amber-900",
  info: "bg-sky-100 text-sky-900",
};

export default function StudioPage() {
  const issues = runFullAudit();
  const s = summarize(issues);
  const articles = getAllArticles();
  const products = getAllProducts();
  const briefs = fs
    .readdirSync(path.join(process.cwd(), "content/briefs"))
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"));
  const byScope = (scope: string) => issues.filter((i) => i.scope === scope && i.level !== "info");

  return (
    <div className="space-y-14">
      <section>
        <h1 className="font-serif text-4xl">Overview</h1>
        <dl className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
          {[
            ["Published", articles.filter((a) => a.status === "published").length],
            ["Drafts / review", articles.filter((a) => a.status !== "published").length],
            ["Products", products.length],
            ["Audit errors", s.errors],
            ["Warnings", s.warnings],
          ].map(([k, v]) => (
            <div key={k} className="rounded-card bg-white p-5 shadow-soft">
              <dt className="eyebrow">{k}</dt>
              <dd className="mt-2 font-serif text-4xl">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-taupe-dark">
          Associates tag configured: <strong>{getAssociateTag() ?? "missing"}</strong>
        </p>
      </section>

      <section>
        <h2 className="font-serif text-3xl">Articles</h2>
        <div className="scroll-region mt-4" role="region" aria-label="Articles" tabIndex={0}>
          <table className="w-full min-w-[60rem] text-left text-sm">
            <thead className="border-b border-champagne text-eyebrow uppercase text-champagne-dark">
              <tr>
                <th className="py-2 pr-4">Article</th>
                <th className="pr-4">Status</th>
                <th className="pr-4">Type</th>
                <th className="pr-4">Words</th>
                <th className="pr-4">Updated</th>
                <th className="pr-4">Approved by</th>
                <th>Open issues</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.slug} className="border-b border-beige align-top">
                  <td className="py-3 pr-4">
                    <Link href={a.status === "published" ? `/${a.slug}` : `/studio/preview/${a.slug}`} className="link-underline">
                      {a.title}
                    </Link>
                    <div className="text-xs text-taupe-dark">{a.primaryKeyword}</div>
                  </td>
                  <td className="pr-4">{a.status}</td>
                  <td className="pr-4">{a.articleType}</td>
                  <td className="pr-4">{a.wordCount}</td>
                  <td className="pr-4">{a.updatedAt}</td>
                  <td className="pr-4">{a.editorialReview.humanApprovedBy ?? "—"}</td>
                  <td>
                    <ul className="space-y-1">
                      {byScope(a.slug).map((i, n) => (
                        <li key={n}>
                          <span className={`rounded px-1.5 py-0.5 text-[0.7rem] ${badge[i.level]}`}>{i.code}</span> {i.message}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-serif text-3xl">Products</h2>
        <ul className="mt-4 divide-y divide-beige rounded-card bg-white text-sm shadow-soft">
          {products.map((p) => (
            <li key={p.id} className="flex flex-wrap justify-between gap-2 p-4">
              <span>
                <strong className="font-medium">{p.name}</strong> <span className="text-taupe-dark">({p.id})</span>
              </span>
              <span>
                {p.status} · link {p.linkStatus} · verified {p.lastVerified ?? "never"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-3xl">Site-wide issues</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {issues
            .filter((i) => !articles.some((a) => a.slug === i.scope) && i.level !== "info")
            .map((i, n) => (
              <li key={n}>
                <span className={`rounded px-1.5 py-0.5 text-[0.7rem] ${badge[i.level]}`}>{i.code}</span> <strong>{i.scope}</strong> — {i.message}
              </li>
            ))}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-3xl">Briefs</h2>
        <p className="mt-2 text-sm text-taupe-dark">Files in content/briefs. Create one with npm run content:brief.</p>
        <ul className="mt-4 columns-1 gap-8 text-sm md:columns-2">
          {briefs.map((b) => (
            <li key={b} className="py-1">
              {b}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
