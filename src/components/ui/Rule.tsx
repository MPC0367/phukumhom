import { cx } from "./cx";
import styles from "./Rule.module.css";

/**
 * The thin separator ELEMENT. It stands wherever older copy typed a middle dot or a dash, which this
 * site never prints (ART-DIRECTION section 0).
 *
 *   <p className="eyebrow">Wang Katha, Pak Chong <Rule /> 18:42 local time</p>      vertical, inline
 *   <span className="numeral">01</span> <Rule orientation="horizontal" /> The setting   a short dash-length line
 *   <Rule orientation="horizontal" length="full" />                                    a hairline across its box
 *
 * It is decoration (aria-hidden) and takes the colour of the text around it, so it reads on every
 * surface, including over a photograph. A real space is written on each side of it: sighted readers see
 * the line, a screen reader hears two separate phrases instead of "Pak Chong18:42".
 *
 * In a row that can wrap, a rule may land at the end of a line. Keep such rows short, or drop items at
 * narrow widths the way the hero meta strip does.
 */

export interface RuleProps {
  orientation?: "vertical" | "horizontal";
  /** Horizontal only: a dash-length mark (default) or the full width of its container. */
  length?: "short" | "full";
  className?: string;
}

export function Rule({ orientation = "vertical", length = "short", className }: RuleProps) {
  if (orientation === "horizontal" && length === "full") {
    return <span aria-hidden="true" className={cx(styles.rule, styles.full, className)} />;
  }
  return (
    <>
      {" "}
      <span aria-hidden="true" className={cx(styles.rule, styles[orientation], className)} />{" "}
    </>
  );
}
