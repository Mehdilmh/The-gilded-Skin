# Niche analysis and content plan — 2026-10-19

## The niche

The Gilded Skin sits between three markets: **beauty tools and at-home devices**, **skincare basics** and **vanity organization**. It earns through Amazon Associates.

- **Demand is growing.** Market-research summaries project home-use beauty devices at roughly $14bn in 2026, growing about 11% a year. Growth is driven by LED, microcurrent and ultrasonic devices, and by shoppers wanting cheaper alternatives to in-clinic treatments. The figures are directional only.
- **Competition is strong at the head.** Broad terms such as "morning skincare routine" and "retinol and vitamin C" are dominated by big publishers and brands; our pages rank 65–100 there (Search Console, Oct 11–17).
- **Our opening is long-tail, "should I / how do I / what to look for" questions.** The hypochlorous acid guide reached an average position of 11 mostly through long questions, and "cool blue eyeshadow" sits at positions 9–17.
- **What builds trust in a YMYL-adjacent niche** (skin health, devices) is cited sources, honest limitations and "who should skip it" guidance. Google's scaled-content policy targets high volume with low added value, not AI use itself. Every article must stay specific, sourced and genuinely useful.

## Content strategy

1. **Deepen the three core clusters** before widening: tools and devices, skincare ingredients and basics, vanity and travel organization.
2. **Answer purchase-adjacent questions** that lead naturally to a product type: microcurrent, dermaplaning, facial steamers, heated curlers, organizers, travel bottles.
3. **Cover evergreen "safety and care" topics** that support the commercial pages and earn links: patch testing, expiration dates, cleaning tools, sensitive skin.
4. **Make each article link to its cluster pillar and two siblings.** No article links to one that goes live later.

## Batch 1 — scheduled 5 per day

| Date | Beauty tools | Skincare | Vanity & travel | Makeup |
| --- | --- | --- | --- | --- |
| Oct 20 | Microcurrent devices explained | What is niacinamide; How to patch test skincare | Packing skincare for a carry-on | Makeup expiration dates |
| Oct 21 | Dermaplaning at home | What are ceramides; Reapplying sunscreen over makeup | Cleaning beauty tools; Small bathroom vanity ideas | — |
| Oct 22 | Facial steamers; Heated eyelash curlers | Witch hazel vs. hypochlorous acid | Organizing a makeup drawer | Makeup for sensitive skin |

Search Console signals behind this batch: "can you put cleanser in a skincare fridge", "hypochlorous acid spray vs witch hazel", "how to fit skincare in a TSA quart bag", "gua sha vs jade roller" and the ultrasonic device queries.

## How scheduling works

- An article with `status: published` and a future `publishedAt` is **scheduled**. It stays hidden from pages, the sitemap, search and the OG and pin routes until that date (UTC).
- Listing pages, the sitemap and article routes re-render hourly (`revalidate = 3600`), so each day's articles appear without a redeploy. This requires the site to run as a Node server (`npm start`), as it does now.
- `npm run audit:content` fails if a live article links to one that isn't live yet.

## Sources

- The Business Research Company via GII Research, Home Use Beauty Devices Global Market Report: https://www.giiresearch.com/report/tbrc1923232-home-use-beauty-devices-global-market-report.html
- Global Market Insights, Skin Care Devices Market: https://gminsights.com/toc/detail/skin-care-devices-market
- PPC Land, Scaled content abuse: https://ppc.land/scaled-content-abuse/
- Search Console export, 2026-10-11 to 2026-10-17 (docs/search-console-2026-10-19.md)
