import type { ReactNode } from "react";
import { cx } from "./cx";
import styles from "./Accordion.module.css";

/**
 * Questions and answers on native <details>/<summary>: it opens with JavaScript off, the browser exposes
 * the expanded state, find-in-page opens a closed answer, and a link to `#id` lands on the item.
 *
 *   <Accordion items={faq.map((f) => ({ id: f.id, question: f.question[lang], answer: <p>{…}</p> }))} />
 *   <Accordion items={…} exclusive="rooms" />     opening one closes the others (the native `name` group)
 *
 * The plus in the round marker turns into a minus as the item opens, and the answer opens with an eased
 * height where the browser can animate to `auto` (::details-content with interpolate-size); elsewhere it
 * settles in with a short fade. Reduced motion makes both instant.
 *
 * `id` becomes the element id (the FAQ deep-link target), so it must be unique on the page. `answer` is
 * running prose: paragraphs, a short list, an onward <TextLink>. Start the answer with the sentence that
 * answers the question outright.
 */

export interface AccordionItem {
  id: string;
  question: string;
  answer: ReactNode;
  /** Render this item open in the initial HTML (for example the one a page section is about). */
  open?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** A group name: only one item of the group is open at a time. Omit to let any number be open. */
  exclusive?: string;
  className?: string;
}

export function Accordion({ items, exclusive, className }: AccordionProps) {
  if (items.length === 0) return null;
  return (
    <div className={cx(styles.accordion, className)}>
      {items.map((item) => (
        <details key={item.id} id={item.id} name={exclusive} className={styles.item} open={item.open}>
          <summary className={styles.summary}>
            <span className={styles.question}>{item.question}</span>
            <span className={styles.marker} aria-hidden="true">
              <span className={styles.stroke} />
              <span className={cx(styles.stroke, styles.upright)} />
            </span>
          </summary>
          <div className={cx("prose", styles.answer)}>{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
