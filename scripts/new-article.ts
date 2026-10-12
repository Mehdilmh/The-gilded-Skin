/**
 * Scaffold a new draft article.
 *   npm run content:new -- my-article-slug "Article title" beauty-tools how-to
 */
import fs from "node:fs";
import path from "node:path";
import { categorySlugs } from "../src/lib/categories";
import { articleTypes } from "../src/lib/schemas";
import { RESERVED_SLUGS } from "../src/lib/content";

const [slug, title, category = "skincare", type = "how-to"] = process.argv.slice(2);
if (!slug || !title || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error('Usage: npm run content:new -- <slug> "<Title>" [category] [type]');
  process.exit(1);
}
if (RESERVED_SLUGS.has(slug)) throw new Error(`"${slug}" is a reserved route`);
if (!(categorySlugs as readonly string[]).includes(category)) throw new Error(`Category must be one of ${categorySlugs.join(", ")}`);
if (!(articleTypes as readonly string[]).includes(type)) throw new Error(`Type must be one of ${articleTypes.join(", ")}`);

const file = path.join(process.cwd(), "content/articles", `${slug}.mdx`);
if (fs.existsSync(file)) throw new Error(`${file} already exists`);
const today = new Date().toISOString().slice(0, 10);

fs.writeFileSync(
  file,
  `---
title: "${title.replace(/"/g, '\\"')}"
slug: ${slug}
excerpt: "One or two sentences that tell the reader exactly what this guide answers and who it's for."
seoTitle: "${title.slice(0, 60).replace(/"/g, '\\"')}"
metaDescription: "Draft — write a unique 110–160 character description that matches the article's main question and answer."
primaryKeyword: research required
secondaryKeywords: []
searchIntent: informational
articleType: ${type}
category: ${category}
tags: []
author: editorial-team
publishedAt: ${today}
updatedAt: ${today}
featuredImage: /images/editorial/hero-vanity.webp
products: []
relatedArticles: []
status: draft
indexing: noindex
basis: independent-research
researchNotes: "Link the brief in content/briefs/${slug}.md. Record where every fact came from."
sources: []
editorialReview:
  aiAssisted: false
  factCheckedAt: null
  humanApprovedBy: null
  approvedAt: null
---

TODO: Answer the main question directly in the first paragraph.

## What matters when choosing

TODO

## Options compared

TODO

## Who each option may suit

TODO

## The bottom line

TODO
`,
);
console.log(`Created ${path.relative(process.cwd(), file)}`);
