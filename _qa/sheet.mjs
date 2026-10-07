import sharp from "sharp";
import fs from "node:fs";
const [out, cols, ...ids] = process.argv.slice(2);
const C = Number(cols), W = 480, H = 320, pad = 8;
const rows = Math.ceil(ids.length / C);
const tiles = [];
for (let i = 0; i < ids.length; i++) {
  const candidates = [`public/media/${ids[i]}-1000.jpg`, `public/media/${ids[i]}-720.jpg`, `public/media/${ids[i]}-600.jpg`, `public/media/${ids[i]}-480.jpg`];
  const file = candidates.find((f) => fs.existsSync(f));
  if (!file) { console.log("missing", ids[i]); continue; }
  const buf = await sharp(file).resize(W, H, { fit: "contain", background: "#222" }).jpeg({ quality: 70 }).toBuffer();
  tiles.push({ input: buf, left: pad + (i % C) * (W + pad), top: pad + Math.floor(i / C) * (H + pad) });
}
await sharp({ create: { width: pad + C * (W + pad), height: pad + rows * (H + pad), channels: 3, background: "#111" } }).composite(tiles).jpeg({ quality: 72 }).toFile(out);
console.log("wrote", out);
