import type { Crumb } from "@/lib/structured-data";
import { Breadcrumbs } from "./Breadcrumbs";

export function PageHeader({ eyebrow, title, intro, crumbs }: { eyebrow?: string; title: string; intro?: React.ReactNode; crumbs?: Crumb[] }) {
  return (
    <header className="border-b border-beige bg-gradient-to-b from-white/60 to-ivory">
      <div className="container max-w-wide pb-14 pt-10 md:pb-20 md:pt-14">
        {crumbs && <Breadcrumbs items={crumbs} />}
        {eyebrow && <p className="eyebrow mt-10">{eyebrow}</p>}
        <h1 className={`max-w-3xl font-serif text-display-sm md:text-display ${eyebrow ? "mt-4" : "mt-10"}`}>{title}</h1>
        {intro && <div className="mt-6 max-w-2xl text-lg leading-relaxed text-espresso/80">{intro}</div>}
      </div>
    </header>
  );
}
