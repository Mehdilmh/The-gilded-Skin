/**
 * Product spreadsheet tools.
 *
 *   npm run products:template -- --category "beauty tools" --count 5
 *       Creates reports/products-template.xlsx with N rows for that category
 *       and an Amazon search link to help you pick products.
 *
 *   npm run products:import -- reports/products-template.xlsx
 *       Reads the filled sheet, creates draft records in content/products/,
 *       and adds them to the article named in the "article" column.
 *
 *   npm run products:export
 *       Writes reports/products.xlsx with every product record and its status.
 *
 * Imported products are drafts: they appear on the site only after a person
 * completes the description, pros/cons and sources and marks them verified.
 * Prices are never imported or displayed.
 */
import "./_env";
import fs from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";
import matter from "gray-matter";
import { getAllArticles, getAllProducts } from "../src/lib/content";
import { getAssociateTag, resolveProductLink } from "../src/lib/affiliate";
import { categorySlugs } from "../src/lib/categories";
import { normalizeCategory, rowToProduct, type ImportRow } from "../src/lib/product-import";

const ROOT = process.cwd();
const REPORTS = path.join(ROOT, "reports");
const PRODUCTS_DIR = path.join(ROOT, "content/products");
const COLUMNS = ["category", "article", "amazon_link", "product_name", "brand", "notes"] as const;

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function styleHeader(ws: ExcelJS.Worksheet) {
  const row = ws.getRow(1);
  row.font = { bold: true, color: { argb: "FFF8F4EC" } };
  row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF342C25" } };
  ws.views = [{ state: "frozen", ySplit: 1 }];
}

async function template() {
  const category = normalizeCategory(arg("category") ?? "");
  const count = Math.min(Math.max(Number(arg("count") ?? 5), 1), 50);
  const article = arg("article") ?? "";
  if (!category) {
    console.error(`Usage: npm run products:template -- --category "<${categorySlugs.join(" | ")}>" --count 5 [--article <slug>] [--search "query"]`);
    process.exit(1);
  }
  const query = arg("search") ?? category.replace(/-/g, " ");
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Products");
  ws.columns = [
    { header: "category", key: "category", width: 22 },
    { header: "article", key: "article", width: 40 },
    { header: "amazon_link", key: "amazon_link", width: 60 },
    { header: "product_name", key: "product_name", width: 40 },
    { header: "brand", key: "brand", width: 20 },
    { header: "notes", key: "notes", width: 40 },
  ];
  for (let i = 0; i < count; i++) ws.addRow({ category, article });
  styleHeader(ws);

  const help = wb.addWorksheet("How to fill");
  const search = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
  [
    ["1. Open the Amazon search (link below), click a product you'd genuinely recommend."],
    ["2. Copy the full address from the browser bar into amazon_link (any length is fine)."],
    ["3. Optional: product_name and brand exactly as the brand writes them; notes for anything to check."],
    ["4. Run: npm run products:import -- reports/products-template.xlsx"],
    ["Do not enter prices — Amazon rules allow prices only from its official API."],
    [""],
    ["Amazon search:", search],
    ["Articles:", getAllArticles().map((a) => a.slug).join(", ")],
  ].forEach((r) => help.addRow(r));
  help.getColumn(1).width = 90;
  help.getCell("B7").value = { text: search, hyperlink: search };

  fs.mkdirSync(REPORTS, { recursive: true });
  const out = path.join(REPORTS, "products-template.xlsx");
  await wb.xlsx.writeFile(out);
  console.log(`Created ${path.relative(ROOT, out)} with ${count} rows for "${category}".`);
}

function cellText(v: ExcelJS.CellValue): string {
  if (v == null) return "";
  if (typeof v === "object" && "hyperlink" in v) return String((v as { hyperlink: string }).hyperlink);
  if (typeof v === "object" && "text" in v) return String((v as { text: string }).text);
  if (typeof v === "object" && "richText" in v) return (v as { richText: { text: string }[] }).richText.map((t) => t.text).join("");
  return String(v);
}

async function importSheet() {
  const file = process.argv[3];
  if (!file || !fs.existsSync(file)) {
    console.error("Usage: npm run products:import -- <file.xlsx|file.csv>");
    process.exit(1);
  }
  const wb = new ExcelJS.Workbook();
  const ws = file.endsWith(".csv") ? await wb.csv.readFile(file) : (await wb.xlsx.readFile(file), wb.worksheets[0]!);
  const header = (ws.getRow(1).values as ExcelJS.CellValue[]).map((v) => cellText(v).trim().toLowerCase());
  const col = (name: (typeof COLUMNS)[number]) => header.indexOf(name);
  if (col("category") < 0 || col("amazon_link") < 0) {
    console.error(`The first row must contain the column names: ${COLUMNS.join(", ")}`);
    process.exit(1);
  }

  const existing = getAllProducts();
  const ids = new Set(existing.map((p) => p.id));
  const asins = new Map(existing.filter((p) => p.asin).map((p) => [p.asin!, p.id]));
  const articles = new Map(getAllArticles().map((a) => [a.slug, a.file]));
  let created = 0;
  const problems: string[] = [];

  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const get = (name: (typeof COLUMNS)[number]) => (col(name) >= 0 ? cellText(row.getCell(col(name)).value).trim() : "");
    const input: ImportRow = {
      category: get("category"),
      amazonLink: get("amazon_link"),
      productName: get("product_name"),
      brand: get("brand"),
      article: get("article"),
      notes: get("notes"),
    };
    if (!input.amazonLink) continue; // empty template row
    const result = rowToProduct(input, r, ids);
    if (!result.ok) {
      problems.push(`row ${result.row}: ${result.error}`);
      continue;
    }
    const { product, article } = result;
    if (asins.has(product.asin!)) {
      problems.push(`row ${r}: ASIN ${product.asin} already exists as "${asins.get(product.asin!)}" — skipped`);
      continue;
    }
    fs.writeFileSync(path.join(PRODUCTS_DIR, `${product.id}.json`), JSON.stringify(product, null, 2) + "\n");
    ids.add(product.id);
    asins.set(product.asin!, product.id);
    created++;

    if (article) {
      const articleFile = articles.get(article);
      if (!articleFile) {
        problems.push(`row ${r}: article "${article}" not found — product created but not attached`);
      } else {
        const raw = fs.readFileSync(articleFile, "utf8");
        const parsed = matter(raw);
        const list: string[] = Array.isArray(parsed.data.products) ? parsed.data.products : [];
        if (!list.includes(product.id)) {
          // Edit only the products line so the rest of the frontmatter keeps its formatting.
          const updated = [...list, product.id];
          const line = `products: ${JSON.stringify(updated)}`;
          const next = /^products:.*$/m.test(raw)
            ? raw.replace(/^products:.*$/m, line)
            : raw.replace(/^status:/m, `${line}\nstatus:`);
          fs.writeFileSync(articleFile, next);
        }
      }
    }
    console.log(`  + ${product.id} (${product.asin})${article ? ` → ${article}` : ""}`);
  }

  console.log(`\nCreated ${created} draft product(s).`);
  if (problems.length) console.log(`\nNeeds attention:\n  ${problems.join("\n  ")}`);
  console.log(
    "\nNext: for each new file in content/products/, add the name, description, features, pros/cons and sources from the brand's official page," +
      ' then set linkStatus "verified", lastVerified, availabilityStatus and status "published". Run npm run audit:links.',
  );
}

async function exportSheet() {
  const tag = getAssociateTag();
  const usage = new Map<string, string[]>();
  for (const a of getAllArticles()) for (const id of a.products) usage.set(id, [...(usage.get(id) ?? []), a.slug]);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Products");
  ws.columns = [
    { header: "id", key: "id", width: 36 },
    { header: "name", key: "name", width: 40 },
    { header: "brand", key: "brand", width: 18 },
    { header: "category", key: "category", width: 20 },
    { header: "asin", key: "asin", width: 13 },
    { header: "affiliate_link", key: "link", width: 55 },
    { header: "status", key: "status", width: 11 },
    { header: "link_status", key: "linkStatus", width: 12 },
    { header: "last_verified", key: "lastVerified", width: 13 },
    { header: "used_in_articles", key: "articles", width: 50 },
  ];
  for (const p of getAllProducts()) {
    const live = resolveProductLink(p, tag);
    const link = live?.href ?? (p.asin && tag ? `https://www.amazon.com/dp/${p.asin}?tag=${tag}` : p.affiliateUrl ?? p.amazonUrl ?? "");
    ws.addRow({
      id: p.id,
      name: p.name,
      brand: p.brand ?? "",
      category: p.category,
      asin: p.asin ?? "",
      link: link ? { text: link, hyperlink: link } : "",
      status: p.status,
      linkStatus: p.linkStatus,
      lastVerified: p.lastVerified ?? "",
      articles: (usage.get(p.id) ?? []).join(", "),
    });
  }
  styleHeader(ws);
  ws.autoFilter = { from: "A1", to: "J1" };
  fs.mkdirSync(REPORTS, { recursive: true });
  const out = path.join(REPORTS, "products.xlsx");
  await wb.xlsx.writeFile(out);
  console.log(`Wrote ${getAllProducts().length} products to ${path.relative(ROOT, out)}`);
}

const command = process.argv[2];
const run = { template, import: importSheet, export: exportSheet }[command ?? ""];
if (!run) {
  console.error("Commands: template | import <file> | export");
  process.exit(1);
}
run().catch((e) => {
  console.error(e);
  process.exit(1);
});
