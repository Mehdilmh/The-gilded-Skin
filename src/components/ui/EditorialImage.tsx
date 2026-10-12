import Image from "next/image";
import { getImage } from "@/lib/content";

interface Props {
  src: string;
  /** Override registry alt text only when the context needs different wording. */
  alt?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  /** Crop to an aspect ratio; otherwise intrinsic dimensions are used. */
  aspect?: "pin" | "editorial" | "wide" | "card" | "square";
  caption?: string;
  showKindLabel?: boolean;
  /** Omit the credit line, e.g. inside a link where a nested credit link is invalid. */
  hideCredit?: boolean;
}

const aspectClass = {
  pin: "aspect-pin",
  editorial: "aspect-editorial",
  wide: "aspect-wide",
  card: "aspect-card",
  square: "aspect-square",
};

/**
 * Responsive image backed by the rights registry (content/images.json).
 * Width/height come from the registry so layout never shifts, and alt text is
 * maintained in one place.
 */
export function EditorialImage({ src, alt, sizes, priority, className = "", imgClassName = "", aspect, caption, showKindLabel, hideCredit }: Props) {
  const record = getImage(src);
  if (!record) {
    throw new Error(`Image ${src} is missing from content/images.json (rights record required)`);
  }
  const altText = alt ?? record.alt;
  if (hideCredit && record.attributionRequired) {
    throw new Error(`Image ${src} requires attribution and cannot be shown without its credit`);
  }
  const credit =
    !hideCredit && record.source !== "original" && record.creator
      ? `${record.creator} / ${record.source.charAt(0).toUpperCase()}${record.source.slice(1)}`
      : null;
  const label = record.kind === "illustration" ? "Illustration" : null;

  const img = aspect ? (
    <div className={`relative overflow-hidden bg-beige ${aspectClass[aspect]}`}>
      <Image src={record.src} alt={altText} fill sizes={sizes} priority={priority} className={`object-cover ${imgClassName}`} />
    </div>
  ) : (
    <Image
      src={record.src}
      alt={altText}
      width={record.width}
      height={record.height}
      sizes={sizes}
      priority={priority}
      className={`h-auto w-full bg-beige ${imgClassName}`}
    />
  );

  if (!caption && !credit && !(showKindLabel && label)) return <div className={className}>{img}</div>;

  return (
    <figure className={className}>
      {img}
      <figcaption className="mt-3 flex flex-wrap gap-x-3 text-xs leading-relaxed text-taupe-dark">
        {caption && <span>{caption}</span>}
        {showKindLabel && label && <span className="uppercase tracking-[0.14em]">{label}</span>}
        {credit &&
          (record.sourceUrl ? (
            <a href={record.sourceUrl} rel="noopener" target="_blank" className="link-underline">
              Image: {credit}
            </a>
          ) : (
            <span>Image: {credit}</span>
          ))}
      </figcaption>
    </figure>
  );
}
