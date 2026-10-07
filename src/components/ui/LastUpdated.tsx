import type { Locale } from "@/content/schema";
import { formatDate, isoDateAttr } from "@/lib/format";
import { cx } from "./cx";

/**
 * "Last updated 7 October 2026" / "ปรับปรุงข้อมูลล่าสุด 7 ตุลาคม 2026".
 *
 *   <LastUpdated lang={lang} date={site.lastUpdated} />
 *
 * `date` is an ISO calendar date (YYYY-MM-DD). It is formatted by lib/format — never turned into an
 * instant, and with a Gregorian year in both languages (plain th-TH would print the Buddhist year).
 * A malformed date throws there, so a wrong value stops the build instead of reaching a guest.
 *
 * Wording: docs/glossary.json → patterns.lastUpdated.
 */

const LABEL: Record<Locale, string> = { en: "Last updated", th: "ปรับปรุงข้อมูลล่าสุด" };

export interface LastUpdatedProps {
  lang: Locale;
  /** ISO date, YYYY-MM-DD — normally `site.lastUpdated`. */
  date: string;
  className?: string;
}

export function LastUpdated({ lang, date, className }: LastUpdatedProps) {
  return (
    <p className={cx("small", "muted", "tabular", className)}>
      {LABEL[lang]} <time dateTime={isoDateAttr(date)}>{formatDate(date, lang, "long")}</time>
    </p>
  );
}
