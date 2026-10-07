#!/usr/bin/env node
// Builds the public image derivatives from the raw legacy harvest.
//
//   npm.cmd run images            → every usable asset in src/content/assets/manifest.json
//   npm.cmd run images -- --only clay-villas-rooftop-pergolas-morning
//   npm.cmd run images -- --check → verify budgets only, write nothing
//
// Input : _src/legacy/<source>                       (raw, untouched, never served)
// Output: public/media/<id>-<width>.webp + .jpg      (descriptive names, ≤ 200 KB each, WebP + JPEG only)
//         public/og/<id>.jpg                         (1200×630 social card for assets flagged "hero")
//         src/content/assets/derivatives.generated.json
//
// Truthfulness rules (BUILD-CONTRACT §4): never upscale a derivative past its source, never relight or
// recolour. The only edits are (1) one global, modest desaturation for sources flagged grade:"calm" — the 2015
// originals are heavily HDR-saturated and the grade moves them back toward natural colour — and (2) cloning out
// catalogued sensor-dust spots from open sky.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "src/content/assets/manifest.json");
const outJson = path.join(root, "src/content/assets/derivatives.generated.json");
const srcDir = path.join(root, "_src/legacy");
const outDir = path.join(root, "public/media");
const ogDir = path.join(root, "public/og");

const BUDGET = 200 * 1024;
const LANDSCAPE_WIDTHS = [480, 760, 1000];
// Full-bleed frames (uses: hero | band) also get these. From a 1000 px original they are enlargements — soft but
// honest; from a 4K master in _src/upscaled/<legacyId>.(jpg|png|webp) they are true downscales.
const BAND_WIDTHS = [1440, 1920];
// Only a true 4K master can honestly serve a 2560 px frame for large retina screens (kept if it fits the budget).
const MASTER_ONLY_WIDTH = 2560;
const upscaledDir = path.join(root, "_src/upscaled");
function masterFor(asset) {
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    const p = path.join(upscaledDir, `${asset.legacyId}.${ext}`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}
const PORTRAIT_WIDTHS = [360, 600];
// Sources flagged grade:"calm" are pulled back toward natural colour; the heaviest HDR frames a little further.
const CALM_SATURATION = { moderate: 0.88, heavy: 0.8, natural: 0.92 };

const argv = process.argv.slice(2);
const only = argv.includes("--only") ? argv[argv.indexOf("--only") + 1] : null;
const checkOnly = argv.includes("--check");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const assets = manifest.filter((a) => a.uses.length > 0 && (!only || a.id === only));
if (!checkOnly) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(ogDir, { recursive: true });
}

const hex = (n) => Math.round(n).toString(16).padStart(2, "0");

/**
 * Clone out sensor dust: each spot is covered by a feathered patch of the sky immediately to its left,
 * taken at the same height so the vertical gradient is unchanged. Nothing in the scene is altered.
 */
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
    const patch = await sharp(file)
      .extract({ left: from, top, width: size, height: size })
      .blur(0.8)
      .ensureAlpha()
      .composite([{ input: mask, blend: "dest-in" }])
      .png()
      .toBuffer();
    overlays.push({ input: patch, left, top });
  }
  return sharp(file).composite(overlays).toBuffer();
}

const sourceCache = new Map();
async function sourceFor(file, asset) {
  if (!asset.heal?.length) return file;
  if (!sourceCache.has(asset.id)) sourceCache.set(asset.id, await healed(file, asset.heal));
  return sourceCache.get(asset.id);
}

function pipeline(file, asset) {
  let img = sharp(file, { failOn: "error" }).rotate();
  if (asset.grade === "calm") img = img.modulate({ saturation: CALM_SATURATION[asset.hdr] ?? 0.86 });
  return img;
}

async function encode(img, format, startQuality) {
  // Step quality down until the file fits the budget; a file that cannot fit is too large in pixels.
  for (let q = startQuality; q >= 34; q -= 4) {
    const buf =
      format === "webp"
        ? await img.clone().webp({ quality: q, effort: 5, smartSubsample: true }).toBuffer()
        : await img.clone().jpeg({ quality: q, mozjpeg: true, progressive: true }).toBuffer();
    if (buf.length <= BUDGET) return { buf, q };
  }
  return null; // cannot fit the budget at any acceptable quality: the caller decides what that means
}

const existing = fs.existsSync(outJson) ? JSON.parse(fs.readFileSync(outJson, "utf8")) : {};
const derivatives = only ? existing : {};
let files = 0;
let bytes = 0;
const problems = [];

for (const asset of assets) {
  const original = path.join(srcDir, asset.source);
  const master = masterFor(asset);
  const file = master ?? original;
  if (!fs.existsSync(file)) {
    problems.push(`${asset.id}: missing source ${asset.source}`);
    continue;
  }
  // A 4K master was made from an already-healed frame (scripts/prepare-upscale.mjs), and the dust coordinates
  // are in the original's pixels, so healing applies to originals only.
  const input = master ? file : await sourceFor(file, asset);
  const meta = await sharp(file).metadata();
  const srcW = meta.width;
  const srcH = meta.height;
  const isBand = asset.uses.includes("hero") || asset.uses.includes("band");
  const base = srcW >= srcH ? LANDSCAPE_WIDTHS : PORTRAIT_WIDTHS;
  // The catalogue records the ORIGINAL's size; a master is larger. Standard widths never exceed the original's
  // intrinsic width unless a master exists; band widths are always produced for full-bleed frames.
  const nativeW = master ? srcW : asset.width;
  const widths = base.filter((w) => w < nativeW).concat(master ? [] : [nativeW]).concat(isBand && srcW >= srcH ? (master ? [...BAND_WIDTHS, MASTER_ONLY_WIDTH] : BAND_WIDTHS) : []);
  const stats = await pipeline(input, asset).resize(32).stats();
  const dominant = `#${hex(stats.channels[0].mean)}${hex(stats.channels[1].mean)}${hex(stats.channels[2].mean)}`;
  const variants = [];
  for (const w of [...new Set(widths)].sort((a, b) => a - b)) {
    const h = Math.round((srcH * w) / srcW);
    const enlarged = w > srcW;
    let resized = pipeline(input, asset).resize({ width: w, withoutEnlargement: !enlarged, kernel: "lanczos3" });
    // A whisper of sharpening keeps an enlargement from looking smeared; it adds no detail and is not sold as such.
    if (enlarged) resized = resized.sharpen({ sigma: 0.7, m1: 0.6, m2: 1.2 });
    const large = BAND_WIDTHS.includes(w) || w === MASTER_ONLY_WIDTH;
    const webp = await encode(resized, "webp", large ? 66 : 78);
    // Large full-bleed variants ship as WebP only: a JPEG that size cannot meet the 200 KB budget without
    // visible blocking, and every browser that would paint a 1440 px hero reads WebP. Older browsers fall
    // back to the 1000 px JPEG.
    const jpg = large ? null : await encode(resized, "jpeg", 80);
    if (!webp || (!large && !jpg)) {
      if (large) {
        console.warn(`${asset.id}: ${w}px does not fit ${BUDGET / 1024} KB, skipped`);
        continue;
      }
      throw new Error(`${asset.id}: cannot fit ${w}px under ${BUDGET} bytes`);
    }
    const stem = `${asset.id}-${w}`;
    if (!checkOnly) {
      fs.writeFileSync(path.join(outDir, `${stem}.webp`), webp.buf);
      if (jpg) fs.writeFileSync(path.join(outDir, `${stem}.jpg`), jpg.buf);
    }
    variants.push({ ...(enlarged ? { enlarged: true } : {}), width: w, height: h, webp: `/media/${stem}.webp`, jpg: jpg ? `/media/${stem}.jpg` : "", bytesWebp: webp.buf.length, bytesJpg: jpg ? jpg.buf.length : 0 });
    files += jpg ? 2 : 1;
    bytes += webp.buf.length + (jpg ? jpg.buf.length : 0);
  }
  derivatives[asset.id] = { master: master ? "upscaled" : "original", width: master ? srcW : asset.width, height: master ? srcH : asset.height, dominant, variants };

  if (asset.uses.includes("hero") && !checkOnly) {
    // Social card. 1200×630 is a mild (≤1.2×) enlargement of a 1000 px source — acceptable for a share preview only.
    const og = await pipeline(input, asset)
      .resize({ width: 1200, height: 630, fit: "cover", position: sharp.strategy.attention })
      .jpeg({ quality: 80, mozjpeg: true, progressive: true })
      .toBuffer();
    fs.writeFileSync(path.join(ogDir, `${asset.id}.jpg`), og);
  }
}

if (!checkOnly) fs.writeFileSync(outJson, JSON.stringify(derivatives, null, 2) + "\n");

const used = new Set(assets.map((a) => a.id));
if (!only && !checkOnly) {
  // Remove derivatives of assets that are no longer in use so /public never carries strays.
  for (const f of fs.readdirSync(outDir)) {
    const id = f.replace(/-\d+\.(webp|jpg)$/, "");
    if (!used.has(id)) fs.unlinkSync(path.join(outDir, f));
  }
}

console.log(`${assets.length} assets → ${files} files, ${(bytes / 1024 / 1024).toFixed(1)} MB total, largest allowed ${BUDGET / 1024} KB`);
if (problems.length) {
  console.error(problems.join("\n"));
  process.exitCode = 1;
}
