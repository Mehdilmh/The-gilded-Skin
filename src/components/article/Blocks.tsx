import { CheckIcon, StarMark } from "@/components/ui/icons";

export function Callout({ title, tone = "note", children }: { title?: string; tone?: "note" | "caution" | "tip"; children: React.ReactNode }) {
  const styles = {
    note: "border-champagne bg-white",
    tip: "border-champagne bg-beige/40",
    caution: "border-espresso/60 bg-white",
  }[tone];
  return (
    <aside className={`not-prose my-8 rounded-r-card border-l-2 px-6 py-5 ${styles}`}>
      {title && <p className="eyebrow mb-2">{title}</p>}
      <div className="space-y-3 text-[0.98rem] leading-relaxed text-espresso/90 [&_a]:link-underline">{children}</div>
    </aside>
  );
}

export function Checklist({ title, items }: { title?: string; items: string[] }) {
  return (
    <div className="not-prose my-8 rounded-card border border-beige bg-white p-6">
      {title && <h4 className="font-serif text-2xl">{title}</h4>}
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[0.98rem] leading-relaxed">
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-champagne text-champagne-dark">
              <CheckIcon className="h-3.5 w-3.5" />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function KeyTakeaways({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="key-takeaways" className="rounded-card bg-espresso px-6 py-7 text-ivory md:px-8">
      <h2 id="key-takeaways" className="flex items-center gap-2 font-sans text-eyebrow font-semibold uppercase !text-champagne-light">
        <StarMark className="h-3.5 w-3.5 text-champagne" /> Key takeaways
      </h2>
      <ul className="mt-4 space-y-3 text-[0.98rem] leading-relaxed">
        {items.map((t) => (
          <li key={t} className="flex gap-3">
            <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-champagne" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function QuickAnswer({ children }: { children: React.ReactNode }) {
  return (
    <section aria-labelledby="quick-answer" className="border-y border-champagne/50 py-6">
      <h2 id="quick-answer" className="eyebrow">
        The quick answer
      </h2>
      <p className="mt-3 font-serif text-2xl leading-snug text-espresso">{children}</p>
    </section>
  );
}

/**
 * Accessible comparison table for product *types* or criteria. Scrolls
 * horizontally on small screens with a sticky first column.
 */
export function ComparisonTable({ caption, columns, rows }: { caption: string; columns: string[]; rows: string[][] }) {
  return (
    <div className="not-prose my-10">
      <p aria-hidden="true" className="mb-2 text-xs uppercase tracking-[0.12em] text-taupe-dark md:hidden">
        Swipe to see the full table →
      </p>
      <div className="scroll-region" role="region" aria-label={caption} tabIndex={0}>
        <table className="w-full min-w-[40rem] border-collapse text-left text-[0.92rem] leading-relaxed">
          <caption className="mb-3 text-left font-serif text-xl text-espresso">{caption}</caption>
          <thead>
            <tr className="border-b border-champagne">
              {columns.map((c, i) => (
                <th
                  key={c}
                  scope="col"
                  className={`bg-ivory px-4 py-3 align-bottom text-eyebrow font-semibold uppercase text-champagne-dark ${i === 0 ? "sticky left-0 z-10" : ""}`}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]} className="border-b border-beige align-top">
                {row.map((cell, i) =>
                  i === 0 ? (
                    <th key={i} scope="row" className="sticky left-0 z-10 bg-ivory px-4 py-4 font-serif text-lg font-medium text-espresso">
                      {cell}
                    </th>
                  ) : (
                    <td key={i} className="bg-white/60 px-4 py-4 text-espresso/85">
                      {cell}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
