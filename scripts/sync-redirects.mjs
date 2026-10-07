#!/usr/bin/env node
// Flattens docs/redirects.json (the reviewed legacy-URL manifest) into the runtime table read by src/proxy.ts.
//   node scripts/sync-redirects.mjs
// Each legacy path maps to exactly one destination; the old query string never decides the target
// (the PHP files ignore it), so query variants collapse into one row.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rows = JSON.parse(fs.readFileSync(path.join(root, "docs/redirects.json"), "utf8"));
const table = {};
for (const r of rows) {
  const to = r.destination.replace("filter=rooftops-spa", "filter=rooftops");
  // The old form handler receives POSTs: 303 turns a stray POST into a GET of the contact page.
  const status = r.source.endsWith("/send-email.php") ? 303 : r.permanent ? 308 : 307;
  const existing = table[r.source];
  if (existing && (existing.to !== to || existing.status !== status)) throw new Error(`conflicting rows for ${r.source}`);
  table[r.source] = { to, status };
}
fs.writeFileSync(path.join(root, "src/content/legacy-redirects.json"), JSON.stringify(table, null, 2) + "\n");
console.log(`${Object.keys(table).length} legacy paths`);
