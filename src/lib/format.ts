import type { Locale, Phone } from "@/content/schema";
import { INTL_LOCALE } from "@/i18n/config";

/**
 * Formatting for the few values the site prints itself: dates, the phone number, clock times.
 *
 * Dates are date-only strings (YYYY-MM-DD) in the resort's calendar. They are never turned into an
 * instant in the visitor's timezone: the string is read as a calendar date and formatted in UTC, so
 * "2026-10-07" prints as 7 October on every server and every device.
 *
 * Years are Gregorian in both languages (docs/VOICE.md §2.4). Plain `th-TH` prints the Buddhist year
 * and `dateStyle: "long"` adds an era ("ค.ศ."), so Thai uses `th-TH-u-ca-gregory` with explicit
 * day / month / year options, and the output is assembled from those three parts only.
 */

export type DateStyle = "long" | "short" | "month-year";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const DATE_OPTIONS: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  long: { day: "numeric", month: "long", year: "numeric" },
  short: { day: "numeric", month: "short", year: "numeric" },
  "month-year": { month: "long", year: "numeric" },
};

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(lang: Locale, style: DateStyle): Intl.DateTimeFormat {
  const key = `${lang}:${style}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(INTL_LOCALE[lang], { ...DATE_OPTIONS[style], calendar: "gregory", numberingSystem: "latn", timeZone: "UTC" });
    formatters.set(key, f);
  }
  return f;
}

/** Calendar parts of a date-only string, or `null` when it is not a real date (2026-02-30, "soon", …). */
export function parseIsoDate(isoDate: string): { year: number; month: number; day: number } | null {
  const m = ISO_DATE.exec(isoDate);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) return null;
  return { year, month, day };
}

/**
 * "7 October 2026" / "7 ตุลาคม 2026" (long, the default) · "7 Oct 2026" / "7 ต.ค. 2026" (short) ·
 * "October 2026" / "ตุลาคม 2026" (month-year).
 *
 * Throws on a malformed date: every date printed here comes from a content file, and a wrong one
 * should stop the build rather than reach a guest as an empty space or "Invalid Date".
 */
export function formatDate(isoDate: string, lang: Locale, style: DateStyle = "long"): string {
  const parts = parseIsoDate(isoDate);
  if (!parts) throw new RangeError(`formatDate: "${isoDate}" is not a calendar date in YYYY-MM-DD form.`);
  // Noon UTC keeps the calendar day fixed whatever the formatter's own conventions are.
  const instant = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12));
  const byType = new Map<string, string>();
  for (const part of formatter(lang, style).formatToParts(instant)) byType.set(part.type, part.value);
  const day = byType.get("day");
  const month = byType.get("month") ?? "";
  // The year is taken from the string itself, so no calendar or era setting can ever move it.
  const year = String(parts.year);
  return style === "month-year" || !day ? `${month} ${year}` : `${day} ${month} ${year}`;
}

/** The machine-readable twin for `<time dateTime>`: the date-only string, validated. */
export function isoDateAttr(isoDate: string): string {
  if (!parseIsoDate(isoDate)) throw new RangeError(`isoDateAttr: "${isoDate}" is not a calendar date in YYYY-MM-DD form.`);
  return isoDate;
}

/** The current Gregorian year at the resort (Asia/Bangkok) — for the copyright line in both languages. */
export function yearInBangkok(now: Date = new Date()): number {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Bangkok", year: "numeric", calendar: "gregory", numberingSystem: "latn" }).format(now));
}

const CLOCK = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** 24-hour clock time as printed: "14:00" in English, "14:00 น." in Thai. `null` for anything else. */
export function formatTime(time: string | null | undefined, lang: Locale): string | null {
  if (!time || !CLOCK.test(time)) return null;
  return lang === "th" ? `${time} น.` : time;
}

/**
 * The one phone number, as printed: national grouping on Thai pages ("065 542 9451"), international on
 * English pages ("+66 65 542 9451"). Pass `pub(site.phone)`; an unpublished number gives `null` and the
 * caller renders nothing.
 */
export function formatPhone(phone: Phone, lang: Locale): string;
export function formatPhone(phone: Phone | null | undefined, lang: Locale): string | null;
export function formatPhone(phone: Phone | null | undefined, lang: Locale): string | null {
  if (!phone) return null;
  return lang === "th" ? phone.national : phone.international;
}

/** `tel:+66655429451`. Only digits and one leading plus survive, whatever the stored spacing. */
export function telHref(phone: Phone): string;
export function telHref(phone: Phone | null | undefined): string | null;
export function telHref(phone: Phone | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.e164.replace(/\D/g, "");
  if (!digits) return null;
  return `tel:+${digits}`;
}

/** Whole numbers with Latin digits and the locale's grouping ("1,204"). Thai numerals are never used. */
export function formatInteger(value: number, lang: Locale): string {
  return new Intl.NumberFormat(lang === "th" ? "th-TH-u-nu-latn" : "en-GB", { maximumFractionDigits: 0 }).format(value);
}

/** Length in Unicode code points — how titles, descriptions and alt text are counted in this project. */
export function codePoints(text: string): number {
  return [...text].length;
}
