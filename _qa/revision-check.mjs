// Checks for the revision of 8 October 2026 (the audit's findings), against the dev server.
//   node _qa/revision-check.mjs [base]
//
//   enquiry   copy-only wording everywhere, only the message required, typed text kept after an error,
//             success state only after a real copy, the clipboard-failure fallback, room prefill and
//             its survival across the language switch
//   planner   the dialog by keyboard (open, focus kept inside, Escape, focus restored), the button's
//             wording with and without dates, past dates, reversed ranges, the one-night default
//   loading   no blocking loader: the page's heading is visible as soon as the document is parsed
//   scrolling native: no smooth-scroll library classes on <html>
// The booking handoff itself (the provider's page) is checked by _qa/booking-check.mjs.
import { chromium } from "playwright";

const BASE = (process.argv[2] ?? "http://127.0.0.1:8352").replace(/\/+$/, "");
const browser = await chromium.launch();
const results = [];
const note = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  | " + detail : ""}`);
};

async function open(path, { clipboard = true, w = 1440, h = 900 } = {}) {
  const context = await browser.newContext({ viewport: { width: w, height: h }, permissions: clipboard ? ["clipboard-read", "clipboard-write"] : [] });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 160)));
  page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 160)));
  await page.goto(BASE + path, { waitUntil: "load" });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(1500);
  return { page, context, errors };
}

const future = (days) => {
  const d = new Date(Date.now() + days * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
};

/* ── Enquiry: wording ── */
{
  const offenders = [];
  for (const path of ["/en", "/en/contact", "/en/faq", "/en/location", "/en/stay/deluxe-balcony", "/th", "/th/contact", "/th/faq", "/th/location"]) {
    const html = await (await fetch(BASE + path)).text();
    const text = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ");
    if (/Send an enquiry|Send enquiry|send an enquiry from/.test(text)) offenders.push(`${path} (English "send")`);
    if (/ส่งข้อความสอบถาม(?!ถึง)/.test(text) && !/คัดลอก/.test(text)) offenders.push(`${path} (Thai "send")`);
  }
  note("enquiry: no page offers to SEND an enquiry while the form only copies", offenders.length === 0, offenders.join(", "));
  const home = await (await fetch(BASE + "/en")).text();
  note("enquiry: the homepage panel says Prepare an enquiry", home.includes("Prepare an enquiry"));
}

/* ── Enquiry: behaviour ── */
{
  const { page, context, errors } = await open("/en/contact?type=stay&room=deluxe-balcony");
  note("enquiry: the section is titled Write your enquiry", (await page.getByRole("heading", { name: "Write your enquiry" }).count()) === 1);
  note("enquiry: the room from the address is preselected", (await page.locator('select[name="room"]').inputValue()) === "deluxe-balcony");

  // Nothing typed: only the message is asked for, and nothing is copied.
  await page.getByRole("button", { name: "Copy enquiry" }).click();
  await page.waitForTimeout(250);
  const invalid = await page.locator('[aria-invalid="true"]').evaluateAll((els) => els.map((el) => el.getAttribute("name")));
  note("enquiry: an empty form asks only for the message", invalid.length === 1 && invalid[0] === "message", JSON.stringify(invalid));
  note("enquiry: the first invalid field has focus", await page.evaluate(() => document.activeElement?.getAttribute("name") === "message"));
  note("enquiry: no success state after a refused copy", (await page.getByText("Message copied").count()) === 0);

  // Typed text survives a validation error.
  await page.locator('input[name="name"]').fill("Test Guest");
  await page.getByRole("button", { name: "Copy enquiry" }).click();
  await page.waitForTimeout(200);
  note("enquiry: what was typed is kept after a validation error", (await page.locator('input[name="name"]').inputValue()) === "Test Guest");

  // A message alone is enough; a wrong phone number, if given, is still caught.
  await page.locator('input[name="tel"]').fill("12");
  await page.locator('textarea[name="message"]').fill("Is there a late check-in?");
  await page.getByRole("button", { name: "Copy enquiry" }).click();
  await page.waitForTimeout(200);
  note("enquiry: a contact detail is optional but checked when given", (await page.locator('input[name="tel"][aria-invalid="true"]').count()) === 1);
  await page.locator('input[name="tel"]').fill("");
  await page.getByRole("button", { name: "Copy enquiry" }).click();
  await page.waitForTimeout(500);
  const copied = await page.evaluate(() => navigator.clipboard.readText().catch(() => ""));
  note("enquiry: the message is on the clipboard, with the room, and no empty reply line", copied.includes("Is there a late check-in?") && copied.includes("Deluxe Balcony") && !/Please reply by/.test(copied), JSON.stringify(copied.slice(0, 140)));
  const status = (await page.locator('[role="status"]').last().innerText()).replace(/\s+/g, " ");
  note("enquiry: the status says copied and what to do next", status.includes("Message copied") && status.includes("Open Facebook and paste it into your message to the resort"), status.slice(0, 120));
  note("enquiry: it never says sent", !/has been sent|was sent|Enquiry sent/i.test(await page.locator("main").innerText()));
  const fb = await page.getByRole("link", { name: /Open the resort.s Facebook page/ }).getAttribute("href");
  note("enquiry: the next step is the verified Facebook page", fb === "https://www.facebook.com/PhukumhomResort", fb ?? "");

  // The language switch keeps the enquiry context.
  // The language switch keeps the enquiry context (it adds the query when pressed).
  await page.locator('header a[href^="/th/contact"]').first().click();
  await page.waitForURL((url) => url.pathname.startsWith("/th/contact"));
  await page.waitForTimeout(800);
  const th = new URL(page.url());
  note("enquiry: the language switch keeps type and room", th.searchParams.get("type") === "stay" && th.searchParams.get("room") === "deluxe-balcony" && (await page.locator('select[name="room"]').inputValue()) === "deluxe-balcony", th.pathname + th.search);
  note("enquiry: no console errors", errors.length === 0, errors.join(" | "));
  await context.close();
}

/* ── Enquiry: the clipboard refuses ── */
{
  const { page, context } = await open("/en/contact", { clipboard: false });
  await page.addInitScript(() => {});
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => Promise.reject(new Error("denied")) } });
    document.execCommand = () => false;
  });
  await page.locator('textarea[name="message"]').fill("Do you have parking for a van?");
  await page.getByRole("button", { name: "Copy enquiry" }).click();
  await page.waitForTimeout(500);
  const draft = await page.locator("textarea[readonly]").inputValue().catch(() => "");
  note("enquiry: when copying fails, the message is shown to copy by hand", draft.includes("Do you have parking for a van?") && (await page.getByText("Copy your message").count()) > 0, draft.slice(0, 80));
  note("enquiry: when copying fails, no success is claimed", (await page.getByText("Message copied").count()) === 0);
  note("enquiry: what was typed is kept after a failed copy", (await page.locator('textarea[name="message"]').inputValue()) === "Do you have parking for a van?");
  await context.close();
}

/* ── Planner: the dialog by keyboard ── */
{
  const { page, context, errors } = await open("/en/stay");
  const trigger = page.locator("header a[data-open-planner]").first();
  await trigger.focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(700);
  const dialog = page.locator("dialog[open]");
  note("planner: Enter on the header link opens the dialog", (await dialog.count()) === 1);
  note("planner: the dialog has a name", ((await dialog.getAttribute("aria-labelledby")) ?? (await dialog.getAttribute("aria-label")) ?? "") !== "");
  // Tab many times: focus must stay inside the dialog.
  let escaped = false;
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press("Tab");
    // A native modal dialog lets Tab pass through the browser's own controls (the page then reports <body>
    // as active). What must never happen is focus landing on something in the page behind the dialog.
    if (await page.evaluate(() => { const el = document.activeElement; return Boolean(el && el !== document.body && el !== document.documentElement && !el.closest("dialog[open]")); })) escaped = true;
  }
  note("planner: Tab never reaches the page behind the dialog", !escaped);

  // Wording with and without dates.
  const button = dialog.locator('button[type="submit"]');
  note("planner: with no dates the button offers to browse", (await button.innerText()).trim().startsWith("Browse rooms and rates"), (await button.innerText()).trim());
  const arrival = dialog.locator('input[name="checkin"]');
  const departure = dialog.locator('input[name="checkout"]');
  await arrival.fill(future(30));
  await arrival.dispatchEvent("change");
  await page.waitForTimeout(200);
  note("planner: choosing an arrival fills a one-night departure", (await departure.inputValue()) === future(31), `${await arrival.inputValue()} → ${await departure.inputValue()}`);
  note("planner: with dates the button checks availability", (await button.innerText()).trim().startsWith("Check availability"), (await button.innerText()).trim());

  // A past arrival and a reversed range are refused in place; nothing navigates.
  await arrival.fill("2020-01-01");
  await button.click();
  await page.waitForTimeout(300);
  note("planner: a past arrival is refused with a message and focus", new URL(page.url()).pathname.endsWith("/stay") && (await arrival.getAttribute("aria-invalid")) === "true" && (await page.evaluate(() => document.activeElement?.getAttribute("name"))) === "checkin");
  await arrival.fill(future(30));
  await departure.fill(future(29));
  await button.click();
  await page.waitForTimeout(300);
  note("planner: departure before arrival is refused, never sent", new URL(page.url()).pathname.endsWith("/stay") && (await departure.getAttribute("aria-invalid")) === "true");
  await departure.fill(future(30));
  await button.click();
  await page.waitForTimeout(300);
  note("planner: same-day arrival and departure is refused", new URL(page.url()).pathname.endsWith("/stay") && (await departure.getAttribute("aria-invalid")) === "true");

  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  note("planner: Escape closes the dialog and focus returns to the link", (await page.locator("dialog[open]").count()) === 0 && (await page.evaluate(() => document.activeElement?.hasAttribute("data-open-planner"))));
  note("planner: no console errors", errors.length === 0, errors.join(" | "));
  await context.close();
}

/* ── Loading and scrolling ── */
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(BASE + "/en", { waitUntil: "domcontentloaded" });
  const early = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    const rect = h1?.getBoundingClientRect();
    const covering = [...document.querySelectorAll("body *")].filter((el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return cs.position === "fixed" && r.width >= innerWidth && r.height >= innerHeight && cs.visibility !== "hidden" && cs.display !== "none" && Number(cs.opacity) > 0 && cs.pointerEvents !== "none";
    }).length;
    return { h1Visible: Boolean(rect && rect.height > 0 && getComputedStyle(h1).visibility !== "hidden" && Number(getComputedStyle(h1).opacity) > 0), covering };
  });
  note("loading: the heading is visible as soon as the document is parsed", early.h1Visible);
  note("loading: nothing covers the page while it loads", early.covering === 0, `${early.covering} full-screen fixed layers`);
  await page.waitForLoadState("load");
  await page.waitForTimeout(1200);
  const html = await page.evaluate(() => ({ cls: document.documentElement.className, storage: Object.keys(sessionStorage) }));
  note("scrolling: no smooth-scroll library is active", !/lenis/.test(html.cls), html.cls);
  note("loading: no session marker is written", html.storage.length === 0, html.storage.join(","));
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(400);
  note("scrolling: the wheel scrolls the page natively", (await page.evaluate(() => scrollY)) > 600, String(await page.evaluate(() => scrollY)));
  await context.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exitCode = failed.length ? 1 : 0;
