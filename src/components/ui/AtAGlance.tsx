import type { ReactNode } from "react";
import { cx } from "./cx";
import styles from "./AtAGlance.module.css";

/**
 * The short answer, near the top of a content page: three to five plain bullets on a rounded white panel
 * (BUILD-CONTRACT section 5, "Content pages").
 *
 *   <AtAGlance title={ui.terms.atAGlance} items={[t.locality, t.rooftops, t.pool]} />
 *
 * `title` is the glossary's terms.atAGlance ("At a glance" / "สรุปสั้นๆ"). It is rendered as an <h2> in
 * the kicker style, so the block is reachable by heading; it is deliberately not a landmark region
 * (a page already has one per section). Each bullet is one complete, publishable sentence that answers
 * the page's question: not a teaser, and never a fact that is still unconfirmed.
 * The panel always reads as ink on white, wherever it is placed (data-ground="light").
 */

export interface AtAGlanceProps {
  title: string;
  /** Three to five bullets. Strings in almost every case; a bullet may carry an inline link. */
  items: ReactNode[];
  /** Give the title an id when something else needs to point at it. */
  titleId?: string;
  className?: string;
}

export function AtAGlance({ title, items, titleId, className }: AtAGlanceProps) {
  if (items.length === 0) return null;
  return (
    <div data-ground="light" className={cx(styles.glance, className)}>
      <h2 id={titleId} className={cx("eyebrow", styles.title)}>
        {title}
      </h2>
      <ul role="list" className={styles.list}>
        {items.map((item, i) => (
          <li key={i} className={styles.item}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
