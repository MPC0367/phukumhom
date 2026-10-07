import { BOOKING_PROVIDER, RESORT_TIME_ZONE } from "@/content/site-public";

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

/** Dates are date-only strings in the resort's calendar (Asia/Bangkok). They are never turned into instants. */
export type IsoDate = `${number}-${number}-${number}`;

export interface StayQuery {
  checkin?: string;
  checkout?: string;
  adults?: number;
}

export type StayError = "invalid-date" | "past-arrival" | "departure-not-after-arrival" | "missing-departure" | "missing-arrival";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string | undefined | null): value is IsoDate {
  if (!value || !ISO_DATE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const probe = new Date(Date.UTC(y, m - 1, d));
  return probe.getUTCFullYear() === y && probe.getUTCMonth() === m - 1 && probe.getUTCDate() === d;
}

/** Today's calendar date at the resort, whatever the visitor's or the server's timezone. */
export function todayInBangkok(now: Date = new Date()): IsoDate {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: RESORT_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(now) as IsoDate;
}

/** Calendar arithmetic on a date-only value. UTC is used purely as a timezone-free calendar. */
export function addDays(date: string, days: number): IsoDate {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10) as IsoDate;
}

/** Validates a stay the way the on-site planner needs it. `null` means the selection can be handed over. */
export function stayError(q: StayQuery, today: string = todayInBangkok()): StayError | null {
  const { checkin, checkout } = q;
  if (!checkin && !checkout) return null; // no dates: the provider's own picker takes over
  if (!checkin) return "missing-arrival";
  if (!checkout) return "missing-departure";
  if (!isIsoDate(checkin) || !isIsoDate(checkout)) return "invalid-date";
  if (checkin < today) return "past-arrival";
  if (checkout <= checkin) return "departure-not-after-arrival";
  return null;
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
