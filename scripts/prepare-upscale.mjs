#!/usr/bin/env node
// Prepares the full-bleed frames for 4K upscaling.
//
//   node scripts/prepare-upscale.mjs      → _src/upscale-in/<legacyId>.jpg  (+ a JSON list with dimensions)
//
// The upscaler is fed the untouched 2015 originals, with one exception: frames that carry catalogued
// sensor dust are healed first (same clone-from-adjacent-sky step as the image pipeline), because an
// upscaler would otherwise sharpen the dust. No grading is applied here — the gentle colour grade stays
// in scripts/process-images.mjs so it can be tuned without spending credits again.
//
// After upscaling, save each result as _src/upscaled/<legacyId>.(png|jpg) and run `npm.cmd run images`.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "src/content/assets/manifest.json"), "utf8"));
const outDir = path.join(root, "_src/upscale-in");
fs.mkdirSync(outDir, { recursive: true });

async function healed(file, spots) {
  const overlays = [];
  for (const s of spots) {
    const size = s.r * 2 + 10;
    const top = Math.max(0, Math.round(s.y - size / 2));
    const left = Math.max(0, Math.round(s.x - size / 2));
    const from = Math.max(0, left - size - 6);
    const mask = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><defs><radialGradient id="g"><stop offset="50%" stop-color="#fff"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`,
    );
    const patch = await sharp(file).extract({ left: from, top, width: size, height: size }).blur(0.8).ensureAlpha().composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
    overlays.push({ input: patch, left, top });
  }
  return sharp(file).composite(overlays).jpeg({ quality: 97, chromaSubsampling: "4:4:4" }).toBuffer();
}

const list = [];
for (const asset of manifest.filter((a) => a.uses.includes("band") || a.uses.includes("hero"))) {
  const src = path.join(root, "_src/legacy", asset.source);
  const out = path.join(outDir, `${asset.legacyId}.jpg`);
  if (asset.heal?.length) fs.writeFileSync(out, await healed(src, asset.heal));
  else fs.copyFileSync(src, out);
  list.push({ legacyId: asset.legacyId, id: asset.id, file: `${asset.legacyId}.jpg`, width: asset.width, height: asset.height, bytes: fs.statSync(out).size, healed: Boolean(asset.heal?.length) });
}
fs.writeFileSync(path.join(outDir, "list.json"), JSON.stringify(list, null, 2) + "\n");
console.log(`${list.length} frames ready in _src/upscale-in`);
for (const f of list) console.log(`${f.legacyId}  ${f.width}x${f.height}  ${Math.round(f.bytes / 1024)} KB${f.healed ? "  (dust healed)" : ""}`);
