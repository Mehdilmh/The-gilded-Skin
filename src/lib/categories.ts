export type CategorySlug = "beauty-tools" | "skincare" | "vanity-organization" | "gift-guides";

export interface Category {
  slug: CategorySlug;
  name: string;
  shortName: string;
  seoTitle: string;
  description: string;
  intro: string;
  image: string;
  imageAlt: string;
}

export const categories: Category[] = [
  {
    slug: "beauty-tools",
    name: "Beauty Tools",
    shortName: "Tools",
    seoTitle: "Beauty Tools: Honest Guides to Facial Devices and Skincare Tools",
    description:
      "Independent guides to cleansing brushes, LED masks, facial rollers, gua sha and other beauty tools — what they can do, what they can't, and what to compare.",
    intro:
      "Facial devices and beauty tools promise a lot. These guides explain how each type works, where the evidence is thin, and which details actually matter before you buy.",
    image: "/images/editorial/tools-still-life.webp",
    imageAlt: "Illustrated still life of a facial roller and gua sha stone on a cream linen surface",
  },
  {
    slug: "skincare",
    name: "Skincare Essentials",
    shortName: "Skincare",
    seoTitle: "Skincare Essentials: Simple Routines and Practical Guides",
    description:
      "Practical, sourced guidance on building simple skincare routines, storing products well and choosing accessories that support the way you already care for your skin.",
    intro:
      "Good skincare is often simpler than the shelf suggests. Start here for routine basics, product storage and the accessories that make daily care easier.",
    image: "/images/editorial/skincare-ritual.webp",
    imageAlt: "Illustrated arrangement of skincare bottles and a folded towel in warm morning light",
  },
  {
    slug: "vanity-organization",
    name: "Vanity & Organization",
    shortName: "Vanity",
    seoTitle: "Vanity Organization: Skincare Storage, Organizers and Travel Cases",
    description:
      "Ideas and buying considerations for organizing skincare and makeup — vanity layouts, small-bathroom storage, travel cases and minimalist organizers.",
    intro:
      "A calm vanity makes a routine easier to keep. These guides cover layouts, storage that protects your products, and organizers worth considering.",
    image: "/images/editorial/vanity-tray.webp",
    imageAlt: "Illustrated tiered vanity tray holding glass bottles and a small vase",
  },
  {
    slug: "gift-guides",
    name: "Beauty Gift Guides",
    shortName: "Gifts",
    seoTitle: "Beauty Gift Guides: Thoughtful Ideas at Every Budget",
    description:
      "Considered beauty gift ideas organized by budget and recipient, with notes on who each idea suits and what to check before buying.",
    intro:
      "Thoughtful gifts start with the person, not the price tag. Our guides group ideas by budget and explain who each one may suit.",
    image: "/images/editorial/gift-ribbon.webp",
    imageAlt: "Illustrated gift box tied with a champagne ribbon beside a small skincare jar",
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export const categorySlugs = categories.map((c) => c.slug) as [CategorySlug, ...CategorySlug[]];
