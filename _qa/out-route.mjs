// Serves the static export (out/) to a Playwright browser context without running a server: every
// request to ORIGIN/phukumhom/... is answered from out/ the way the Pages stand-in and GitHub Pages
// answer it (a folder gets its index.html). Use it when no stand-in can be started.
//
//   import { ORIGIN, serveOut } from "./out-route.mjs";
//   await serveOut(context);  await page.goto(ORIGIN + "/phukumhom/th/");

import fs from "node:fs";
import path from "node:path";

export const ORIGIN = "http://phukumhom.out";
const OUT = path.resolve("out");
const BASE = "/phukumhom";
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
};

export async function serveOut(context) {
  await context.route(`${ORIGIN}/**`, async (route) => {
    const url = new URL(route.request().url());
    let rel = decodeURIComponent(url.pathname);
    if (!rel.startsWith(BASE)) return route.fulfill({ status: 404, body: "" });
    rel = rel.slice(BASE.length) || "/";
    let file = path.join(OUT, rel);
    if (rel.endsWith("/")) file = path.join(file, "index.html");
    else if (!path.extname(file) && fs.existsSync(path.join(file, "index.html"))) {
      return route.fulfill({ status: 301, headers: { location: url.pathname + "/" + url.search } });
    }
    if (!file.startsWith(OUT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      const notFound = path.join(OUT, "404.html");
      return route.fulfill({ status: 404, contentType: TYPES[".html"], body: fs.existsSync(notFound) ? fs.readFileSync(notFound) : "" });
    }
    return route.fulfill({ status: 200, contentType: TYPES[path.extname(file)] ?? "application/octet-stream", body: fs.readFileSync(file) });
  });
}
