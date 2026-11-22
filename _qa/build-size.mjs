// Sizes of what a route's HTML asks for on first load, read from the static build on disk.
//   node _qa/build-size.mjs [outDir=out] [route ...]      e.g. node _qa/build-size.mjs out en th en/stay
// Raw bytes and gzip bytes (level 9, close to what a static host sends). Not a speed measurement.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
const args = process.argv.slice(2);
const out = args[0] && fs.existsSync(args[0]) && fs.statSync(args[0]).isDirectory() ? args.shift() : "out";
const routes = args.length ? args : ["en", "th", "en/stay", "en/stay/executive-pool-spa", "en/gallery", "en/contact"];
const gz = (buf) => zlib.gzipSync(buf, { level: 9 }).length;
const kb = (n) => (n / 1024).toFixed(0).padStart(5);
const local = (url) => {
  const clean = url.split("?")[0].replace(/^https?:\/\/[^/]+/, "");
  const rel = clean.replace(/^\/[^/]+\/(?=_next\/)/, "").replace(/^\//, "");
  return path.join(out, decodeURIComponent(rel));
};
console.log("route".padEnd(30), "html raw/gz KB", " js files raw/gz KB", " css files raw/gz KB");
for (const route of routes) {
  const file = path.join(out, route, "index.html");
  if (!fs.existsSync(file)) { console.log(route.padEnd(30), "missing"); continue; }
  const html = fs.readFileSync(file);
  const text = html.toString("utf8");
  const scripts = [...new Set([...text.matchAll(/<script[^>]+src="([^"]+\.js[^"]*)"/g)].map((m) => m[1]))];
  const styles = [...new Set([...text.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map((m) => m[1]))];
  const sum = (urls) => urls.reduce((acc, u) => { const f = local(u); if (!fs.existsSync(f)) return acc; const b = fs.readFileSync(f); return { raw: acc.raw + b.length, gz: acc.gz + gz(b), n: acc.n + 1 }; }, { raw: 0, gz: 0, n: 0 });
  const js = sum(scripts), css = sum(styles);
  console.log(route.padEnd(30), `${kb(html.length)} /${kb(gz(html))}`, `   ${String(js.n).padStart(2)} ${kb(js.raw)} /${kb(js.gz)}`, `   ${String(css.n).padStart(2)} ${kb(css.raw)} /${kb(css.gz)}`);
}
