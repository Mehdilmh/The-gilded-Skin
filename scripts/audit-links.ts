/**
 * Affiliate and source link audit.
 *   npm run audit:links               static checks (tag, marketplace, ASIN, status, staleness)
 *   npm run audit:links -- --network  also request each URL and report HTTP failures
 *
 * Network checks only make lightweight HEAD/GET requests to product pages and
 * sources; they never scrape content. Amazon may answer automated requests
 * with 503 or a robot check — treat those as "verify manually", not broken.
 */
import "./_env";
import { auditProducts, summarize } from "../src/lib/audit";
import { getAllArticles, getAllProducts } from "../src/lib/content";
import { resolveProductLink, isAmazonUrl } from "../src/lib/affiliate";
import { printIssues } from "./_print";

async function check(url: string): Promise<{ status: number | "error"; note?: string }> {
  try {
    let res = await fetch(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(15_000) });
    if (res.status === 405 || res.status === 403) res = await fetch(url, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(15_000) });
    return { status: res.status };
  } catch (e) {
    return { status: "error", note: (e as Error).message };
  }
}

async function main() {
  const issues = auditProducts();
  printIssues(issues, process.argv.includes("--info"));
  const s = summarize(issues);
  console.log(`\nProducts: ${getAllProducts().length} records — ${s.errors} error(s), ${s.warnings} warning(s)`);

  if (process.argv.includes("--network")) {
    const urls = new Map<string, string>();
    for (const p of getAllProducts()) {
      const link = resolveProductLink(p);
      if (link) urls.set(link.href, `product:${p.id}`);
    }
    for (const a of getAllArticles()) for (const src of a.sources) urls.set(src.url, `source:${a.slug}`);
    console.log(`\nChecking ${urls.size} URLs…`);
    let failures = 0;
    for (const [url, owner] of urls) {
      const r = await check(url);
      const ok = typeof r.status === "number" && r.status < 400;
      const manual = isAmazonUrl(url) && (r.status === 503 || r.status === "error");
      if (!ok) {
        if (!manual) failures++;
        console.log(`  ${manual ? "verify " : "FAIL   "} ${String(r.status).padEnd(5)} ${owner.padEnd(48)} ${url}${r.note ? ` (${r.note})` : ""}`);
      }
    }
    console.log(failures ? `\n${failures} URL(s) failed` : "\nAll reachable URLs responded successfully");
    if (failures) process.exitCode = 1;
  }
  if (s.errors) process.exitCode = 1;
}

main();
