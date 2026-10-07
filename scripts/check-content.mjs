#!/usr/bin/env node
// Content and metadata crawler for the running site. Plain Node 24, no dependencies.
//
//   node scripts/check-content.mjs                 every published page, both languages
//   node scripts/check-content.mjs --json          machine-readable result on stdout
//   node scripts/check-content.mjs --only /en/stay only pages whose path starts with this
//   node scripts/check-content.mjs --base http://127.0.0.1:8352   (or QA_BASE=…)
//   node scripts/check-content.mjs --no-links --no-assets          skip the link / image requests
//
// The server must already be running. Exit code: 0 all pages pass, 1 at least one failure,
// 2 the server could not be reached.
//
// Which pages: when robots.txt names a sitemap (the public site) the list is read from /sitemap.xml;
// otherwise (a preview) it is the built-in list below, which mirrors src/lib/routes.ts and the feature
// flags in src/content/site.ts. Both sources are compared whenever both are available.
//
// Per page (FAIL):
//   status 200 · exactly one <h1> · <html lang> matches the URL · title 50-60 and description 140-160
//   code points, both unique across pages · one absolute, self-referencing canonical · hreflang th / en /
//   x-default, reciprocal · og:title, og:description, og:image · every <img> has alt (<= 125 code points),
//   width and height · no placeholder text (TBC, lorem, undefined, [object, {placeholder} …) · no banned
//   words · no href="#" or empty href · every internal link target answers 200 · JSON-LD parses and holds
//   no aggregateRating / review / geo / starRating / priceRange · the robots signal fits the environment.
// Per page (warning, does not change the exit code):
//   <h3> before any <h2> · a link inside a heading · a fragment link whose target id does not exist ·
//   title not ending in the brand suffix · og:url differing from the canonical · metadata outside <head>.
// Site-wide (FAIL): robots.txt fits the environment · the sitemap lists exactly the published pages ·
//   unknown and flagged-off URLs answer 404 · every canonical uses one origin.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/* ───────────── Arguments ───────────── */

const argv = process.argv.slice(2);
const has = (name) => argv.includes(`--${name}`);
const value = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] !== undefined && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};
/** Git Bash rewrites a leading-slash argument into a Windows path ("/th" → "C:/Program Files/Git/th"). Undo it. */
const unMsys = (text) => {
  const m = /^[A-Za-z]:[\\/](?:Program Files[\\/])?Git[\\/]?(.*)$/i.exec(text);
  return m ? `/${m[1].replace(/\\/g, "/")}` : text;
};

if (has("help")) {
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(1, 28).map((l) => l.replace(/^\/\/ ?/, "")).join("\n"));
  process.exit(0);
}

const BASE = value("base", process.env.QA_BASE ?? "http://127.0.0.1:8352").replace(/\/+$/, "");
const BASE_ORIGIN = new URL(BASE).origin;
const JSON_OUT = has("json");
const ONLY = value("only", null) ? unMsys(value("only", null)) : null;
const CHECK_LINKS = !has("no-links");
const CHECK_ASSETS = !has("no-assets");
const TIMEOUT = Number(value("timeout", 120000));
const UA = "phukumhom-check-content/1.0 (+scripts/check-content.mjs)";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* ───────────── The route table (mirrors src/lib/routes.ts) ───────────── */

const LOCALES = ["th", "en"];
const DEFAULT_LOCALE = "th";
const ROOM_IDS = ["deluxe-balcony", "deluxe-bathtub", "executive-pool-spa"];
/** [id, path, flag, indexable] — keep in step with ROUTES in src/lib/routes.ts (the script checks). */
const ROUTES = [
  ["home", "", null, true],
  ["stay", "/stay", null, true],
  ["room", "/stay/[room]", null, true],
  ["dining", "/dining", null, true],
  ["experiences", "/experiences", null, true],
  ["gallery", "/gallery", null, true],
  ["location", "/location", null, true],
  ["contact", "/contact", null, true],
  ["faq", "/faq", null, true],
  ["privacy", "/privacy", null, true],
  ["terms", "/terms", null, true],
  ["gatherings", "/gatherings", "gatherings", true],
  ["offers", "/offers", "offers", true],
];
/** Feature flags as they stand in src/content/site.ts today. Re-read from that file when it is present. */
const DEFAULT_FLAGS = { offers: false, gatherings: false };
/** Pages marked "never index" in src/content/seo.ts: kept out of the sitemap even when their flag is on. */
const NEVER_INDEXED = ["/gatherings"];

const LIMITS = { title: [50, 60], description: [140, 160], alt: 125 };
const BRAND_SUFFIX = { en: "| Phukumhom Resort", th: "| ภูคำหอม รีสอร์ท" };

const BANNED = [
  ["luxury", /\bluxur(?:y|ious|iously)\b/i],
  ["world-class", /\bworld[- ]class\b/i],
  ["nestled", /\bnestl(?:e|ed|es|ing)\b/i],
  ["hidden gem", /\bhidden\s+gems?\b/i],
  ["paradise", /\bparadise\b/i],
  ["Jacuzzi", /\bjacuzzis?\b/i],
  ["villa", /\bvillas?\b/i],
  ["หรูหรา", /หรูหรา/],
  ["ระดับโลก", /ระดับโลก/],
  ["อ่างสปา", /อ่างสปา/],
  ["ภูคาหอม (misspelling of ภูคำหอม)", /ภูคาหอม/],
];

const PLACEHOLDERS = [
  ["TBC", /\bTBC\b/],
  ["TBD", /\bTBD\b/],
  ["lorem", /\blorem\b/i],
  ["undefined", /\bundefined\b/],
  ["[object", /\[object\b/i],
  ["NaN", /\bNaN\b/],
  ["Invalid Date", /\bInvalid Date\b/],
  ["{placeholder}", /\{\s*[A-Za-z_$][\w.$-]*\s*\}/],
  ["[PLACEHOLDER]", /\[[A-Z][A-Z0-9 _-]{2,}\]/],
];

const FORBIDDEN_LD_KEYS = new Set(["aggregateRating", "review", "reviews", "geo", "starRating", "priceRange"]);
const FORBIDDEN_LD_TYPES = new Set(["AggregateRating", "Review", "Rating", "GeoCoordinates"]);

const count = (text) => [...text].length;

/* ───────────── Source cross-checks (best effort; the script still runs without the files) ───────────── */

function readSource(relative) {
  try {
    return fs.readFileSync(path.join(ROOT, relative), "utf8");
  } catch {
    return null;
  }
}

function routesFromSource() {
  const source = readSource("src/lib/routes.ts");
  if (!source) return null;
  const found = [];
  const re = /^\s*(\w+):\s*\{\s*path:\s*"([^"]*)",\s*flag:\s*(null|"(\w+)"),\s*indexable:\s*(true|false)/gm;
  let m;
  while ((m = re.exec(source))) found.push([m[1], m[2], m[4] ?? null, m[5] === "true"]);
  return found.length > 0 ? found : null;
}

function flagsFromSource() {
  const source = readSource("src/content/site.ts");
  const block = source ? /\bflags:\s*\{([^}]*)\}/.exec(source) : null;
  if (!block) return null;
  const flags = {};
  for (const m of block[1].matchAll(/(\w+):\s*(true|false)/g)) flags[m[1]] = m[2] === "true";
  return flags;
}

/** The same rule as `publishedPaths()` in src/lib/routes.ts, minus pages that are never indexed. */
function publishedPaths(routes, flags) {
  const out = [];
  for (const [id, routePath, flag, indexable] of routes) {
    if (!indexable || (flag !== null && !flags[flag])) continue;
    if (id === "room") for (const room of ROOM_IDS) out.push(routePath.replace("[room]", room));
    else if (id === "offers") continue;
    else if (!NEVER_INDEXED.includes(routePath)) out.push(routePath);
  }
  return out;
}

/* ───────────── HTTP ───────────── */

async function request(url, method = "GET") {
  try {
    const res = await fetch(url, {
      method,
      redirect: "manual",
      headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" },
      signal: AbortSignal.timeout(TIMEOUT),
    });
    const type = res.headers.get("content-type") ?? "";
    let body = "";
    if (method !== "HEAD" && /text\/|xml|json/.test(type)) body = await res.text();
    else if (res.body) await res.body.cancel();
    return { status: res.status, type, body, headers: res.headers, location: res.headers.get("location") };
  } catch (error) {
    return { status: 0, type: "", body: "", headers: new Headers(), location: null, error: String(error?.cause?.code ?? error?.message ?? error) };
  }
}

async function pool(items, size, worker) {
  let next = 0;
  const run = async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      await worker(items[index], index);
    }
  };
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, run));
}

/* ───────────── A small HTML reader ───────────── */

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const RAW_TEXT = new Set(["script", "style", "textarea", "title"]);
const INLINE = new Set(
  "a abbr b bdi bdo cite code data dfn em i kbd label mark q s samp small span strong sub sup time u var wbr".split(" "),
);
const NOT_VISIBLE = new Set(["head", "script", "style", "template"]);
const ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: String.fromCharCode(160),
  ndash: "–",
  mdash: "—",
  hellip: "…",
  copy: "©",
  middot: "·",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
};

function decodeEntities(text) {
  if (!text.includes("&")) return text;
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (whole, body) => {
    if (body[0] === "#") {
      const code = body[1] === "x" || body[1] === "X" ? Number.parseInt(body.slice(2), 16) : Number.parseInt(body.slice(1), 10);
      return Number.isInteger(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
    }
    return Object.hasOwn(ENTITIES, body) ? ENTITIES[body] : whole;
  });
}

function parseAttributes(source) {
  const attrs = Object.create(null);
  const re = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let m;
  while ((m = re.exec(source))) {
    const name = m[1].toLowerCase();
    if (!(name in attrs)) attrs[name] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? "");
  }
  return attrs;
}

function parseHtml(html) {
  const doc = {
    lang: null,
    title: null,
    titleCount: 0,
    metas: [],
    links: [],
    h1: 0,
    headings: [],
    images: [],
    anchors: [],
    ids: new Set(),
    jsonLd: [],
    attrText: [],
    mains: 0,
    text: "",
  };
  const text = [];
  const stack = [];
  let heading = null;
  const TAG = /<(\/?)([a-zA-Z][^\s/>]*)((?:"[^"]*"|'[^']*'|[^'">])*)>/y;
  const inside = (names) => stack.some((name) => names.has(name));
  const insideOne = (name) => stack.includes(name);

  const pushText = (raw) => {
    if (raw === "" || inside(NOT_VISIBLE)) return;
    const decoded = decodeEntities(raw);
    text.push(decoded);
    if (heading) heading.text += decoded;
  };

  let i = 0;
  const n = html.length;
  while (i < n) {
    const lt = html.indexOf("<", i);
    if (lt === -1) {
      pushText(html.slice(i));
      break;
    }
    if (lt > i) pushText(html.slice(i, lt));
    if (html.startsWith("<!--", lt)) {
      const end = html.indexOf("-->", lt + 4);
      i = end === -1 ? n : end + 3;
      continue;
    }
    if (html[lt + 1] === "!" || html[lt + 1] === "?") {
      const end = html.indexOf(">", lt);
      i = end === -1 ? n : end + 1;
      continue;
    }
    TAG.lastIndex = lt;
    const m = TAG.exec(html);
    if (!m) {
      pushText("<");
      i = lt + 1;
      continue;
    }
    i = TAG.lastIndex;
    const name = m[2].toLowerCase();

    if (m[1]) {
      const at = stack.lastIndexOf(name);
      if (at !== -1) stack.length = at;
      if (heading && name === `h${heading.level}`) heading = null;
      if (!INLINE.has(name)) text.push(" ");
      continue;
    }

    const attrs = parseAttributes(m[3]);
    const selfClosing = /\/\s*$/.test(m[3]);
    const inHead = insideOne("head");
    if (!INLINE.has(name)) text.push(" ");

    if (typeof attrs.id === "string" && attrs.id !== "") doc.ids.add(attrs.id);
    if (!inside(NOT_VISIBLE)) {
      for (const attr of ["alt", "title", "aria-label", "placeholder"]) {
        if (typeof attrs[attr] === "string" && attrs[attr].trim() !== "") doc.attrText.push({ tag: name, attr, value: attrs[attr] });
      }
    }

    if (name === "html") doc.lang = attrs.lang ?? null;
    else if (name === "meta") doc.metas.push({ ...attrs, inHead });
    else if (name === "link") doc.links.push({ rel: (attrs.rel ?? "").toLowerCase(), href: attrs.href ?? null, hreflang: attrs.hreflang ?? null, inHead });
    else if (name === "main") doc.mains += 1;
    else if (name === "img") doc.images.push({ src: attrs.src ?? null, alt: "alt" in attrs ? attrs.alt : null, width: attrs.width ?? null, height: attrs.height ?? null });
    else if (/^h[1-6]$/.test(name)) {
      heading = { level: Number(name[1]), text: "", hasLink: false };
      doc.headings.push(heading);
      if (heading.level === 1) doc.h1 += 1;
    } else if (name === "a") {
      doc.anchors.push({ href: "href" in attrs ? attrs.href : null, inHeading: heading !== null });
      if (heading) heading.hasLink = true;
    }

    if (RAW_TEXT.has(name) && !selfClosing) {
      const closeAt = html.toLowerCase().indexOf(`</${name}`, i);
      const content = html.slice(i, closeAt === -1 ? n : closeAt);
      const closeEnd = closeAt === -1 ? n : html.indexOf(">", closeAt);
      i = closeEnd === -1 ? n : closeEnd + 1;
      if (name === "script" && (attrs.type ?? "").toLowerCase() === "application/ld+json") doc.jsonLd.push(content);
      else if (name === "title" && inHead) {
        doc.titleCount += 1;
        if (doc.title === null) doc.title = decodeEntities(content).replace(/\s+/g, " ").trim();
      } else if (name === "title") {
        // <title> inside an inline SVG is its accessible name: guest-facing text.
        const label = decodeEntities(content).trim();
        if (label) doc.attrText.push({ tag: "svg", attr: "title", value: label });
      }
      continue;
    }
    if (!VOID.has(name) && !selfClosing) stack.push(name);
  }

  doc.text = text.join("").replace(/\s+/g, " ").trim();
  return doc;
}

const findMeta = (doc, key) => doc.metas.find((m) => (m.name ?? "").toLowerCase() === key || (m.property ?? "").toLowerCase() === key) ?? null;
const metaContent = (doc, key) => (findMeta(doc, key)?.content ?? "").trim();
const relHas = (link, token) => link.rel.split(/\s+/).includes(token);

/* ───────────── Per-page checks ───────────── */

function snippet(text, index, length) {
  const from = Math.max(0, index - 28);
  const to = Math.min(text.length, index + length + 28);
  return `${from > 0 ? "…" : ""}${text.slice(from, to)}${to < text.length ? "…" : ""}`;
}

function scan(where, text, page) {
  for (const [label, re] of PLACEHOLDERS) {
    const m = re.exec(text);
    if (m) page.fail("text", `placeholder "${label}" in ${where}: "${snippet(text, m.index, m[0].length)}"`);
  }
  for (const [label, re] of BANNED) {
    const m = re.exec(text);
    if (m) page.fail("text", `banned word "${label}" in ${where}: "${snippet(text, m.index, m[0].length)}"`);
  }
  // U+0E4D U+0E32 is a decomposed sara am; the name must be typed with the single character U+0E33.
  const decomposed = text.indexOf(String.fromCharCode(0x0e4d, 0x0e32));
  if (decomposed !== -1) page.fail("text", `decomposed Thai sara am in ${where}: "${snippet(text, decomposed, 2)}"`);
}

function walkJsonLd(node, found) {
  if (Array.isArray(node)) {
    for (const item of node) walkJsonLd(item, found);
  } else if (node && typeof node === "object") {
    for (const [key, val] of Object.entries(node)) {
      if (FORBIDDEN_LD_KEYS.has(key)) found.add(key);
      if (key === "@type") for (const t of Array.isArray(val) ? val : [val]) if (FORBIDDEN_LD_TYPES.has(t)) found.add(`@type ${t}`);
      walkJsonLd(val, found);
    }
  }
}

function inspectPage(page, env) {
  const { doc, lang, path: pagePath } = page;

  // Language and the one heading.
  if (doc.lang !== lang) page.fail("lang", `<html lang="${doc.lang ?? ""}"> but the URL is /${lang}`);
  if (doc.h1 !== 1) page.fail("h1", `${doc.h1} <h1> elements (need exactly one)`);
  let h2Seen = false;
  for (const h of doc.headings) {
    if (h.level === 1) h2Seen = false;
    if (h.level === 2) h2Seen = true;
    if (h.level === 3 && !h2Seen) page.warn("headings", `<h3> "${h.text.trim().slice(0, 50)}" comes before any <h2>`);
    if (h.hasLink) page.warn("headings", `link inside <h${h.level}> "${h.text.trim().slice(0, 50)}"`);
  }
  if (doc.mains !== 1) page.warn("landmarks", `${doc.mains} <main> elements`);

  // Title and description.
  const title = doc.title ?? "";
  const description = metaContent(doc, "description");
  page.metrics.title = title;
  page.metrics.titleLength = count(title);
  page.metrics.description = description;
  page.metrics.descriptionLength = count(description);
  if (!title) page.fail("title", "no <title>");
  else if (page.metrics.titleLength < LIMITS.title[0] || page.metrics.titleLength > LIMITS.title[1]) {
    page.fail("title", `title is ${page.metrics.titleLength} code points (need ${LIMITS.title[0]}-${LIMITS.title[1]}): "${title}"`);
  }
  if (doc.titleCount > 1) page.fail("title", `${doc.titleCount} <title> elements in <head>`);
  if (title && !title.endsWith(BRAND_SUFFIX[lang])) page.warn("title", `title does not end with "${BRAND_SUFFIX[lang]}"`);
  if (!description) page.fail("description", "no meta description");
  else if (page.metrics.descriptionLength < LIMITS.description[0] || page.metrics.descriptionLength > LIMITS.description[1]) {
    page.fail("description", `description is ${page.metrics.descriptionLength} code points (need ${LIMITS.description[0]}-${LIMITS.description[1]})`);
  }

  // Canonical.
  const canonicals = doc.links.filter((l) => relHas(l, "canonical"));
  page.canonical = null;
  if (canonicals.length !== 1) page.fail("canonical", `${canonicals.length} canonical links (need exactly one)`);
  else {
    const href = canonicals[0].href ?? "";
    let url = null;
    try {
      url = /^https?:\/\//i.test(href) ? new URL(href) : null;
    } catch {
      url = null;
    }
    if (!url) page.fail("canonical", `canonical is not an absolute URL: "${href}"`);
    else {
      page.canonical = href;
      page.canonicalOrigin = url.origin;
      if (url.pathname !== pagePath) page.fail("canonical", `canonical points to ${url.pathname}, not to this page`);
      if (url.search || url.hash) page.fail("canonical", `canonical carries a query string or fragment: "${href}"`);
      if (!canonicals[0].inHead) page.warn("canonical", "canonical link is outside <head>");
    }
  }

  // hreflang (reciprocity is checked once every page is read).
  page.alternates = {};
  for (const l of doc.links) if (relHas(l, "alternate") && l.hreflang) page.alternates[l.hreflang.toLowerCase()] = l.href ?? "";
  for (const code of ["th", "en", "x-default"]) {
    const href = page.alternates[code];
    if (!href) page.fail("hreflang", `no hreflang="${code}" link`);
    else if (!/^https?:\/\//i.test(href)) page.fail("hreflang", `hreflang="${code}" is not absolute: "${href}"`);
  }
  if (page.canonical && page.alternates[lang] && page.alternates[lang] !== page.canonical) {
    page.fail("hreflang", `hreflang="${lang}" (${page.alternates[lang]}) is not this page's canonical`);
  }
  if (page.alternates.th && page.alternates["x-default"] && page.alternates.th !== page.alternates["x-default"]) {
    page.fail("hreflang", `x-default (${page.alternates["x-default"]}) is not the Thai page (${page.alternates.th})`);
  }
  const rest = pagePath.replace(/^\/(th|en)/, "");
  for (const code of LOCALES) {
    const href = page.alternates[code];
    if (!href || !/^https?:\/\//i.test(href)) continue;
    const altPath = new URL(href).pathname;
    if (altPath !== `/${code}${rest}`) page.fail("hreflang", `hreflang="${code}" points to ${altPath}, expected /${code}${rest}`);
  }

  // Open Graph.
  for (const key of ["og:title", "og:description", "og:image"]) {
    if (!metaContent(doc, key)) page.fail("og", `no ${key}`);
  }
  const ogImage = metaContent(doc, "og:image");
  if (ogImage && !/^https?:\/\//i.test(ogImage)) page.fail("og", `og:image is not absolute: "${ogImage}"`);
  page.ogImage = ogImage || null;
  const ogUrl = metaContent(doc, "og:url");
  if (ogUrl && page.canonical && ogUrl !== page.canonical) page.warn("og", `og:url (${ogUrl}) differs from the canonical`);

  // Images.
  page.metrics.images = doc.images.length;
  for (const img of doc.images) {
    const name = img.src ? img.src.split("/").pop() : "(no src)";
    if (img.alt === null) page.fail("img", `${name}: no alt attribute`);
    else if (count(img.alt) > LIMITS.alt) page.fail("img", `${name}: alt is ${count(img.alt)} code points (max ${LIMITS.alt})`);
    if (!/^\d+$/.test(img.width ?? "") || !/^\d+$/.test(img.height ?? "")) page.fail("img", `${name}: width/height missing or not a number`);
  }

  // Visible text, attribute text and metadata text.
  scan("visible text", doc.text, page);
  for (const item of doc.attrText) scan(`<${item.tag} ${item.attr}>`, item.value, page);
  scan("<title>", title, page);
  scan("meta description", description, page);
  for (const key of ["og:title", "og:description", "og:image:alt", "twitter:title", "twitter:description"]) scan(key, metaContent(doc, key), page);

  // Links that go nowhere.
  page.metrics.anchors = doc.anchors.length;
  for (const a of doc.anchors) {
    if (a.href === null) page.fail("href", "<a> without an href");
    else if (a.href.trim() === "") page.fail("href", 'empty href=""');
    else if (a.href.trim() === "#") page.fail("href", 'href="#"');
    else if (/^javascript:/i.test(a.href.trim())) page.fail("href", `javascript: link "${a.href.slice(0, 40)}"`);
  }

  // Structured data.
  page.metrics.jsonLd = doc.jsonLd.length;
  doc.jsonLd.forEach((raw, index) => {
    let data;
    try {
      data = JSON.parse(raw);
    } catch (error) {
      page.fail("jsonld", `block ${index + 1} does not parse: ${String(error.message).slice(0, 80)}`);
      return;
    }
    const found = new Set();
    walkJsonLd(data, found);
    if (found.size > 0) page.fail("jsonld", `block ${index + 1} contains ${[...found].join(", ")}`);
  });

  // Indexing signal against the environment.
  const metaRobots = metaContent(doc, "robots");
  const headerRobots = page.headers.get("x-robots-tag") ?? "";
  const noindex = /noindex/i.test(metaRobots) || /noindex/i.test(headerRobots);
  page.metrics.robots = [metaRobots && `meta: ${metaRobots}`, headerRobots && `header: ${headerRobots}`].filter(Boolean).join(" · ") || "none";
  if (env.isPublic && noindex) page.fail("robots", `the public site lists this page but it says noindex (${page.metrics.robots})`);
  if (!env.isPublic && !noindex) page.fail("robots", "a preview page must carry noindex (meta robots or X-Robots-Tag)");

  if (pagePath === `/${lang}` && !doc.ids.has("story")) page.warn("anchors", 'the homepage has no id="story" (legacy "about" URLs redirect to it)');
}

/* ───────────── Main ───────────── */

function makePage(pagePath) {
  const page = {
    path: pagePath,
    lang: pagePath.split("/")[1],
    status: 0,
    failures: [],
    warnings: [],
    metrics: {},
    doc: null,
    headers: new Headers(),
    canonical: null,
    canonicalOrigin: null,
    alternates: {},
    ogImage: null,
    fail(check, message) {
      this.failures.push({ check, message });
    },
    warn(check, message) {
      this.warnings.push({ check, message });
    },
  };
  return page;
}

async function main() {
  const site = { failures: [], warnings: [], notes: [] };
  const siteFail = (check, message) => site.failures.push({ check, message });
  const siteWarn = (check, message) => site.warnings.push({ check, message });

  // 0. Is the server there, and which environment is it?
  const robots = await request(`${BASE}/robots.txt`);
  if (robots.status === 0) {
    const message = `Cannot reach ${BASE} (${robots.error}). Start the site first; this script never starts it.`;
    if (JSON_OUT) console.log(JSON.stringify({ base: BASE, error: message }, null, 2));
    else console.error(message);
    process.exit(2);
  }
  const robotsLines = robots.body.split(/\r?\n/).map((l) => l.trim());
  const sitemapLine = robotsLines.find((l) => /^sitemap:/i.test(l)) ?? null;
  const disallowAll = robotsLines.some((l) => /^disallow:\s*\/\s*$/i.test(l));
  const isPublic = robots.status === 200 && sitemapLine !== null && !disallowAll;
  const env = { isPublic, robotsStatus: robots.status, sitemapLine, disallowAll };

  if (robots.status !== 200) siteFail("robots.txt", `/robots.txt answered ${robots.status}`);
  else if (!isPublic) {
    if (!disallowAll) siteFail("robots.txt", 'a preview must answer "Disallow: /" for every crawler');
    if (sitemapLine) siteFail("robots.txt", "a preview must not advertise a sitemap");
  } else {
    for (const blocked of ["/api/", "/_qa/"]) {
      if (!robotsLines.some((l) => new RegExp(`^disallow:\\s*${blocked.replace(/\//g, "\\/")}\\s*$`, "i").test(l))) {
        siteFail("robots.txt", `the public robots.txt does not disallow ${blocked}`);
      }
    }
  }

  // 1. The page list.
  const sourceRoutes = routesFromSource();
  if (sourceRoutes && JSON.stringify(sourceRoutes) !== JSON.stringify(ROUTES)) {
    siteWarn("routes", "the built-in route list no longer matches src/lib/routes.ts — update ROUTES in scripts/check-content.mjs");
  }
  const flags = { ...DEFAULT_FLAGS, ...(flagsFromSource() ?? {}) };
  const builtIn = LOCALES.flatMap((lang) => publishedPaths(ROUTES, flags).map((p) => `/${lang}${p}`));

  const sitemap = await request(`${BASE}/sitemap.xml`);
  let sitemapPaths = null;
  let sitemapOrigins = new Set();
  if (sitemap.status === 200) {
    const locs = [...sitemap.body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => decodeEntities(m[1]));
    sitemapPaths = [];
    for (const loc of locs) {
      try {
        const url = new URL(loc);
        sitemapOrigins.add(url.origin);
        sitemapPaths.push(url.pathname.replace(/\/+$/, "") || "/");
      } catch {
        siteFail("sitemap", `sitemap <loc> is not an absolute URL: "${loc}"`);
      }
    }
    const urlBlocks = sitemap.body.split("<url>").slice(1);
    const incomplete = urlBlocks.filter((b) => !["th", "en", "x-default"].every((code) => b.includes(`hreflang="${code}"`))).length;
    if (incomplete > 0) siteFail("sitemap", `${incomplete} sitemap entries lack a th / en / x-default alternate`);
    if (sitemapOrigins.size > 1) siteFail("sitemap", `sitemap mixes origins: ${[...sitemapOrigins].join(", ")}`);
  } else if (isPublic) {
    siteFail("sitemap", `/sitemap.xml answered ${sitemap.status}`);
  } else {
    siteWarn("sitemap", `/sitemap.xml answered ${sitemap.status}`);
  }

  if (sitemapPaths) {
    const inSitemap = new Set(sitemapPaths);
    const expected = new Set(builtIn);
    const missing = builtIn.filter((p) => !inSitemap.has(p));
    const extra = sitemapPaths.filter((p) => !expected.has(p));
    if (missing.length > 0) siteFail("sitemap", `published pages missing from the sitemap: ${missing.join(", ")}`);
    if (extra.length > 0) siteFail("sitemap", `sitemap lists pages the route table does not publish: ${extra.join(", ")}`);
    if (sitemapPaths.some((p) => /styleguide/.test(p))) siteFail("sitemap", "the sitemap lists /styleguide");
  }

  const allPaths = isPublic && sitemapPaths ? [...new Set(sitemapPaths)] : builtIn;
  const paths = ONLY ? allPaths.filter((p) => p === ONLY || p.startsWith(ONLY)) : allPaths;
  site.notes.push(`pages from ${isPublic && sitemapPaths ? "/sitemap.xml" : "the built-in route list"} (${paths.length}${ONLY ? ` of ${allPaths.length}, --only ${ONLY}` : ""})`);

  // 2. Read every page (one at a time: a dev server compiles each route on first request).
  const pages = [];
  const byPath = new Map();
  const readPage = async (pagePath) => {
    const page = makePage(pagePath);
    const res = await request(`${BASE}${pagePath}`);
    page.status = res.status;
    page.headers = res.headers;
    if (res.status !== 200) {
      const why = res.status === 0 ? `no response (${res.error})` : res.location ? `status ${res.status} → ${res.location}` : `status ${res.status}`;
      page.fail("status", `${why} (need 200)`);
    } else {
      page.doc = parseHtml(res.body);
    }
    byPath.set(pagePath, page);
    return page;
  };
  for (const pagePath of paths) {
    const page = await readPage(pagePath);
    pages.push(page);
    if (!JSON_OUT) process.stderr.write(`\rreading ${pages.length}/${paths.length} `);
  }
  if (!JSON_OUT) process.stderr.write("\r" + " ".repeat(24) + "\r");

  for (const page of pages) if (page.doc) inspectPage(page, env);

  // 3. Across pages: uniqueness, reciprocity, one canonical origin.
  for (const key of ["title", "description"]) {
    const seen = new Map();
    for (const page of pages) {
      const text = page.metrics[key];
      if (!text) continue;
      if (!seen.has(text)) seen.set(text, []);
      seen.get(text).push(page.path);
    }
    for (const page of pages) {
      const sharers = (seen.get(page.metrics[key]) ?? []).filter((p) => p !== page.path);
      if (sharers.length > 0) page.fail(key, `${key} is not unique: shared with ${sharers.join(", ")}`);
    }
  }

  for (const page of pages) {
    if (!page.doc || !page.canonical) continue;
    for (const code of LOCALES) {
      if (code === page.lang) continue;
      const href = page.alternates[code];
      if (!href || !/^https?:\/\//i.test(href)) continue;
      const partnerPath = new URL(href).pathname;
      let partner = byPath.get(partnerPath);
      if (!partner) {
        partner = await readPage(partnerPath);
        if (partner.doc) inspectPage(partner, env);
      }
      if (!partner.doc) page.fail("hreflang", `hreflang="${code}" target ${partnerPath} answered ${partner.status}`);
      else if (partner.alternates[page.lang] !== page.canonical) {
        page.fail("hreflang", `not reciprocal: ${partnerPath} does not list this page as hreflang="${page.lang}"`);
      }
    }
  }

  const canonicalOrigins = new Set(pages.map((p) => p.canonicalOrigin).filter(Boolean));
  if (canonicalOrigins.size > 1) siteFail("canonical", `canonicals use more than one origin: ${[...canonicalOrigins].join(", ")}`);
  for (const origin of canonicalOrigins) {
    if (sitemapOrigins.size === 1 && !sitemapOrigins.has(origin)) siteFail("canonical", `canonical origin ${origin} differs from the sitemap's ${[...sitemapOrigins][0]}`);
  }
  const ownOrigins = new Set([BASE_ORIGIN, ...canonicalOrigins, ...sitemapOrigins]);

  // 4. Internal link targets and local images, each requested once.
  const targets = new Map();
  const fragmentChecks = [];
  const want = (key, kind) => {
    if (!targets.has(key)) targets.set(key, { key, kind, status: null, ids: null, location: null, error: null });
    return targets.get(key);
  };
  const local = (href, pageUrl) => {
    try {
      const url = new URL(href, pageUrl);
      if (!/^https?:$/.test(url.protocol) || !ownOrigins.has(url.origin)) return null;
      return url;
    } catch {
      return null;
    }
  };

  for (const page of pages) {
    if (!page.doc) continue;
    page.linkTargets = [];
    page.assetTargets = [];
    const pageUrl = `${BASE}${page.path}`;
    for (const a of page.doc.anchors) {
      const href = (a.href ?? "").trim();
      if (href === "" || href === "#" || /^(mailto|tel|sms|javascript|data|blob):/i.test(href)) continue;
      if (/^[a-z][a-z0-9+.-]*:/i.test(href) && !/^https?:/i.test(href)) continue;
      const url = local(href, pageUrl);
      if (!url) {
        page.metrics.external = (page.metrics.external ?? 0) + 1;
        continue;
      }
      if (!href.startsWith("/") && !href.startsWith("#") && !/^https?:/i.test(href)) page.warn("href", `relative href "${href}" (internal links are root-relative)`);
      const key = `${url.pathname.replace(/\/+$/, "") || "/"}${url.search}`;
      const fragment = url.hash.length > 1 ? decodeURIComponent(url.hash.slice(1)) : null;
      if (key === page.path) {
        if (fragment && !page.doc.ids.has(fragment)) page.warn("anchors", `link to #${fragment}, but this page has no element with that id`);
        continue;
      }
      if (CHECK_LINKS) {
        page.linkTargets.push({ key, href });
        want(key, "page");
        if (fragment) fragmentChecks.push({ page, key, fragment, href });
      }
    }
    if (CHECK_ASSETS) {
      for (const img of page.doc.images) {
        if (!img.src || /^(data|blob):/i.test(img.src)) continue;
        const url = local(img.src, pageUrl);
        if (!url) {
          page.fail("img", `image is loaded from another origin: ${img.src.slice(0, 80)}`);
          continue;
        }
        const key = `${url.pathname}${url.search}`;
        page.assetTargets.push({ key, what: "image" });
        want(key, "asset");
      }
      if (page.ogImage) {
        const url = local(page.ogImage, pageUrl);
        if (url) {
          const key = `${url.pathname}${url.search}`;
          page.assetTargets.push({ key, what: "og:image" });
          want(key, "asset");
        } else page.warn("og", `og:image is on another origin and was not requested: ${page.ogImage}`);
      }
    }
  }

  await pool([...targets.values()], 6, async (target) => {
    const known = byPath.get(target.key);
    if (known) {
      target.status = known.status;
      target.ids = known.doc?.ids ?? null;
      return;
    }
    if (target.kind === "asset") {
      let res = await request(`${BASE}${target.key}`, "HEAD");
      if (res.status === 405 || res.status === 501) res = await request(`${BASE}${target.key}`);
      target.status = res.status;
      target.error = res.error ?? null;
      return;
    }
    const res = await request(`${BASE}${target.key}`);
    target.status = res.status;
    target.location = res.location;
    target.error = res.error ?? null;
    if (res.status === 200 && /html/.test(res.type)) target.ids = parseHtml(res.body).ids;
  });

  for (const page of pages) {
    const reported = new Set();
    for (const { key, href } of page.linkTargets ?? []) {
      const target = targets.get(key);
      if (!target || target.status === 200 || reported.has(key)) continue;
      reported.add(key);
      const why = target.status === 0 ? `no response (${target.error})` : target.location ? `${target.status} → ${target.location}` : String(target.status);
      page.fail("links", `link to ${href} answers ${why}`);
    }
    for (const { key, what } of page.assetTargets ?? []) {
      const target = targets.get(key);
      if (!target || target.status === 200 || reported.has(key)) continue;
      reported.add(key);
      page.fail(what === "og:image" ? "og" : "img", `${what} ${key} answers ${target.status === 0 ? `no response (${target.error})` : target.status}`);
    }
    page.metrics.links = new Set((page.linkTargets ?? []).map((t) => t.key)).size;
  }
  for (const { page, key, fragment, href } of fragmentChecks) {
    const target = targets.get(key);
    if (target?.status === 200 && target.ids && !target.ids.has(fragment)) page.warn("anchors", `link to ${href}: the target page has no id="${fragment}"`);
  }

  // 5. URLs that must not exist.
  if (!ONLY) {
    const flaggedOff = ROUTES.filter(([, , flag]) => flag !== null && !flags[flag]).map(([, routePath]) => routePath);
    const probes = [];
    for (const lang of LOCALES) {
      probes.push([`/${lang}/check-content-no-such-page`, "an unknown URL"]);
      for (const routePath of flaggedOff) probes.push([`/${lang}${routePath}`, "a route behind a switched-off flag"]);
    }
    await pool(probes, 4, async ([probePath, what]) => {
      const res = await request(`${BASE}${probePath}`);
      if (res.status !== 404) siteFail("404", `${probePath} (${what}) answers ${res.status === 0 ? `no response (${res.error})` : res.status}, expected 404`);
    });
  }

  // 6. Report.
  const failed = pages.filter((p) => p.failures.length > 0);
  const summary = {
    pages: pages.length,
    passed: pages.length - failed.length,
    failed: failed.length,
    failures: pages.reduce((sum, p) => sum + p.failures.length, 0) + site.failures.length,
    warnings: pages.reduce((sum, p) => sum + p.warnings.length, 0) + site.warnings.length,
    requests: targets.size,
  };
  const ok = summary.failures === 0;

  if (JSON_OUT) {
    console.log(
      JSON.stringify(
        {
          base: BASE,
          environment: { public: isPublic, robots: disallowAll ? "disallow all" : sitemapLine ? "open, sitemap advertised" : "open", canonicalOrigins: [...canonicalOrigins] },
          summary,
          ok,
          site,
          pages: pages.map((p) => ({ path: p.path, status: p.status, ok: p.failures.length === 0, metrics: p.metrics, failures: p.failures, warnings: p.warnings })),
        },
        null,
        2,
      ),
    );
    process.exit(ok ? 0 : 1);
  }

  const CHECKS = ["h1", "lang", "title", "description", "canonical", "hreflang", "og", "img", "text", "href", "links", "jsonld", "robots"];
  const HEAD = ["PAGE", "ST", "H1", "LANG", "TITLE", "DESC", "CANON", "HREFL", "OG", "IMG", "TEXT", "HREF", "LINKS", "LD", "ROBOT", "RESULT"];
  const rows = pages.map((p) => {
    const bad = new Set(p.failures.map((f) => f.check));
    if (!p.doc) return [p.path, String(p.status), ...CHECKS.map(() => "-"), "FAIL"];
    const cell = (check, good) => (bad.has(check) ? "FAIL" : good);
    return [
      p.path,
      String(p.status),
      cell("h1", String(p.doc.h1)),
      cell("lang", p.doc.lang ?? "?"),
      `${p.metrics.titleLength}${bad.has("title") ? "!" : ""}`,
      `${p.metrics.descriptionLength}${bad.has("description") ? "!" : ""}`,
      cell("canonical", "ok"),
      cell("hreflang", "ok"),
      cell("og", "ok"),
      cell("img", String(p.metrics.images)),
      cell("text", "ok"),
      cell("href", "ok"),
      cell("links", CHECK_LINKS ? String(p.metrics.links ?? 0) : "skip"),
      cell("jsonld", String(p.metrics.jsonLd)),
      cell("robots", "ok"),
      p.failures.length === 0 ? "pass" : "FAIL",
    ];
  });
  const widths = HEAD.map((h, i) => Math.max(h.length, ...rows.map((r) => r[i].length)));
  const line = (cells) => cells.map((c, i) => c.padEnd(widths[i])).join("  ").trimEnd();

  console.log(`check-content  ${BASE}  ·  ${isPublic ? "PUBLIC site" : "preview"} (robots.txt: ${disallowAll ? "Disallow: /" : sitemapLine ?? "open"})`);
  for (const note of site.notes) console.log(note);
  if (canonicalOrigins.size > 0) console.log(`canonical origin: ${[...canonicalOrigins].join(", ")}`);
  console.log("");
  console.log(line(HEAD));
  console.log(widths.map((w) => "-".repeat(w)).join("  "));
  for (const row of rows) console.log(line(row));
  console.log("");
  console.log("IMG = images on the page · LINKS = distinct internal targets requested · LD = JSON-LD blocks · TITLE/DESC = length in code points");

  if (site.failures.length > 0) {
    console.log("\nSITE-WIDE FAILURES");
    for (const f of site.failures) console.log(`  [${f.check}] ${f.message}`);
  }
  if (failed.length > 0) {
    console.log("\nPAGE FAILURES");
    for (const p of failed) {
      console.log(`  ${p.path}`);
      for (const f of p.failures) console.log(`    [${f.check}] ${f.message}`);
    }
  }
  const warned = pages.filter((p) => p.warnings.length > 0);
  if (site.warnings.length > 0 || warned.length > 0) {
    console.log("\nWARNINGS (do not fail the run)");
    for (const w of site.warnings) console.log(`  [${w.check}] ${w.message}`);
    for (const p of warned) {
      console.log(`  ${p.path}`);
      for (const w of p.warnings) console.log(`    [${w.check}] ${w.message}`);
    }
  }

  console.log(
    `\n${ok ? "PASS" : "FAIL"}  ${summary.passed}/${summary.pages} pages pass · ${summary.failures} failure${summary.failures === 1 ? "" : "s"} · ${summary.warnings} warning${summary.warnings === 1 ? "" : "s"} · ${summary.requests} link/image targets requested`,
  );
  process.exit(ok ? 0 : 1);
}

await main();
