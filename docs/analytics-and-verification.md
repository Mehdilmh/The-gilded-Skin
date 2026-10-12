# Analytics, Search Console & verification

None of these accounts have been created or verified by the build. Each step below needs the site owner.

## Google Search Console

1. Go to https://search.google.com/search-console → Add property.
2. Recommended: **Domain** property (`thegildedskin.com`), verified by a DNS TXT record at your registrar — covers http/https/www.
3. Alternative: **URL-prefix** property `https://thegildedskin.com/` with the HTML tag method. Copy only the token from `content="…"` into `GOOGLE_SITE_VERIFICATION`, redeploy, click Verify.
4. Sitemaps → submit `https://thegildedskin.com/sitemap.xml`. Submission doesn't guarantee indexing.
5. URL Inspection → request indexing for the homepage and a few key guides after launch.

## Google Analytics 4 (optional)

1. Create a GA4 property and web data stream for `https://thegildedskin.com`.
2. Put the measurement ID (`G-XXXXXXXXXX`) in `NEXT_PUBLIC_GA_MEASUREMENT_ID` and redeploy.
3. Behavior: a consent banner appears; GA loads **only after "Allow analytics"**, with Google signals and ad personalization disabled. Declining loads nothing. Visitors can change their choice on `/cookie-policy`.
4. Events sent (aggregate, no personal data): page views, `affiliate_click` (product ID + placement), `pinterest_save` (article slug). Pinterest referrals and search landing pages are available from GA's standard acquisition reports.
5. In GA, mark `affiliate_click` as a key event if useful. Check whether your audience's jurisdictions need additional consent tooling (e.g. IAB TCF / Google Consent Mode for EEA traffic) and update the privacy and cookie policies to match.

## Pinterest

See [pinterest.md](pinterest.md) — `PINTEREST_SITE_VERIFICATION` holds the `p:domain_verify` token.

## UTM conventions

| Channel | utm_source | utm_medium | utm_campaign | utm_content |
| --- | --- | --- | --- | --- |
| Pinterest pins | pinterest | social | article slug | pin-1…3 |
| Pinterest save button | pinterest | social | save-button | article slug |
| Newsletter | newsletter | email | issue name | link position |

Never add UTMs to Amazon links.

## Privacy

Never send names, emails or other personal data to analytics. Keep the privacy and cookie policies in sync with what is actually enabled — both pages adapt automatically to whether GA and a newsletter are configured.
