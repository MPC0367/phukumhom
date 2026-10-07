#!/usr/bin/env node
// Behavioural checks for the motion system on /{lang}/lab/motion. Each check prints one line: PASS or FAIL
// and what was measured. Run all, or name the ones you want:
//
//   node _qa/motion-probe.mjs                 everything, Chromium
//   node _qa/motion-probe.mjs reel anchors    only those
//   node _qa/motion-probe.mjs --engine webkit
//   node _qa/motion-probe.mjs --lang th
//
// Checks: console provider touch reduced nojs anchors scrollto focus refresh bottom reel reelkeys transition
//         navarm persist layout hashload reeltouch loader failsafe
// The dev server must be running, and it is shared: a check can fail once when another build is compiling.
// Run a failing check again by name before believing it.
import { chromium, webkit } from "playwright";

const argv = process.argv.slice(2);
const opt = (n, d) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : d;
};
const names = argv.filter((a, i) => !a.startsWith("--") && !(i > 0 && argv[i - 1].startsWith("--")));
const wants = (n) => names.length === 0 || names.includes(n);
const BASE = process.env.QA_BASE ?? "http://127.0.0.1:8352";
const lang = opt("lang", "en");
const URL = `${BASE}/${lang}/lab/motion`;
const engineName = opt("engine", "chromium");
const engine = engineName === "webkit" ? webkit : chromium;

const browser = await engine.launch();
const results = [];
const report = (name, pass, detail) => {
  results.push({ name, pass });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}  ${typeof detail === "string" ? detail : JSON.stringify(detail)}`);
};

async function open(options = {}, url = URL) {
  const context = await browser.newContext({
    viewport: options.viewport ?? { width: 1440, height: 900 },
    reducedMotion: options.reduced ? "reduce" : "no-preference",
    javaScriptEnabled: options.nojs ? false : true,
    hasTouch: options.touch || undefined,
    isMobile: options.touch && engine === chromium ? true : undefined,
    locale: "en-GB",
  });
  const page = await context.newPage();
  const messages = [];
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") messages.push(`${m.type()}: ${m.text().slice(0, 300)}`);
  });
  page.on("pageerror", (e) => messages.push(`pageerror: ${String(e.message).slice(0, 300)}`));
  await page.goto(url, { waitUntil: "load" });
  return { context, page, messages };
}
const settle = (page, ms = 3200) => page.waitForTimeout(ms);
const top = (page, sel) => page.evaluate((s) => Math.round(document.querySelector(s).getBoundingClientRect().top), sel);

/* Everything that could be hidden by a start state: opacity 0, a closed clip-path, a line parked under its mask. */
const hiddenCount = (page) =>
  page.evaluate(() => {
    let n = 0;
    for (const el of document.querySelectorAll("main *")) {
      const cs = getComputedStyle(el);
      if (el.closest("[data-pkh-loader]") || el.closest("[hidden]")) continue;
      if (cs.opacity === "0" && !el.closest("[data-live='false']")) n++;
      else if (/inset\((100|9\d)/.test(cs.clipPath)) n++;
    }
    return n + document.querySelectorAll("main .pkh-line-mask").length;
  });

/* ── console: no hydration warnings, no errors ── */
if (wants("console")) {
  const { context, page, messages } = await open();
  await settle(page);
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 120));
    }
  });
  await page.waitForTimeout(1200);
  const real = messages.filter((m) => !/preloaded using link preload|Download the React DevTools/.test(m));
  report("console", real.length === 0, real.length ? real.slice(0, 4) : "no errors or warnings on load and a full scroll");
  await context.close();
}

/* ── provider: html.motion, Lenis for a fine pointer, loader finished, nothing left hidden above the fold ── */
if (wants("provider")) {
  const { context, page } = await open();
  await settle(page);
  const state = await page.evaluate(() => ({
    html: document.documentElement.className,
    ready: document.querySelector("[data-probe='motion']")?.dataset.ready,
    loaderDone: window.__pkhLoader?.done,
    loaderHidden: document.querySelector("[data-pkh-loader]")?.hidden,
    bootScripts: document.querySelectorAll("[data-pkh-loader] + script").length,
  }));
  const ok = /\bmotion\b/.test(state.html) && /\blenis\b/.test(state.html) && state.ready === "true" && state.loaderDone === true && state.loaderHidden === true;
  report("provider", ok, state);
  await context.close();
}

/* ── touch: motion on, but no Lenis ── */
if (wants("touch")) {
  const { context, page } = await open({ touch: true, viewport: { width: 390, height: 844 } });
  await settle(page);
  const html = await page.evaluate(() => document.documentElement.className);
  report("touch", /\bmotion\b/.test(html) && !/\blenis\b/.test(html), html.replace(/\S*variable\S*/g, "").trim());
  await context.close();
}

/* ── reduced motion: no loader, no Lenis, nothing hidden, nothing transformed, native reel ── */
if (wants("reduced")) {
  const { context, page } = await open({ reduced: true });
  await page.waitForTimeout(400);
  const early = await page.evaluate(() => ({
    loaderShown: document.querySelector("[data-pkh-loader]")?.hidden === false,
    loader: window.__pkhLoader ?? null,
  }));
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo({ top: 1400, behavior: "instant" }));
  await page.waitForTimeout(500);
  const state = await page.evaluate(() => ({
    html: document.documentElement.className.replace(/\S*variable\S*/g, "").trim(),
    drift: document.querySelector("[role='group'][data-drift]") !== null,
    clones: document.querySelectorAll("[data-reel-clone]").length,
    transformed: [...document.querySelectorAll("main *")].filter((el) => {
      const t = getComputedStyle(el).transform;
      return t !== "none" && !el.closest("[aria-hidden='true']") && !el.matches("[class*='readoutFill']");
    }).length,
    counting: document.querySelectorAll("[data-counting]").length,
  }));
  const hidden = await hiddenCount(page);
  const ok = !early.loaderShown && !/motion|lenis/.test(state.html) && !state.drift && state.clones === 0 && hidden === 0 && state.transformed === 0 && state.counting === 0;
  report("reduced", ok, { ...early, ...state, hidden });
  await context.close();
}

/* ── no JavaScript: loader stays hidden, nothing hidden, reel is a native scroller ── */
if (wants("nojs")) {
  const { context, page } = await open({ nojs: true });
  await page.waitForTimeout(300);
  const html = await page.content();
  const loaderHidden = /data-pkh-loader=""[^>]*\shidden/.test(html);
  const inlineHidden = /style="[^"]*(opacity:\s*0|visibility:\s*hidden|clip-path)/.test(html.replace(/<script[\s\S]*?<\/script>/g, ""));
  const clones = (html.match(/data-reel-clone/g) ?? []).length;
  report("nojs", loaderHidden && !inlineHidden && clones === 0, { loaderHidden, inlineHiddenStyles: inlineHidden, clones });
  await context.close();
}

/* ── anchors: an in-page link glides to its target and stops below the sticky header ── */
if (wants("anchors")) {
  const { context, page } = await open();
  await settle(page);
  const before = await page.evaluate(() => window.scrollY);
  await page.click("nav a[href='#reveal']");
  await page.waitForTimeout(250);
  const during = await page.evaluate(() => window.scrollY);
  await page.waitForTimeout(2200);
  const after = await page.evaluate(() => window.scrollY);
  const at = await top(page, "#reveal");
  const header = await page.evaluate(() => Math.round(document.querySelector("header")?.getBoundingClientRect().bottom ?? 0));
  const hash = await page.evaluate(() => location.hash);
  const ok = during > before && during < after && at >= header && at < header + 80 && hash === "#reveal";
  report("anchors", ok, { before, during, after, targetTop: at, headerBottom: header, hash });
  await context.close();
}

/* ── scrollToTarget(): a button glides the page to the top ── */
if (wants("scrollto")) {
  const { context, page } = await open();
  await settle(page);
  await page.evaluate(() => document.querySelector("[data-probe='top']").scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForTimeout(1300);
  const from = await page.evaluate(() => Math.round(window.scrollY));
  await page.click("[data-probe='top']");
  await page.waitForTimeout(220);
  const during = await page.evaluate(() => Math.round(window.scrollY));
  await page.waitForTimeout(2600);
  const after = await page.evaluate(() => Math.round(window.scrollY));
  report("scrollto", from > 3000 && during < from && during > 0 && after === 0, { from, during, after });
  await context.close();
}

/* ── focus: Tab moves through the page and the focused element is always on screen and visible ── */
if (wants("focus")) {
  const { context, page } = await open();
  await settle(page);
  let bad = 0;
  let steps = 0;
  const seen = [];
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press("Tab");
    // Long enough for the browser's own smooth focus scroll to arrive.
    await page.waitForTimeout(650);
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const r = el.getBoundingClientRect();
      let opacity = 1;
      for (let n = el; n && n !== document.documentElement; n = n.parentElement) opacity *= Number(getComputedStyle(n).opacity);
      return {
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 24),
        onScreen: r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth,
        opacity: Math.round(opacity * 100) / 100,
        inMain: !!el.closest("main"),
      };
    });
    if (!info) continue;
    steps++;
    if (info.inMain) seen.push(info.text);
    if (!info.onScreen) bad++;
  }
  // After the animations a focused element must be fully opaque.
  await page.waitForTimeout(1300);
  const final = await page.evaluate(() => {
    const el = document.activeElement;
    let opacity = 1;
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) opacity *= Number(getComputedStyle(n).opacity);
    return { opacity, y: Math.round(window.scrollY) };
  });
  report("focus", bad === 0 && steps > 20 && final.opacity === 1, { steps, offScreen: bad, final, reached: seen.slice(0, 14) });
  await context.close();
}

/* ── late layout change: the trigger positions follow when the page grows above them ── */
if (wants("refresh")) {
  const { context, page } = await open();
  await settle(page);
  const armedBefore = await hiddenCount(page);
  // Push everything down by 900px, as a late image without reserved space would.
  await page.evaluate(() => {
    const spacer = document.createElement("div");
    spacer.id = "probe-spacer";
    spacer.style.height = "900px";
    document.querySelector("main").prepend(spacer);
  });
  await page.waitForTimeout(700);
  // Scroll to where chapter 02 USED to start revealing. With stale positions its tiles would fire now, off screen.
  const stale = await page.evaluate(() => {
    const el = document.querySelector("#reveal ul");
    const rect = el.getBoundingClientRect();
    return { top: Math.round(rect.top), opacity: getComputedStyle(el.children[0]).opacity };
  });
  await page.evaluate(() => window.scrollTo({ top: document.querySelector("#reveal").getBoundingClientRect().top + window.scrollY - 900 - 300, behavior: "instant" }));
  await page.waitForTimeout(600);
  const early = await page.evaluate(() => getComputedStyle(document.querySelector("#reveal ul").children[0]).opacity);
  await page.evaluate(() => document.querySelector("#reveal ul").scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForTimeout(1800);
  const late = await page.evaluate(() => getComputedStyle(document.querySelector("#reveal ul").children[0]).opacity);
  report("refresh", early === "0" && late === "1", { armedBefore, staleTop: stale.top, opacityBeforeItsNewPosition: early, opacityOnceInView: late });
  await context.close();
}

/* ── nothing stays hidden: jump to the very bottom, then walk back up ── */
if (wants("bottom")) {
  const { context, page } = await open();
  await settle(page);
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await page.waitForTimeout(2600);
  const atBottom = await page.evaluate(() => {
    let n = 0;
    for (const el of document.querySelectorAll("main *")) {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight || r.width === 0) continue;
      if (el.closest("[hidden]")) continue;
      const cs = getComputedStyle(el);
      if (cs.opacity !== "1" || /inset\((100|9\d)/.test(cs.clipPath)) n++;
    }
    return n + document.querySelectorAll("main .pkh-line-mask").length;
  });
  const everywhere = await hiddenCount(page);
  report("bottom", atBottom === 0 && everywhere === 0, { hiddenInViewAtBottom: atBottom, hiddenAnywhereAfterJump: everywhere });
  await context.close();
}

/* ── reel: drifts, pauses under a mouse, resumes, drag does not click, click clicks, clone click forwards, overlay pauses ── */
if (wants("reel")) {
  const { context, page } = await open();
  await settle(page);
  await page.evaluate(() => document.querySelector("#reel [role='group']").scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForTimeout(900);
  const x = () =>
    page.evaluate(() => {
      const track = document.querySelector("#reel [role='group'] > div > div");
      return new DOMMatrixReadOnly(getComputedStyle(track).transform).m41;
    });
  const count = () => page.evaluate(() => Number(document.querySelector("[data-probe='reel']").dataset.count));
  const facts = await page.evaluate(() => {
    const group = document.querySelector("#reel [role='group']");
    const clones = group.querySelectorAll("[data-reel-clone]");
    return {
      drift: group.dataset.drift,
      label: group.getAttribute("aria-label"),
      originals: group.querySelectorAll("[data-reel-item]:not([data-reel-clone])").length,
      clones: clones.length,
      clonesInert: [...clones].every((c) => c.closest("[inert]") && c.closest("[aria-hidden='true']") && c.tabIndex === -1),
      cloneIds: group.querySelectorAll("[data-reel-clone] [id], [data-reel-clone][id]").length,
    };
  });
  // Park the mouse well away first.
  await page.mouse.move(700, 80);
  await page.waitForTimeout(400);
  const a = await x();
  await page.waitForTimeout(1000);
  const b = await x();
  const drifting = Math.abs(b - a);
  // Hover: it eases to a stop.
  const box = await page.evaluate(() => {
    const r = document.querySelector("#reel [role='group']").getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  });
  const cy = box.top + box.height / 2;
  await page.mouse.move(box.left + box.width * 0.5, cy);
  await page.waitForTimeout(1500);
  const c = await x();
  await page.waitForTimeout(700);
  const d = await x();
  const heldUnderMouse = Math.abs(d - c);
  // Drag: a throw moves it and does not activate anything.
  const clicksBefore = await count();
  await page.mouse.down();
  await page.mouse.move(box.left + box.width * 0.5 - 60, cy, { steps: 4 });
  await page.mouse.move(box.left + box.width * 0.5 - 320, cy, { steps: 8 });
  // Draggable applies a move on the next frame.
  await page.waitForTimeout(120);
  const e = await x();
  await page.mouse.up();
  await page.waitForTimeout(250);
  const f = await x();
  await page.waitForTimeout(2600);
  const clicksAfterDrag = await count();
  const dragged = Math.abs(e - d);
  const thrown = Math.abs(f - e);
  // A plain click on whatever is under the pointer (an original or a copy) activates exactly one item.
  await page.mouse.move(box.left + box.width * 0.5, cy);
  await page.waitForTimeout(500);
  const under = await page.evaluate(
    ([px, py]) => {
      const group = document.querySelector("#reel [role='group']");
      const hit = [...group.querySelectorAll("[data-reel-item]")].find((el) => {
        const r = el.getBoundingClientRect();
        return px >= r.left && px <= r.right && py >= r.top && py <= r.bottom;
      });
      return hit ? { item: hit.dataset.reelItem, clone: hit.hasAttribute("data-reel-clone") } : null;
    },
    [box.left + box.width * 0.5, cy],
  );
  await page.mouse.click(box.left + box.width * 0.5, cy);
  await page.waitForTimeout(300);
  const clicksAfterClick = await count();
  const reported = await page.evaluate(() => document.querySelector("[data-probe='reel']").textContent);
  // Click a copy on purpose. Swipe the row sideways (a trackpad gesture) until a copy is under the pointer's side of the view.
  const cloneOnScreen = () =>
    page.evaluate(() => {
      const view = document.querySelector("#reel [role='group']").getBoundingClientRect();
      return [...document.querySelectorAll("#reel [data-reel-clone]")].some((el) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        return cx > view.left + 40 && cx < view.right - 40;
      });
    });
  await page.mouse.move(box.left + box.width * 0.5, cy);
  const beforeSwipe = await x();
  let swipes = 0;
  while (!(await cloneOnScreen()) && swipes < 14) {
    await page.mouse.wheel(500, 0);
    await page.waitForTimeout(140);
    swipes++;
  }
  const swiped = Math.abs((await x()) - beforeSwipe) > 100 || swipes === 0;
  const clonePoint = await page.evaluate(() => {
    const view = document.querySelector("#reel [role='group']").getBoundingClientRect();
    for (const el of document.querySelectorAll("#reel [data-reel-clone]")) {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      if (cx > view.left + 40 && cx < view.right - 40) return { x: cx, y: r.top + r.height / 2, item: el.dataset.reelItem };
    }
    return null;
  });
  let cloneForwarded = null;
  if (clonePoint) {
    await page.mouse.move(clonePoint.x, clonePoint.y);
    await page.waitForTimeout(300);
    const n = await count();
    await page.mouse.click(clonePoint.x, clonePoint.y);
    await page.waitForTimeout(450);
    const text = await page.evaluate(() => document.querySelector("[data-probe='reel']").textContent);
    cloneForwarded = (await count()) === n + 1 && text.endsWith(` ${clonePoint.item}`);
  }
  // Mouse away: it drifts again.
  await page.mouse.move(700, 60);
  await page.waitForTimeout(1300);
  const g = await x();
  await page.waitForTimeout(800);
  const h = await x();
  const resumed = Math.abs(h - g);
  // Overlay open: it holds, and Lenis stops.
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("pkh:overlay", { detail: { open: true } })));
  await page.waitForTimeout(1400);
  const i = await x();
  await page.waitForTimeout(700);
  const j = await x();
  const stopped = await page.evaluate(() => document.documentElement.classList.contains("lenis-stopped"));
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("pkh:overlay", { detail: { open: false } })));
  await page.waitForTimeout(300);
  const restarted = await page.evaluate(() => !document.documentElement.classList.contains("lenis-stopped"));
  const heldForOverlay = Math.abs(j - i);
  const ok =
    facts.drift === "on" && facts.clones >= facts.originals * 2 && facts.clonesInert && facts.cloneIds === 0 &&
    drifting > 15 && drifting < 60 && heldUnderMouse < 1 && dragged > 150 && thrown > 5 && clicksAfterDrag === clicksBefore &&
    clicksAfterClick === clicksBefore + 1 && cloneForwarded === true && swiped && resumed > 8 && heldForOverlay < 1 && stopped && restarted;
  report("reel", ok, {
    ...facts, pxPerSecond: Math.round(drifting), heldUnderMouse: +heldUnderMouse.toFixed(2), dragged: Math.round(dragged), thrown: Math.round(thrown),
    clicksAfterDrag: clicksAfterDrag - clicksBefore, clickUnder: under, clicksAfterClick: clicksAfterClick - clicksBefore, reported, sidewaysSwipes: swipes, swipeMovedIt: swiped, cloneForwarded,
    resumed: Math.round(resumed), heldForOverlay: +heldForOverlay.toFixed(2), lenisStopped: stopped, lenisRestarted: restarted,
  });
  await context.close();
}

/* ── reel keyboard: focus pauses it and brings an off-screen item into view ── */
if (wants("reelkeys")) {
  const { context, page } = await open();
  await settle(page);
  await page.evaluate(() => document.querySelector("#reel [role='group']").scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForTimeout(600);
  await page.focus("[data-probe='overlay']");
  const visited = [];
  for (let k = 0; k < 8; k++) {
    await page.keyboard.press("Tab");
    await page.waitForTimeout(800);
    visited.push(
      await page.evaluate(() => {
        const el = document.activeElement;
        const r = el.getBoundingClientRect();
        const view = document.querySelector("#reel [role='group']").getBoundingClientRect();
        return { item: el.dataset.reelItem ?? null, clone: el.hasAttribute("data-reel-clone"), inView: r.left >= view.left - 1 && r.right <= view.right + 1 };
      }),
    );
  }
  const x1 = await page.evaluate(() => new DOMMatrixReadOnly(getComputedStyle(document.querySelector("#reel [role='group'] > div > div")).transform).m41);
  await page.waitForTimeout(700);
  const x2 = await page.evaluate(() => new DOMMatrixReadOnly(getComputedStyle(document.querySelector("#reel [role='group'] > div > div")).transform).m41);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(200);
  const activated = await page.evaluate(() => document.querySelector("[data-probe='reel']").textContent);
  const items = visited.map((v) => v.item);
  const ok = items.join(",") === "1,2,3,4,5,6,7,8" && visited.every((v) => v.inView && !v.clone) && Math.abs(x2 - x1) < 1 && / 8$/.test(activated);
  report("reelkeys", ok, { order: items.join(","), allInView: visited.every((v) => v.inView), heldWhileFocused: +Math.abs(x2 - x1).toFixed(2), enterActivated: activated });
  await context.close();
}

/* ── page transition: nothing on the hard load, a fade on client navigation, and the scroll resets ── */
if (wants("transition")) {
  const { context, page } = await open();
  // The innermost transition wrapper: the one that remounts for this navigation.
  const wrapper = "[data-page-transition] [data-page-transition]";
  await page.waitForTimeout(700);
  const onLoad = await page.evaluate((s) => getComputedStyle(document.querySelector(s)).opacity + "|" + getComputedStyle(document.querySelector(s)).transform, wrapper);
  await settle(page, 2600);
  await page.evaluate(() => document.querySelector("#links").scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForTimeout(1500);
  const samples = [];
  // The lab's second page: same provider, new page.
  const dest = `/${lang}/lab/motion/second`;
  await page.click(`#links a[href='${dest}']`);
  for (let k = 0; k < 14; k++) {
    await page.waitForTimeout(60);
    samples.push(
      await page.evaluate((s) => {
        const el = document.querySelector(s);
        return { path: location.pathname, o: Number(getComputedStyle(el).opacity).toFixed(2), y: Math.round(window.scrollY) };
      }, wrapper),
    );
  }
  await page.waitForTimeout(900);
  const end = await page.evaluate((s) => {
    const el = document.querySelector(s);
    return { path: location.pathname, o: getComputedStyle(el).opacity, t: getComputedStyle(el).transform, y: Math.round(window.scrollY), style: el.getAttribute("style") ?? "" };
  }, wrapper);
  const faded = samples.some((x) => x.path === dest && Number(x.o) < 0.9);
  const ok = onLoad === "1|none" && faded && end.path === dest && end.o === "1" && end.t === "none" && end.y === 0;
  report("transition", ok, { onHardLoad: onLoad, fadeSeen: faded, opacities: samples.filter((x) => x.path === dest).map((x) => x.o).join(" "), end });
  await context.close();
}

/* ── a page reached from the BOTTOM of the previous one still gets its entrances ── */
if (wants("navarm")) {
  const { context, page } = await open();
  await settle(page);
  await page.evaluate(() => document.querySelector("#links").scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForTimeout(1500);
  const from = await page.evaluate(() => Math.round(window.scrollY));
  const dest = lang === "en" ? "/th/lab/motion" : "/en/lab/motion";
  await page.click(`#links a[href='${dest}']`);
  await page.waitForTimeout(1600);
  const arrived = await page.evaluate(() => ({ path: location.pathname, y: Math.round(window.scrollY) }));
  const armed = await hiddenCount(page);
  // The first screen of the new page must be showing, and what is below must be waiting.
  const firstScreen = await page.evaluate(() => {
    const line = document.querySelector("p.hero-line");
    return { opacity: getComputedStyle(line).opacity, masks: line.querySelectorAll(".pkh-line-mask").length };
  });
  await page.evaluate(() => document.querySelector("#reveal ul").scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForTimeout(250);
  const during = await page.evaluate(() => getComputedStyle(document.querySelector("#reveal ul").children[2]).opacity);
  await page.waitForTimeout(1700);
  const after = await page.evaluate(() => getComputedStyle(document.querySelector("#reveal ul").children[2]).opacity);
  const ok = arrived.path === dest && arrived.y === 0 && armed > 15 && firstScreen.opacity === "1" && firstScreen.masks === 0 && Number(during) < 1 && after === "1";
  report("navarm", ok, { leftFromY: from, arrived, armedBelowTheFold: armed, firstScreen, tileOpacityAsItArrives: during, tileOpacityAfter: after });
  await context.close();
}

/* ── the provider outlives the page: route change under a persistent provider, then Back ── */
if (wants("persist")) {
  const { context, page, messages } = await open();
  await settle(page);
  await page.evaluate(() => { document.querySelector("[data-probe='motion']").__sameNode = true; });
  await page.evaluate(() => document.querySelector("#links").scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForTimeout(1500);
  const from = await page.evaluate(() => Math.round(window.scrollY));
  // Leave with an overlay still announced as open: the new page must not inherit a locked scroll.
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("pkh:overlay", { detail: { open: true } })));
  await page.waitForTimeout(100);
  const lockedBefore = await page.evaluate(() => document.documentElement.classList.contains("lenis-stopped"));
  await page.evaluate((href) => document.querySelector(`#links a[href='${href}']`).click(), `/${lang}/lab/motion/second`);
  await page.waitForTimeout(1700);
  const arrived = await page.evaluate(() => ({
    path: location.pathname,
    y: Math.round(window.scrollY),
    providerKept: document.querySelector("[data-probe='motion']").__sameNode === true,
    ready: document.querySelector("[data-probe='motion']").dataset.ready,
    locked: document.documentElement.classList.contains("lenis-stopped"),
    heroMasks: document.querySelectorAll("p.hero-line .pkh-line-mask").length,
    heroOpacity: getComputedStyle(document.querySelector("p.hero-line")).opacity,
  }));
  const armed = await hiddenCount(page);
  await page.mouse.move(700, 450);
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(1300);
  const wheeled = await page.evaluate(() => Math.round(window.scrollY));
  await page.goBack();
  await page.waitForTimeout(3200);
  const back = await page.evaluate(() => ({ path: location.pathname, y: Math.round(window.scrollY) }));
  const hiddenInView = await page.evaluate(() => {
    let n = 0;
    for (const el of document.querySelectorAll("main *")) {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight || r.width === 0 || el.closest("[hidden]")) continue;
      const cs = getComputedStyle(el);
      if (cs.opacity === "0" || /inset\((100|9\d)/.test(cs.clipPath)) n++;
    }
    return n;
  });
  await page.mouse.wheel(0, -500);
  await page.waitForTimeout(1300);
  const wheeledBack = await page.evaluate(() => Math.round(window.scrollY));
  const real = messages.filter((m) => !/preloaded using link preload|Download the React DevTools/.test(m));
  const ok = lockedBefore && arrived.path.endsWith("/second") && arrived.y === 0 && arrived.providerKept && arrived.ready === "true" && !arrived.locked &&
    arrived.heroMasks === 0 && arrived.heroOpacity === "1" && armed > 0 && Math.abs(wheeled - 600) < 40 && back.path.endsWith("/lab/motion") &&
    Math.abs(back.y - from) < 40 && hiddenInView === 0 && Math.abs(wheeledBack - (back.y - 500)) < 40 && real.length === 0;
  report("persist", ok, { leftFromY: from, lockedBefore, arrived, armedBelowTheFold: armed, wheelFromTop: wheeled, back, hiddenInViewAfterBack: hiddenInView, wheelAfterBack: wheeledBack, console: real.slice(0, 3) });
  await context.close();
}

/* ── layout: the same page, to a tenth of a pixel, with no JavaScript, reduced motion, armed and revealed ── */
if (wants("layout")) {
  const measure = (page) =>
    page.evaluate(() => {
      const top = (sel) => Math.round((document.querySelector(sel).getBoundingClientRect().top + window.scrollY) * 10) / 10;
      return [top("#split"), top("#reveal"), top("#media"), top("#reel"), top("#sky"), top("#links"), document.documentElement.scrollHeight].join(" ");
    });
  const widths = [1440, 390];
  const seen = [];
  for (const width of widths) {
    const viewport = { width, height: 900 };
    const a = await open({ reduced: true, viewport });
    await a.page.waitForTimeout(1200);
    const reduced = await measure(a.page);
    await a.context.close();
    const b = await open({ viewport });
    await settle(b.page);
    const armed = await measure(b.page);
    await b.page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
        window.scrollTo({ top: y, behavior: "instant" });
        await new Promise((r) => setTimeout(r, 140));
      }
    });
    await b.page.waitForTimeout(2400);
    const revealed = await measure(b.page);
    await b.context.close();
    seen.push({ width, same: reduced === armed && armed === revealed, reduced, armed, revealed });
  }
  report("layout", seen.every((x) => x.same), seen.map((x) => (x.same ? { width: x.width, identical: true, positions: x.armed } : x)));
}

/* ── hash on load: /page#section lands under the header with nothing hidden in or above the view ── */
if (wants("hashload")) {
  const { context, page } = await open({}, URL + "#sky");
  await settle(page, 3800);
  const state = await page.evaluate(() => {
    let hiddenInView = 0;
    let hiddenAbove = 0;
    for (const el of document.querySelectorAll("main *")) {
      if (el.closest("[hidden]") || el.tagName === "CANVAS") continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0) continue;
      const cs = getComputedStyle(el);
      if (!(cs.opacity === "0" || /inset\((100|9\d)/.test(cs.clipPath))) continue;
      if (r.bottom < 0) hiddenAbove++;
      else if (r.top < innerHeight) hiddenInView++;
    }
    return { y: Math.round(window.scrollY), targetTop: Math.round(document.querySelector("#sky").getBoundingClientRect().top), hiddenInView, hiddenAbove };
  });
  const header = await page.evaluate(() => Math.round(document.querySelector("header").getBoundingClientRect().bottom));
  report("hashload", state.targetTop >= header && state.targetTop < header + 60 && state.hiddenInView === 0 && state.hiddenAbove === 0, { ...state, headerBottom: header });
  await context.close();
}

/* ── reel on a phone: a sideways swipe moves it, a vertical one scrolls the page, a tap activates once ── */
if (wants("reeltouch") && engine === chromium) {
  const { context, page } = await open({ touch: true, viewport: { width: 390, height: 844 } });
  const client = await context.newCDPSession(page);
  await settle(page, 3300);
  await page.evaluate(() => document.querySelector("#reel [role='group']").scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForTimeout(900);
  const x = () => page.evaluate(() => new DOMMatrixReadOnly(getComputedStyle(document.querySelector("#reel [role='group'] > div > div")).transform).m41);
  const count = () => page.evaluate(() => Number(document.querySelector("[data-probe='reel']").dataset.count));
  const middle = () => page.evaluate(() => { const r = document.querySelector("#reel [role='group']").getBoundingClientRect(); return Math.round(r.top + r.height / 2); });
  const swipe = async (x0, y0, x1, y1, steps = 8) => {
    await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y: y0 }] });
    for (let i = 1; i <= steps; i++) {
      await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: Math.round(x0 + ((x1 - x0) * i) / steps), y: Math.round(y0 + ((y1 - y0) * i) / steps) }] });
      await page.waitForTimeout(16);
    }
    await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  };
  const a = await x();
  await page.waitForTimeout(1000);
  const b = await x();
  const before = await count();
  let cy = await middle();
  await swipe(300, cy, 80, cy);
  await page.waitForTimeout(200);
  const c = await x();
  await page.waitForTimeout(2600);
  const afterSwipe = (await count()) - before;
  const y0 = await page.evaluate(() => window.scrollY);
  await swipe(200, cy, 200, cy - 260);
  await page.waitForTimeout(900);
  const y1 = await page.evaluate(() => window.scrollY);
  const afterScroll = (await count()) - before;
  await page.evaluate(() => document.querySelector("#reel [role='group']").scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForTimeout(700);
  cy = await middle();
  await page.touchscreen.tap(160, cy);
  await page.waitForTimeout(500);
  const afterTap = (await count()) - before;
  const html = await page.evaluate(() => document.documentElement.className);
  const ok = !/lenis/.test(html) && Math.abs(b - a) > 15 && Math.abs(c - b) > 150 && afterSwipe === 0 && y1 - y0 > 150 && afterScroll === 0 && afterTap === 1;
  report("reeltouch", ok, { lenis: /lenis/.test(html), driftPxPerSecond: Math.round(Math.abs(b - a)), sidewaysSwipeMoved: Math.round(Math.abs(c - b)), clicksAfterSwipe: afterSwipe, verticalSwipeScrolledPage: Math.round(y1 - y0), clicksAfterVerticalSwipe: afterScroll, clicksAfterTap: afterTap });
  await context.close();
}

/* ── loader contract: event fires once, onLoaderDone timing, duration, repeat visit is shorter ── */
if (wants("loader")) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.__events = [];
    window.addEventListener("pkh:loader-done", () => window.__events.push(Math.round(performance.now())));
    const seen = new MutationObserver(() => {
      const el = document.querySelector("[data-pkh-loader]");
      if (!el) return;
      if (!el.hidden && window.__shown === undefined) window.__shown = Math.round(performance.now());
      if (el.hidden && window.__shown !== undefined && window.__gone === undefined) window.__gone = Math.round(performance.now());
    });
    seen.observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ["hidden"] });
  });
  const run = async () => {
    await page.goto(URL, { waitUntil: "load" });
    await page.waitForTimeout(3600);
    return page.evaluate(() => ({ shown: window.__shown, gone: window.__gone, events: window.__events, visit: document.querySelector("[data-pkh-loader]").dataset.visit }));
  };
  const first = await run();
  const second = await run();
  const d1 = first.gone - first.shown;
  const d2 = second.gone - second.shown;
  const ok = first.visit === "first" && second.visit === "repeat" && first.events.length === 1 && second.events.length === 1 && d1 > 1500 && d1 < 3000 && d2 > 600 && d2 < 1500 && d2 < d1;
  report("loader", ok, { firstVisitMs: d1, repeatVisitMs: d2, firstEventAfterShownMs: first.events[0] - first.shown, events: [first.events.length, second.events.length] });
  await context.close();
}

/* ── loader fail-safe: if the page never hydrates, the loader still leaves by 3 seconds ── */
if (wants("failsafe")) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  // Let the document and its inline script through, block every script file: React never arrives.
  await page.route("**/*.js", (route) => route.abort());
  await page.addInitScript(() => {
    const seen = new MutationObserver(() => {
      const el = document.querySelector("[data-pkh-loader]");
      if (!el) return;
      if (!el.hidden && window.__shown === undefined) window.__shown = Math.round(performance.now());
      if (el.hidden && window.__shown !== undefined && window.__gone === undefined) window.__gone = Math.round(performance.now());
    });
    seen.observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ["hidden"] });
  });
  await page.goto(URL, { waitUntil: "commit" });
  await page.waitForTimeout(3900);
  const state = await page.evaluate(() => ({ shown: window.__shown, gone: window.__gone, done: window.__pkhLoader?.done, hidden: document.querySelector("[data-pkh-loader]").hidden }));
  const life = state.gone - state.shown;
  report("failsafe", state.hidden === true && state.done === true && life <= 3050, { loaderLifeMs: life, ...state });
  await context.close();
}

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed${failed.length ? "  FAILED: " + failed.map((r) => r.name).join(", ") : ""}  (${engineName}, ${lang})`);
process.exit(failed.length ? 1 : 0);
