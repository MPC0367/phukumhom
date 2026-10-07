import type { ReactNode } from "react";
import type { Locale } from "@/content/schema";
import { cx } from "./cx";
import { Horizon } from "./Horizon";
import styles from "./SectionHeader.module.css";

/**
 * How a section opens: the Horizon (with its number and label), then the heading and an optional lead.
 *
 *   <SectionHeader lang={lang} number={1} label="The setting" heading="A garden, a pond and a great deal of sky"
 *                  headingId="setting-title" lead="…" align="split" />
 *
 * The heading element is an <h2> (or <h3> with level={3}) wearing the .h2 size: hierarchy is meaning,
 * size is CSS. Keep links out of the heading. `align="split"` moves the lead to the right-hand columns
 * on wide screens, its first line on the heading's baseline; below 64rem it stacks like "start".
 *
 * `lang` is written onto the block, so a header in the other language (a specimen, a quoted label) takes
 * that language's type scale. `draw` is passed to the Horizon.
 */

export interface SectionHeaderProps {
  /** Editorial number for the homepage story sections (01–05) only. */
  number?: number | string;
  /** The short Horizon label, e.g. glossary home.sections.setting.label. */
  label?: string;
  heading: ReactNode;
  /** Give the heading an id and pass the same value to <Section labelledBy>. */
  headingId?: string;
  level?: 2 | 3;
  lead?: ReactNode;
  align?: "start" | "split";
  lang: Locale;
  draw?: boolean;
  className?: string;
}

export function SectionHeader({ number, label, heading, headingId, level = 2, lead, align = "start", lang, draw = false, className }: SectionHeaderProps) {
  const Heading = level === 3 ? "h3" : "h2";
  return (
    <header lang={lang} className={cx(styles.header, align === "split" && styles.split, className)}>
      <Horizon number={number} label={label} draw={draw} />
      <div className={styles.body}>
        <Heading id={headingId} className={cx("h2", styles.heading)}>
          {heading}
        </Heading>
        {lead ? <p className={cx("lead", styles.lead)}>{lead}</p> : null}
      </div>
    </header>
  );
}
