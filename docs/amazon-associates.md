# Amazon Associates & affiliate links

Source of truth: the current [Operating Agreement](https://affiliate-program.amazon.com/help/operating/agreement/) and [Program Policies](https://affiliate-program.amazon.com/help/operating/policies). Re-read them before launch and whenever Amazon announces changes. This site is built to *support* compliance; it cannot guarantee it, nor account approval.

## Tracking ID

`AMAZON_ASSOCIATE_TAG=gettse00-20` — set in the hosting environment, read only on the server by `getAssociateTag()` in `src/lib/affiliate.ts`. Changing it there changes every link at the next build.

## Adding a product

1. Copy `content/products/_TEMPLATE.json` to `content/products/<id>.json` (file name = `id`).
2. Fill name/brand/specifications **from the brand's official materials**. Record each source in `sources`.
3. Generate the link with Associates tools (SiteStripe or Associates Central "Link to any page") while logged in. Store it in `affiliateUrl`, or store the `asin` and let the utility build `https://www.amazon.com/dp/<ASIN>?tag=<tag>`.
4. Set `lastVerified`, `availabilityStatus`, then `linkStatus: "verified"` and `status: "published"`.
5. Reference it in an article: `products: [id]` and `<ProductCard id="id" />`.
6. Run `npm run audit:links` (and `-- --network` occasionally).

Replacing a link = edit one JSON file. All articles update on the next build.

## What the code enforces

- Links go **directly** to the Amazon product detail page — no redirects through this site, no interstitials, no cloaking.
- `rel="sponsored nofollow noopener noreferrer"`, `target="_blank"`, an accessible label ending "(affiliate link, opens in a new tab)", and a visible "Affiliate link · Opens Amazon" note.
- CTAs: "View product on Amazon", "Check the current listing", "Compare product details".
- Products that aren't `published` + `verified`, or when the tag is missing, render **nothing** in production.
- Raw Amazon URLs inside article bodies are blocked (rendered as plain text) and fail the audit.
- UTM parameters can never be added to Amazon URLs (`withUtm` throws).
- No fields exist for hand-entered prices, star ratings, review counts or bestseller status. `priceDisplay` is `hidden` unless a future permitted API source is added.
- No affiliate links are inserted automatically into content.

## Disclosures

- Exact statement **"As an Amazon Associate I earn from qualifying purchases."** in the footer of every page and on `/affiliate-disclosure`.
- A short disclosure box at the top of every article, before any recommendation. When the article has live affiliate links it reads: "This article contains affiliate links. We may earn a commission if you make a qualifying purchase, at no additional cost to you." followed by the Associates statement.
- Pinterest exports append "This guide contains affiliate links." to pin descriptions for affiliate articles.
- The site states it is independent and not affiliated with or endorsed by Amazon.

## Product images, prices and the APIs

- Do **not** scrape Amazon pages or download Amazon images. Product cards show an editorial image only if one with a legitimate basis is registered (`kind: "product-photo"`, `source: "amazon-api"` or `"brand-press-kit"` with license notes); otherwise they show no product image.
- New Associates accounts don't automatically have Product Advertising API / Creators API access. If you get access, add a server-only adapter (e.g. `src/lib/amazon-api.ts`) that follows the current authentication, caching, refresh, attribution and display rules, and show prices only with the required timestamp/disclaimer. Until then prices are never displayed.
- Don't use Amazon content outside its permitted purpose, or to train AI models.

## Compliance checklist (re-check before launch)

- [ ] Associates account approved and the tracking ID matches `AMAZON_ASSOCIATE_TAG`.
- [ ] Site URL(s) and Pinterest profile listed in Associates Central where required.
- [ ] Disclosure statement visible in footer, disclosure page and near recommendations.
- [ ] No prices, ratings or availability shown without a permitted source.
- [ ] No copied customer reviews, no fabricated testimonials.
- [ ] No affiliate links in emails, PDFs or other places the policies prohibit.
- [ ] No incentives for clicks or purchases.
- [ ] Every affiliate link verified with `npm run audit:links -- --network` and spot-checked by hand.
- [ ] Program policies re-read this quarter.
