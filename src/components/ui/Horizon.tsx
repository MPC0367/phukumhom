import { cx } from "./cx";
import { formatNumeral } from "./Kicker";
import { Rule } from "./Rule";
import styles from "./Horizon.module.css";

/**
 * A labelled hairline: the quiet divider for places that have no chapter rail (the footer's columns, a
 * policy page, the 404).
 *
 *   <Horizon />                                   a plain hairline
 *   <Horizon label="Plan the journey" />          a label, then the line running on to the edge
 *   <Horizon number={2} label="Choose your stay" />   01, a short rule, the label, the line
 *
 * Between the number and the label there is a drawn rule element, never a typed dash.
 * `draw` lets the line grow from the left once, where motion is welcome and scripting is on; otherwise
 * the line is simply there.
 *
 * The line is decoration (role="presentation"); the label is real text.
 */

export interface HorizonProps {
  label?: string;
  /** Section number. A number is padded to two digits; a string is printed as given. */
  number?: number | string;
  draw?: boolean;
  className?: string;
}

/** Re-exported from Kicker so first-build imports (`import { formatNumeral } from "./Horizon"`) keep working. */
export { formatNumeral };

export function Horizon({ label, number, draw = false, className }: HorizonProps) {
  const hasNumber = number !== undefined && number !== "";
  const hasLabel = Boolean(label) || hasNumber;
  return (
    <div className={cx(styles.horizon, draw && styles.draw, className)}>
      {hasLabel ? (
        <p className={cx("eyebrow", styles.label)}>
          {hasNumber ? <span className="numeral">{formatNumeral(number)}</span> : null}
          {hasNumber && label ? <Rule orientation="horizontal" /> : null}
          {label}
        </p>
      ) : null}
      <span className={styles.line} role="presentation" />
    </div>
  );
}
