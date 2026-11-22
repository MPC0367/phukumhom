// The opening (src/components/site/Intro.tsx): when it plays, when it does not, and that it never holds
// the page. Needs the dev server (or the Pages stand-in) running; it never starts one.
//
//   node _qa/intro-check.mjs                                  against http://127.0.0.1:8352
//   node _qa/intro-check.mjs http://127.0.0.1:8353/phukumhom  against the built site
//   node _qa/intro-check.mjs --frames                         also saves frames to _qa/shots/intro-*.png
//
// Checks: it shows on arrival and again on reload; it is gone within about 2 s; the heading is in the
// document from the start; it does not play when arriving from another page of the site; under reduced
// motion a still version plays (nothing moves, it fades); nothing is written to browser storage; no
// console errors.

import { chromium, webkit } from "playwright";

const argv = process.argv.slice(2);
const BASE = (argv.find((a) => !a.startsWith("--")) ?? "http://127.0.0.1:8352").replace(/\/+$/, "");
const FRAMES = argv.includes("--frames");
const results = [];
const note = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  | ${detail}` : ""}`);
};

const state = (page) =>
  page.evaluate(() => {
    const el = document.querySelector('[class*="Intro-module"][class*="intro"]');
    const cs = el ? getComputedStyle(el) : null;
    const r = el ? el.getBoundingClientRect() : null;
    return {
      attr: document.documentElement.getAttribute("data-intro"),
      // On screen: displayed and not yet lifted off the top. (The attribute is only tidied up afterwards.)
      shown: Boolean(cs && cs.display !== "none" && cs.visibility !== "hidden" && Number(cs.opacity) > 0.01 && r && r.bottom > 1),
      h1: Boolean(document.querySelector("h1")?.textContent?.trim()),
      storage: Object.keys(sessionStorage).length + Object.keys(localStorage).length,
    };
  });

for (const [engineName, engine] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await engine.launch();

  // Arrival from outside: plays, then is gone.
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(String(e)));
    const t0 = Date.now();
    await page.goto(BASE + "/th/", { waitUntil: "commit" });
    await page.waitForSelector("h1", { state: "attached" });
    const early = await state(page);
    // The opening's own clock starts when its script runs, which is no later than this moment.
    const seen = Date.now(); // frames below are timed from here
    note(`${engineName}: the opening shows on arrival`, early.shown && early.attr !== null, `attr=${early.attr} after ${Date.now() - t0} ms`);
    note(`${engineName}: the heading is in the document from the start`, early.h1);
    if (FRAMES && engineName === "chromium") {
      for (const at of [250, 600, 1000, 1250]) {
        await page.waitForTimeout(Math.max(0, at - (Date.now() - seen)));
        await page.screenshot({ path: `_qa/shots/intro-${at}.png` });
      }
    }
    // Watch what the visitor sees, frame by frame inside the page: the panel must be off the screen within
    // about 2 s. (Polling from outside lets headless WebKit stop producing frames, which freezes CSS animations
    // in a way a visible Safari tab never does.)
    const goneAfter = await page.evaluate(async () => {
      const el = document.querySelector('[class*="Intro-module"][class*="intro"]');
      const t0 = performance.now();
      while (performance.now() - t0 < 3000) {
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) <= 0.01 || el.getBoundingClientRect().bottom <= 1) return Math.round(performance.now() - t0);
        await new Promise((res) => requestAnimationFrame(res));
      }
      return 9999;
    });
    note(`${engineName}: off the screen within about 2.4 s`, goneAfter <= 2400, `${goneAfter} ms after it was first seen`);
    await page.waitForTimeout(600);
    note(`${engineName}: its marker is cleared afterwards`, (await state(page)).attr === null);
    note(`${engineName}: no console errors on arrival`, errors.length === 0, errors.slice(0, 3).join(" | "));
    const after = await state(page);
    note(`${engineName}: nothing written to browser storage`, after.storage === 0, String(after.storage));

    // Reload: it plays again (the studio reloads to look at changes).
    await page.reload({ waitUntil: "commit" });
    await page.waitForSelector("h1", { state: "attached" });
    const reloaded = await state(page);
    note(`${engineName}: plays again on reload`, reloaded.shown && reloaded.attr !== null, `attr=${reloaded.attr}`);
    await page.waitForTimeout(2600);

    // A full load arriving from another page of the site: no replay. (Playwright's forged Referer header
    // makes WebKit refuse the page's own background fetches, so console errors are not counted after this.)
    await page.goto(BASE + "/th/experiences/", { waitUntil: "commit", referer: BASE + "/th/" });
    await page.waitForSelector("h1", { state: "attached" });
    const internal = await state(page);
    note(`${engineName}: not played when coming from another page of the site`, !internal.shown, `attr=${internal.attr}`);

    await context.close();
  }

  // Reduced motion: never.
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(BASE + "/en/", { waitUntil: "commit" });
    await page.waitForSelector("h1", { state: "attached" });
    const s = await state(page);
    // The still version: shown, never moved, then faded away.
    const still = await page.evaluate(async () => {
      const el = document.querySelector('[class*="Intro-module"][class*="intro"]');
      const t0 = performance.now();
      let moved = false;
      while (performance.now() - t0 < 3000) {
        const cs = getComputedStyle(el);
        if (cs.transform !== "none" && cs.transform !== "matrix(1, 0, 0, 1, 0, 0)") moved = true;
        if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) <= 0.01) return { moved, goneAfter: Math.round(performance.now() - t0) };
        await new Promise((res) => requestAnimationFrame(res));
      }
      return { moved, goneAfter: 9999 };
    });
    note(`${engineName}: reduced motion gets a still version`, s.shown && !still.moved && still.goneAfter <= 2400, `shown=${s.shown} moved=${still.moved} gone after ${still.goneAfter} ms`);
    await context.close();
  }

  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exitCode = failed.length ? 1 : 0;
