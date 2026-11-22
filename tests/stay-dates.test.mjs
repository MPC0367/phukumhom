// Date-only stay rules: past dates, reversed ranges, month and year boundaries, and "today" in Bangkok.
// Run: node --test tests/stay-dates.test.mjs
import assert from "node:assert/strict";
import { test } from "node:test";
import { addDays, isIsoDate, nightsBetween, stayError, todayInBangkok } from "../src/lib/stay-dates.ts";

const TODAY = "2026-10-08";

test("no dates at all is allowed: the booking page opens on its own picker", () => {
  assert.equal(stayError({}, TODAY), null);
  assert.equal(stayError({ checkin: "", checkout: "" }, TODAY), null);
});

test("a valid future stay passes", () => {
  assert.equal(stayError({ checkin: "2026-11-11", checkout: "2026-11-13" }, TODAY), null);
  assert.equal(stayError({ checkin: TODAY, checkout: "2026-10-09" }, TODAY), null);
});

test("an arrival in the past is refused", () => {
  assert.equal(stayError({ checkin: "2026-10-07", checkout: "2026-10-09" }, TODAY), "past-arrival");
  assert.equal(stayError({ checkin: "2025-12-31", checkout: "2026-10-09" }, TODAY), "past-arrival");
});

test("departure before arrival, and same-day arrival and departure, are refused: a reversed range is never sent", () => {
  assert.equal(stayError({ checkin: "2026-11-13", checkout: "2026-11-11" }, TODAY), "departure-not-after-arrival");
  assert.equal(stayError({ checkin: "2026-11-11", checkout: "2026-11-11" }, TODAY), "departure-not-after-arrival");
});

test("one date without the other is refused, never guessed", () => {
  assert.equal(stayError({ checkin: "2026-11-11" }, TODAY), "missing-departure");
  assert.equal(stayError({ checkout: "2026-11-13" }, TODAY), "missing-arrival");
});

test("things that are not calendar dates are refused", () => {
  assert.equal(stayError({ checkin: "2026-02-30", checkout: "2026-03-02" }, TODAY), "invalid-date");
  assert.equal(stayError({ checkin: "11/11/2026", checkout: "2026-11-13" }, TODAY), "invalid-date");
  assert.equal(isIsoDate("2026-02-29"), false); // 2026 is not a leap year
  assert.equal(isIsoDate("2028-02-29"), true);
  // While a year is being typed a date field passes through 0002, 0020 and 0202. None may be handed over.
  assert.equal(stayError({ checkin: "0002-01-01", checkout: "0002-01-02" }, TODAY), "invalid-date");
  assert.equal(stayError({ checkin: "0202-01-01", checkout: "0202-01-02" }, TODAY), "past-arrival");
});

test("month and year boundaries", () => {
  assert.equal(addDays("2026-10-31", 1), "2026-11-01");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2028-02-28", 1), "2028-02-29");
  assert.equal(addDays("2027-02-28", 1), "2027-03-01");
  assert.equal(nightsBetween("2026-12-30", "2027-01-02"), 3);
  assert.equal(stayError({ checkin: "2026-12-31", checkout: "2027-01-01" }, TODAY), null);
});

test("today is today at the resort, whatever the clock's own zone says", () => {
  // 18:30 UTC on 7 October is 01:30 on 8 October in Bangkok (UTC+7).
  assert.equal(todayInBangkok(new Date("2026-10-07T18:30:00Z")), "2026-10-08");
  // 16:59 UTC is 23:59 the same day in Bangkok.
  assert.equal(todayInBangkok(new Date("2026-10-07T16:59:00Z")), "2026-10-07");
  // New Year: 17:00 UTC on 31 December is already 1 January in Bangkok.
  assert.equal(todayInBangkok(new Date("2026-12-31T17:00:00Z")), "2027-01-01");
});

test("dates stay strings: comparing them is comparing calendar days", () => {
  assert.equal("2026-11-11" < "2026-11-13", true);
  assert.equal("2026-09-30" < "2026-10-01", true);
  assert.equal("2026-12-31" < "2027-01-01", true);
});
