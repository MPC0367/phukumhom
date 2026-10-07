import type { ReactNode } from "react";
import { cx } from "./cx";
import { Rule } from "./Rule";

/**
 * The small label: above a chapter title, along a meta strip, on a tile. English is set in tracked
 * capitals, Thai in plain 14px (typography.css switches on :lang, so Thai is never uppercased or tracked).
 *
 *   <Kicker>The setting</Kicker>
 *   <Kicker number={1}>The setting</Kicker>          01, a short rule, then the label
 *   <Kicker as="span">Check-in</Kicker>              inside another text element
 *
 * A page's <h1> may wear the same class: <h1 className="eyebrow">. The class is global.
 */

export interface KickerProps {
  as?: "p" | "span" | "div";
  id?: string;
  /** Chapter numbering. A number is padded to two digits; a string is printed as given. */
  number?: number | string;
  className?: string;
  children: ReactNode;
}

/** 3 → "03". Shared so numerals are padded the same way everywhere. */
export function formatNumeral(value: number | string): string {
  return typeof value === "number" ? String(value).padStart(2, "0") : value;
}

export function Kicker({ as: Tag = "p", id, number, className, children }: KickerProps) {
  const hasNumber = number !== undefined && number !== "";
  return (
    <Tag id={id} className={cx("eyebrow", className)}>
      {hasNumber ? (
        <>
          <span className="numeral">{formatNumeral(number)}</span>
          <Rule orientation="horizontal" />
        </>
      ) : null}
      {children}
    </Tag>
  );
}
