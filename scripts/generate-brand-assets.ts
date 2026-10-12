/**
 * Generates raster brand assets and the original illustration library.
 *
 *   npm run brand:assets
 *
 * - Brand PNGs (logo-512, social avatar, apple icon, favicon.ico, default OG)
 * - Editorial illustrations as optimized WebP under public/images/editorial
 * - Upserts their rights records into content/images.json
 *
 * The vector logos themselves come from scripts/brand/build_logo.py.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import * as K from "./brand/illustrations";

const ROOT = process.cwd();
const PUB = path.join(ROOT, "public");
const EDITORIAL = path.join(PUB, "images/editorial");
const TODAY = new Date().toISOString().slice(0, 10);

interface Scene {
  file: string;
  w: number;
  h: number;
  alt: string;
  draw: (id: string, w: number, h: number) => string;
}

const S = (id: string) => ({
  plinth: K.plinth(id), dropper: K.dropper(id), pump: K.pump(id), jar: K.jar(id), tube: K.tube(id),
  roller: K.roller(id), guaSha: K.guaSha(id), brush: K.brush(id), mask: K.mask(id), tray: K.tray(id),
  towel: K.towel(id), sprig: K.sprig(id), vase: K.vase(id), sphere: K.sphere(id), giftBox: K.giftBox(id),
  pouch: K.pouch(id), fridge: K.fridge(id), mirror: K.mirror(id),
});

const scenes: Scene[] = [
  {
    file: "hero-vanity.webp", w: 1280, h: 1600,
    alt: "Illustrated vanity still life with a gold mirror, glass serum bottles on a stone plinth and a eucalyptus sprig in soft window light",
    draw: (id, w, h) => {
      const o = S(id); const g = h * 0.6; const top = g + 80 - 120 * 2.6;
      return K.backdrop(id, w, h, { horizon: 0.6 }) +
        K.shadow(id, w * 0.5, g + 80, 420) + o.plinth({ x: w * 0.5, y: g + 80, s: 2.6 }) +
        K.shadow(id, w * 0.27, top, 80) + o.mirror({ x: w * 0.27, y: top, s: 1.55 }) +
        K.shadow(id, w * 0.56, top, 60) + o.pump({ x: w * 0.56, y: top, s: 1.35 }) +
        K.shadow(id, w * 0.73, top, 60) + o.dropper({ x: w * 0.73, y: top, s: 1.45, tint: K.C.amber }) +
        o.jar({ x: w * 0.42, y: top + 6, s: 1.0 }) +
        o.sprig({ x: w * 0.87, y: top, s: 1.25 }) +
        K.shadow(id, w * 0.14, g + 400, 100) + o.sphere({ x: w * 0.14, y: g + 390, s: 1.4 }) +
        K.grain(id, w, h);
    },
  },
  {
    file: "tools-still-life.webp", w: 1200, h: 1500,
    alt: "Illustrated still life of a facial roller and gua sha stone on a cream linen surface",
    draw: (id, w, h) => {
      const o = S(id); const g = h * 0.62;
      return K.backdrop(id, w, h, { horizon: 0.62 }) +
        K.shadow(id, w * 0.5, g + 200, 340) + o.towel({ x: w * 0.5, y: g + 200, s: 1.9 }) +
        o.roller({ x: w * 0.52, y: g + 10, s: 1.7 }) + o.guaSha({ x: w * 0.5, y: g + 250, s: 1.4, tint: K.C.rose }) +
        o.sprig({ x: w * 0.85, y: g, s: 0.9, flip: true }) + K.grain(id, w, h);
    },
  },
  {
    file: "skincare-ritual.webp", w: 1200, h: 1500,
    alt: "Illustrated arrangement of skincare bottles and a folded towel in warm morning light",
    draw: (id, w, h) => {
      const o = S(id); const g = h * 0.7;
      return K.backdrop(id, w, h, { horizon: 0.7 }) +
        K.shadow(id, w * 0.62, g + 60, 260) + o.towel({ x: w * 0.62, y: g + 60, s: 1.5 }) +
        K.shadow(id, w * 0.34, g + 40, 60) + o.pump({ x: w * 0.34, y: g + 40, s: 1.25 }) +
        o.dropper({ x: w * 0.58, y: g - 90, s: 1.2, tint: K.C.amber }) +
        o.tube({ x: w * 0.76, y: g - 90, s: 1.0, tint: K.C.blush }) +
        o.sprig({ x: w * 0.14, y: g + 40, s: 0.9 }) + K.grain(id, w, h);
    },
  },
  {
    file: "vanity-tray.webp", w: 1200, h: 1500,
    alt: "Illustrated tiered vanity tray holding glass bottles and a small vase",
    draw: (id, w, h) => {
      const o = S(id); const g = h * 0.66;
      return K.backdrop(id, w, h, { horizon: 0.66 }) +
        K.shadow(id, w * 0.5, g + 90, 320) + o.tray({ x: w * 0.5, y: g + 90, s: 1.3 }) +
        o.pump({ x: w * 0.32, y: g + 60, s: 0.95 }) + o.dropper({ x: w * 0.48, y: g + 66, s: 1.0, tint: K.C.amber }) +
        o.jar({ x: w * 0.64, y: g + 70, s: 0.75 }) + o.vase({ x: w * 0.78, y: g + 62, s: 0.9 }) +
        o.sprig({ x: w * 0.78, y: g - 110, s: 0.7 }) + K.grain(id, w, h);
    },
  },
  {
    file: "gift-ribbon.webp", w: 1200, h: 1500,
    alt: "Illustrated gift box tied with a champagne ribbon beside a small skincare jar",
    draw: (id, w, h) => {
      const o = S(id); const g = h * 0.68;
      return K.backdrop(id, w, h, { horizon: 0.68 }) +
        K.shadow(id, w * 0.45, g + 80, 260) + o.giftBox({ x: w * 0.45, y: g + 80, s: 1.35 }) +
        K.shadow(id, w * 0.78, g + 90, 80) + o.jar({ x: w * 0.78, y: g + 90, s: 0.9 }) +
        o.sphere({ x: w * 0.2, y: g + 120, s: 0.8, tint: K.C.blush }) + K.grain(id, w, h);
    },
  },
  {
    file: "vanity-organization-guide.webp", w: 1500, h: 1000,
    alt: "Illustrated vanity with a round gold mirror, a tray of skincare bottles and a eucalyptus sprig",
    draw: (id, w, h) => {
      const o = S(id); const g = h * 0.7;
      return K.backdrop(id, w, h, { horizon: 0.7 }) +
        o.mirror({ x: w * 0.24, y: g + 10, s: 1.05 }) +
        K.shadow(id, w * 0.6, g + 80, 300) + o.tray({ x: w * 0.6, y: g + 80, s: 1.15 }) +
        o.pump({ x: w * 0.46, y: g + 52, s: 0.8 }) + o.dropper({ x: w * 0.58, y: g + 58, s: 0.85, tint: K.C.amber }) +
        o.jar({ x: w * 0.71, y: g + 62, s: 0.62 }) + o.sprig({ x: w * 0.86, y: g + 40, s: 0.7 }) + K.grain(id, w, h);
    },
  },
  {
    file: "morning-routine.webp", w: 1500, h: 1000,
    alt: "Illustrated morning skincare lineup of a cleanser, serum, moisturizer jar and sunscreen tube on a plinth",
    draw: (id, w, h) => {
      const o = S(id); const g = h * 0.7;
      return K.backdrop(id, w, h, { horizon: 0.7 }) +
        K.shadow(id, w * 0.5, g + 70, 340) + o.plinth({ x: w * 0.5, y: g + 70, s: 2.1 }) +
        o.pump({ x: w * 0.33, y: g - 180, s: 0.85 }) + o.dropper({ x: w * 0.45, y: g - 180, s: 0.9, tint: K.C.amber }) +
        o.jar({ x: w * 0.57, y: g - 176, s: 0.7 }) + o.tube({ x: w * 0.68, y: g - 180, s: 0.85, tint: K.C.blush }) +
        o.sprig({ x: w * 0.86, y: g + 50, s: 0.75 }) + K.grain(id, w, h);
    },
  },
  {
    file: "led-mask-guide.webp", w: 1500, h: 1000,
    alt: "Illustration of a generic white LED face mask with soft red light points resting on a stone plinth",
    draw: (id, w, h) => {
      const o = S(id); const g = h * 0.74;
      return K.backdrop(id, w, h, { horizon: 0.74 }) +
        K.shadow(id, w * 0.5, g + 60, 300) + o.plinth({ x: w * 0.5, y: g + 60, s: 1.8 }) +
        o.mask({ x: w * 0.5, y: g - 160, s: 1.25 }) + o.sprig({ x: w * 0.16, y: g + 60, s: 0.8 }) +
        o.sphere({ x: w * 0.82, y: g + 60, s: 0.9 }) + K.grain(id, w, h);
    },
  },
  {
    file: "roller-gua-sha.webp", w: 1500, h: 1000,
    alt: "Illustrated facial roller and gua sha stone side by side on a folded towel",
    draw: (id, w, h) => {
      const o = S(id); const g = h * 0.62;
      return K.backdrop(id, w, h, { horizon: 0.62 }) +
        K.shadow(id, w * 0.5, g + 250, 420) + o.towel({ x: w * 0.5, y: g + 250, s: 2.3 }) +
        o.roller({ x: w * 0.36, y: g + 120, s: 1.5 }) + o.guaSha({ x: w * 0.68, y: g + 130, s: 1.25 }) +
        o.sprig({ x: w * 0.9, y: g + 30, s: 0.7, flip: true }) + K.grain(id, w, h);
    },
  },
  {
    file: "skincare-fridge.webp", w: 1500, h: 1000,
    alt: "Illustration of a small cream-colored skincare fridge holding generic bottles and jars",
    draw: (id, w, h) => {
      const o = S(id); const g = h * 0.78;
      return K.backdrop(id, w, h, { horizon: 0.78 }) +
        K.shadow(id, w * 0.46, g + 20, 200) + o.fridge({ x: w * 0.46, y: g + 20, s: 1.55 }) +
        K.shadow(id, w * 0.74, g + 20, 60) + o.pump({ x: w * 0.74, y: g + 20, s: 0.9 }) +
        o.sprig({ x: w * 0.88, y: g + 20, s: 0.75 }) + K.grain(id, w, h);
    },
  },
  {
    file: "travel-case.webp", w: 1500, h: 1000,
    alt: "Illustrated sand-colored travel pouch with a gold zipper beside small travel bottles",
    draw: (id, w, h) => {
      const o = S(id); const g = h * 0.72;
      return K.backdrop(id, w, h, { horizon: 0.72 }) +
        K.shadow(id, w * 0.42, g + 60, 300) + o.pouch({ x: w * 0.42, y: g + 60, s: 1.45 }) +
        K.shadow(id, w * 0.72, g + 60, 40) + o.pump({ x: w * 0.72, y: g + 60, s: 0.6 }) +
        o.dropper({ x: w * 0.8, y: g + 64, s: 0.65, tint: K.C.amber }) + o.tube({ x: w * 0.88, y: g + 64, s: 0.6 }) +
        K.grain(id, w, h);
    },
  },
  {
    file: "cleansing-brush.webp", w: 1500, h: 1000,
    alt: "Illustration of a generic soft silicone facial cleansing brush standing beside a cleanser jar",
    draw: (id, w, h) => {
      const o = S(id); const g = h * 0.76;
      return K.backdrop(id, w, h, { horizon: 0.76 }) +
        K.shadow(id, w * 0.44, g + 30, 90) + o.brush({ x: w * 0.44, y: g + 30, s: 1.45 }) +
        K.shadow(id, w * 0.64, g + 40, 100) + o.jar({ x: w * 0.64, y: g + 40, s: 1.0 }) +
        o.sprig({ x: w * 0.2, y: g + 40, s: 0.85 }) + K.grain(id, w, h);
    },
  },
  {
    file: "device-checklist.webp", w: 1500, h: 1000,
    alt: "Illustrated flat lay of generic at-home beauty devices: a cleansing brush, a facial roller and a gua sha stone",
    draw: (id, w, h) => {
      const o = S(id); const g = h * 0.7;
      return K.backdrop(id, w, h, { horizon: 0.7 }) +
        K.shadow(id, w * 0.28, g + 40, 80) + o.brush({ x: w * 0.28, y: g + 40, s: 1.2 }) +
        o.roller({ x: w * 0.56, y: g + 70, s: 1.15 }) + o.guaSha({ x: w * 0.78, y: g + 150, s: 0.95, tint: K.C.rose }) +
        o.sprig({ x: w * 0.92, y: g + 20, s: 0.6 }) + K.grain(id, w, h);
    },
  },
  {
    file: "gift-guide.webp", w: 1500, h: 1000,
    alt: "Illustrated beauty gift arrangement with a ribboned box, a skincare jar and a small vase",
    draw: (id, w, h) => {
      const o = S(id); const g = h * 0.72;
      return K.backdrop(id, w, h, { horizon: 0.72 }) +
        K.shadow(id, w * 0.42, g + 60, 250) + o.giftBox({ x: w * 0.42, y: g + 60, s: 1.15 }) +
        K.shadow(id, w * 0.68, g + 60, 80) + o.jar({ x: w * 0.68, y: g + 60, s: 0.8 }) +
        o.vase({ x: w * 0.82, y: g + 60, s: 0.8 }) + o.sprig({ x: w * 0.82, y: g - 100, s: 0.55 }) + K.grain(id, w, h);
    },
  },
];

function wrap(id: string, w: number, h: number, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${K.defs(id)}${body}</svg>`;
}

/** Minimal ICO container holding PNG payloads (supported by all modern browsers). */
function pngsToIco(pngs: { size: number; data: Buffer }[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const dir = Buffer.alloc(16 * pngs.length);
  let offset = 6 + dir.length;
  pngs.forEach((p, i) => {
    const b = i * 16;
    dir.writeUInt8(p.size >= 256 ? 0 : p.size, b);
    dir.writeUInt8(p.size >= 256 ? 0 : p.size, b + 1);
    dir.writeUInt8(0, b + 2);
    dir.writeUInt8(0, b + 3);
    dir.writeUInt16LE(1, b + 4);
    dir.writeUInt16LE(32, b + 6);
    dir.writeUInt32LE(p.data.length, b + 8);
    dir.writeUInt32LE(offset, b + 12);
    offset += p.data.length;
  });
  return Buffer.concat([header, dir, ...pngs.map((p) => p.data)]);
}

async function brand() {
  const b = path.join(PUB, "brand");
  await sharp(path.join(b, "logo-mark.svg"), { density: 600 })
    .resize(400, 400, { fit: "contain", background: "#F8F4EC" })
    .extend({ top: 56, bottom: 56, left: 56, right: 56, background: "#F8F4EC" })
    .flatten({ background: "#F8F4EC" })
    .png()
    .toFile(path.join(b, "logo-512.png"));
  await sharp(path.join(b, "social-avatar.svg"), { density: 150 }).resize(1000, 1000).png().toFile(path.join(b, "social-avatar.png"));
  const icon = path.join(ROOT, "src/app/icon.svg");
  await sharp(icon, { density: 600 }).resize(180, 180).png().toFile(path.join(ROOT, "src/app/apple-icon.png"));
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(sizes.map(async (size) => ({ size, data: await sharp(icon, { density: 600 }).resize(size, size).png().toBuffer() })));
  fs.writeFileSync(path.join(ROOT, "src/app/favicon.ico"), pngsToIco(pngs));

  // Default Open Graph image: hero illustration + lockup.
  const hero = await sharp(path.join(EDITORIAL, "hero-vanity.webp")).resize(560, 630, { fit: "cover" }).toBuffer();
  const lockup = await sharp(path.join(b, "logo-stacked.svg"), { density: 220 }).resize({ width: 520 }).png().toBuffer();
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#F8F4EC" } })
    .composite([
      { input: hero, left: 640, top: 0 },
      { input: lockup, left: 60, top: 160 },
    ])
    .png()
    .toFile(path.join(PUB, "og-default.png"));
}

async function main() {
  fs.mkdirSync(EDITORIAL, { recursive: true });
  const registryPath = path.join(ROOT, "content/images.json");
  const registry: Record<string, unknown>[] = fs.existsSync(registryPath) ? JSON.parse(fs.readFileSync(registryPath, "utf8")) : [];

  for (const [i, scene] of scenes.entries()) {
    const id = `s${i}`;
    const svg = wrap(id, scene.w, scene.h, scene.draw(id, scene.w, scene.h));
    const out = path.join(EDITORIAL, scene.file);
    await sharp(Buffer.from(svg)).webp({ quality: 84 }).toFile(out);
    const src = `/images/editorial/${scene.file}`;
    const record = {
      src,
      alt: scene.alt,
      width: scene.w,
      height: scene.h,
      kind: "illustration",
      source: "original",
      license: "Original work created for The Gilded Skin",
      attributionRequired: false,
      depictsSpecificProduct: false,
      rightsVerifiedAt: TODAY,
      notes: "Generated by scripts/generate-brand-assets.ts. Depicts generic product types only.",
    };
    const existing = registry.findIndex((r) => r.src === src);
    if (existing >= 0) registry[existing] = { ...registry[existing], ...record, rightsVerifiedAt: registry[existing]!.rightsVerifiedAt ?? TODAY };
    else registry.push(record);
    console.log(`illustration ${scene.file}`);
  }
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n");
  await brand();
  console.log("brand assets written");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
