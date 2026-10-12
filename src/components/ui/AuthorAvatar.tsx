import type { Author } from "@/lib/schemas";

/** Monogram avatar — we don't use stock photos of strangers for bylines. */
export function AuthorAvatar({ author, size = "md" }: { author: Author; size?: "sm" | "md" | "lg" }) {
  const initials = author.name
    .split(" ")
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  const dims = { sm: "h-9 w-9 text-sm", md: "h-14 w-14 text-xl", lg: "h-28 w-28 text-4xl" }[size];
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-pill bg-espresso font-serif text-champagne-light ring-1 ring-champagne/50 ring-offset-2 ring-offset-ivory ${dims}`}
    >
      {initials}
    </span>
  );
}
