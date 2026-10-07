import type { ReactNode } from "react";
import s from "./rooftop.module.css";

/**
 * `text` with each of `words` set in a span that does not wrap.
 *
 * For Thai. The script has no spaces between words, so the browser finds line breaks with a dictionary,
 * and its dictionary splits compounds: a line can end on กลาง and the next begin with แจ้ง. Marking the
 * compounds that matter keeps them whole without typing anything into the sentence (docs/VOICE.md
 * section 2.4: never a zero-width character to fix wrapping; the fix belongs in the stylesheet).
 *
 * The longest word is tried first, so a compound wins over its own parts. With no words (English) the
 * text is returned as it is. A plain module: used by the server component and by the control.
 */
export function keepWhole(text: string, words: readonly string[]): ReactNode {
  if (words.length === 0 || text === "") return text;
  const escaped = [...words].sort((a, b) => b.length - a.length).map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  // A capturing group: split() then returns the matches too, at the odd positions.
  return text.split(new RegExp(`(${escaped.join("|")})`, "g")).map((part, index) =>
    index % 2 === 1 ? (
      <span key={index} className={s.whole}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}
