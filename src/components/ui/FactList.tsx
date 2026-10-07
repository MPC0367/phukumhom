import type { ReactNode } from "react";
import { cx } from "./cx";
import styles from "./FactList.module.css";

/**
 * Facts as a ledger: a semantic <dl>, one term and its value per row, rows ruled with hairlines.
 *
 *   <FactList items={[
 *     { term: "Outdoors", value: room.outdoors[lang] },
 *     { term: "Bathing", value: room.bathing[lang] },
 *   ]} />
 *
 *   ledger   (default) terms in one aligned column, values in the next, first lines on a shared baseline.
 *            Below 30rem it stacks by itself, so long values never squeeze into half a phone.
 *   stacked  term above value at every width — for narrow columns and for long values.
 *
 * Only publishable facts belong here: build `items` from `pub(fact)` and drop the row when it is null.
 * There is no empty state — an unknown fact has no row (BUILD-CONTRACT §2).
 */

export interface FactItem {
  term: string;
  value: ReactNode;
}

export interface FactListProps {
  items: FactItem[];
  variant?: "ledger" | "stacked";
  className?: string;
}

export function FactList({ items, variant = "ledger", className }: FactListProps) {
  if (items.length === 0) return null;
  return (
    <dl className={cx(styles.list, variant === "ledger" && styles.ledger, className)}>
      {items.map((item) => (
        <div key={item.term} className={styles.row}>
          <dt className={styles.term}>{item.term}</dt>
          <dd className={styles.value}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
