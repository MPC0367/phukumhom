import type { ReactNode } from "react";
import { cx } from "./cx";
import styles from "./Panel.module.css";

/**
 * A rounded surface (--radius-lg) for things that belong together: an address card, a form, the sky panel.
 *
 *   <Panel>…</Panel>                                  white, the raised ground for forms and docks
 *   <Panel tone="sand" padding="lg">…</Panel>         the alternate ground
 *   <Panel tone="outline">…</Panel>                   no fill, a hairline: takes the colours of the band it is in
 *   <Panel as="form" …>                               pick the element; `id` and aria-labelledby pass through
 *
 * White and sand panels are ALWAYS ink on a light ground, wherever they are placed: they restate the
 * light tokens and carry data-ground="light", so a panel inside the twilight chapter, the forest band or
 * over a photograph has forest buttons, a forest focus ring and clay numerals again. An outline panel
 * does the opposite on purpose: it inherits its surroundings.
 * `float` adds the one shadow (--shadow-float): only for a panel that sits over a photograph.
 */

export interface PanelProps {
  as?: "div" | "section" | "article" | "aside" | "form" | "li";
  tone?: "white" | "sand" | "outline";
  padding?: "md" | "lg";
  /** The one shadow, for a panel floating over a photograph (the planner dock). */
  float?: boolean;
  id?: string;
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}

export function Panel({ as: Tag = "div", tone = "white", padding = "md", float = false, id, labelledBy, className, children }: PanelProps) {
  return (
    <Tag
      id={id}
      aria-labelledby={labelledBy}
      data-ground={tone === "outline" ? undefined : "light"}
      className={cx(styles.panel, styles[tone], styles[padding], float && styles.float, className)}
    >
      {children}
    </Tag>
  );
}
