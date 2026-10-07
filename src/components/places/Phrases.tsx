import { Fragment, type ReactNode } from "react";
import type { Locale } from "@/content/schema";
import styles from "./phrases.module.css";

/**
 * Thai text that wraps between its phrases.
 *
 *   <Phrases lang={lang} text={c.intro} />
 *
 * Thai is written without spaces between words, so a browser breaks a line wherever its dictionary
 * finds a word boundary, which can be in the middle of a compound (เส้น | ทาง) or straight after the
 * first word of a sentence. The spaces a Thai writer does leave mark the phrases. Each phrase is kept
 * whole where it fits, so the line breaks at a space instead. Nothing is typed into the text: no manual
 * break, no zero-width character (docs/VOICE.md 2.4). A phrase wider than its line still wraps inside
 * itself, so nothing can push the page wider than the screen.
 *
 * For short display and label text: an intro in a narrow rail, a sentence on a card, a one-line note.
 * Running paragraphs are better left to the browser. English is returned as it is.
 *
 * (Chapters 04 and 05 carry the same few lines privately; one shared copy in components/ui would do for all.)
 */
export function Phrases({ text, lang }: { text: string; lang: Locale }): ReactNode {
  if (lang !== "th") return text;
  return text.split(" ").map((phrase, index) => (
    <Fragment key={index}>
      {index > 0 ? " " : null}
      <span className={styles.phrase}>{phrase}</span>
    </Fragment>
  ));
}
