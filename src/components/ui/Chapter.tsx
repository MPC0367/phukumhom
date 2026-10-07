import { isValidElement, useId, type CSSProperties, type ReactNode } from "react";
import type { Locale } from "@/content/schema";
import { cx } from "./cx";
import { Kicker, formatNumeral } from "./Kicker";
import styles from "./Chapter.module.css";

/**
 * The workhorse section (ART-DIRECTION section 2): a sticky left rail and a content column.
 *
 *   <Chapter lang={lang} id="story" number={1} kicker="The setting" title="Garden"
 *            intro="Clay-coloured rooms in a garden, each with a rooftop of its own."
 *            actions={<TextLink variant="arrow" href={href(lang, "stay")}>Rooms</TextLink>}>
 *     …the content column…
 *   </Chapter>
 *
 *   rail      numeral, kicker, the title as an <h2 class="chapter-title">, intro (34ch), actions.
 *             From 64rem it is columns 1 to 4 (railWidth={5}: 1 to 5) and sticks under the header at
 *             header height + 2.5rem while the content scrolls past. Below 64rem it stacks above the
 *             content. On a short viewport (under 45rem tall, which is also what 200% zoom looks like) it
 *             does not stick: a rail taller than the screen would hide its own last lines. It is always
 *             in normal flow and never has a max-height, so it cannot overlap what follows.
 *   title     one or two words. `<em>` gives the single italic accent word English is allowed.
 *             Its size is capped by the rail's own width and the length of its longest word, so a long
 *             word ("Photographs") is set smaller rather than running into the content column.
 *   tone      paper (default) · sand · white · twilight · forest. The dark tones re-point every token.
 *   divider   a full-width hairline above the chapter (default). Turn it off where the ground changes
 *             or straight after a band.
 *
 * The root is <section id data-chapter={kicker} data-chapter-number={number} aria-labelledby>: the
 * chapter index reads those two attributes to name the dots at the right edge of the screen.
 * `lang` is written on the root so a chapter quoted in the other language takes that language's type.
 * No two adjacent chapters should use the same composition in the content column.
 */

export interface ChapterProps {
  id?: string;
  /** 1 → "01". A string is printed as given. */
  number?: number | string;
  kicker: string;
  title: ReactNode;
  /** id for the <h2>; generated when omitted. */
  titleId?: string;
  intro?: ReactNode;
  /** Links and pills under the intro: TextLink, Button. */
  actions?: ReactNode;
  tone?: "paper" | "sand" | "white" | "twilight" | "forest";
  lang: Locale;
  divider?: boolean;
  railWidth?: 4 | 5;
  className?: string;
  children: ReactNode;
}

const TONE = {
  paper: styles.paper,
  sand: "on-sand",
  white: "on-white",
  twilight: "on-twilight",
  forest: "on-forest",
} as const;

/** The words of a title, whatever it is made of (a string, or text with an <em> accent). */
function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

/**
 * The largest size at which the title's longest word still fits the rail, in rail widths (cqi).
 * English: the longest word, at half an em a letter (Cormorant averages 0.39 to 0.46). Thai: the whole
 * title, counting only the letters that take a column (vowels and tone marks above and below do not),
 * at two thirds of an em each. Six letters or fewer never bind: the type scale's own maximum is smaller.
 */
function titleCap(title: ReactNode, lang: Locale): string {
  const text = textOf(title).trim();
  if (lang === "th") {
    const columns = [...text.replace(/[\s\p{M}]/gu, "")].length;
    return `${Math.round(1510 / Math.max(columns, 5)) / 10}cqi`;
  }
  const longest = Math.max(0, ...text.split(/\s+/).map((word) => [...word].length));
  return `${Math.round(2000 / Math.max(longest, 6)) / 10}cqi`;
}

export function Chapter({ id, number, kicker, title, titleId, intro, actions, tone = "paper", lang, divider = true, railWidth = 4, className, children }: ChapterProps) {
  const generatedId = useId();
  const headingId = titleId ?? generatedId;
  const hasNumber = number !== undefined && number !== "";
  const numeral = hasNumber ? formatNumeral(number) : undefined;

  return (
    <section
      id={id}
      lang={lang}
      data-chapter={kicker}
      data-chapter-number={numeral}
      aria-labelledby={headingId}
      className={cx(styles.chapter, TONE[tone], divider && styles.divider, railWidth === 5 && styles.wide, className)}
    >
      <div className={cx("container", styles.grid)}>
        <header className={styles.rail}>
          <div className={styles.railInner}>
            {numeral ? <p className={cx("numeral", styles.numeral)}>{numeral}</p> : null}
            <Kicker className={styles.kicker}>{kicker}</Kicker>
            <h2 id={headingId} className={cx("chapter-title", styles.title)} style={{ "--chapter-title-cap": titleCap(title, lang) } as CSSProperties}>
              {title}
            </h2>
            {intro ? <p className={styles.intro}>{intro}</p> : null}
            {actions ? <div className={styles.actions}>{actions}</div> : null}
          </div>
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </section>
  );
}
