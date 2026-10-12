# Deployment, domain & maintenance

The site is a standard Next.js app; any Next-compatible host works. Vercel is the simplest; Netlify, Cloudflare (with the OpenNext adapter), Render or a Node server (`npm run build && npm start`) also work.

## Environments

| Environment | `SITE_ENV` | Indexing |
| --- | --- | --- |
| Production (`thegildedskin.com`) | `production` | Indexable |
| Preview / staging | `staging` | `noindex` meta + `X-Robots-Tag`, robots.txt `Disallow: /`, empty sitemap |
| Local | `development` | Same as staging |

Only the production environment may set `SITE_ENV=production`. Protect preview deployments with the host's password protection if you set `ENABLE_STUDIO=true` there.

## Vercel example

1. Import the GitHub repository in Vercel (framework auto-detected; build `npm run build`, output default).
2. Project → Settings → Environment Variables:
   - Production: `NEXT_PUBLIC_SITE_URL=https://thegildedskin.com`, `SITE_ENV=production`, `AMAZON_ASSOCIATE_TAG=gettse00-20`, plus optional keys from `.env.example`.
   - Preview: same but `SITE_ENV=staging`.
   - Mark secrets (`RESEND_API_KEY`) as sensitive. Never prefix secrets with `NEXT_PUBLIC_`.
3. Node.js 22 in project settings.

## Domain & HTTPS

DNS changes are the owner's decision; nothing here changes live DNS.

1. Add `thegildedskin.com` and `www.thegildedskin.com` to the project.
2. At the registrar, create the records the host shows (Vercel: `A 76.76.21.21` for the apex and `CNAME cname.vercel-dns.com` for `www` — confirm current values in the dashboard).
3. Set the **apex** as primary; redirect `www` → apex (also enforced in `next.config.ts`).
4. HTTPS certificates are issued automatically; HTTP → HTTPS redirection is handled by the host. HSTS is sent by the app.
5. Verify: `curl -I http://thegildedskin.com` → 308/301 to `https://thegildedskin.com/`; `curl -I https://www.thegildedskin.com/blog` → redirect to apex.

## Redirects

- Trailing slashes → no trailing slash (308), automatic.
- Moved/renamed articles: add `{ "source": "/old", "destination": "/new", "permanent": true }` to `content/redirects.json`, keep the old slug out of `content/articles`.
- Deleted content with no replacement returns the custom 404; link to a close alternative if one exists.

## Release process

1. Work on a branch → open a PR → CI runs lint, types, unit tests, audits, build and Playwright.
2. Review the preview deployment.
3. Merge to `main` → production deploy.
4. Post-deploy: open the homepage, an article, `/sitemap.xml` and `/robots.txt`; confirm robots says `Allow: /`.

## Rollback

- **Vercel:** Deployments → previous production deployment → "Promote to Production" (instant, no rebuild).
- **Git:** `git revert <commit>` and push to `main` for a durable fix.
- **Node host:** keep the previous `.next` build or redeploy the previous tag.

## Backup & maintenance

- All content, products, images and configuration are in Git — the repository is the backup. Keep GitHub as remote and optionally mirror it.
- Environment variables live in the host dashboard; keep a copy in a password manager.
- Monthly: `npm run check`, `npm run audit:links -- --network`, the SEO health checklist in [seo.md](seo.md).
- Quarterly: re-read Amazon Associates policies and Pinterest guidelines; review articles older than 12 months; `npm outdated` and update dependencies on a branch.
