// Crawls the metadata of the static build as GitHub Pages will serve it, and follows every address in it.
//
//   node _qa/metadata-check.mjs [standIn] [publicRoot]
//   node _qa/metadata-check.mjs http://127.0.0.1:8353/phukumhom https://mpc0367.github.io/phukumhom
//
// The stand-in (npm run pages:serve) serves ./out under the same path prefix as the real host. Every
// address the pages print for the PUBLIC root (canonical, hreflang, og:url, og:image, twitter:image,
// JSON-LD url/@id/item/image, sitemap <loc> and alternates) is mapped onto the stand-in and requested:
// a correct-looking attribute is not enough if the address does not answer.
//
// This is the check that would have caught the first deployment's "https://mpc0367.github.io/en/".
import fs from "node:fs";

const STAND_IN = (process.argv[2] ?? "http://127.0.0.1:8353/phukumhom").replace(/\/+$/, "");
const PUBLIC = (process.argv[3] ?? "https://mpc0367.github.io/phukumhom").replace(/\/+$/, "");
const PUBLIC_ORIGIN = new URL(PUBLIC).origin;

const PAGES = ["", "stay", "stay/deluxe-balcony", "stay/deluxe-bathtub", "stay/executive-pool-spa", "dining", "experiences", "gallery", "location", "contact", "faq", "privacy", "terms"];
const LANGS = ["th", "en"];

const results = [];
const note = (name, ok, detail = "") => {
  results.push({ name, ok });
  if (!ok || process.argv.includes("--verbose")) console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  | " + detail : ""}`);
};

const local = (publicUrl) => STAND_IN + publicUrl.slice(PUBLIC.length);
const cache = new Map();
async function status(publicUrl) {
  if (!publicUrl.startsWith(PUBLIC + "/") && publicUrl !== PUBLIC) return { status: 0, type: "", outside: true };
  if (cache.has(publicUrl)) return cache.get(publicUrl);
  const res = await fetch(local(publicUrl), { redirect: "manual" });
  const out = { status: res.status, type: res.headers.get("content-type") ?? "" };
  cache.set(publicUrl, out);
  return out;
}

const attr = (html, re) => [...html.matchAll(re)].map((m) => m[1]);
const pagePath = (lang, page) => `/${lang}/${page ? page + "/" : ""}`;

let checkedUrls = 0;
for (const lang of LANGS) {
  for (const page of PAGES) {
    const path = pagePath(lang, page);
    const expected = PUBLIC + path;
    const res = await fetch(STAND_IN + path);
    const html = await res.text();
    const problems = [];
    if (res.status !== 200) problems.push(`status ${res.status}`);

    const canonical = attr(html, /<link rel="canonical" href="([^"]+)"/g);
    if (canonical.length !== 1) problems.push(`${canonical.length} canonical links`);
    else if (canonical[0] !== expected) problems.push(`canonical ${canonical[0]} (expected ${expected})`);

    const alternates = Object.fromEntries([...html.matchAll(/<link rel="alternate" hrefLang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]));
    for (const l of LANGS) if (alternates[l] !== PUBLIC + pagePath(l, page)) problems.push(`hreflang ${l} = ${alternates[l]}`);
    if (alternates["x-default"] !== PUBLIC + pagePath("th", page)) problems.push(`hreflang x-default = ${alternates["x-default"]}`);

    const ogUrl = attr(html, /<meta property="og:url" content="([^"]+)"/g)[0];
    if (ogUrl !== expected) problems.push(`og:url ${ogUrl}`);

    const images = [...attr(html, /<meta property="og:image" content="([^"]+)"/g), ...attr(html, /<meta name="twitter:image" content="([^"]+)"/g)];
    if (images.length === 0) problems.push("no social image");
    for (const image of images) {
      const r = await status(image);
      checkedUrls++;
      if (r.outside) problems.push(`social image outside the site root: ${image}`);
      else if (r.status !== 200 || !r.type.startsWith("image/")) problems.push(`social image ${image} answered ${r.status} ${r.type}`);
    }
    const width = attr(html, /<meta property="og:image:width" content="([^"]+)"/g)[0];
    const height = attr(html, /<meta property="og:image:height" content="([^"]+)"/g)[0];
    const alt = attr(html, /<meta property="og:image:alt" content="([^"]+)"/g)[0];
    if (!width || !height || !alt) problems.push("social image without width, height or alt");

    const robots = attr(html, /<meta name="robots" content="([^"]+)"/g)[0] ?? "";
    if (!/noindex/.test(robots)) problems.push(`robots "${robots}" (a preview must be noindex)`);

    // Structured data: every address that names our host must sit under the public root and answer.
    const ld = attr(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
    const seen = new Set();
    for (const block of ld) {
      let data;
      try {
        data = JSON.parse(block);
      } catch {
        problems.push("JSON-LD does not parse");
        continue;
      }
      (function walk(node) {
        if (typeof node === "string") {
          if (node.startsWith(PUBLIC_ORIGIN)) seen.add(node.replace(/#.*$/, ""));
        } else if (Array.isArray(node)) node.forEach(walk);
        else if (node && typeof node === "object") Object.values(node).forEach(walk);
      })(data);
    }
    for (const url of seen) {
      const r = await status(url);
      checkedUrls++;
      if (r.outside) problems.push(`JSON-LD address outside the site root: ${url}`);
      else if (r.status !== 200) problems.push(`JSON-LD address ${url} answered ${r.status}`);
    }

    // The canonical and every alternate must themselves answer.
    for (const url of [canonical[0], ...Object.values(alternates)].filter(Boolean)) {
      const r = await status(url);
      checkedUrls++;
      if (r.outside || r.status !== 200) problems.push(`${url} answered ${r.outside ? "outside root" : r.status}`);
    }
    note(`${path} metadata`, problems.length === 0, problems.slice(0, 4).join(" ; "));
  }
}

// The sitemap: every <loc> and every alternate is a real page under the public root.
{
  const xml = await (await fetch(STAND_IN + "/sitemap.xml")).text();
  const locs = attr(xml, /<loc>([^<]+)<\/loc>/g);
  const alts = attr(xml, /<xhtml:link[^>]+href="([^"]+)"/g);
  const bad = [];
  for (const url of new Set([...locs, ...alts])) {
    const r = await status(url);
    checkedUrls++;
    if (r.outside || r.status !== 200) bad.push(`${url} → ${r.outside ? "outside root" : r.status}`);
  }
  note(`sitemap: ${locs.length} locations and their alternates answer 200 under ${PUBLIC}`, locs.length === PAGES.length * LANGS.length && bad.length === 0, `${locs.length} locs; ${bad.slice(0, 3).join(" ; ")}`);
}

// robots.txt of the project folder: a preview turns crawlers away. (A crawler reads robots.txt at the HOST
// root, which this project does not control; the page-level noindex above is what actually applies.)
{
  const robots = await (await fetch(STAND_IN + "/robots.txt")).text();
  note("robots.txt in the project folder disallows everything (preview)", /Disallow:\s*\/\s*$/m.test(robots) && !/Sitemap:/i.test(robots), robots.replace(/\s+/g, " ").slice(0, 80));
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} metadata checks passed (${checkedUrls} addresses followed)`);
if (process.argv.includes("--json")) fs.writeFileSync("_qa/metadata-check.json", JSON.stringify(results, null, 1));
process.exitCode = failed.length ? 1 : 0;
