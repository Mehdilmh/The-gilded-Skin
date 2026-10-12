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
    image: "/images/photos/facial-roller-gua-sha-marble-flatlay.webp",
    imageAlt: "A rose quartz facial roller and gua sha stone resting on a marble slab",
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
    image: "/images/photos/white-skincare-bottles-towels-flatlay.webp",
    imageAlt: "Unlabeled white skincare bottles and a cream jar beside folded towels",
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
    image: "/images/photos/organized-bathroom-vanity-shelving.webp",
    imageAlt: "An organized bathroom vanity with open shelving, folded towels and woven storage baskets beneath the counter",
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
    image: "/images/photos/wrapped-gift-box-red-ribbon-beige.webp",
    imageAlt: "A small white gift box tied with a red ribbon beside a blank card on a beige background",
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export const categorySlugs = categories.map((c) => c.slug) as [CategorySlug, ...CategorySlug[]];
