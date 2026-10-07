#!/usr/bin/env node
// Records which pages exist under src/app/[lang], so links to pages that are not built yet can fall back
// to the matching homepage chapter instead of a 404 (see src/lib/routes.ts).
//
//   node scripts/detect-routes.mjs [projectRoot]   → src/lib/built-routes.generated.json
//
// Run it after adding or removing a page. The Pages export runs it automatically.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const app = path.join(root, "src/app/[lang]");
const has = (...segments) => fs.existsSync(path.join(app, ...segments, "page.tsx"));

const built = ["home"].filter(() => has());
for (const id of ["stay", "dining", "experiences", "gallery", "location", "contact", "faq", "privacy", "terms", "gatherings", "offers"]) {
  if (has(id)) built.push(id);
}
if (has("stay", "[room]")) built.push("room");

const out = path.join(root, "src/lib/built-routes.generated.json");
const next = JSON.stringify(built, null, 2) + "\n";
if (!fs.existsSync(out) || fs.readFileSync(out, "utf8") !== next) fs.writeFileSync(out, next);
console.log(`built routes: ${built.join(", ")}`);
