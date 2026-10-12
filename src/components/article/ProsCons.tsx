import { CheckIcon, MinusIcon } from "@/components/ui/icons";

type Level = "h3" | "h4";

export function ProsCons({
  pros,
  cons,
  prosTitle = "Strengths",
  consTitle = "Limitations",
  headingLevel = "h3",
}: {
  pros: string[];
  cons: string[];
  prosTitle?: string;
  consTitle?: string;
  headingLevel?: Level;
}) {
  const H = headingLevel;
  return (
    <div className="not-prose my-8 grid gap-4 sm:grid-cols-2">
      <div className="rounded-card border border-beige bg-white p-5">
        <H className="eyebrow">{prosTitle}</H>
        <ul className="mt-3 space-y-2.5 text-[0.95rem] leading-relaxed">
          {pros.map((p) => (
            <li key={p} className="flex gap-2.5">
              <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-champagne-dark" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-card border border-beige bg-white p-5">
        <H className="eyebrow !text-taupe-dark">{consTitle}</H>
        <ul className="mt-3 space-y-2.5 text-[0.95rem] leading-relaxed">
          {cons.map((c) => (
            <li key={c} className="flex gap-2.5">
              <MinusIcon className="mt-1 h-4 w-4 shrink-0 text-taupe-dark" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SuitsSkip({ suits, skip, subject = "this", headingLevel = "h3" }: { suits: string[]; skip: string[]; subject?: string; headingLevel?: Level }) {
  const H = headingLevel;
  return (
    <div className="not-prose my-8 grid gap-4 sm:grid-cols-2">
      <div className="rounded-card bg-beige/50 p-5">
        <H className="eyebrow">May suit you if…</H>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[0.95rem] leading-relaxed marker:text-champagne">
          {suits.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-card border border-dashed border-taupe/60 p-5">
        <H className="eyebrow !text-taupe-dark">Consider skipping {subject} if…</H>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[0.95rem] leading-relaxed marker:text-taupe">
          {skip.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
