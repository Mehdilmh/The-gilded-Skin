# Design system & brand

## Identity

- **Wordmark:** "THE GILDED SKIN" set in Cormorant Garamond (weight ~560) with 0.16em tracking, outlined to SVG paths so it never depends on installed fonts.
- **Mark:** an eight-petal botanical star — four long petals and four short diagonal leaves in a champagne-gold gradient.
- **Files (`public/brand/`):**

| File | Use |
| --- | --- |
| `logo.svg` | Primary horizontal lockup (header) |
| `logo-stacked.svg` | Stacked lockup with "Beauty Editorial" line (social, print) |
| `logo-mono-dark.svg` / `logo-mono-light.svg` | Single-color versions for light / dark backgrounds |
| `logo-mark.svg` / `logo-mark-mono.svg` | Mark only |
| `favicon.svg`, `src/app/icon.svg`, `src/app/favicon.ico`, `src/app/apple-icon.png` | Browser and device icons |
| `logo-512.png` | Organization logo for structured data |
| `social-avatar.svg/.png` | Pinterest/Instagram profile image (1000×1000) |

Rebuild vectors with `python3 scripts/brand/build_logo.py`, rasters with `npm run brand:assets`. Don't use Amazon's or any other brand's marks in the identity.

## Color tokens (`tailwind.config.ts`)

| Token | Hex | Use | Contrast note |
| --- | --- | --- | --- |
| `ivory` | `#F8F4EC` | Page background | — |
| `champagne` | `#B7975B` | Rules, icons, decorative accents only | Fails AA for text on ivory/white |
| `champagne-dark` | `#7A5F2C` | Eyebrows, accent text, gold buttons | ≥4.5:1 on ivory |
| `champagne-light` | `#D9C59C` | Accents on espresso | — |
| `espresso` | `#342C25` | Text, dark sections, primary buttons | — |
| `taupe` | `#9B8C7B` | Borders, decorative | Not for text |
| `taupe-dark` | `#6E6152` | Muted text, captions | ≥4.5:1 on ivory |
| `beige` | `#E9DFD0` | Dividers, image placeholders, soft panels | — |
| `white` | `#FFFFFF` | Cards | — |

## Typography

- **Serif (headings):** Cormorant Garamond, `font-serif`, weight 500. Display sizes `display-sm` 36px → `display` 52px → `display-lg` 72px.
- **Sans (body, UI):** Inter, `font-sans`. Body 16–18px, 1.6–1.75 line height.
- **Eyebrow:** 12px, uppercase, 0.18em tracking, semibold, `champagne-dark` (`.eyebrow`).
- Headings use `text-wrap: balance`; paragraphs use `pretty`.

## Components & patterns

- **Buttons:** `.btn-primary` (espresso pill), `.btn-secondary` (outline), `.btn-gold` (affiliate CTA).
- **Cards:** `rounded-card` (6px), white, `shadow-soft`.
- **Image ratios:** `aspect-pin` 2:3, `aspect-editorial` 4:5, `aspect-card` 3:2, `aspect-wide` 16:9.
- **Layout:** `container` with 20/32/40px gutters; `max-w-wide` 76rem; prose `max-w-prose` 42rem.
- **Article blocks:** QuickAnswer, KeyTakeaways, ComparisonTable (scrollable with sticky first column), ProsCons, SuitsSkip, Checklist, Callout, ProductCard, ProductComparison, Figure.
- **Motion:** subtle image zoom on hover only; disabled under `prefers-reduced-motion`.
- **Focus:** 2px `champagne-dark` outline on every focusable element; skip link to `#main`.

## Illustration style

Soft editorial still lifes: warm ivory wall, sand surface, arched window glow, diagonal light, gold-accented generic vessels, eucalyptus sprig, plinths. Kit: `scripts/brand/illustrations.ts`. Illustrations show product *types*, never branded products.

## Pinterest templates

Defined in `src/lib/social-images.tsx` (1000×1500): `roundup`/`organization` (full-bleed illustration + ivory card), `comparison`/`routine` (espresso with arched window), `checklist` (beige with check mark), `gift-guide` (gold frame).
