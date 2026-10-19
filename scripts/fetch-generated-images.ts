/**
 * Download full-resolution generated images listed in scripts/generated-images.json,
 * convert them to WebP (2000px wide) in public/images/photos, and update their
 * records in content/images.json.
 *
 *   npm run images:fetch
 *
 * Run it on a machine that can reach fal.media, then commit the changed files.
 * Images that are already full size are skipped.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

interface Entry {
  file: string;
  url: string;
  alt: string;
  requestId: string;
}

const ROOT = process.cwd();
const manifest: Entry[] = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/generated-images.json"), "utf8"));
const registryPath = path.join(ROOT, "content/images.json");
const TARGET_WIDTH = 2000;

async function main() {
  const registry: Record<string, unknown>[] = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  let updated = 0;
  for (const entry of manifest) {
    const out = path.join(ROOT, "public/images/photos", `${entry.file}.webp`);
    if (fs.existsSync(out)) {
      const meta = await sharp(out).metadata();
      if ((meta.width ?? 0) >= TARGET_WIDTH) {
        console.log(`skip  ${entry.file} (already ${meta.width}px)`);
        continue;
      }
    }
    const res = await fetch(entry.url);
    if (!res.ok) {
      console.error(`fail  ${entry.file}: HTTP ${res.status}`);
      process.exitCode = 1;
      continue;
    }
    const input = Buffer.from(await res.arrayBuffer());
    const { width, height } = await sharp(input)
      .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(out);
    const src = `/images/photos/${entry.file}.webp`;
    const record = registry.find((r) => r.src === src);
    if (record) {
      Object.assign(record, { width, height });
      if (typeof record.notes === "string") record.notes = record.notes.replace(/ Interim 768px preview.*$/, "");
    }
    else console.warn(`warn  ${entry.file}: no record in content/images.json`);
    console.log(`saved ${entry.file} (${width}×${height})`);
    updated++;
  }
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n");
  console.log(`\n${updated} image(s) updated.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
