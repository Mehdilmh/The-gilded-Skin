export type CategorySlug = "beauty-tools" | "skincare" | "vanity-organization" | "gift-guides" | "makeup";

export interface Category {
  slug: CategorySlug;
  name: string;
  shortName: string;
  seoTitle: string;
  description: string;
  intro: string;
  image: string;
  imageAlt: string;
  /** The "start here" guide featured at the top of the category page. */
  pillar?: string;
  /** Optional tagged link to a matching Amazon category, shown as a clearly labeled affiliate button. */
  amazonBrowse?: { url: string; label: string };
}

export const categories: Category[] = [
  {
    slug: "beauty-tools",
    name: "Beauty Tools",
    shortName: "Tools",
    seoTitle: "Beauty Tools & Devices: Honest Buying Guides",
    description:
      "Independent guides to cleansing brushes, LED masks, facial rollers, gua sha and other beauty tools — what they can do, what they can't, and what to compare.",
    intro:
      "Facial devices and beauty tools promise a lot. These guides explain how each type works, where the evidence is thin, and which details actually matter before you buy.",
    pillar: "at-home-facial-device-buying-checklist",
    image: "/images/photos/facial-roller-gua-sha-marble-flatlay.webp",
    imageAlt: "A rose quartz facial roller and gua sha stone resting on a marble slab",
  },
  {
    slug: "skincare",
    name: "Skincare Essentials",
    shortName: "Skincare",
    seoTitle: "Skincare Essentials: Routines and Ingredients",
    description:
      "Practical, sourced guidance on building simple skincare routines, storing products well and choosing accessories that support the way you already care for your skin.",
    intro:
      "Good skincare is often simpler than the shelf suggests. Start here for routine basics, product storage and the accessories that make daily care easier.",
    pillar: "how-to-build-a-simple-morning-skincare-routine",
    image: "/images/photos/white-skincare-bottles-towels-flatlay.webp",
    imageAlt: "Unlabeled white skincare bottles and a cream jar beside folded towels",
  },
  {
    slug: "vanity-organization",
    name: "Vanity & Organization",
    shortName: "Vanity",
    seoTitle: "Vanity Organization, Storage and Travel Cases",
    description:
      "Ideas and buying considerations for organizing skincare and makeup — vanity layouts, small-bathroom storage, travel cases and minimalist organizers.",
    intro:
      "A calm vanity makes a routine easier to keep. These guides cover layouts, storage that protects your products, and organizers worth considering.",
    pillar: "how-to-organize-a-skincare-routine",
    image: "/images/photos/organized-bathroom-vanity-shelving.webp",
    imageAlt: "An organized bathroom vanity with open shelving, folded towels and woven storage baskets beneath the counter",
  },
  {
    slug: "makeup",
    name: "Makeup",
    shortName: "Makeup",
    seoTitle: "Makeup Guides: Complexion, Color and Tools",
    description:
      "Research-led makeup guides from The Gilded Skin: how to choose complexion products, color and makeup tools, with notes on who each option may suit.",
    intro:
      "Makeup guides are on the way. Like everything we publish, they'll explain what to compare and who each option may suit — not just what's popular.",
    pillar: "skin-tint-vs-foundation",
    image: "/images/editorial/makeup-still-life.webp",
    imageAlt: "Illustrated still life of a lipstick, a powder compact and a makeup brush on a cream surface",
    amazonBrowse: {
      url: "https://www.amazon.com/s?i=specialty-aps&bbn=16225006011&rh=n%3A%252116225006011%2Cn%3A11058281",
      label: "Browse makeup on Amazon",
    },
  },
  {
    slug: "gift-guides",
    name: "Beauty Gift Guides",
    shortName: "Gifts",
    seoTitle: "Beauty Gift Guides: Thoughtful Ideas",
    description:
      "Considered beauty gift ideas organized by budget and recipient, with notes on who each idea suits and what to check before buying.",
    intro:
      "Thoughtful gifts start with the person, not the price tag. Our guides group ideas by budget and explain who each one may suit.",
    pillar: "how-to-choose-a-beauty-gift",
    image: "/images/photos/wrapped-gift-box-red-ribbon-beige.webp",
    imageAlt: "A small white gift box tied with a red ribbon beside a blank card on a beige background",
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export const categorySlugs = categories.map((c) => c.slug) as [CategorySlug, ...CategorySlug[]];
