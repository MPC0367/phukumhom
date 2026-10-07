#!/usr/bin/env node
// Builds the static site for GitHub Pages.
//
//   node scripts/export-pages.mjs                      local: builds in a sibling folder, result copied to ./out
//   node scripts/export-pages.mjs --in-place           CI: builds in this checkout (it is thrown away afterwards)
//   options: --base /phukumhom   the path prefix of the project site ("" for a custom domain)
//            --origin https://mpc0367.github.io        scheme + host the site is served from
//            --fresh                                    reinstall dependencies in the build folder
//
// Why a separate folder locally: GitHub Pages has no server, so the export must drop the things only a
// server can do (the request proxy, the catch-all 404 route) and it must not disturb a running `next dev`.
// The script mirrors the source into ../phukumhom-pages-build, prunes it there, builds, and copies the
// result back to ./out. Nothing in this folder is modified except ./out and src/lib/built-routes.generated.json.
//
// What the export changes compared with the Node build:
//   - src/proxy.ts is left out: locale choice for "/" becomes a small root index.html, and legacy .php
//     redirects need the real host (docs for the deployment live with the studio).
//   - src/app/[lang]/[...rest] is left out; a real page (page-not-found) is exported and copied to 404.html,
//     which GitHub Pages serves for unknown URLs.
//   - the internal lab and style-guide pages are left out.
//   - a footer notice says this is a concept preview, not the resort's official website.
//   - pages stay "noindex": the preview must not compete with the resort's real site in search.
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] !== undefined && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};

const inPlace = flag("in-place");
const base = opt("base", "/phukumhom").replace(/\/+$/, "");
const origin = opt("origin", "https://mpc0367.github.io").replace(/\/+$/, "").toLowerCase();
const tree = inPlace ? root : path.resolve(root, "..", "phukumhom-pages-build");
const isWindows = process.platform === "win32";

function run(cmd, args, options = {}) {
  const res = spawnSync(cmd, args, { stdio: "inherit", cwd: tree, shell: isWindows, ...options });
  if (res.status !== 0) throw new Error(`${cmd} ${args.join(" ")} exited with ${res.status}`);
}
const rm = (...p) => fs.rmSync(path.join(tree, ...p), { recursive: true, force: true });
const exists = (...p) => fs.existsSync(path.join(tree, ...p));

/* ── 1. A clean copy of the source (local only) ── */
if (!inPlace) {
  fs.mkdirSync(tree, { recursive: true });
  for (const dir of ["src", "public", "out", ".next", "docs"]) rm(dir);
  for (const dir of ["src", "public"]) fs.cpSync(path.join(root, dir), path.join(tree, dir), { recursive: true });
  for (const file of ["package.json", "package-lock.json", "tsconfig.json", "next.config.ts"]) fs.copyFileSync(path.join(root, file), path.join(tree, file));
  fs.mkdirSync(path.join(tree, "scripts"), { recursive: true });
  fs.copyFileSync(path.join(root, "scripts/detect-routes.mjs"), path.join(tree, "scripts/detect-routes.mjs"));

  const lockHash = crypto.createHash("sha1").update(fs.readFileSync(path.join(root, "package-lock.json"))).digest("hex");
  const stamp = path.join(tree, ".lockhash");
  const installed = fs.existsSync(path.join(tree, "node_modules/next/package.json")) && fs.existsSync(stamp) && fs.readFileSync(stamp, "utf8") === lockHash;
  if (!installed || flag("fresh")) {
    console.log("installing dependencies in the build folder …");
    run(isWindows ? "npm.cmd" : "npm", ["ci", "--no-audit", "--no-fund"], { env: { ...process.env, PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: "1" } });
    fs.writeFileSync(stamp, lockHash);
  }
}

/* ── 2. Prune what a static host cannot serve ── */
rm("src", "proxy.ts");
rm("src", "app", "[lang]", "[...rest]");
rm("src", "app", "[lang]", "lab");
rm("src", "app", "[lang]", "styleguide");
rm("src", "app", "api");

// The not-found page as a real, exportable route. It becomes /404.html below.
const NOT_FOUND_ROUTE = "page-not-found";
fs.mkdirSync(path.join(tree, "src/app/[lang]", NOT_FOUND_ROUTE), { recursive: true });
fs.writeFileSync(
  path.join(tree, "src/app/[lang]", NOT_FOUND_ROUTE, "page.tsx"),
  `import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NotFoundView } from "@/components/site/NotFoundView";
import { notFoundPageMetadata } from "@/components/site/not-found-metadata";
import { isLocale } from "@/i18n/config";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? notFoundPageMetadata(lang) : {};
}

export default async function PageNotFound({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <NotFoundView lang={lang} />;
}
`,
);

// Metadata routes must be explicitly static for an export.
for (const file of ["src/app/robots.ts", "src/app/sitemap.ts"]) {
  if (!exists(file)) continue;
  const p = path.join(tree, file);
  const src = fs.readFileSync(p, "utf8");
  if (!/export const dynamic\s*=/.test(src)) fs.writeFileSync(p, `${src}\nexport const dynamic = "force-static";\n`);
}

// Which pages exist decides where links to unbuilt pages point (src/lib/routes.ts).
run("node", ["scripts/detect-routes.mjs", tree], { shell: false });
if (!inPlace) {
  // Keep the working copy's record in step with the pages that actually exist (lab pages do not count).
  spawnSync("node", [path.join(root, "scripts/detect-routes.mjs"), root], { stdio: "inherit" });
}

/* ── 3. Build ── */
const env = {
  ...process.env,
  PAGES_EXPORT: "1",
  BASE_PATH: base,
  NEXT_PUBLIC_SITE_ORIGIN: `${origin}${base}`,
  NEXT_PUBLIC_PREVIEW_NOTICE: "1",
  NEXT_TELEMETRY_DISABLED: "1",
};
delete env.SITE_ENV; // a preview is never the public, indexable site
rm("out");
run("node", [path.join("node_modules", "next", "dist", "bin", "next"), "build"], { env, shell: false });

/* ── 4. Finish the folder for GitHub Pages ── */
const out = path.join(tree, "out");

// The router prefetches each route segment from a file named with dots: "__next.$d$lang.__PAGE__.txt".
// A build on Windows writes those segments as nested folders instead ("__next.$d$lang/__PAGE__.txt"), so
// every prefetch 404s and navigation falls back to full page loads. Flatten them to the names the router
// asks for. On Linux (the GitHub Actions build) the files are already flat and this does nothing.
(function flattenSegments(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (entry.name.startsWith("__next.")) {
      (function lift(from, prefix) {
        for (const inner of fs.readdirSync(from, { withFileTypes: true })) {
          const p = path.join(from, inner.name);
          if (inner.isDirectory()) lift(p, `${prefix}.${inner.name}`);
          else fs.renameSync(p, path.join(dir, `${prefix}.${inner.name}`));
        }
      })(full, entry.name);
      fs.rmSync(full, { recursive: true, force: true });
    } else {
      flattenSegments(full);
    }
  }
})(out);
if (!fs.existsSync(path.join(out, "th", "index.html"))) throw new Error("export produced no /th/index.html");

// Underscore folders (_next) are only served when Jekyll is switched off.
fs.writeFileSync(path.join(out, ".nojekyll"), "");

// 404.html: the Thai not-found page; an unknown URL under /en/ is handed to the English one.
const notFoundHtml = fs.readFileSync(path.join(out, "th", NOT_FOUND_ROUTE, "index.html"), "utf8");
const toEnglish = `<script>(function(){var b=${JSON.stringify(base)},p=location.pathname;if(p.indexOf(b+"/en/")===0&&p.indexOf("/${NOT_FOUND_ROUTE}")<0){location.replace(b+"/en/${NOT_FOUND_ROUTE}/")}})()</script>`;
fs.writeFileSync(path.join(out, "404.html"), notFoundHtml.replace("<head>", `<head>${toEnglish}`));

// The root: with no server to read the Accept-Language header, a small page sends the visitor to a
// language — a saved explicit choice first, then the browser's first language, then Thai — and offers both.
fs.writeFileSync(
  path.join(out, "index.html"),
  `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Phukumhom Resort Khao Yai</title>
<script>(function(){var m=document.cookie.match(/(?:^|; )pkh_lang=(th|en)/);var l=m?m[1]:((navigator.language||"").toLowerCase().indexOf("en")===0?"en":"th");location.replace("./"+l+"/"+location.hash)})()</script>
<noscript><meta http-equiv="refresh" content="0; url=./th/"></noscript>
<style>
html{background:#f6f2ea;color:#26312c;font:17px/1.6 "Leelawadee UI","Segoe UI",Tahoma,sans-serif}
body{margin:0;min-height:100vh;display:grid;place-items:center;text-align:center}
p{margin:0 0 1.5rem;letter-spacing:.26em;text-indent:.26em;font-weight:500}
a{display:inline-block;margin:0 .75rem;padding:.75rem 1.5rem;border:1px solid #203d34;border-radius:999px;color:#203d34;text-decoration:none}
a:hover,a:focus-visible{background:#203d34;color:#f6f2ea}
</style>
</head>
<body>
<main>
<p>PHUKUMHOM</p>
<a href="./th/" lang="th" hreflang="th">ภาษาไทย</a><a href="./en/" lang="en" hreflang="en">English</a>
</main>
</body>
</html>
`,
);

/* ── 5. Check the result ── */
const htmlFiles = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name.endsWith(".html")) htmlFiles.push(p);
  }
})(out);

// Every absolute URL in the markup must carry the path prefix, or it 404s on a project site.
const stray = new Map();
if (base) {
  const attr = /\s(?:src|href|action|poster)="(\/(?!\/)[^"]*)"/g;
  const srcset = /\ssrcset="([^"]+)"/gi;
  const ok = (u) => u === base || u.startsWith(`${base}/`);
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, "utf8");
    for (const m of html.matchAll(attr)) if (!ok(m[1])) stray.set(m[1], path.relative(out, file));
    for (const m of html.matchAll(srcset)) {
      for (const part of m[1].split(",")) {
        const u = part.trim().split(/\s+/)[0];
        if (u.startsWith("/") && !u.startsWith("//") && !ok(u)) stray.set(u, path.relative(out, file));
      }
    }
  }
}

let bytes = 0;
let files = 0;
(function size(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) size(p);
    else {
      bytes += fs.statSync(p).size;
      files += 1;
    }
  }
})(out);

if (!inPlace) {
  // Empty ./out rather than removing it: on Windows a folder that a running process (the local Pages
  // stand-in, a shell) has open cannot be deleted, but its contents can be replaced.
  const dest = path.join(root, "out");
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(dest)) fs.rmSync(path.join(dest, entry), { recursive: true, force: true, maxRetries: 8, retryDelay: 250 });
  fs.cpSync(out, dest, { recursive: true });
}

console.log(`\nexported ${htmlFiles.length} pages, ${files} files, ${(bytes / 1048576).toFixed(1)} MB → ${inPlace ? "out" : path.join(root, "out")}`);
console.log(`will be served at ${origin}${base}/`);
if (stray.size) {
  console.error(`\n${stray.size} absolute URL(s) without the "${base}" prefix (they would 404 on the project site):`);
  for (const [url, file] of [...stray].slice(0, 25)) console.error(`  ${url}   in ${file}`);
  process.exitCode = 1;
}
