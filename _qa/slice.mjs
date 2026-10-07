// Cuts a tall full-page screenshot into viewable pieces: node _qa/slice.mjs <png> [sliceHeight=1800] [outWidth=1000]
import sharp from "sharp";
const [file, h = "1800", w = "1000"] = process.argv.slice(2);
const meta = await sharp(file).metadata();
const H = Number(h);
const n = Math.ceil(meta.height / H);
for (let i = 0; i < n; i++) {
  const top = i * H;
  const height = Math.min(H, meta.height - top);
  const out = file.replace(/\.png$/, `-${String(i + 1).padStart(2, "0")}.jpg`);
  await sharp(file).extract({ left: 0, top, width: meta.width, height }).resize({ width: Math.min(Number(w), meta.width) }).jpeg({ quality: 78 }).toFile(out);
  console.log(out);
}
