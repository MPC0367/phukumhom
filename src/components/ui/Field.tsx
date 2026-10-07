import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cx } from "./cx";
import { Icon } from "./Icon";
import styles from "./Field.module.css";

/**
 * Labelled form controls with a floating label, done in CSS alone.
 *
 *   <Field label={ui.labels.name} name="name" autoComplete="name" required />
 *   <Field label={ui.terms.arrival} name="checkin" type="date" />
 *   <Field label={ui.labels.email} name="email" type="email" hint={…} error={errors.email} />
 *   <SelectField label={ui.terms.adults} name="adults" defaultValue="2">
 *     <option value="1">1</option> …
 *   </SelectField>
 *   <TextareaField label={ui.labels.message} name="message" rows={5} />
 *
 * - The label is a real <label for>, always visible. In an empty text field it rests on the centre
 *   line; on focus, or once there is a value, it rises to the top edge. The mechanism is
 *   :placeholder-shown and :focus-within, so it works with JavaScript off and survives autofill.
 * - Native date and time inputs never match :placeholder-shown, so their label is always raised and the
 *   browser's own "dd/mm/yyyy" hint and calendar button stay fully usable. A select's label is always
 *   raised too.
 * - 56px tall, --radius-sm, a control-strength border (--border-control) that turns forest with a second
 *   pixel on focus. Fields are white wells: they read on white and on sand panels.
 * - `error` puts the control in the error state: aria-invalid, the message beneath it wired with
 *   aria-describedby, an error-coloured border and a mark that does not rely on colour. Pass the
 *   message only while it applies. `hint` is the standing help line.
 * - `optionalLabel` appends "(optional)" to the label; required fields take the native `required`.
 * - Everything else (name, type, autoComplete, inputMode, min, max, defaultValue, event handlers from a
 *   client parent) is passed to the control. `className` goes on the wrapper, for grid placement.
 */

interface FieldBase {
  label: string;
  /** Standing help under the control. */
  hint?: ReactNode;
  /** The error message; its presence sets the error state. */
  error?: ReactNode;
  /** Text such as ui.labels.optional, shown after the label in brackets. */
  optionalLabel?: string;
  className?: string;
}

function ids(base: string, hint: ReactNode, error: ReactNode, describedBy?: string) {
  const hintId = hint ? `${base}-hint` : undefined;
  const errorId = error ? `${base}-error` : undefined;
  const described = [describedBy, errorId, hintId].filter(Boolean).join(" ") || undefined;
  return { hintId, errorId, described };
}

function Messages({ hint, error, hintId, errorId }: { hint?: ReactNode; error?: ReactNode; hintId?: string; errorId?: string }) {
  if (!hint && !error) return null;
  return (
    <div className={styles.messages}>
      {error ? (
        <p id={errorId} className={styles.error}>
          <Icon name="x" size={14} className={styles.errorMark} />
          <span>{error}</span>
        </p>
      ) : null}
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function LabelText({ label, optionalLabel }: { label: string; optionalLabel?: string }) {
  return (
    // One inline box: the label is a flex container, and a flex item of its own would lose its leading space.
    <span className={styles.labelText}>
      {label}
      {optionalLabel ? <span className={styles.optional}> ({optionalLabel})</span> : null}
    </span>
  );
}

/* ── Field: a single-line input ── */

/**
 * Input types that draw their own hint and picker ("dd/mm/yyyy", a calendar button). They get no
 * placeholder, so they can never match :placeholder-shown in any engine and their label is always
 * raised, clear of what the browser draws inside the field.
 */
const NATIVE_HINT = new Set(["date", "time", "datetime-local", "month", "week"]);

export type FieldProps = FieldBase & Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "placeholder">;

export function Field({ label, hint, error, optionalLabel, className, id, type = "text", ...rest }: FieldProps) {
  const generated = useId();
  const controlId = id ?? generated;
  const { hintId, errorId, described } = ids(controlId, hint, error, rest["aria-describedby"]);
  return (
    <div className={cx(styles.field, error ? styles.invalid : undefined, className)}>
      <div className={styles.control}>
        {/* A single space as the placeholder: invisible, and it is what lets CSS tell an empty field from a filled one. */}
        <input {...rest} id={controlId} type={type} placeholder={NATIVE_HINT.has(type) ? undefined : " "} className={styles.input} aria-invalid={error ? true : rest["aria-invalid"]} aria-describedby={described} />
        <label htmlFor={controlId} className={styles.label}>
          <LabelText label={label} optionalLabel={optionalLabel} />
        </label>
      </div>
      <Messages hint={hint} error={error} hintId={hintId} errorId={errorId} />
    </div>
  );
}

/* ── SelectField: a native select; the label is always raised ── */

export type SelectFieldProps = FieldBase & Omit<SelectHTMLAttributes<HTMLSelectElement>, "className">;

export function SelectField({ label, hint, error, optionalLabel, className, id, children, ...rest }: SelectFieldProps) {
  const generated = useId();
  const controlId = id ?? generated;
  const { hintId, errorId, described } = ids(controlId, hint, error, rest["aria-describedby"]);
  return (
    <div className={cx(styles.field, error ? styles.invalid : undefined, className)}>
      <div className={cx(styles.control, styles.raised)}>
        <select {...rest} id={controlId} className={cx(styles.input, styles.select)} aria-invalid={error ? true : rest["aria-invalid"]} aria-describedby={described}>
          {children}
        </select>
        <label htmlFor={controlId} className={styles.label}>
          <LabelText label={label} optionalLabel={optionalLabel} />
        </label>
        <Icon name="chevron-down" size={18} className={styles.chevron} />
      </div>
      <Messages hint={hint} error={error} hintId={hintId} errorId={errorId} />
    </div>
  );
}

/* ── TextareaField ── */

export type TextareaFieldProps = FieldBase & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className" | "placeholder">;

export function TextareaField({ label, hint, error, optionalLabel, className, id, rows = 5, ...rest }: TextareaFieldProps) {
  const generated = useId();
  const controlId = id ?? generated;
  const { hintId, errorId, described } = ids(controlId, hint, error, rest["aria-describedby"]);
  return (
    <div className={cx(styles.field, error ? styles.invalid : undefined, className)}>
      <div className={cx(styles.control, styles.area)}>
        <textarea {...rest} id={controlId} rows={rows} placeholder=" " className={cx(styles.input, styles.textarea)} aria-invalid={error ? true : rest["aria-invalid"]} aria-describedby={described} />
        <label htmlFor={controlId} className={styles.label}>
          <LabelText label={label} optionalLabel={optionalLabel} />
        </label>
      </div>
      <Messages hint={hint} error={error} hintId={hintId} errorId={errorId} />
    </div>
  );
}
