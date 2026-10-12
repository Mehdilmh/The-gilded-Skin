# Editorial workflow & content model

## Production stages

| # | Stage | Where it happens | Gate |
| --- | --- | --- | --- |
| 1 | Topic proposed | `npm run content:brief -- <slug> "<query>"` | Brief file exists |
| 2 | Search intent documented | Brief → *Search* section | Intent + related questions filled from live SERPs |
| 3 | Overlap checked | Brief → *Existing content* (auto-listed) | No two articles target the same intent |
| 4 | Product shortlist researched | `content/products/*.json` in `draft` status | Specs from official sources |
| 5 | Sources collected | Brief + article `sources` | Primary sources only |
| 6 | Brief complete | Brief status `briefed` | — |
| 7 | Draft written | `npm run content:new …` → `status: draft` | Preview at `/studio/preview/<slug>` |
| 8 | Product facts checked | Product `sources`, `lastVerified` | Each fact traceable |
| 9 | Affiliate links verified | Product `linkStatus: verified`, `npm run audit:links` | No link errors |
| 10 | Images & rights verified | `content/images.json` | No image errors |
| 11 | SEO & accessibility checks | `npm run audit:content`, `npm run check` | No errors |
| 12 | Editorial review approved | `editorialReview.humanApprovedBy`, `approvedAt`, `factCheckedAt` | `npm run audit:launch` passes |
| 13 | Published | `status: published`, `indexing: index`, merge to main | CI green |
| 14 | Pinterest assets prepared | Three `pinterest.pins` + `npm run pinterest:export` | Required by schema |
| 15 | Performance reviewed | Search Console + Pinterest Analytics after 4–8 weeks | Update or consolidate |

## Article frontmatter

| Field | Notes |
| --- | --- |
| `title`, `slug`, `excerpt` | Slug must equal the file name; lowercase-hyphenated; never change after publishing (add a redirect if you must) |
| `seoTitle` (≤ ~60 chars), `metaDescription` (110–160) | Unique per article |
| `primaryKeyword`, `secondaryKeywords`, `searchIntent` | One primary keyword per article — the audit flags duplicates |
| `articleType` | review, comparison, roundup, beginners-guide, how-to, category-guide, buying-checklist, gift-guide, routine |
| `category`, `tags` | Category drives breadcrumbs, related articles and category pages |
| `author`, `reviewer` | IDs from `content/authors.json`. Add a reviewer only if a real reviewer exists |
| `publishedAt`, `updatedAt` | `updatedAt` = last *substantial* update |
| `featuredImage`, `imageCaption`, `socialImage` | Images must be in `content/images.json` |
| `quickAnswer`, `keyTakeaways`, `faq` | Rendered as visible sections; FAQ also becomes FAQPage JSON-LD |
| `products`, `relatedArticles` | IDs / slugs |
| `status` (draft, review, published), `indexing` (index, noindex) | Only `published` is public |
| `basis` | `independent-research` or `hands-on-testing` (requires `testingNotes`) |
| `researchNotes`, `sources` | Sources render on the page |
| `editorialReview` | `aiAssisted`, `factCheckedAt`, `humanApprovedBy`, `approvedAt` |
| `pinterest.pins` | Exactly three concepts before publishing |

The table of contents and reading time are generated automatically.

## MDX components

```mdx
<Callout title="Note" tone="tip">Text with a [link](/somewhere).</Callout>

<Checklist title="Before you buy" items={["One", "Two"]} />

<ComparisonTable caption="Types compared" columns={["Type", "Best for", "Limits"]} rows={[["A", "x", "y"]]} />

<ProsCons pros={["…"]} cons={["…"]} />
<SuitsSkip subject="a brush" suits={["…"]} skip={["…"]} />

<ProductCard id="product-id" rank={1} />
<ProductComparison ids={["a", "b"]} caption="Brushes compared" />

<Figure src="/images/editorial/file.webp" caption="Optional caption" />
```

Use Markdown links for internal links (`[guide](/slug)`). Never paste Amazon URLs into the body — the audit fails and the link is not rendered. Products only appear when their record is `published` + `verified`.

## Templates

**Product roundup:** search-focused title → introduction → quick recommendations → how products were selected → buying criteria → individual product sections (ProductCard) → comparison table → which option suits which reader → common mistakes → FAQ (if useful) → conclusion → sources & disclosure (automatic).

**Individual review:** intended use → verified specifications → main advantages → limitations → alternatives → unanswered questions → sources. State plainly whether it's research or documented hands-on testing.

Draft roundups in `content/articles/best-*.mdx` and `beauty-gift-ideas-*.mdx` already follow this structure.

## Quality controls (`npm run audit:content`)

Errors (block publishing): invalid frontmatter; missing image rights record; markdown images; missing/unverified products; raw Amazon links; fabricated-experience phrases ("we tested", "after using it for 30 days", "our lab") without documented testing; TODO/TBD text; broken internal links or links to drafts; missing related articles; no fact-check date; duplicate SEO titles/descriptions; duplicate primary keywords; near-duplicate bodies (>30% shingle overlap).

Warnings: risky claims ("guarantee", "clinically proven", "cure", prices in body…); thin content (<600 words); long SEO titles; short descriptions; fewer than three H2s; no quick answer; orphaned articles; empty categories; stale articles (>12 months); awaiting human approval (an error with `--launch`).

## AI assistance policy

AI may help organize research and draft. A person must verify every claim against its source, rewrite for originality and voice, and record approval. Never mass-publish unreviewed AI output. The nine launch articles are flagged `aiAssisted: true` and are waiting for that approval.

## Initial launch plan

| Brief | Status |
| --- | --- |
| How to organize skincare products on a vanity | Published (awaiting approval) |
| How to build a simple morning skincare routine | Published (awaiting approval) |
| LED face masks: features, limitations, buying considerations | Published (awaiting approval) |
| What to consider before buying an at-home facial device | Published (awaiting approval) |
| How to compare facial rollers and gua sha tools | Published (awaiting approval) |
| Skincare fridge: useful accessory or unnecessary purchase? | Published (awaiting approval) |
| How to choose a travel-friendly skincare case | Published (awaiting approval) |
| Facial cleansing brushes: what to compare (informational) | Published (awaiting approval) |
| How to choose a beauty gift (supports gift category) | Published (awaiting approval) |
| Best skincare organizers for a small bathroom | Draft — needs products |
| Best skincare travel bags | Draft — needs products |
| Best facial cleansing brushes | Draft — needs products |
| Best beauty organizers for a minimalist vanity | Draft — overlap check first |
| Best makeup and skincare storage solutions | Draft — overlap check first, consider merging |
| Beauty gift ideas under $25 / under $50 | Draft — need products and a permitted price source |
| Beauty tools for a beginner's routine | Draft |
