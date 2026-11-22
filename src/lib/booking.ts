import { BOOKING_PROVIDER } from "@/content/site-public";
import { stayError } from "./stay-dates";

/**
 * The booking adapter — the only module that knows how a stay is handed to the booking provider.
 *
 * What was verified on the provider's receiving page (7 Oct 2026, see docs/RESEARCH.md and BUILD-CONTRACT §3):
 *   checkin=YYYY-MM-DD, checkout=YYYY-MM-DD and adults=N are honoured.
 *   lang, roomTypeId and currency are stripped, so they are never sent.
 *   children=N is honoured but the engine then assumes age 0, so children are added on the provider's page.
 *
 * This is a link-only integration. A cross-origin link cannot observe availability, prices, errors or a
 * completed reservation, so nothing here reports any of those.
 */

export const BOOKING = BOOKING_PROVIDER;

/**
 * The date rules (date-only strings, today at the resort, what makes a stay valid) live in
 * src/lib/stay-dates.ts, a module with no imports so it can be tested with plain Node. They are
 * re-exported here: application code keeps importing from this adapter.
 */
export { addDays, isIsoDate, nightsBetween, stayError, todayInBangkok, type IsoDate, type StayError } from "./stay-dates";

export interface StayQuery {
  checkin?: string;
  checkout?: string;
  adults?: number;
}

/**
 * The outbound booking URL. With no arguments it is the plain verified destination — the href every
 * booking link carries, so it works with JavaScript disabled. Dates and adults are appended only when
 * they form a valid stay; anything else falls back to the plain destination rather than a broken search.
 */
export function bookingHref(q: StayQuery = {}): string {
  const url = new URL(BOOKING.baseUrl);
  const hasDates = Boolean(q.checkin && q.checkout);
  if (hasDates && stayError(q) === null) {
    url.searchParams.set(BOOKING.params.checkin, q.checkin as string);
    url.searchParams.set(BOOKING.params.checkout, q.checkout as string);
  }
  if (typeof q.adults === "number" && Number.isInteger(q.adults) && q.adults >= 1 && q.adults <= BOOKING.maxAdultsSelectable) {
    url.searchParams.set(BOOKING.params.adults, String(q.adults));
  }
  return url.toString();
}

/** Field names for the no-JavaScript GET form that posts straight to the provider. */
export const BOOKING_FORM = {
  action: BOOKING.baseUrl,
  method: "get" as const,
  fields: BOOKING.params,
};
