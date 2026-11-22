// A LAB diagnostic, not field data: LCP and CLS for a route on the static build, in Chromium, with
// network and CPU throttling applied through the DevTools protocol. One run per profile.
//   node _qa/vitals-lab.mjs [standIn] [route ...]
import { chromium } from "playwright";
const args = process.argv.slice(2);
const BASE = (args[0] && /^https?:/.test(args[0]) ? args.shift() : "http://127.0.0.1:8353/phukumhom").replace(/\/+$/, "");
const routes = args.length ? args : ["/en/", "/th/", "/en/stay/", "/en/stay/executive-pool-spa/"];
const PROFILES = [
  { name: "phone, 4x CPU slowdown, 1.6 Mbps / 150 ms", viewport: { width: 390, height: 844 }, mobile: true, cpu: 4, net: { latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 } },
  { name: "desktop, no throttling", viewport: { width: 1440, height: 900 }, mobile: false, cpu: 1, net: null },
];
const browser = await chromium.launch();
for (const profile of PROFILES) {
  console.log(`\n${profile.name}`);
  for (const route of routes) {
    const context = await browser.newContext({ viewport: profile.viewport, isMobile: profile.mobile, hasTouch: profile.mobile, deviceScaleFactor: profile.mobile ? 3 : 1 });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    if (profile.net) await cdp.send("Network.emulateNetworkConditions", { offline: false, ...profile.net });
    if (profile.cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: profile.cpu });
    await page.addInitScript(() => {
      window.__v = { lcp: 0, cls: 0, lcpEl: "" };
      new PerformanceObserver((list) => { for (const e of list.getEntries()) { window.__v.lcp = e.startTime; window.__v.lcpEl = (e.element?.tagName ?? "") + (e.url ? " " + e.url.split("/").pop() : ""); } }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.__v.cls += e.value; }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(BASE + route, { waitUntil: "load", timeout: 120000 });
    await page.waitForTimeout(4000);
    const v = await page.evaluate(() => ({ ...window.__v, fcp: performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0 }));
    console.log(`  ${route.padEnd(34)} FCP ${String(Math.round(v.fcp)).padStart(5)} ms   LCP ${String(Math.round(v.lcp)).padStart(5)} ms (${v.lcpEl.slice(0, 44)})   CLS ${v.cls.toFixed(3)}`);
    await context.close();
  }
}
await browser.close();
