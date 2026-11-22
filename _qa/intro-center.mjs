// Is the opening's text centred, to the pixel, as the eye sees it?
//
// Photographs the opening (its still, reduced-motion form: the same layout, every letter fully inked) in
// Chromium and WebKit at several phone and desktop widths, then scans the pixels for the dark green logo on
// the paper: for each line (PHUKUMHOM, KHAO YAI) it finds the first and last columns that hold
// ink and compares the empty space on the left with the empty space on the right.
//
//   node _qa/intro-center.mjs [--out | url]     default: --out (the static export in out/, no server)
//
// Prints, per engine and size, both gaps in CSS pixels and the offset (positive = too far right). Passes
// when every offset is within 0.6 CSS px: at 3x one device pixel is 0.33 px and anti-aliased edges round
// to it, so smaller differences cannot be seen or reliably measured. Saves one frame per engine for the eye.

import sharp from "sharp";
import { chromium, webkit } from "playwright";
import { ORIGIN, serveOut } from "./out-route.mjs";

const arg = process.argv[2] ?? "--out";
const USE_OUT = arg === "--out";
const URL_ = USE_OUT ? ORIGIN + "/phukumhom/th/" : arg;
const SIZES = [
  [375, 667],
  [390, 844],
  [430, 932],
  [1440, 900],
];
/** Phones photographed at 3x, the desktop width at 2x (as those screens are; 3x at 1440 is too slow to catch). */
const dprFor = (w) => (w < 768 ? 3 : 2);
let worst = 0;
const missed = [];
const rows = [];

/** First and last columns in a band of rows whose pixels are light (the letters), in device pixels. */
function inkColumns(raw, width, channels, top, bottom) {
  let first = -1;
  let last = -1;
  for (let x = 0; x < width; x++) {
    for (let y = top; y < bottom; y++) {
      const i = (y * width + x) * channels;
      const lum = 0.2126 * raw[i] + 0.7152 * raw[i + 1] + 0.0722 * raw[i + 2];
      if (lum < 160) {
        if (first < 0) first = x;
        last = x;
        break;
      }
    }
  }
  return { first, last };
}

for (const [engineName, engine] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await engine.launch();
  for (const [w, h] of SIZES) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const phone = w < 768;
      const context = await browser.newContext({
        viewport: { width: w, height: h },
        deviceScaleFactor: dprFor(w),
        isMobile: phone,
        hasTouch: phone,
        reducedMotion: "reduce",
      });
      if (USE_OUT) await serveOut(context);
      const page = await context.newPage();
      await page.goto(URL_, { waitUntil: "commit" });
      await page.waitForSelector('[class*="Intro-module"] [data-band]', {
        state: "attached",
      });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(350);
      const bands = await page.evaluate(() =>
        [...document.querySelectorAll('[class*="Intro-module"] [data-band]')].map(
          (t) => {
            const r = t.getBoundingClientRect();
            return { top: r.top, bottom: r.bottom };
          },
        ),
      );
      const png = await page.screenshot({ type: "png" });
      // Count the frame only if the panel was still fully there when it was taken: once it starts to fade,
      // the page shows through and the scan would measure that instead.
      const solid = await page.evaluate(() => {
        const el = document.querySelector('[class*="Intro-module"][class*="intro"]');
        const cs = el && getComputedStyle(el);
        return Boolean(cs && cs.display !== "none" && Number(cs.opacity) === 1);
      });
      if (w === 390)
        await page.screenshot({
          path: `_qa/shots/intro-center-${engineName}.png`,
        });
      await context.close();

      const DPR = dprFor(w);

      const { data, info } = await sharp(png)
        .raw()
        .toBuffer({ resolveWithObject: true });
      const results = bands.map((b, line) => {
        const top = Math.max(0, Math.floor(b.top * DPR));
        const bottom = Math.min(info.height, Math.ceil(b.bottom * DPR));
        const { first, last } = inkColumns(
          data,
          info.width,
          info.channels,
          top,
          bottom,
        );
        const left = first / DPR;
        const right = (info.width - 1 - last) / DPR;
        const offset = (left - right) / 2; // positive: the letters sit to the right of centre
        return {
          line: ["name", "place"][line] ?? String(line),
          first,
          left: left.toFixed(1),
          right: right.toFixed(1),
          offset,
        };
      });
      // On a slow first load the opening can be gone (or fading) before the photograph: try again.
      if (!solid || results.some((r) => r.first < 0)) {
        console.log(
          `${engineName.padEnd(8)} ${String(w).padStart(4)}px  opening not captured (already gone), attempt ${attempt}`,
        );
        continue;
      }
      for (const r of results) {
        worst = Math.max(worst, Math.abs(r.offset));
        r.offset = r.offset.toFixed(2);
      }
      rows.push({ engine: engineName, size: `${w}x${h}`, results });
      console.log(
        `${engineName.padEnd(8)} ${String(w).padStart(4)}px  ` +
          results
            .map(
              (r) =>
                `${r.line}: left ${r.left} / right ${r.right} -> offset ${r.offset}px`,
            )
            .join("   "),
      );
      break;
    }
    if (!rows.some((r) => r.engine === engineName && r.size === `${w}x${h}`)) missed.push(`${engineName} ${w}px`);
  }
  await browser.close();
}

if (missed.length) console.log(`NOT MEASURED (opening gone before every photograph): ${missed.join(", ")}`);
console.log(
  missed.length ? "INCOMPLETE" : worst <= 0.6
    ? `PASS centred (worst offset ${worst.toFixed(2)}px)`
    : `FAIL off centre by up to ${worst.toFixed(2)}px (positive = too far right)`,
);
process.exitCode = worst <= 0.6 ? 0 : 1;
