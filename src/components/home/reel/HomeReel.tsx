import { Fragment, type ReactNode } from "react";
import { copy, HOME_REEL } from "@/content/pages/home/reel";
import type { Locale } from "@/content/schema";
import { href } from "@/lib/routes";
import { GalleryReel } from "@/components/media";
import { Reveal, SplitReveal } from "@/components/motion";
import { Button, Icon, cx } from "@/components/ui";
import s from "./HomeReel.module.css";

/**
 * Homepage Band B, "the reel" (ART-DIRECTION section 6): a full-bleed sand band between chapters 05
 * and 06.
 *
 *   head   the heading (set as a kicker), a display line that rises line by line, one supporting
 *          sentence, the pill to the gallery page and, while the row can be dragged, a small cue
 *   reel   twelve photographs of mixed widths drifting from edge to edge; grab and throw the row,
 *          or open any frame in the viewer
 *
 * The band's <h2> is the kicker ("Gallery"): it names the section in plain words, and the display
 * line is a styled paragraph, the same division of labour as the hero.
 *
 * Not a chapter: it carries no data-chapter, so the chapter index passes over it.
 */

/** The line with its one italic word (English only). */
function withAccent(text: string, accent: string): ReactNode {
  if (!accent) return text;
  const at = text.indexOf(accent);
  if (at < 0) throw new Error(`HomeReel: the accent word "${accent}" is not in the display line.`);
  return (
    <>
      {text.slice(0, at)}
      <em>{accent}</em>
      {text.slice(at + accent.length)}
    </>
  );
}

/**
 * Thai has no spaces between words, so a browser may break a line in the middle of a phrase. The spaces
 * a Thai writer does leave mark the phrases: each one is kept whole where it fits, and the line then
 * breaks between phrases. (Not a manual break: a phrase wider than the line still wraps inside itself.)
 */
function phrased(text: string): ReactNode {
  return text.split(" ").map((phrase, index) => (
    <Fragment key={index}>
      {index > 0 ? " " : null}
      <span className={s.phrase}>{phrase}</span>
    </Fragment>
  ));
}

const HEADING_ID = "home-reel-heading";

export function HomeReel({ lang }: { lang: Locale }) {
  const c = copy[lang];

  return (
    <section id="reel" lang={lang} aria-labelledby={HEADING_ID} className={cx("on-sand", s.band)}>
      <div className={cx("container", s.head)}>
        <div className={s.words}>
          <h2 id={HEADING_ID} className={cx("eyebrow", s.kicker)}>
            {c.kicker}
          </h2>
          <SplitReveal as="p" lang={lang} className={cx("h2", s.line)}>
            {lang === "th" ? phrased(c.line) : withAccent(c.line, c.accent)}
          </SplitReveal>
        </div>
        <Reveal delay={0.15} className={s.side}>
          <p className={s.lead}>{lang === "th" ? phrased(c.lead) : c.lead}</p>
          <div className={s.actions}>
            <Button variant="secondary" href={href(lang, "gallery")} icon="arrow-right">
              {c.open}
            </Button>
            <p className={cx("eyebrow", s.hint)} aria-hidden="true">
              <Icon name="arrow-left" size={16} />
              <span>{c.hint}</span>
              <Icon name="arrow-right" size={16} />
            </p>
          </div>
        </Reveal>
      </div>

      <Reveal className={s.row}>
        <GalleryReel
          lang={lang}
          label={c.label}
          assets={HOME_REEL.map((frame) => frame.asset)}
          ratios={Object.fromEntries(HOME_REEL.map((frame) => [frame.asset, frame.ratio]))}
          className={s.reel}
        />
      </Reveal>
    </section>
  );
}
