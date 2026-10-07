// Lays a tall phone screenshot out as side-by-side columns: node _qa/strip.mjs <png> [cols=6] [colWidth=300] [start=0]
import sharp from "sharp";
const [file, cols = "6", cw = "300", start = "0"] = process.argv.slice(2);
const meta = await sharp(file).metadata();
const C = Number(cols), W = Number(cw);
const scale = W / meta.width;
const segH = Math.round(1750 / scale / (W / 300) * (W / 300)); // source px per column, about 1750 output px tall
const srcSeg = Math.round(1750 / scale);
const tiles = [];
for (let i = 0; i < C; i++) {
  const top = (Number(start) + i) * srcSeg;
  if (top >= meta.height) break;
  const height = Math.min(srcSeg, meta.height - top);
  const buf = await sharp(file).extract({ left: 0, top, width: meta.width, height }).resize({ width: W }).jpeg({ quality: 76 }).toBuffer();
  tiles.push({ input: buf, left: i * (W + 10), top: 0 });
}
const out = file.replace(/\.png$/, `-strip${start === "0" ? "" : "-" + start}.jpg`);
await sharp({ create: { width: tiles.length * (W + 10), height: 1750, channels: 3, background: "#222" } }).composite(tiles).jpeg({ quality: 76 }).toFile(out);
console.log(out, "segments", Math.ceil(meta.height / srcSeg));
