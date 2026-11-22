// The booking handoff, end to end, as far as a link can be checked: from the on-site planner to the
// provider's page, reading what the PROVIDER shows (not only the outgoing URL). It stops there: no room is
// selected, nothing is reserved and nothing is paid.
//
//   node _qa/booking-check.mjs [base]
//
// It visits https://letsbook.me a handful of times with future dates. Run it sparingly.
import { chromium } from "playwright";

const BASE = (process.argv[2] ?? "http://127.0.0.1:8352").replace(/\/+$/, "");
const PROVIDER = "https://letsbook.me/booking/phukumhomresort";
const browser = await chromium.launch();
const results = [];
const note = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  | " + detail : ""}`);
};
const day = (offset) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(Date.now() + offset * 86_400_000));
const checkin = day(34);
const checkout = day(36);

/* ── 1. Without JavaScript: a plain link and a plain GET form ── */
{
  const html = await (await fetch(BASE + "/en")).text();
  const link = html.includes(`href="${PROVIDER}"`);
  const form = /<form[^>]+method="get"[^>]+action="https:\/\/letsbook\.me\/booking\/phukumhomresort"/.test(html) || /<form[^>]+action="https:\/\/letsbook\.me\/booking\/phukumhomresort"[^>]+method="get"/.test(html);
  const names = ['name="checkin"', 'name="checkout"', 'name="adults"'].every((n) => html.includes(n));
  note("no JavaScript: booking links are plain anchors to the provider", link);
  note("no JavaScript: the planner is a GET form to the provider with checkin, checkout and adults", form && names);
  note("no JavaScript: nothing unsupported is sent (no room, language, currency or children field)", !/name="(roomTypeId|room|lang|currency|children)"/.test(html.match(/<form[^>]+letsbook[\s\S]*?<\/form>/)?.[0] ?? ""));
}

/* ── 2. From the planner to the provider: dates and three adults ── */
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "en-GB" });
  const page = await context.newPage();
  await page.goto(BASE + "/en/stay", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await page.locator("header a[data-open-planner]").first().click();
  await page.waitForTimeout(600);
  const dialog = page.locator("dialog[open]");
  await dialog.locator('input[name="checkin"]').fill(checkin);
  await dialog.locator('input[name="checkin"]').dispatchEvent("change");
  await dialog.locator('input[name="checkout"]').fill(checkout);
  await dialog.locator('input[name="checkout"]').dispatchEvent("change");
  await dialog.locator('select[name="adults"]').selectOption("3");
  await Promise.all([page.waitForURL(/letsbook\.me/, { timeout: 45000 }), dialog.locator('button[type="submit"]').click()]);
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(4000);
  const url = new URL(page.url());
  note("handoff: the provider URL carries the chosen dates and adults", url.searchParams.get("checkin") === checkin && url.searchParams.get("checkout") === checkout && url.searchParams.get("adults") === "3", url.search);
  const sent = [...url.searchParams.keys()];
  note("handoff: this site sent only checkin, checkout and adults", !sent.some((k) => ["lang", "roomTypeId", "currency"].includes(k)), sent.join(","));

  const text = (await page.locator("body").innerText()).replace(/\s+/g, " ");
  const [, , ci] = checkin.split("-");
  const [, , co] = checkout.split("-");
  const guests = /3 Adults|3 Guests|3A\b/.test(text);
  note("handoff: the provider SHOWS three adults", guests, (text.match(/1 Room[^.]{0,40}/)?.[0] ?? "").slice(0, 60));
  // The provider's search bar prints the two dates; find both day numbers near a month name.
  const dates = await page.evaluate(() => [...document.querySelectorAll("input, [class*=date], [class*=Date]")].map((el) => (el.value || el.textContent || "").trim()).filter((t) => /\d/.test(t) && t.length < 60).slice(0, 12));
  const shown = dates.join(" | ");
  note("handoff: the provider SHOWS the chosen dates", new RegExp(`\\b${Number(ci)}\\b`).test(shown + text.slice(0, 600)) && new RegExp(`\\b${Number(co)}\\b`).test(shown + text.slice(0, 600)), shown.slice(0, 160));
  note("handoff: all three room types are offered for three adults", ["Deluxe Balcony", "Deluxe with Bathtub", "Executive Pool Spa"].every((n) => text.includes(n)));
  await page.screenshot({ path: "_qa/shots/booking-handoff.png" });

  // Back returns to the site.
  await page.goBack({ waitUntil: "load" });
  await page.waitForTimeout(1200);
  note("handoff: the browser's Back button returns to this site", page.url().startsWith(BASE), page.url());
  await context.close();
}

/* ── 3. One and two adults, and no dates ── */
for (const adults of [1, 2]) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: "en-GB" });
  const page = await context.newPage();
  await page.goto(`${PROVIDER}?checkin=${checkin}&checkout=${checkout}&adults=${adults}`, { waitUntil: "load", timeout: 60000 });
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3500);
  const text = (await page.locator("body").innerText()).replace(/\s+/g, " ");
  note(`handoff: the provider shows ${adults} adult${adults > 1 ? "s" : ""}`, new RegExp(`\\b${adults} (Adult|Guest)`).test(text), (text.match(/1 Room[^.]{0,40}/)?.[0] ?? "").slice(0, 60));
  await context.close();
}
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: "en-GB" });
  const page = await context.newPage();
  const res = await page.goto(PROVIDER, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(2500);
  note("no dates: the plain provider link opens the booking page on its own dates", (res?.status() ?? 0) === 200 && /letsbook\.me/.test(page.url()), page.url().slice(0, 110));
  await context.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed  (stay tested: ${checkin} to ${checkout}; no reservation or payment was made)`);
process.exitCode = failed.length ? 1 : 0;
