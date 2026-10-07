// Page weight on first load (no scrolling) against the static build: node _qa/weight.mjs [base] [path ...]
import { chromium } from "playwright";
const args = process.argv.slice(2);
const BASE = (args[0] && /^https?:/.test(args[0]) ? args.shift() : "http://127.0.0.1:8353/phukumhom").replace(/\/+$/, "");
const paths = args.length ? args : ["en/", "th/", "en/stay/", "en/stay/executive-pool-spa/", "en/dining/", "en/gallery/", "en/contact/", "th/faq/"];
const browser = await chromium.launch();
for (const width of [390, 1440]) {
  for (const path of paths) {
    const context = await browser.newContext({ viewport: { width, height: width < 700 ? 844 : 900 }, deviceScaleFactor: width < 700 ? 3 : 1, isMobile: width < 700 });
    const page = await context.newPage();
    const sizes = { document: 0, script: 0, stylesheet: 0, image: 0, font: 0, other: 0 };
    let largestImage = 0, requests = 0;
    page.on("response", async (r) => {
      const type = r.request().resourceType();
      const len = Number(r.headers()["content-length"] ?? 0);
      requests++;
      sizes[type in sizes ? type : "other"] += len;
      if (type === "image" && len > largestImage) largestImage = len;
    });
    await page.goto(`${BASE}/${path}`, { waitUntil: "load" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(2500);
    const kb = (n) => Math.round(n / 1024);
    const total = Object.values(sizes).reduce((a, b) => a + b, 0);
    console.log(`${String(width).padEnd(5)} /${path.padEnd(30)} ${String(requests).padStart(3)} req  total ${String(kb(total)).padStart(5)} KB  (html ${kb(sizes.document)}, js ${kb(sizes.script)}, css ${kb(sizes.stylesheet)}, img ${kb(sizes.image)}, font ${kb(sizes.font)})  largest image ${kb(largestImage)} KB`);
    await context.close();
  }
}
await browser.close();
