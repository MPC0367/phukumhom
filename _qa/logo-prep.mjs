import sharp from "sharp";
const src = process.argv[2];
const out = process.argv[3];
const img = sharp(src).removeAlpha();
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const lum = (i) => 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
// Ink = clearly darker than the white ground.
let minX = W, maxX = 0, minY = H, maxY = 0;
const rowInk = new Array(H).fill(0);
let sumR = 0, sumG = 0, sumB = 0, n = 0;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = (y * W + x) * 3; const L = lum(i);
  if (L < 200) { rowInk[y]++; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
  if (L < 120) { sumR += data[i]; sumG += data[i + 1]; sumB += data[i + 2]; n++; }
}
const ink = [Math.round(sumR / n), Math.round(sumG / n), Math.round(sumB / n)];
// Bands: runs of rows with ink, separated by empty rows.
const bands = []; let start = -1;
for (let y = minY; y <= maxY + 1; y++) { const has = rowInk[y] > 0; if (has && start < 0) start = y; if (!has && start >= 0) { bands.push([start, y - 1]); start = -1; } }
console.log(JSON.stringify({ W, H, box: { minX, maxX, minY, maxY }, ink, bands }));
// Alpha logo: colour = the ink green everywhere, alpha from how dark the pixel is (white = clear).
const pad = 4;
const x0 = Math.max(0, minX - pad), y0 = Math.max(0, minY - pad), x1 = Math.min(W - 1, maxX + pad), y1 = Math.min(H - 1, maxY + pad);
const w = x1 - x0 + 1, h = y1 - y0 + 1;
const rgba = Buffer.alloc(w * h * 4);
const inkL = 0.2126 * ink[0] + 0.7152 * ink[1] + 0.0722 * ink[2];
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
  const i = ((y + y0) * W + (x + x0)) * 3; const L = lum(i);
  const a = Math.max(0, Math.min(1, (250 - L) / (250 - inkL)));
  const o = (y * w + x) * 4; rgba[o] = ink[0]; rgba[o + 1] = ink[1]; rgba[o + 2] = ink[2]; rgba[o + 3] = Math.round(a * 255);
}
await sharp(rgba, { raw: { width: w, height: h, channels: 4 } }).webp({ quality: 92, alphaQuality: 100 }).toFile(out + ".webp");
await sharp(rgba, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 9, palette: true, quality: 95 }).toFile(out + ".png");
console.log(JSON.stringify({ crop: { x0, y0, w, h }, bandsInCrop: bands.map(([a, b]) => [a - y0, b - y0]) }));
