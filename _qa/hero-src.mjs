// Which hero file a browser actually picks, per engine and pixel density.
//   node _qa/hero-src.mjs [base] [route ...]
import { chromium, webkit } from "playwright";
const args = process.argv.slice(2);
const BASE = (args[0] && /^https?:/.test(args[0]) ? args.shift() : "http://127.0.0.1:8352").replace(/\/+$/, "");
const routes = args.length ? args : ["/en", "/en/stay/executive-pool-spa", "/th/dining"];
for (const [name, engine] of [["chromium", chromium], ["webkit", webkit]]) {
  const browser = await engine.launch();
  for (const dpr of [1, 2, 3]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: dpr });
    for (const route of routes) {
      const page = await context.newPage();
      await page.goto(BASE + route, { waitUntil: "load" });
      await page.waitForTimeout(700);
      const src = await page.evaluate(() => {
        const img = document.querySelector('img[fetchpriority="high"]') ?? document.querySelector("header img, main img");
        return img ? (img.currentSrc || img.src).split("/").pop() : "none";
      });
      console.log(`${name.padEnd(9)} ${dpr}x  ${route.padEnd(30)} ${src}`);
      await page.close();
    }
    await context.close();
  }
  await browser.close();
}
