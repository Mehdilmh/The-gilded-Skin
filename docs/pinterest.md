# Pinterest

Policy reference: [Pinterest commercial and branded content guidelines](https://policy.pinterest.com/en/commercial-and-branded-content-guidelines). Re-read before campaigns.

## Built in

- **Three pin concepts per article** in frontmatter (`pinterest.pins`): headline, description, template, board, topics, image concept, optional kicker. Required before an article can be published.
- **Generated pin graphics** (1000×1500, 2:3) at `/pins/<slug>/<1|2|3>`, built at deploy time from the article's illustration and the brand templates (`roundup`, `organization`, `comparison`, `routine`, `checklist`, `gift-guide`).
- **Save to Pinterest** link on every article — a plain link to Pinterest's save dialog (no third-party script), prefilled with the pin image, description and a UTM-tagged URL.
- **Open Graph** images at `/og/<slug>` so Rich Pins / link previews look right.
- **CSV export:** `npm run pinterest:export` → `reports/pins.csv` (title, media URL, board, description, link, keywords). Suitable for Pinterest's bulk-create flow or a scheduler.
- **Studio view:** `/studio/pinterest` (development) previews every concept.

## UTM tracking

Pin links use `utm_source=pinterest&utm_medium=social&utm_campaign=<slug>&utm_content=pin-<n>`. UTMs only ever go on links to this site — never on Amazon links — so Associates tracking is unaffected. Canonical tags ignore query strings, so UTMs don't create duplicate pages.

## Workflow per article

1. Write three *distinct* concepts (different angle, not reworded copies): e.g. a checklist, a comparison, a "should you buy it" question.
2. Check descriptions are accurate and match the article. No exaggerated claims.
3. If the article contains affiliate links, the export appends "This guide contains affiliate links." Keep a clear disclosure in any manually written description too.
4. Publish gradually (a few fresh pins per day across boards) rather than mass-posting. Don't re-pin identical images repeatedly.
5. After 30–60 days, review Pinterest Analytics: outbound clicks by pin → write new concepts in the style that works.

## Image rules

- Pins use original illustrations of generic product types. Never present an illustration as the actual recommended product.
- For product-specific pins, use a licensed photograph or an image you're authorized to use, recorded in `content/images.json`.

## Suggested boards

Vanity Organization Ideas · Skincare Routine Tips · Beauty Tools & Devices · Honest Beauty Buying Guides · Travel Beauty Tips · Beauty Gift Ideas · Minimal Beauty Routines

## Account setup (owner tasks)

1. Create a Pinterest **business** account; use `public/brand/social-avatar.png` as the profile image.
2. Claim the website: Settings → Claimed accounts → Websites → choose the HTML tag option and copy only the `content` value into `PINTEREST_SITE_VERIFICATION`. Redeploy, then click Verify.
3. Rich Pins are generated from Open Graph metadata, which every article already has.
4. Pinterest tag: only add it if you will run Pinterest ads and need conversion data; it would need to be consent-gated like GA.
