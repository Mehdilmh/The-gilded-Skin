import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

/**
 * The Gilded Skin design tokens.
 * Palette, type scale, radii and spacing live here so components never
 * hard-code brand values.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./content/**/*.mdx"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1.25rem", md: "2rem", lg: "2.5rem" } },
    extend: {
      colors: {
        ivory: "#F8F4EC",
        champagne: { DEFAULT: "#B7975B", dark: "#7A5F2C", light: "#D9C59C" },
        espresso: { DEFAULT: "#342C25", soft: "#4A4038" },
        taupe: { DEFAULT: "#9B8C7B", dark: "#6E6152" },
        beige: "#E9DFD0",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      fontSize: {
        eyebrow: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.18em" }],
        "display-sm": ["2.25rem", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
        display: ["3.25rem", { lineHeight: "1.05", letterSpacing: "-0.015em" }],
        "display-lg": ["4.5rem", { lineHeight: "1", letterSpacing: "-0.02em" }],
      },
      borderRadius: { card: "0.375rem", pill: "999px" },
      maxWidth: { prose: "42rem", wide: "76rem" },
      aspectRatio: { pin: "2 / 3", editorial: "4 / 5", wide: "16 / 9", card: "3 / 2" },
      boxShadow: {
        soft: "0 1px 2px rgba(52,44,37,0.04), 0 8px 24px -12px rgba(52,44,37,0.18)",
      },
      typography: () => ({
        gilded: {
          css: {
            "--tw-prose-body": "#3d342c",
            "--tw-prose-headings": "#342C25",
            "--tw-prose-links": "#342C25",
            "--tw-prose-bold": "#342C25",
            "--tw-prose-quotes": "#342C25",
            "--tw-prose-quote-borders": "#B7975B",
            "--tw-prose-bullets": "#B7975B",
            "--tw-prose-counters": "#7A5F2C",
            "--tw-prose-hr": "#E9DFD0",
            "--tw-prose-th-borders": "#D9C59C",
            "--tw-prose-td-borders": "#E9DFD0",
          },
        },
      }),
    },
  },
  plugins: [typography],
};

export default config;
