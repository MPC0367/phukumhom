import type { CSSProperties, FieldsetHTMLAttributes } from "react";
import { cx } from "./cx";
import styles from "./Segmented.module.css";

/**
 * A native radio group drawn as a pill switch. CSS only: it works with JavaScript off, submits with its
 * form like any radio group, and keeps the keyboard behaviour the platform gives radios (Tab to the
 * group, arrow keys to move the choice).
 *
 *   <Segmented name="reply" legend={ui.labels.replyChannel} defaultValue="phone"
 *              options={[{ value: "phone", label: ui.labels.phone }, { value: "email", label: ui.labels.email }]} />
 *
 * - Two to six options of similar length; the segments are equal widths. For more, or for long labels,
 *   use a <SelectField>.
 * - The forest thumb slides to the chosen segment where the browser supports :has(); elsewhere the
 *   chosen segment simply fills.
 * - `legend` names the group and is shown above it; `hideLegend` keeps it for assistive technology only
 *   (when a visible heading right above already says the same).
 * - Uncontrolled: `defaultValue` picks the initial choice. A client parent may listen with `onChange`
 *   on the group (it bubbles from the radios); any other fieldset attribute is passed through.
 */

export interface SegmentedOption {
  value: string;
  label: string;
}

export interface SegmentedProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "className" | "children" | "defaultValue"> {
  name: string;
  options: SegmentedOption[];
  defaultValue?: string;
  legend: string;
  hideLegend?: boolean;
  className?: string;
}

export function Segmented({ name, options, defaultValue, legend, hideLegend = false, className, ...rest }: SegmentedProps) {
  return (
    <fieldset {...rest} className={cx(styles.segmented, className)}>
      <legend className={hideLegend ? "vh" : styles.legend}>{legend}</legend>
      <div className={styles.track} style={{ "--segments": options.length } as CSSProperties}>
        {options.map((option) => (
          <label key={option.value} className={styles.option}>
            <input type="radio" className={styles.radio} name={name} value={option.value} defaultChecked={option.value === defaultValue} />
            <span className={styles.text}>{option.label}</span>
          </label>
        ))}
        <span className={styles.thumb} aria-hidden="true" />
      </div>
    </fieldset>
  );
}
