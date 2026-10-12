import Image from "next/image";
import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex shrink-0 items-center ${className}`} aria-label="The Gilded Skin — home">
      <Image
        src="/brand/logo.svg"
        alt="The Gilded Skin"
        width={573}
        height={76}
        priority
        unoptimized
        className="h-7 w-auto sm:h-8 lg:h-9"
      />
    </Link>
  );
}
