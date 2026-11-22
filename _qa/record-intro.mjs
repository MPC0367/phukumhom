// Records the opening on a phone-sized screen, as a visitor arriving at the site sees it.
//
//   node _qa/record-intro.mjs [url] [outDir]
//   default url: https://mpc0367.github.io/phukumhom/th/   default outDir: _qa/shots/intro-video
//
// Writes a .webm from Playwright (Chromium, 390 x 844, 2x). Convert it with ffmpeg for sharing.

import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const url = process.argv[2] ?? "https://mpc0367.github.io/phukumhom/th/";
const outDir = process.argv[3] ?? "_qa/shots/intro-video";
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  recordVideo: { dir: outDir, size: { width: 390, height: 844 } },
});
const page = await context.newPage();
// A blank page first, so the recording shows the arrival from nothing.
await page.goto("about:blank");
await page.waitForTimeout(500);
await page.goto(url, { waitUntil: "commit" });
await page.waitForTimeout(4500);
const video = page.video();
await context.close();
await browser.close();
const file = await video.path();
const target = path.join(outDir, "intro.webm");
fs.renameSync(file, target);
console.log(target);
