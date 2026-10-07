#!/usr/bin/env node
// Frame sequences for judging motion by eye. Captures a run of viewport screenshots at a fixed interval
// and tiles them into one contact sheet (each frame stamped with its time), so a whole animation can be
// read in a single image.
//
//   node _qa/motion-seq.mjs en/lab/motion --name loader-en                      the hard-load sequence
//   node _qa/motion-seq.mjs en/lab/motion --name loader-repeat --repeat         second load in the same session
//   node _qa/motion-seq.mjs en/lab/motion --name split --after 3200 --to 1500   settle, then scroll to y and film the reveals
//   node _qa/motion-seq.mjs th/lab/motion --name th --mobile --w 390 --h 844
//
// Options: --frames N (12)  --interval ms (200)  --w --h  --mobile  --reduced  --engine webkit
//          --after ms   wait this long after navigation before the action (default 0: film from the first byte)
//          --to y       wheel-scroll to this offset as the action (smooth, through the real wheel handler)
//          --jump y     instant scroll to this offset as the action
//          --click sel  click this element as the action (a link: films the page transition)
//          --slow k     GSAP time scale from the action on (0.2 = five times slower); dev builds only
//          --clip x,y,w,h   film only this part of the viewport
//          --cols N     contact sheet columns (4)   --thumb px (480)
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { chromium, webkit } from "playwright";

const argv = process.argv.slice(2);
let target = argv.find((a) => !a.startsWith("--")) ?? "en/lab/motion";
const msys = target.match(/^[A-Za-z]:[\\/](?:Program Files[\\/])?Git[\\/]?(.*)$/i);
if (msys) target = "/" + msys[1].replace(/\\/g, "/");
if (!target.startsWith("/")) target = "/" + target;
const flag = (n) => argv.includes(`--${n}`);
const opt = (n, d) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : d;
};

const BASE = process.env.QA_BASE ?? "http://127.0.0.1:8352";
const w = Number(opt("w", 1440));
const h = Number(opt("h", w < 700 ? 844 : 900));
const frames = Number(opt("frames", 12));
const interval = Number(opt("interval", 200));
const after = Number(opt("after", 0));
const name = opt("name", "seq");
const cols = Number(opt("cols", 4));
const thumb = Number(opt("thumb", 480));
const engine = opt("engine", "chromium") === "webkit" ? webkit : chromium;
const outDir = "_qa/shots/motion";
fs.mkdirSync(outDir, { recursive: true });

const browser = await engine.launch();
const context = await browser.newContext({
  viewport: { width: w, height: h },
  isMobile: flag("mobile") && engine === chromium ? true : undefined,
  hasTouch: flag("mobile") || undefined,
  reducedMotion: flag("reduced") ? "reduce" : "no-preference",
  locale: "en-GB",
});
const page = await context.newPage();
const errors = [];
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") errors.push(`${m.type()}: ${m.text().slice(0, 240)}`);
});
page.on("pageerror", (e) => errors.push(`pageerror: ${String(e.message).slice(0, 240)}`));

if (flag("repeat")) {
  // A first visit, so that the filmed load is a later one in the same session.
  await page.goto(BASE + target, { waitUntil: "load" });
  await page.waitForTimeout(3200);
}

// Chromium: film with the DevTools screencast (frames arrive as the compositor produces them, with their
// own timestamps, and nothing blocks the page). WebKit: fall back to a screenshot loop.
const cast = [];
let client = null;
if (engine === chromium) {
  client = await context.newCDPSession(page);
  client.on("Page.screencastFrame", ({ data, metadata, sessionId }) => {
    cast.push({ t: metadata.timestamp * 1000, buffer: Buffer.from(data, "base64") });
    client.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
  });
  await client.send("Page.startScreencast", { format: "png", everyNthFrame: 1 });
}

const t0 = Date.now();
await page.goto(BASE + target, { waitUntil: "commit" });
if (after) await page.waitForTimeout(after);

// --slow 0.2 runs every GSAP animation at a fifth of its speed from here on (development builds only).
const slow = opt("slow", null);
if (slow !== null) await page.evaluate((k) => window.__pkhGsap?.globalTimeline.timeScale(k), Number(slow));

const to = opt("to", null);
const jump = opt("jump", null);
const click = opt("click", null);
let actionAt = Date.now();
if (click !== null) {
  // Bring the link on screen first, let the page settle, then film from the click.
  await page.evaluate((sel) => document.querySelector(sel).scrollIntoView({ block: "center", behavior: "instant" }), click);
  await page.waitForTimeout(1300);
  actionAt = Date.now();
  await page.evaluate((sel) => document.querySelector(sel).click(), click);
}
if (to !== null) {
  const y = Number(to);
  const current = await page.evaluate(() => window.scrollY);
  await page.mouse.move(w / 2, h / 2);
  // Several notches, like a hand on a wheel, rather than one teleport.
  const steps = 6;
  actionAt = Date.now();
  for (let i = 0; i < steps; i++) await page.mouse.wheel(0, (y - current) / steps);
} else if (jump !== null) {
  actionAt = Date.now();
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Number(jump));
}
const base = after || to !== null || jump !== null || click !== null ? actionAt : t0;

const shots = [];
if (client) {
  await page.waitForTimeout(Math.max(0, base + frames * interval + 150 - Date.now()));
  await client.send("Page.stopScreencast").catch(() => {});
  // Screencast stamps are wall-clock milliseconds. For each tick take the last frame produced by then.
  for (let i = 0; i < frames; i++) {
    const due = base + i * interval;
    let pick = null;
    for (const f of cast) if (f.t <= due + 8) pick = f;
    if (!pick) pick = cast[0];
    if (pick) shots.push({ at: i * interval, buffer: pick.buffer, real: Math.round(pick.t - base) });
  }
} else {
  for (let i = 0; i < frames; i++) {
    const due = base + i * interval;
    const wait = due - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    const at = Date.now() - base;
    const buffer = await page.screenshot({ type: "png" }).catch(() => null);
    if (buffer) shots.push({ at, buffer, real: at });
  }
}

const state = await page
  .evaluate(() => ({
    scrollY: Math.round(window.scrollY),
    html: document.documentElement.className.replace(/\S*variable\S*/g, "").trim(),
    loader: window.__pkhLoader ? { done: window.__pkhLoader.done } : null,
  }))
  .catch(() => null);
await browser.close();

const clip = opt("clip", null)?.split(",").map(Number) ?? null;
if (clip) for (const shot of shots) shot.buffer = await sharp(shot.buffer).extract({ left: clip[0], top: clip[1], width: clip[2], height: clip[3] }).png().toBuffer();
const th = Math.round((thumb * (clip ? clip[3] : h)) / (clip ? clip[2] : w));
const label = (text) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${thumb}" height="26"><rect width="100%" height="100%" fill="#111"/><text x="8" y="18" font-family="monospace" font-size="14" fill="#fff">${text}</text></svg>`,
  );
const rows = Math.ceil(shots.length / cols);
const cellH = th + 26;
const composites = [];
for (let i = 0; i < shots.length; i++) {
  const x = (i % cols) * (thumb + 6);
  const y = Math.floor(i / cols) * (cellH + 6);
  composites.push({ input: await sharp(shots[i].buffer).resize(thumb, th).png().toBuffer(), left: x, top: y + 26 });
  composites.push({ input: await sharp(label(`#${i}  ${(shots[i].at / 1000).toFixed(2)}s`)).png().toBuffer(), left: x, top: y });
}
const sheet = path.join(outDir, `${name}.png`);
await sharp({
  create: { width: cols * (thumb + 6) - 6, height: rows * (cellH + 6) - 6, channels: 3, background: "#444" },
})
  .composite(composites)
  .png()
  .toFile(sheet);

if (flag("keep")) shots.forEach((s, i) => fs.writeFileSync(path.join(outDir, `${name}-${String(i).padStart(2, "0")}.png`), s.buffer));
console.log(JSON.stringify({ sheet, cast: cast.length, frames: shots.map((s) => s.real), state, errors: errors.slice(0, 10) }));
