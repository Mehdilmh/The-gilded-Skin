# The Gilded Skin

An independent beauty editorial publication — honest, research-led guides to skincare tools, beauty devices, vanity organization and gifts — monetized through compliant Amazon Associates affiliate links.

**Production domain:** https://thegildedskin.com

> *Thoughtful beauty finds, elevated routines, and honest guides to help you choose what belongs on your vanity.*

---

## At a glance

| Area | What's included |
| --- | --- |
| Stack | Next.js 15 (App Router, Server Components), React 19, TypeScript, Tailwind CSS 3, MDX, Zod |
| Content | MDX articles + JSON product records in `content/`, validated at build time |
| Brand | Vector wordmark, botanical-star mark, monochrome variants, favicon set, social avatar, original illustration library |
| Affiliate | Central Amazon link utility (`src/lib/affiliate.ts`), disclosures, link audit |
| SEO | Per-page metadata + canonicals, JSON-LD, XML + HTML sitemaps, robots.txt, staging noindex |
| Pinterest | Three pin concepts per article, generated 1000×1500 pin graphics, CSV export, save links |
| Editorial QA | `npm run audit:content` quality gate, dev-only `/studio` dashboard, briefs |
| Tests | 77 Vitest unit/render tests, 68 Playwright checks at mobile/tablet/desktop with axe |

## Quick start

Requirements: Node.js 20.9+ (22 recommended), npm.

```bash
npm install
cp .env.example .env.local      # then edit values
npm run dev                     # http://localhost:3000
```

Open http://localhost:3000/studio in development for the editorial dashboard (audit results, draft previews, Pinterest assets).

## Configuration

All configuration is through environment variables — see [`.env.example`](.env.example) for the full, commented list.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical origin, `https://thegildedskin.com` |
| `SITE_ENV` | yes | `production` enables indexing. Any other value → `noindex` everywhere, robots.txt disallows all, empty sitemap |
| `AMAZON_ASSOCIATE_TAG` | yes | Amazon US tracking ID (`gettse00-20`), read server-side only |
| `AMAZON_MARKETPLACE` | no | Defaults to `www.amazon.com` |
| `CONTACT_EMAIL` | recommended | Public contact address shown on the Contact page |
| `CONTACT_PROVIDER`, `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` | no | Enables the contact form via Resend. Without them the page shows the email address instead |
| `NEWSLETTER_FORM_ACTION`, `NEWSLETTER_PROVIDER_NAME` | no | A real provider's form endpoint. The signup block is hidden unless set |
| `GOOGLE_SITE_VERIFICATION`, `PINTEREST_SITE_VERIFICATION` | no | Verification meta tags |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | no | GA4, loaded only after visitor consent |
| `NEXT_PUBLIC_PINTEREST_URL`, `NEXT_PUBLIC_INSTAGRAM_URL` | no | Footer links + Organization `sameAs` |
| `ENABLE_STUDIO` | no | Exposes `/studio` outside development. Only for password-protected previews |

`SITE_ENV`, sitemap and robots are evaluated **at build time** for static pages. Build production with `SITE_ENV=production`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint (zero warnings allowed) |
| `npm run typecheck` | Generates route types, then `tsc --noEmit` |
| `npm test` | Vitest unit + render tests |
| `npm run test:e2e` | Playwright against the production build (run `SITE_ENV=production npm run build` first) |
| `npm run audit:content` | Editorial quality gate — fails on errors |
| `npm run audit:launch` | Same, but also requires recorded human approval on every published article |
| `npm run audit:links` | Affiliate link audit; add `-- --network` to request every product and source URL |
| `npm run content:new -- <slug> "<Title>" [category] [type]` | Scaffold a draft article |
| `npm run content:brief -- <slug> "<query>"` | Create an article brief with an overlap check |
| `npm run products:template -- --category "beauty tools" --count 5` | Excel sheet to collect Amazon links for a category |
| `npm run products:import -- <file.xlsx>` | Create draft product records from the filled sheet |
| `npm run products:export` | Writes `reports/products.xlsx` with every product, tagged link and status |
| `npm run pinterest:export` | Writes `reports/pins.csv` for bulk pin creation |
| `npm run brand:assets` | Regenerates illustrations, PNG logos, favicon and default OG image |
| `npm run check` | Lint, types, unit tests, audits and build in one go |

Vector logos are built with `python3 scripts/brand/build_logo.py` (needs `pip install fonttools brotli`).

## Project structure

```
content/
  articles/*.mdx        Articles (frontmatter = metadata; body = MDX)
  products/*.json       Product records (one file per product; _TEMPLATE.json)
  briefs/*.md           Article briefs and keyword research (_TEMPLATE.md)
  authors.json          Bylines (real people only get Person schema)
  images.json           Image rights registry (every image needs a record)
  redirects.json        Permanent redirects for moved content
src/
  app/                  Routes (pages, sitemap.ts, robots.ts, og/, pins/, api/contact, studio/)
  components/           layout/, article/, affiliate/, ui/, home/, analytics/
  lib/                  affiliate, content, schemas, seo, structured-data, audit, social-images…
public/brand/           Logo, mark, monochrome variants, favicon, avatar
public/images/editorial Original illustrations (WebP)
scripts/                Audits, scaffolding, exports, brand asset generation
tests/unit, tests/e2e   Vitest and Playwright suites
docs/                   Detailed guides (see below)
```

## Documentation

- [Architecture & decisions](docs/architecture.md)
- [Design system & brand](docs/design-system.md)
- [Editorial workflow & content model](docs/editorial-workflow.md)
- [Amazon Associates & affiliate links](docs/amazon-associates.md)
- [SEO, AI search & keyword research](docs/seo.md)
- [Pinterest](docs/pinterest.md)
- [Images & rights](docs/images.md)
- [Analytics, Search Console & verification](docs/analytics-and-verification.md)
- [Deployment, domain & maintenance](docs/deployment.md)
- [Launch checklist & remaining external tasks](docs/launch-checklist.md)

## Important honesty notes

- The nine launch articles were drafted with AI assistance from verified primary sources. They are marked `editorialReview.aiAssisted: true` and **await human editorial approval** (`npm run audit:launch` fails until each is approved). Read and approve them before launch.
- No product has been selected yet. Product records are placeholders in `draft` status, so **no affiliate product links render** on the public site until real products are researched, linked with Associates tools and verified. Commercial roundups are drafts for the same reason.
- Images are original illustrations of generic product types, labeled "Illustration" and never presented as specific products.
- Legal pages are templates describing how the site works. Have them reviewed for your jurisdiction.
