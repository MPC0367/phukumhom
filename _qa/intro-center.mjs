// Is the opening's text centred? Measures the name and the line beneath against the screen's centre in
// Chromium and WebKit at phone sizes, and saves one frame per engine.
//
//   node _qa/intro-center.mjs [--out | url]     default: --out (the static export in out/, no server)

import { chromium, webkit } from "playwright";
import { ORIGIN, serveOut } from "./out-route.mjs";

const arg = process.argv[2] ?? "--out";
const USE_OUT = arg === "--out";
const URL_ = USE_OUT ? ORIGIN + "/phukumhom/th/" : arg;
let worst = 0;

for (const [name, engine] of [["chromium", chromium], ["webkit", webkit]]) {
  const browser = await engine.launch();
  for (const [w, h] of [[390, 844], [375, 667], [430, 932]]) {
    const context = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 3, isMobile: name !== "firefox", hasTouch: true });
    if (USE_OUT) await serveOut(context);
    const page = await context.newPage();
    await page.goto(URL_, { waitUntil: "commit" });
    await page.waitForSelector('[class*="Intro-module"] text', { state: "attached" });
    await page.waitForTimeout(1500);
    const m = await page.evaluate(() => {
      // The box includes the letter-spacing that follows the last letter, which shows nothing: take it off,
      // so this measures the letters themselves.
      const svg = document.querySelector('[class*="Intro-module"] svg');
      const scale = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
      const box = (el) => {
        const r = el.getBoundingClientRect();
        const trailing = (parseFloat(getComputedStyle(el).letterSpacing) || 0) * scale;
        const right = r.right - trailing;
        return { left: Math.round(r.left), right: Math.round(right), centre: Math.round(((r.left + right) / 2) * 2) / 2, width: Math.round(right - r.left) };
      };
      const [nameEl, subEl] = document.querySelectorAll('[class*="Intro-module"] text');
      return { vw: innerWidth, name: box(nameEl), sub: box(subEl), font: getComputedStyle(nameEl).fontFamily.slice(0, 40), fontsReady: document.fonts.status };
    });
    const off = Math.max(Math.abs(m.name.centre - m.vw / 2), Math.abs(m.sub.centre - m.vw / 2));
    worst = Math.max(worst, off);
    console.log(`${name} ${w}x${h}: name ${m.name.left}..${m.name.right} (centre ${m.name.centre}), sub centre ${m.sub.centre}, screen centre ${m.vw / 2}, off by ${off}px, fonts ${m.fontsReady}`);
    if (w === 390) await page.screenshot({ path: `_qa/shots/intro-center-${name}.png` });
    await context.close();
  }
  await browser.close();
}
console.log(worst <= 3 ? `PASS centred (worst ${worst}px)` : `FAIL off centre by up to ${worst}px`);
process.exitCode = worst <= 3 ? 0 : 1;
