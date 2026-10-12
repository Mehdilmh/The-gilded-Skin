import type { Metadata } from "next";
import Link from "next/link";
import { requireStudio } from "@/lib/studio";

export const metadata: Metadata = { title: "Studio", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  requireStudio();
  return (
    <div className="container max-w-wide py-10">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-card bg-espresso px-6 py-4 text-ivory">
        <p className="font-serif text-2xl !text-ivory">Editorial Studio</p>
        <nav aria-label="Studio" className="flex gap-6 text-sm">
          <Link href="/studio" className="hover:text-champagne-light">Overview</Link>
          <Link href="/studio/pinterest" className="hover:text-champagne-light">Pinterest</Link>
        </nav>
        <p className="w-full text-xs text-ivory/70">Read-only. Edit files in content/ and run the audits from the command line. Not available in production.</p>
      </div>
      {children}
    </div>
  );
}
