/**
 * Technical SEO + link audit for a running site.
 *
 *   npm run audit:site                         # http://localhost:3000 (npm run build && npm start first)
 *   npm run audit:site -- https://thegildedskin.com
 *
 * Crawls robots.txt, sitemap.xml and every page in the sitemap, then checks:
 * HTTP status, canonical, title/description (presence, length, duplicates),
 * robots meta, one <h1>, duplicate element ids, JSON-LD validity, og:image,
 * Amazon links (tracking ID, marketplace, link type), internal links and images.
 */
export {};

const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const CANONICAL_ORIGIN = "https://thegildedskin.com";
const TAG = "gettse00-20";

type Level = "error" | "warning";
const issues: { level: Level; url: string; message: string }[] = [];
const add = (level: Level, url: string, message: string) => issues.push({ level, url, message });

const statusCache = new Map<string, number>();
async function status(url: string): Promise<number> {
  if (statusCache.has(url)) return statusCache.get(url)!;
  let code = 0;
  try {
    const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(20_000) });
    code = res.status;
  } catch {
    code = -1;
  }
  statusCache.set(url, code);
  return code;
}

const attr = (tag: string, name: string) => new RegExp(`${name}="([^"]*)"`).exec(tag)?.[1];
const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const toLocal = (u: string) => (u.startsWith(CANONICAL_ORIGIN) ? BASE + u.slice(CANONICAL_ORIGIN.length) : u);

async function main() {
  console.log(`Auditing ${BASE}\n`);
  const robots = await (await fetch(`${BASE}/robots.txt`)).text();
  if (!/Allow: \//.test(robots)) add("error", "/robots.txt", "Does not allow crawling (is SITE_ENV=production set at build time?)");
  if (!robots.includes(`Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml`)) add("error", "/robots.txt", "Missing sitemap reference");

  const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
  if (locs.length === 0) add("error", "/sitemap.xml", "Sitemap is empty");
  const pageUrls = locs.filter((l) => !/\.(webp|png|jpe?g)$/i.test(l));

  const titles = new Map<string, string>();
  const descs = new Map<string, string>();
  const internal = new Set<string>();
  const images = new Set<string>();
  let amazonLinks = 0;

  for (const loc of pageUrls) {
    const url = toLocal(loc);
    const path = loc.slice(CANONICAL_ORIGIN.length) || "/";
    const res = await fetch(url, { redirect: "manual" });
    if (res.status !== 200) {
      add("error", path, `HTTP ${res.status} for a sitemap URL`);
      continue;
    }
    const html = await res.text();
    const head = html.slice(0, html.indexOf("</head>"));

    const canonical = /<link rel="canonical" href="([^"]+)"/.exec(head)?.[1];
    if (!canonical) add("error", path, "Missing canonical");
    else if (canonical !== loc) add("error", path, `Canonical ${canonical} differs from sitemap URL`);

    const title = decode(/<title>([^<]*)<\/title>/.exec(head)?.[1] ?? "");
    if (!title) add("error", path, "Missing <title>");
    else {
      if (title.length > 70) add("warning", path, `Title is ${title.length} characters`);
      if (titles.has(title)) add("error", path, `Duplicate title (also ${titles.get(title)})`);
      titles.set(title, path);
    }
    const desc = decode(/<meta name="description" content="([^"]*)"/.exec(head)?.[1] ?? "");
    if (!desc) add("error", path, "Missing meta description");
    else {
      if (desc.length < 70 || desc.length > 170) add("warning", path, `Meta description is ${desc.length} characters`);
      if (descs.has(desc)) add("error", path, `Duplicate meta description (also ${descs.get(desc)})`);
      descs.set(desc, path);
    }
    const robotsMeta = /<meta name="robots" content="([^"]*)"/.exec(head)?.[1] ?? "";
    if (/noindex/.test(robotsMeta)) add("error", path, "Sitemap URL is noindex");

    const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
    if (h1s !== 1) add("error", path, `${h1s} <h1> elements`);

    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]!);
    const dupIds = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
    if (dupIds.length) add("error", path, `Duplicate element ids: ${dupIds.join(", ")}`);

    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      try {
        const data = JSON.parse(m[1]!);
        if (data["@context"] !== "https://schema.org") add("error", path, "JSON-LD without schema.org context");
        if (/AggregateRating|"Offer"|ratingValue/.test(m[1]!)) add("error", path, "JSON-LD contains ratings or offers");
      } catch {
        add("error", path, "Invalid JSON-LD");
      }
    }

    const og = /<meta property="og:image" content="([^"]+)"/.exec(head)?.[1];
    if (!og) add("error", path, "Missing og:image");
    else {
      const code = await status(toLocal(decode(og)));
      if (code !== 200) add("error", path, `og:image returns ${code}`);
    }
    if (!/<html lang="en-US"/.test(html)) add("error", path, "Missing lang attribute");
    if (!/name="viewport"/.test(head)) add("error", path, "Missing viewport meta");

    for (const m of html.matchAll(/<a\s[^>]*href="([^"]+)"[^>]*>/g)) {
      const href = decode(m[1]!);
      if (href.startsWith("/") && !href.startsWith("//")) internal.add(href.split("#")[0]!);
      if (/amazon\.|amzn\.to|a\.co\//.test(href)) {
        amazonLinks++;
        const tag = m[0];
        let u: URL;
        try {
          u = new URL(href);
        } catch {
          add("error", path, `Invalid Amazon URL ${href}`);
          continue;
        }
        if (u.hostname !== "www.amazon.com") add("error", path, `Amazon link on ${u.hostname} (expected www.amazon.com): ${href}`);
        if (u.searchParams.get("tag") !== TAG) add("error", path, `Amazon link without tag=${TAG}: ${href}`);
        if (!/\/dp\/[A-Z0-9]{10}/.test(u.pathname) && u.pathname !== "/s") add("warning", path, `Amazon link is neither a product page nor a search: ${href}`);
        if (!/sponsored/.test(attr(tag, "rel") ?? "")) add("error", path, `Amazon link missing rel="sponsored": ${href}`);
      }
    }
    for (const m of html.matchAll(/<img\s[^>]*>/g)) {
      const tag = m[0];
      if (!/\salt="/.test(tag)) add("error", path, `Image without alt: ${tag.slice(0, 80)}`);
      const src = attr(tag, "src");
      if (src?.startsWith("/")) images.add(decode(src));
    }
  }

  for (const href of internal) {
    if (href === "" || href.startsWith("/search")) continue;
    const code = await status(BASE + href);
    if (code >= 400 || code < 0) add("error", href, `Broken internal link (HTTP ${code})`);
    else if (code === 308 || code === 301) add("warning", href, `Internal link redirects (HTTP ${code})`);
  }
  for (const src of images) {
    const code = await status(BASE + src);
    if (code !== 200) add("error", src, `Image returns HTTP ${code}`);
  }
  for (const [path, expected] of [["/this-page-should-not-exist", 404], ["/studio", 404], ["/blog/", 308]] as const) {
    const code = await status(BASE + path);
    if (code !== expected) add("error", path, `Expected HTTP ${expected}, got ${code}`);
  }

  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  for (const i of [...errors, ...warnings]) console.log(`${i.level === "error" ? "ERROR  " : "warning"} ${i.url}  ${i.message}`);
  console.log(
    `\nPages: ${pageUrls.length} · internal links: ${internal.size} · images: ${images.size} · Amazon links: ${amazonLinks}` +
      `\n${errors.length} error(s), ${warnings.length} warning(s)`,
  );
  process.exitCode = errors.length ? 1 : 0;
}

main();
