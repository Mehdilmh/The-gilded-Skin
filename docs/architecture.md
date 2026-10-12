# Architecture & decisions

## Summary

A statically generated Next.js 15 App Router site. Editorial pages are Server Components rendered to HTML at build time; the only client JavaScript is the mobile-menu enhancement, the consent-gated analytics loader and Next's router. Content lives in the repository as MDX and JSON, validated with Zod on every build.

## Key decisions

| Decision | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 15.5 App Router + React 19 | Server-rendered HTML for crawlability, built-in metadata/sitemap/robots/OG APIs, static generation |
| Content store | MDX + JSON files in `content/` | A solo publisher needs versioned, reviewable content without running a CMS or database. Git history is the audit trail and the backup |
| Validation | Zod schemas (`src/lib/schemas.ts`) | Invalid frontmatter, products or image records fail the build with a clear message |
| Database | None | No feature needs persistent server state. Revisit only if multiple editors need a web UI |
| Admin | Read-only `/studio`, dev-only | No public admin surface to secure. Editing happens in files + pull requests |
| Styling | Tailwind CSS 3 with design tokens | Small CSS, consistent tokens, no UI library |
| Fonts | Cormorant Garamond + Inter, self-hosted (OFL) via `next/font/local` | No third-party font requests, no layout shift |
| Images | Original illustrations generated as WebP + `next/image` (AVIF/WebP) | Rights-clean; dimensions known; responsive |
| Social images | `next/og` route handlers rendered at build | Branded OG and Pinterest graphics without design tooling |
| Affiliate links | Direct, tagged product-page links built server-side | Compliant (no cloaking/interstitials), single place to change a link |
| Tests | Vitest + Playwright + axe-core | Fast unit checks; real-browser checks at three widths |

## Rendering & routes

| Route | Rendering |
| --- | --- |
| `/`, `/blog`, `/category/[slug]`, `/[slug]`, legal pages | Static (SSG) |
| `/og/[slug]`, `/pins/[slug]/[n]` | Static images generated at build |
| `/sitemap.xml`, `/robots.txt` | Static, depend on `SITE_ENV` at build |
| `/search`, `/contact` | Dynamic (query string / per-request timestamp) |
| `/api/contact` | Route handler (POST) |
| `/studio/*` | Dynamic, 404 unless development or `ENABLE_STUDIO=true` |

Articles live at the root (`/<slug>`). `RESERVED_SLUGS` in `src/lib/content.ts` prevents an article from shadowing a site route.

## Data flow

```
content/*.mdx ──gray-matter──▶ Zod (articleFrontmatterSchema) ──▶ Article objects
content/products/*.json ─────▶ Zod (productSchema) ─────────────▶ getPublicProduct()
content/images.json ─────────▶ Zod (imageRecordSchema) ─────────▶ EditorialImage
                                                    │
               src/lib/affiliate.ts  ◀── AMAZON_ASSOCIATE_TAG (server env)
                                                    │
                         ArticleView (RSC) ──▶ static HTML
```

## Security

- Secrets are read only in server code (`process.env` in route handlers / server components). Only `NEXT_PUBLIC_*` values reach the browser, and none are secrets.
- Security headers in `next.config.ts` (nosniff, referrer policy, frame options, permissions policy, HSTS). `X-Powered-By` removed.
- Non-production builds send `X-Robots-Tag: noindex, nofollow`.
- Contact form: Zod validation, honeypot, time trap, per-IP rate limit (best effort, per instance), HTML-escaped email body, provider errors never echoed.
- MDX is first-party content; `blockDangerousJS` stays on.
- JSON-LD is serialized with `<` escaped.

## Optional AI integration (not implemented)

The core site needs no AI API. If an assistant is added later (brief drafts, pin copy, meta suggestions):

- Put it behind a server-only adapter (e.g. `src/lib/ai/`), configured by `AI_PROVIDER` / `AI_API_KEY`, and make every output a *suggestion* written to a draft file for human approval.
- Document the provider, model, rate limits and expected cost in this file before enabling it.
- Never let it invent sources, specifications, prices or reviews, and never train on Amazon Product Advertising content.
- The site must keep working when the variables are unset.

## Milestone log

1. **Audit & planning** — empty repository; stack chosen as above.
2. **Brand & design system** — vector logo set, favicon/icons, tokens, layout, header/footer.
3. **Main website** — homepage, blog, categories, article template, About, Contact, legal pages, 404, search, HTML sitemap.
4. **Content & product system** — schemas, MDX components, product records, image registry, briefs.
5. **Amazon Associates** — link utility, disclosures, product cards/comparisons, link audit.
6. **SEO** — metadata, canonicals, JSON-LD, sitemap, robots, staging noindex, internal-link checks.
7. **Pinterest** — pin concepts, generated pin graphics, save links, CSV export, studio view.
8. **QA** — lint, types, 77 unit tests, 68 e2e checks, axe, Lighthouse.
9. **Deployment prep** — CI workflow and docs.
