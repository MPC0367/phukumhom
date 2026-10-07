#!/usr/bin/env node
// A local stand-in for GitHub Pages, to check the export before it is published.
//
//   node scripts/serve-pages.mjs [--port 8353] [--base /phukumhom] [--dir out]
//
// It behaves like Pages where it matters: the site lives under a path prefix, a folder URL serves its
// index.html (and a folder without a trailing slash redirects to the slash), paths are case-sensitive,
// and anything unknown gets 404.html with status 404. No rewrites, no headers, no server logic.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : fallback;
};
const port = Number(opt("port", 8353));
const base = opt("base", "/phukumhom").replace(/\/+$/, "");
const dir = path.resolve(root, opt("dir", "out"));

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".map": "application/json",
};

/** True only when every segment exists with exactly this spelling (Windows would otherwise forgive case). */
function existsExact(file) {
  const rel = path.relative(dir, file);
  if (rel.startsWith("..")) return false;
  let current = dir;
  for (const segment of rel.split(path.sep).filter(Boolean)) {
    if (!fs.existsSync(current) || !fs.readdirSync(current).includes(segment)) return false;
    current = path.join(current, segment);
  }
  return fs.existsSync(current);
}

function send(res, status, file) {
  res.writeHead(status, {
    "Content-Type": TYPES[path.extname(file)] ?? "application/octet-stream",
    "Content-Length": fs.statSync(file).size,
    "Cache-Control": "no-cache",
  });
  // A HEAD request gets the headers only, as on the real host.
  if (res.req.method === "HEAD") return res.end();
  fs.createReadStream(file).pipe(res);
}

http
  .createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === "/") {
      res.writeHead(302, { Location: `${base}/` });
      return res.end();
    }
    const notFound = () => {
      const page = path.join(dir, "404.html");
      if (fs.existsSync(page)) return send(res, 404, page);
      res.writeHead(404);
      res.end("404");
    };
    if (base && pathname !== base && !pathname.startsWith(`${base}/`)) return notFound();
    pathname = pathname.slice(base.length) || "/";
    const file = path.join(dir, pathname);
    if (!existsExact(file)) return notFound();
    if (fs.statSync(file).isDirectory()) {
      if (!pathname.endsWith("/")) {
        res.writeHead(301, { Location: `${base}${pathname}/${url.search}` });
        return res.end();
      }
      const index = path.join(file, "index.html");
      return fs.existsSync(index) ? send(res, 200, index) : notFound();
    }
    send(res, 200, file);
  })
  .listen(port, "127.0.0.1", () => console.log(`Pages stand-in: http://127.0.0.1:${port}${base}/  (serving ${dir})`));
