#!/usr/bin/env node
// Screenshot + quick health probe for one page, driven by Playwright (Chromium or WebKit).
//
//   node _qa/shot.mjs /th --w 1440 --h 900 --full --out _qa/shots/home-th-1440.png
//   node _qa/shot.mjs /en/stay --w 390 --h 844 --mobile --engine webkit
//   node _qa/shot.mjs /th --w 1440 --scroll 1800            (viewport capture after scrolling)
//   node _qa/shot.mjs /th --w 1440 --sel "#rooms"           (capture one element)
//   node _qa/shot.mjs /th --w 390 --reduced                 (prefers-reduced-motion)
//   node _qa/shot.mjs /th --w 1440 --nojs                   (JavaScript disabled)
//
// Prints one JSON line: status, console errors, failed requests, broken images, horizontal overflow, page height.
// The dev server must already be running (preview_start "phukumhom", http://127.0.0.1:8352).
import fs from "node:fs";
import path from "node:path";
import { chromium, webkit } from "playwright";

const argv = process.argv.slice(2);
let target = argv.find((a) => !a.startsWith("--")) ?? "/th";
// Git Bash rewrites a leading-slash argument into a Windows path ("/th" → "C:/Program Files/Git/th"). Undo it,
// and accept a path written without its leading slash ("th/stay") so either spelling works from any shell.
const msys = target.match(/^[A-Za-z]:[\\/](?:Program Files[\\/])?Git[\\/]?(.*)$/i);
if (msys) target = "/" + msys[1].replace(/\\/g, "/");
if (!/^https?:/.test(target) && !target.startsWith("/")) target = "/" + target;
const flag = (name) => argv.includes(`--${name}`);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : fallback;
};

const BASE = process.env.QA_BASE ?? "http://127.0.0.1:8352";
const url = /^https?:/.test(target) ? target : BASE + target;
const w = Number(opt("w", 1440));
const h = Number(opt("h", w < 700 ? 844 : 900));
const engine = opt("engine", "chromium") === "webkit" ? webkit : chromium;
const slug = target.replace(/^https?:\/\/[^/]+/, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "root";
const out = opt("out", `_qa/shots/${slug}-${w}${flag("full") ? "-full" : ""}${opt("engine", "") === "webkit" ? "-webkit" : ""}.png`);
fs.mkdirSync(path.dirname(out), { recursive: true });

const browser = await engine.launch();
const context = await browser.newContext({
  viewport: { width: w, height: h },
  deviceScaleFactor: Number(opt("dpr", 1)),
  isMobile: flag("mobile") && engine === chromium ? true : undefined,
  hasTouch: flag("mobile") || undefined,
  reducedMotion: flag("reduced") ? "reduce" : "no-preference",
  javaScriptEnabled: !flag("nojs"),
  locale: opt("locale", "en-GB"),
});
const page = await context.newPage();
const consoleErrors = [];
const failed = [];
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text().slice(0, 300)); });
page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${String(e.message).slice(0, 300)}`));
page.on("requestfailed", (r) => failed.push(`${r.failure()?.errorText ?? "failed"} ${r.url()}`));
page.on("response", (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });

let status = 0;
try {
  const res = await page.goto(url, { waitUntil: "load", timeout: 90000 });
  status = res?.status() ?? 0;
} catch (e) {
  consoleErrors.push(`goto: ${String(e.message).split("\n")[0]}`);
}
await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

if (!flag("nojs")) {
  // Walk the page once so lazy images and in-view reveals have fired before a full-page capture.
  if (flag("full")) {
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.8;
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        window.scrollTo({ top: y, behavior: "instant" });
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo({ top: 0, behavior: "instant" });
    });
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
  }
  const scroll = Number(opt("scroll", 0));
  if (scroll) await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), scroll);
}
await page.waitForTimeout(Number(opt("wait", 700)));

const probe = flag("nojs")
  ? {}
  : await page.evaluate(() => {
      const de = document.documentElement;
      const overflowing = [];
      if (de.scrollWidth > window.innerWidth + 1) {
        for (const el of document.querySelectorAll("body *")) {
          const r = el.getBoundingClientRect();
          if (r.right > window.innerWidth + 1 && r.width > 0 && overflowing.length < 6) {
            overflowing.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} right=${Math.round(r.right)}`);
          }
        }
      }
      return {
        title: document.title,
        lang: de.lang,
        h1: [...document.querySelectorAll("h1")].map((e) => e.textContent.trim().slice(0, 90)),
        pageHeight: de.scrollHeight,
        scrollWidth: de.scrollWidth,
        innerWidth: window.innerWidth,
        horizontalOverflow: de.scrollWidth > window.innerWidth + 1,
        overflowing,
        brokenImages: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src),
      };
    });

const sel = opt("sel", null);
if (sel) await page.locator(sel).first().screenshot({ path: out });
else await page.screenshot({ path: out, fullPage: flag("full") });

await browser.close();
console.log(JSON.stringify({ url, w, h, status, out, ...probe, consoleErrors: consoleErrors.slice(0, 8), failed: failed.slice(0, 8) }));
