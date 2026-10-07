// Functional checks of the inner pages against the dev server: node _qa/inner-check.mjs [base]
import { chromium } from "playwright";
const BASE = (process.argv[2] ?? "http://127.0.0.1:8352").replace(/\/+$/, "");
const browser = await chromium.launch();
const results = [];
const note = (name, ok, detail = "") => { results.push({ name, ok }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  | " + detail : ""}`); };
async function open(path, opts = {}) {
  const context = await browser.newContext({ viewport: { width: opts.w ?? 1440, height: opts.h ?? 900 }, permissions: ["clipboard-read", "clipboard-write"] });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); });
  page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 160)));
  await page.goto(BASE + path, { waitUntil: "load" });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(2500);
  return { page, context, errors };
}

// FAQ: search, count, hash
{
  const { page, context, errors } = await open("/en/faq#pets");
  note("faq: #pets opens its answer", await page.evaluate(() => document.getElementById("pets")?.open === true));
  const pad0 = await page.evaluate(() => { const a = document.querySelector('nav[aria-label="Jump to a group"] a'); return a ? getComputedStyle(a).paddingLeft + " / " + getComputedStyle(a).display : "none"; });
  console.log("      jump link padding-left / display:", pad0);
  const input = page.locator('input[type="search"]');
  note("faq: search field appears with script", (await input.count()) === 1);
  await input.fill("breakfast");
  await page.waitForTimeout(300);
  const shown = await page.locator("details").count();
  const status = (await page.locator('[role="status"]').first().textContent())?.trim();
  note("faq: search filters the questions", shown > 0 && shown < 16, `${shown} shown, status "${status}"`);
  await input.fill("zzzzqq");
  await page.waitForTimeout(200);
  note("faq: no match shows the empty line", (await page.locator("details").count()) === 0 && (await page.getByText("No question matches").count()) === 1);
  const pad = await page.evaluate(() => { const a = document.querySelector('nav[aria-label="Jump to a group"] a'); return a ? getComputedStyle(a).paddingLeft : "none"; });
  console.log("      jump link padding-left:", pad);
  note("faq: no console errors", errors.length === 0, errors.join(" | "));
  await context.close();
}

// Gallery: filter chips, URL, lightbox
{
  const { page, context, errors } = await open("/en/gallery");
  const all = await page.locator("ul[aria-label] > li").count();
  await page.getByRole("button", { name: /^Rooftops/ }).click();
  await page.waitForTimeout(400);
  const some = await page.locator("ul[aria-label] > li").count();
  note("gallery: a chip narrows the wall", some > 0 && some < all, `${all} -> ${some}, url ${new URL(page.url()).search}`);
  note("gallery: the filter is written to the address", new URL(page.url()).searchParams.get("filter") === "rooftops");
  await page.locator("ul[aria-label] > li button").first().click();
  await page.waitForTimeout(600);
  const dialogOpen = await page.evaluate(() => [...document.querySelectorAll("dialog")].some((d) => d.open));
  const counter = await page.evaluate(() => [...document.querySelectorAll("dialog")].find((d) => d.open)?.querySelector("[aria-live]")?.textContent ?? "");
  note("gallery: a photograph opens the viewer on the filtered set", dialogOpen && counter.includes(`of ${some}`), counter);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  note("gallery: Escape closes the viewer", await page.evaluate(() => ![...document.querySelectorAll("dialog")].some((d) => d.open)));
  note("gallery: no console errors", errors.length === 0, errors.join(" | "));
  await context.close();
}
{
  const { page, context } = await open("/en/gallery?filter=dining");
  const pressed = await page.evaluate(() => [...document.querySelectorAll('button[aria-pressed="true"]')].map((b) => b.textContent).join(","));
  note("gallery: ?filter=dining arrives filtered", /^Dining/.test(pressed), pressed);
  await context.close();
}

// Room page: View all photos, ask link
{
  const { page, context, errors } = await open("/en/stay/deluxe-balcony");
  await page.getByRole("link", { name: "View all photos" }).click();
  await page.waitForTimeout(500);
  note("room: View all photos opens the viewer", await page.evaluate(() => [...document.querySelectorAll("dialog")].some((d) => d.open)));
  await page.keyboard.press("Escape");
  const ask = await page.evaluate(() => [...document.querySelectorAll("a")].find((a) => a.textContent.includes("Ask about this room"))?.getAttribute("href"));
  note("room: Ask about this room carries the room", ask === "/en/contact?type=stay&room=deluxe-balcony", ask);
  note("room: no console errors", errors.length === 0, errors.join(" | "));
  await context.close();
}

// Contact: prefill from the query, validation, copy
{
  const { page, context, errors } = await open("/en/contact?type=stay&room=deluxe-bathtub");
  const type = await page.locator('select[name="type"]').inputValue();
  const room = await page.locator('select[name="room"]').inputValue().catch(() => "missing");
  note("contact: the query preselects a stay and the room", type === "stay" && room === "deluxe-bathtub", `${type} / ${room}`);
  await page.getByRole("button", { name: "Copy enquiry" }).click();
  await page.waitForTimeout(300);
  const invalid = await page.locator('[aria-invalid="true"]').count();
  note("contact: an empty form shows its errors and copies nothing", invalid >= 3 && (await page.getByText("Your message is copied").count()) === 0, `${invalid} invalid fields`);
  await page.locator('input[name="name"]').fill("Test Guest");
  await page.locator('input[name="tel"]').fill("+66 81 234 5678");
  await page.locator('textarea[name="message"]').fill("Is the rooftop reached by stairs?");
  await page.getByRole("button", { name: "Copy enquiry" }).click();
  await page.waitForTimeout(600);
  const copied = await page.evaluate(() => navigator.clipboard.readText().catch(() => ""));
  note("contact: a valid form copies the message", copied.includes("Test Guest") && copied.includes("Deluxe Bathtub") && copied.includes("+66 81 234 5678"), JSON.stringify(copied.slice(0, 160)));
  note("contact: it says copied, never sent", (await page.getByText("Your message is copied").count()) === 1 && (await page.getByText(/has been sent\./).count()) === 0);
  note("contact: no console errors", errors.length === 0, errors.join(" | "));
  await context.close();
}

// The API refuses GET and, unconfigured, a valid POST
{
  const get = await fetch(BASE + "/api/enquiry");
  note("api: GET is refused", get.status === 405, String(get.status));
  const post = await fetch(BASE + "/api/enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "general", name: "A", channel: "email", contact: "a@b.co", checkin: "", checkout: "", room: "", guests: "", message: "Hello", lang: "en" }) });
  const body = await post.json();
  note("api: a valid POST answers not-configured, not ok", post.status === 503 && body.ok === false && body.error === "not-configured", `${post.status} ${JSON.stringify(body)}`);
  const bad = await fetch(BASE + "/api/enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "general", name: "", channel: "email", contact: "nope", checkin: "", checkout: "", room: "", guests: "", message: "", lang: "en" }) });
  note("api: an invalid POST is refused with field errors", bad.status === 422, String(bad.status));
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exitCode = failed.length ? 1 : 0;
