// Accessibility scan (axe-core, WCAG 2.2 A and AA rules) of the running site: node _qa/axe.mjs [base] [path ...]
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";
const args = process.argv.slice(2);
const BASE = (args[0] && /^https?:/.test(args[0]) ? args.shift() : "http://127.0.0.1:8352").replace(/\/+$/, "");
const INNER = ["stay", "stay/deluxe-balcony", "stay/deluxe-bathtub", "stay/executive-pool-spa", "dining", "experiences", "gallery", "location", "contact", "faq", "privacy", "terms"];
const paths = args.length ? args : ["th", "en", ...INNER.flatMap((p) => [`th/${p}`, `en/${p}`])];
const browser = await chromium.launch();
let total = 0;
for (const width of [1440, 390]) {
  for (const path of paths) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(`${BASE}/${path}`, { waitUntil: "load" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(800);
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    for (const v of result.violations) {
      total += v.nodes.length;
      console.log(`${width} /${path}  [${v.impact}] ${v.id}: ${v.help}`);
      for (const node of v.nodes.slice(0, 3)) console.log(`      ${node.target.join(" ")}  ::  ${(node.failureSummary ?? "").split("\n").slice(1, 2).join(" ").trim().slice(0, 160)}`);
    }
    await context.close();
  }
}
await browser.close();
console.log(total === 0 ? "\nno violations" : `\n${total} violating nodes`);
process.exitCode = total ? 1 : 0;
