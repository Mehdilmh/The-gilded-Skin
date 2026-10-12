import { CheckIcon, MinusIcon } from "@/components/ui/icons";

export function ProsCons({ pros, cons, prosTitle = "Strengths", consTitle = "Limitations" }: { pros: string[]; cons: string[]; prosTitle?: string; consTitle?: string }) {
  return (
    <div className="not-prose my-8 grid gap-4 sm:grid-cols-2">
      <div className="rounded-card border border-beige bg-white p-5">
        <h4 className="eyebrow">{prosTitle}</h4>
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
        <h4 className="eyebrow !text-taupe-dark">{consTitle}</h4>
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

export function SuitsSkip({ suits, skip, subject = "this" }: { suits: string[]; skip: string[]; subject?: string }) {
  return (
    <div className="not-prose my-8 grid gap-4 sm:grid-cols-2">
      <div className="rounded-card bg-beige/50 p-5">
        <h4 className="eyebrow">May suit you if…</h4>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[0.95rem] leading-relaxed marker:text-champagne">
          {suits.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-card border border-dashed border-taupe/60 p-5">
        <h4 className="eyebrow !text-taupe-dark">Consider skipping {subject} if…</h4>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[0.95rem] leading-relaxed marker:text-taupe">
          {skip.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
