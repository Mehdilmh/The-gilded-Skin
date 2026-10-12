/**
 * Export Pinterest pin concepts for every published article as CSV, ready for
 * Pinterest's bulk-create flow or a scheduling tool.
 *   npm run pinterest:export            -> reports/pins.csv
 *
 * Image URLs point to the generated 1000×1500 pin graphics on the production
 * domain; destination links carry UTM parameters (never on Amazon links).
 */
import "./_env";
import fs from "node:fs";
import path from "node:path";
import { articleHasAffiliateLinks, getPublishedArticles } from "../src/lib/content";
import { absoluteUrl } from "../src/lib/site";
import { withUtm } from "../src/lib/affiliate";

const csv = (v: string) => `"${v.replace(/"/g, '""')}"`;
const rows = [["Title", "Media URL", "Pinterest board", "Description", "Link", "Keywords", "Template", "Image concept"].join(",")];

for (const a of getPublishedArticles()) {
  const affiliate = articleHasAffiliateLinks(a);
  a.pinterest.pins.forEach((pin, i) => {
    const link = withUtm(absoluteUrl(`/${a.slug}`), { source: "pinterest", medium: "social", campaign: a.slug, content: `pin-${i + 1}` });
    const description = affiliate ? `${pin.description} This guide contains affiliate links.` : pin.description;
    rows.push(
      [pin.title, absoluteUrl(`/pins/${a.slug}/${i + 1}`), pin.board, description, link, pin.topics.join(", "), pin.template, pin.imageConcept]
        .map(csv)
        .join(","),
    );
  });
}
const out = path.join(process.cwd(), "reports/pins.csv");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, rows.join("\n") + "\n");
console.log(`Wrote ${rows.length - 1} pins to ${path.relative(process.cwd(), out)}`);
