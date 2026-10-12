/**
 * Create an article brief from the keyword-research template.
 *   npm run content:brief -- my-article-slug "Main search query"
 */
import "./_env";
import fs from "node:fs";
import path from "node:path";
import { getAllArticles } from "../src/lib/content";

const [slug, query] = process.argv.slice(2);
if (!slug || !query) {
  console.error('Usage: npm run content:brief -- <slug> "<main search query>"');
  process.exit(1);
}
const file = path.join(process.cwd(), "content/briefs", `${slug}.md`);
if (fs.existsSync(file)) throw new Error(`${file} already exists`);
const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
const overlap = getAllArticles()
  .filter((a) => words.some((w) => `${a.title} ${a.primaryKeyword} ${a.secondaryKeywords.join(" ")}`.toLowerCase().includes(w)))
  .map((a) => `- /${a.slug} — "${a.primaryKeyword}" (${a.status})`);
const template = fs.readFileSync(path.join(process.cwd(), "content/briefs/_TEMPLATE.md"), "utf8");
fs.writeFileSync(
  file,
  template
    .replace("{{slug}}", slug)
    .replace("{{query}}", query)
    .replace("{{date}}", new Date().toISOString().slice(0, 10))
    .replace("{{overlap}}", overlap.length ? overlap.join("\n") : "- None found automatically. Search the site manually as well."),
);
console.log(`Created ${path.relative(process.cwd(), file)}`);
if (overlap.length) console.log(`Possible overlap:\n${overlap.join("\n")}`);
