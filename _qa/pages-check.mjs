// Checks the static export the way GitHub Pages will serve it (run `npm.cmd run pages` then start the
// stand-in: node scripts/serve-pages.mjs). Usage: node _qa/pages-check.mjs [baseUrl]
import fs from "node:fs";
import { chromium } from "playwright";

const BASE = (process.argv[2] ?? "http://127.0.0.1:8353/phukumhom").replace(/\/+$/, "");
const origin = new URL(BASE).origin;
const prefix = new URL(BASE).pathname;
fs.mkdirSync("_qa/shots", { recursive: true });

const browser = await chromium.launch();
const results = [];
const note = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};

async function visit(pathname, { width = 1440, height = 900, js = true, shot } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, javaScriptEnabled: js, isMobile: width < 700, hasTouch: width < 700 });
  const page = await context.newPage();
  const failed = [];
  const errors = [];
  page.on("response", (r) => {
    if (r.status() >= 400) failed.push(`${r.status()} ${r.url().replace(origin, "")}`);
  });
  page.on("requestfailed", (r) => {
    // In a static export Next's router sends a HEAD to a page before prefetching its segments and drops the
    // connection once it has the status line; Chromium reports that as an aborted request. It is not a failure.
    if (r.method() === "HEAD" && r.failure()?.errorText === "net::ERR_ABORTED") return;
    failed.push(`failed ${r.url().replace(origin, "")}`);
  });
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text().slice(0, 200));
  });
  page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 200)));
  const res = await page.goto(BASE + pathname, { waitUntil: "load", timeout: 60000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(3500);
  if (shot) await page.screenshot({ path: shot });
  return { page, context, status: res?.status() ?? 0, failed, errors };
}

// 1. The root sends the visitor to a language.
{
  const v = await visit("/");
  note("root redirects to a language", /\/(th|en)\/$/.test(new URL(v.page.url()).pathname), v.page.url().replace(origin, ""));
  await v.context.close();
}
{
  const v = await visit("/", { js: false });
  note("root without JavaScript reaches Thai", new URL(v.page.url()).pathname === `${prefix}/th/`, v.page.url().replace(origin, ""));
  await v.context.close();
}

// 2. Both homepages load completely.
const links = new Set();
for (const lang of ["th", "en"]) {
  const v = await visit(`/${lang}/`, { shot: `_qa/shots/pages-${lang}-1440.png` });
  note(`/${lang}/ status 200`, v.status === 200);
  note(`/${lang}/ no failed requests`, v.failed.length === 0, v.failed.slice(0, 5).join(" | "));
  note(`/${lang}/ no console errors`, v.errors.length === 0, v.errors.slice(0, 3).join(" | "));
  const info = await v.page.evaluate(() => ({
    lang: document.documentElement.lang,
    h1: document.querySelectorAll("h1").length,
    broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src),
    robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "",
    notice: /Concept preview|เว็บไซต์ตัวอย่าง/.test(document.querySelector("footer")?.textContent ?? ""),
    credit: Boolean(document.querySelector('footer a[href^="https://o2-designstudio.com"]')),
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    hrefs: [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")),
  }));
  note(`/${lang}/ html lang`, info.lang === lang, info.lang);
  note(`/${lang}/ one h1`, info.h1 === 1, String(info.h1));
  note(`/${lang}/ no broken images`, info.broken.length === 0, info.broken.slice(0, 3).join(" | "));
  note(`/${lang}/ is noindex`, /noindex/.test(info.robots), info.robots);
  note(`/${lang}/ shows the concept-preview notice`, info.notice);
  note(`/${lang}/ carries the O2 credit`, info.credit);
  note(`/${lang}/ no horizontal overflow`, !info.overflow);
  for (const h of info.hrefs) if (h && h.startsWith("/")) links.add(h.split("#")[0]);
  await v.context.close();
}

// 2b. Every inner page loads cleanly in both languages.
const INNER = ["stay", "stay/deluxe-balcony", "stay/deluxe-bathtub", "stay/executive-pool-spa", "dining", "experiences", "gallery", "location", "contact", "faq", "privacy", "terms"];
for (const lang of ["th", "en"]) {
  const problems = [];
  for (const path of INNER) {
    const v = await visit(`/${lang}/${path}/`);
    const info = await v.page.evaluate(() => ({
      lang: document.documentElement.lang,
      h1: document.querySelectorAll("h1").length,
      broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length,
      robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "",
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      hrefs: [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")),
    }));
    const bad = [];
    if (v.status !== 200) bad.push(`status ${v.status}`);
    if (v.failed.length) bad.push(`failed ${v.failed.slice(0, 2).join(", ")}`);
    if (v.errors.length) bad.push(`console ${v.errors[0]}`);
    if (info.lang !== lang) bad.push(`lang ${info.lang}`);
    if (info.h1 !== 1) bad.push(`h1 x${info.h1}`);
    if (info.broken) bad.push(`${info.broken} broken images`);
    if (!/noindex/.test(info.robots)) bad.push("indexable");
    if (info.overflow) bad.push("overflow");
    if (bad.length) problems.push(`${path}: ${bad.join("; ")}`);
    for (const h of info.hrefs) if (h && h.startsWith("/")) links.add(h.split("#")[0].split("?")[0]);
    await v.context.close();
  }
  note(`/${lang}/ the ${INNER.length} inner pages load cleanly`, problems.length === 0, problems.slice(0, 4).join(" | "));
}

// 3. Every internal link resolves.
const dead = [];
for (const href of links) {
  const res = await fetch(origin + href, { redirect: "follow" });
  if (res.status !== 200) dead.push(`${res.status} ${href}`);
}
note(`all ${links.size} internal link targets answer 200`, dead.length === 0, dead.slice(0, 8).join(" | "));

// 4. Unknown URLs get the not-found page with status 404, in the right language.
{
  const v = await visit("/th/no-such-page/");
  const text = await v.page.evaluate(() => document.body.innerText.slice(0, 400));
  note("unknown Thai URL answers 404 with the site chrome", v.status === 404 && (await v.page.locator("header").count()) > 0, text.replace(/\s+/g, " ").slice(0, 90));
  await v.context.close();
}
{
  const v = await visit("/en/no-such-page/");
  note("unknown English URL lands on the English not-found page", /\/en\/page-not-found\/$/.test(new URL(v.page.url()).pathname), v.page.url().replace(origin, ""));
  await v.context.close();
}

// 5. Language switch and the planner hand-off link.
{
  const v = await visit("/th/");
  const toEn = await v.page.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")).find((h) => /\/en\/?$/.test(h ?? "")) ?? "");
  note("language switch points inside the site prefix", toEn.startsWith(prefix + "/en"), toEn);
  const booking = await v.page.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")).filter((h) => (h ?? "").startsWith("https://letsbook.me/")).length);
  note("booking links go to the booking partner", booking > 0, `${booking} link(s)`);
  await v.context.close();
}

// 6. A phone.
{
  const v = await visit("/en/", { width: 390, height: 844, shot: "_qa/shots/pages-en-390.png" });
  const overflow = await v.page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  note("phone: no failed requests, no overflow", v.failed.length === 0 && !overflow, v.failed.slice(0, 3).join(" | "));
  await v.context.close();
}

await browser.close();
const failures = results.filter((r) => !r.ok);
console.log(`\n${results.length - failures.length}/${results.length} checks passed`);
process.exitCode = failures.length ? 1 : 0;
