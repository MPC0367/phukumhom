/**
 * Stay dates: date-only strings in the resort's calendar, and the rules a stay must pass before it is
 * handed to the booking page.
 *
 * A date here is "YYYY-MM-DD" and nothing else. It is never turned into an instant in the visitor's
 * time zone: a guest in Los Angeles and a guest in Bangkok who both pick 11 November mean the same
 * night at the resort. "Today" is today in Asia/Bangkok, whatever the device clock's zone says.
 *
 * This module has no imports, so it can be tested with plain Node:
 *   node --test tests/stay-dates.test.mjs
 * src/lib/booking.ts re-exports everything here; application code imports from there.
 */

/** The resort's time zone. (Also in src/content/site-public.ts; repeated so this file needs no imports.) */
export const STAY_TIME_ZONE = "Asia/Bangkok";

export type IsoDate = `${number}-${number}-${number}`;

export interface StayDates {
  checkin?: string;
  checkout?: string;
}

export type StayError = "invalid-date" | "past-arrival" | "departure-not-after-arrival" | "missing-departure" | "missing-arrival";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** A real calendar date in YYYY-MM-DD form: "2026-02-30" and "soon" are not. */
export function isIsoDate(value: string | undefined | null): value is IsoDate {
  if (!value || !ISO_DATE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const probe = new Date(Date.UTC(y, m - 1, d));
  return probe.getUTCFullYear() === y && probe.getUTCMonth() === m - 1 && probe.getUTCDate() === d;
}

/** Today's calendar date at the resort, whatever the visitor's or the server's time zone. */
export function todayInBangkok(now: Date = new Date()): IsoDate {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: STAY_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(now) as IsoDate;
}

/** Calendar arithmetic on a date-only value. UTC is used purely as a zone-free calendar. */
export function addDays(date: string, days: number): IsoDate {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10) as IsoDate;
}

/** Nights between two date-only values. */
export function nightsBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86_400_000);
}

/**
 * Validates a stay the way the on-site planner needs it. `null` means the selection can be handed over.
 *
 *   no dates at all            → null: the booking page opens on its own date picker
 *   arrival only / departure only → "missing-departure" / "missing-arrival"
 *   not a real date            → "invalid-date"
 *   arrival before today       → "past-arrival"   (today at the resort)
 *   departure on or before arrival → "departure-not-after-arrival"   (a reversed range is never sent)
 */
export function stayError(q: StayDates, today: string = todayInBangkok()): StayError | null {
  const { checkin, checkout } = q;
  if (!checkin && !checkout) return null;
  if (!checkin) return "missing-arrival";
  if (!checkout) return "missing-departure";
  if (!isIsoDate(checkin) || !isIsoDate(checkout)) return "invalid-date";
  if (checkin < today) return "past-arrival";
  if (checkout <= checkin) return "departure-not-after-arrival";
  return null;
}
