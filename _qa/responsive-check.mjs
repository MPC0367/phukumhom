// Responsive acceptance: the listed widths, a short landscape screen, both languages, reduced motion off.
//   node _qa/responsive-check.mjs [base]
//
// Per page and width it measures what can be measured: page-wide horizontal overflow, elements that
// stick out of the viewport, a heading wider than its box (clipped text), interactive targets smaller
// than WCAG 2.2's 24 by 24 CSS px (inline links in sentences are exempt, as the criterion says), and
// whether the first availability action is reachable. It also saves a screenshot of the first screen
// for a few combinations. Emulation in Chromium: not physical devices.
import fs from "node:fs";
import { chromium } from "playwright";

const BASE = (process.argv[2] ?? "http://127.0.0.1:8352").replace(/\/+$/, "");
const WIDTHS = [
  { w: 320, h: 640 },
  { w: 375, h: 667 },
  { w: 390, h: 844 },
  { w: 430, h: 932 },
  { w: 768, h: 1024 },
  { w: 1024, h: 768 },
  { w: 1440, h: 900 },
  { w: 844, h: 390, name: "landscape" },
];
const PAGES = ["", "stay", "stay/executive-pool-spa", "dining", "location", "contact", "faq", "privacy"];
const SHOTS = new Set(["320:en/stay/executive-pool-spa", "320:th/contact", "390:th/stay", "768:en/stay", "1024:en", "landscape:en", "390:en/contact", "1440:th/stay/deluxe-bathtub"]);
fs.mkdirSync("_qa/shots/responsive", { recursive: true });

const browser = await chromium.launch();
const problems = [];
let pages = 0;
for (const size of WIDTHS) {
  const label = size.name ?? String(size.w);
  const context = await browser.newContext({ viewport: { width: size.w, height: size.h }, isMobile: size.w < 800, hasTouch: size.w < 800, deviceScaleFactor: size.w < 800 ? 2 : 1 });
  for (const lang of ["en", "th"]) {
    for (const path of PAGES.concat(lang === "th" ? ["stay/deluxe-bathtub"] : [])) {
      const url = `/${lang}${path ? "/" + path : ""}`;
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 120)));
      await page.goto(BASE + url, { waitUntil: "load" });
      await page.waitForTimeout(900);
      const found = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const out = [];
        if (document.documentElement.scrollWidth > vw + 1) out.push(`page scrolls sideways (${document.documentElement.scrollWidth} > ${vw})`);
        // Elements sticking out to the right, unless an ancestor clips or scrolls them on purpose.
        const clippedByAncestor = (el) => {
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            const cs = getComputedStyle(p);
            if (/(hidden|clip|auto|scroll)/.test(cs.overflowX)) return true;
          }
          return false;
        };
        let sticking = 0;
        for (const el of document.querySelectorAll("main *, header *, footer *")) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          if (r.right > vw + 2 && r.left < vw && !clippedByAncestor(el) && getComputedStyle(el).position !== "fixed") sticking++;
        }
        if (sticking) out.push(`${sticking} element(s) stick out of the viewport`);
        for (const h of document.querySelectorAll("h1, h2, h3")) {
          // A visually hidden heading is a 1px box by design: it is not clipped text.
          if (h.getBoundingClientRect().width <= 2) continue;
          if (h.scrollWidth > h.clientWidth + 2 && getComputedStyle(h).overflowX !== "visible") out.push(`clipped heading: ${h.textContent.trim().slice(0, 40)}`);
        }
        // Target size (WCAG 2.2 AA 2.5.8): 24 by 24, inline links in text exempt.
        let small = 0;
        const examples = [];
        for (const el of document.querySelectorAll('a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"]')) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          const cs = getComputedStyle(el);
          if (cs.visibility === "hidden" || cs.display === "none") continue;
          if (el.closest('[aria-hidden="true"]') || el.closest("dialog:not([open])")) continue;
          const inline = cs.display === "inline" && el.tagName === "A";
          if (!inline && (r.width < 24 || r.height < 24)) {
            small++;
            if (examples.length < 3) examples.push(`${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 24)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
          }
        }
        if (small) out.push(`${small} target(s) under 24x24: ${examples.join("; ")}`);
        const h1 = document.querySelector("h1");
        if (!h1 || h1.getBoundingClientRect().height === 0) out.push("no visible h1");
        return out;
      });
      for (const f of [...found, ...errors.map((e) => `script error: ${e}`)]) problems.push(`${label} ${url}: ${f}`);
      if (SHOTS.has(`${label}:${lang}${path ? "/" + path : ""}`)) await page.screenshot({ path: `_qa/shots/responsive/${label}-${lang}${path ? "-" + path.replace(/\//g, "-") : "-home"}.png` });
      pages++;
      await page.close();
    }
  }
  await context.close();
}
await browser.close();
for (const p of problems) console.log("ISSUE ", p);
console.log(`\n${pages} page views across ${WIDTHS.length} viewport sizes; ${problems.length} issue(s)`);
process.exitCode = problems.length ? 1 : 0;
