import { PageHeader } from "./PageHeader";
import { formatDate } from "@/lib/format";

/** Shared layout for About, policy and legal pages. */
export function ProsePage({
  title,
  eyebrow,
  intro,
  path,
  updated,
  children,
}: {
  title: string;
  eyebrow?: string;
  intro?: React.ReactNode;
  path: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "Home", path: "/" },
          { name: title, path },
        ]}
        eyebrow={eyebrow}
        title={title}
        intro={intro}
      />
      <div className="container max-w-wide py-14">
        {updated && (
          <p className="mb-8 text-xs uppercase tracking-[0.12em] text-taupe-dark">
            Last updated <time dateTime={updated}>{formatDate(updated)}</time>
          </p>
        )}
        <div className="article-prose">{children}</div>
      </div>
    </>
  );
}

export function LegalReviewNote() {
  return (
    <aside className="not-prose my-8 rounded-card border border-champagne/60 bg-white/70 p-5 text-sm leading-relaxed">
      <strong className="font-semibold">Note:</strong> This page describes how the site currently works. It is not legal advice and should be reviewed
      for the site operator&rsquo;s jurisdiction and the services in use before relying on it.
    </aside>
  );
}
