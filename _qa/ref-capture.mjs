// Captures a reference site as a sequence of viewport screenshots while scrolling, so scroll-driven
// reveals and smooth-scroll libraries behave as they do for a visitor.
//   node _qa/ref-capture.mjs <url> <outPrefix> [width] [height] [steps] [mobile]
import { chromium } from "playwright";

const [url, prefix, w = "1440", h = "900", steps = "14", mobile = ""] = process.argv.slice(2);
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: Number(w), height: Number(h) },
  deviceScaleFactor: 1,
  isMobile: mobile === "mobile",
  hasTouch: mobile === "mobile",
});
const page = await context.newPage();
await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(9000); // loader + hero reveal
await page.screenshot({ path: `${prefix}-00.png` });
const total = await page.evaluate(() => document.documentElement.scrollHeight);
const n = Number(steps);
for (let i = 1; i <= n; i++) {
  const y = Math.round(((total - Number(h)) * i) / n);
  await page.mouse.wheel(0, 0);
  await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${prefix}-${String(i).padStart(2, "0")}.png` });
}
console.log(JSON.stringify({ url, total, shots: n + 1 }));
await browser.close();
