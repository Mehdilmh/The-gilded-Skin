# SEO, AI search & keyword research

Nothing here guarantees indexing, rankings, traffic or citations by AI systems. The goal is a site that is easy to crawl, understand and trust.

## What's implemented

| Feature | Where |
| --- | --- |
| Unique title, description, canonical, Open Graph, Twitter tags | `pageMetadata()` in `src/lib/seo.ts`, used by every page |
| Absolute canonicals on `https://thegildedskin.com`, no trailing slash | `absoluteUrl()`; Next `trailingSlash: false` (308 redirect) |
| `www` → apex permanent redirect | `next.config.ts` |
| Robots meta: index in production, noindex elsewhere; noindex for search, drafts, empty categories | `pageMetadata()`, layout |
| `X-Robots-Tag: noindex` on non-production | `next.config.ts` headers |
| XML sitemap: home, static pages, populated categories, published articles (+ image) | `src/lib/sitemap.ts` → `/sitemap.xml` |
| robots.txt: allows all assets, disallows `/search`, `/studio`, `/api/` | `src/lib/robots.ts` |
| HTML sitemap | `/sitemap` |
| JSON-LD: Organization, WebSite (+SearchAction), BreadcrumbList, BlogPosting, FAQPage (only when FAQ is visible), CollectionPage | `src/lib/structured-data.ts` |
| Person only for real authors (`isRealPerson: true`); no Review/AggregateRating/Offer | same |
| 404 page with real 404 status | `src/app/not-found.tsx` |
| Moved content → permanent redirects | `content/redirects.json` |
| Images: descriptive filenames, registry alt text, width/height, AVIF/WebP, lazy below the fold, `priority` above | `EditorialImage` |
| Internal-link checks: broken links, links to drafts, orphans, related articles | `npm run audit:content` |
| Duplicate titles/descriptions, keyword cannibalization, near-duplicate bodies | same |

## AI-powered search readiness

Following Google's guidance ([AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [AI features](https://developers.google.com/search/docs/appearance/ai-features)):

- All content is server-rendered HTML; nothing requires interaction to reveal it (FAQ answers are plain text, not collapsed).
- Each article opens with a **quick answer**, then key takeaways, then sections with descriptive H2s.
- Buying guides include: what matters when choosing, comparison tables, strengths and limitations, who it may suit / who should skip, FAQ when useful, and a sources + methodology section.
- Author identity and the editorial policy are linked from every article.
- Structured data mirrors visible content.
- There is deliberately no `llms.txt` or hidden AI-only content.

## Keyword research workflow

1. `npm run content:brief -- <slug> "<main query>"` — creates `content/briefs/<slug>.md` from `_TEMPLATE.md` and lists possibly overlapping articles.
2. Fill in from live sources (Google SERPs and "People also ask", Search Console queries, Pinterest search suggestions, forums). Record **only observed data**; if you have no tool data, keep "research required". Never invent volume, difficulty, rankings or competitor statistics.
3. Decide the single intent the article will satisfy. If another article already serves it, update that article instead.
4. Plan internal links both ways (what this links to; what should link here).
5. Prefer long-tail questions and build clusters:
   - **Beauty tools:** LED masks · cleansing brushes · rollers & gua sha · device buying checklist · beginner tools
   - **Vanity & organization:** vanity organization · small-bathroom organizers · minimalist organizers · travel cases · storage
   - **Skincare essentials:** morning routine · storage/shelf life · skincare fridge
   - **Gifts:** how to choose · by budget (once a permitted price source exists)

## SEO health checklist (monthly)

- [ ] Sitemap submitted in Search Console; no "couldn't fetch" errors.
- [ ] Canonicals: URL Inspection on 3 random articles shows the user-declared canonical selected.
- [ ] Indexing report: no unexpected "Excluded by noindex" for published pages; drafts/search not indexed.
- [ ] Crawl errors / 404s reviewed; add redirects for moved URLs.
- [ ] Core Web Vitals report (field data) — LCP, INP, CLS in "Good".
- [ ] `npm run audit:content` and `npm run audit:links -- --network` clean.
- [ ] Performance report: queries with high impressions / low CTR → improve titles/descriptions honestly.
- [ ] No duplicate titles/descriptions (audit).
- [ ] Freshness: articles older than 12 months reviewed; `updatedAt` changed only for substantial updates.
- [ ] Mobile usability spot check on a real phone.

## Measured baseline

Lighthouse 12 (mobile emulation with simulated throttling, local production build, October 2026):

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | 94 | 100 | 100 | 100 | 3.1 s | 0 |
| `/facial-rollers-vs-gua-sha` | 95 | 100 | 100 | 100 | 2.8 s | 0 |
| `/led-face-masks-what-to-compare` | 95 | 100 | 100 | 100 | 2.8 s | 0 |

Lab numbers vary between runs and machines. Re-measure on the live host; field data in Search Console is what matters.
