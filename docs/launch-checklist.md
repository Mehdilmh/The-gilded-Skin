# Launch checklist & remaining external tasks

Everything below needs the site owner — accounts, legal decisions, editorial sign-off or DNS. None of it has been done or verified by the build.

## Before launch (blocking)

- [ ] **Editorial approval.** Read each of the nine published articles against its sources. Edit as needed, then set `editorialReview.humanApprovedBy`, `approvedAt` (and update `factCheckedAt`). `npm run audit:launch` must pass.
- [ ] **Contact details.** Set `CONTACT_EMAIL` to a real, monitored mailbox. Optionally configure Resend for the form.
- [ ] **Legal review.** Have the privacy policy, cookie policy, terms and affiliate disclosure reviewed for the operator's identity, jurisdiction and the services actually enabled. Add the operator's legal name/address if required.
- [ ] **Amazon Associates.** Confirm the account is active and `gettse00-20` is the right tracking ID; add the website (and Pinterest profile, if you'll pin affiliate content) in Associates Central; re-read the Operating Agreement and Program Policies.
- [ ] **Hosting & domain.** Create the production project, set environment variables (`SITE_ENV=production`), connect `thegildedskin.com`, set apex as primary, confirm HTTPS (see [deployment.md](deployment.md)).
- [ ] **Smoke test production:** homepage, an article, `/sitemap.xml`, `/robots.txt` (`Allow: /`), view-source shows canonical `https://thegildedskin.com/...`.

## Soon after launch

- [ ] Google Search Console: verify, submit sitemap ([analytics-and-verification.md](analytics-and-verification.md)).
- [ ] Pinterest business account, claim website, upload the social avatar, create boards, start pinning from `npm run pinterest:export` gradually.
- [ ] Decide on analytics. If GA4: set the measurement ID, confirm the consent banner, update policies if needed.
- [ ] Social profile URLs in `NEXT_PUBLIC_PINTEREST_URL` / `NEXT_PUBLIC_INSTAGRAM_URL`.

## Content roadmap

- [ ] Research real products for the draft roundups (cleansing brushes, small-bathroom organizers, travel bags). Create verified product records with Associates-generated links. Then complete and publish the roundups.
- [ ] Decide whether "minimalist vanity organizers" and "makeup and skincare storage" are distinct intents or should merge with the organizer roundup.
- [ ] Gift guides by budget require a permitted, current price source (e.g. approved API access). Until then, keep them as drafts or reframe without price claims.
- [ ] Add a real author profile (with true credentials only) if a named person will write.
- [ ] Consider licensed photography to complement the illustrations (record rights in `content/images.json`).
- [ ] Optional newsletter: choose a provider and set `NEWSLETTER_FORM_ACTION`.

## Verified by the build (October 2026)

- Lint, type check, 77 unit/render tests, content and link audits, production build.
- 68 Playwright checks across mobile (Pixel 7), tablet (820px) and desktop (1440px): rendering, mobile menu, no horizontal overflow, no-JS crawlability, canonicals, robots meta, JSON-LD validity, sitemap/robots content, draft and studio 404s, trailing-slash redirects, internal link resolution, pin/OG images, no prices, disclosure text, image alts, contact validation, security headers, axe (no serious/critical violations), skip link.
- Lighthouse on a local production build (see [seo.md](seo.md)).
