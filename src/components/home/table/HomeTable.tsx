import { Fragment, type ReactNode } from "react";
import { getAsset } from "@/content/assets";
import { dining } from "@/content/dining";
import { copy, PAVILION, TABLE_REEL } from "@/content/pages/home/table";
import { isPublishable, type Locale } from "@/content/schema";
import { t } from "@/i18n/ui";
import { href } from "@/lib/routes";
import { GalleryReel } from "@/components/media";
import { MediaReveal, Parallax, Reveal, SplitReveal } from "@/components/motion";
import { Button, Chapter, Icon, Panel, Picture, cx } from "@/components/ui";
import s from "./HomeTable.module.css";

/**
 * Homepage chapter 04, "Garden and table" (ART-DIRECTION section 6).
 *
 *   rail      04, the kicker, "Table", a two-line intro and the pill to the Dining page
 *   content   1. the statement: the resort's account of its kitchen garden, set large, lines rising
 *             2. the dining pavilion at dusk, unveiled, with a white dock straddling its lower edge that
 *                carries the two notes (what grows, what follows the season)
 *             3. a small reel of plates and garden beds that runs off the right edge of the screen
 *
 * Every sentence about the garden is printed from `dining.kitchenGarden.points`: the first point is
 * the statement, the next two make the first note and the rest make the second. If that record is ever
 * withdrawn (its status stops being publishable) the statement and the dock are simply not rendered;
 * nothing here restates a fact.
 *
 * The dock echoes the planner dock under the hero: a white rounded bar, half on the photograph.
 */

/** The statement with its one italic word (English only). */
function withAccent(text: string, accent: string): ReactNode {
  if (!accent) return text;
  const at = text.indexOf(accent);
  if (at < 0) throw new Error(`HomeTable: the accent word "${accent}" is not in the kitchen-garden statement.`);
  return (
    <>
      {text.slice(0, at)}
      <em>{accent}</em>
      {text.slice(at + accent.length)}
    </>
  );
}

/**
 * Thai has no spaces between words, so a browser may break a display line in the middle of a phrase.
 * The spaces a Thai writer does leave mark the phrases: each one is kept whole where it fits, and the
 * line then breaks between phrases. (Not a manual break: a phrase wider than the line still wraps.)
 */
function phrased(text: string): ReactNode {
  return text.split(" ").map((phrase, index) => (
    <Fragment key={index}>
      {index > 0 ? " " : null}
      <span className={s.phrase}>{phrase}</span>
    </Fragment>
  ));
}

export function HomeTable({ lang }: { lang: Locale }) {
  const c = copy[lang];
  const ui = t(lang);

  const garden = dining.kitchenGarden;
  const points = isPublishable(garden.status) ? garden.points[lang] : [];
  const [statement, ...rest] = points;
  const notes = [
    { label: c.notes.garden, text: rest.slice(0, 2).join(" ") },
    { label: c.notes.season, text: rest.slice(2).join(" ") },
  ].filter((note) => note.text);

  const pavilion = getAsset(PAVILION);
  // The Thai page names the page it goes to in full, so the pill does not repeat the chapter title.
  const dest = lang === "th" ? ui.pageNames.dining : ui.nav.dining;

  return (
    <Chapter
      lang={lang}
      id="table"
      number={4}
      kicker={c.kicker}
      // The rail arrives the way every chapter's does: the title rises out of its mask, the intro fades in after it.
      title={
        <SplitReveal as="span" lang={lang} className={s.railTitle}>
          {c.title}
        </SplitReveal>
      }
      intro={
        <Reveal as="span" variant="fade" delay={0.2} className={s.railIntro}>
          {lang === "th" ? phrased(c.intro) : c.intro}
        </Reveal>
      }
      className={s.chapter}
      actions={
        <Button variant="secondary" href={href(lang, "dining")} icon="arrow-right">
          {dest}
        </Button>
      }
    >
      {statement ? (
        <SplitReveal as="p" lang={lang} className={cx("statement", s.statement)}>
          {lang === "th" ? phrased(statement) : withAccent(statement, c.accent)}
        </SplitReveal>
      ) : null}

      {/* The caption rides inside the mask, so it arrives with the photograph and never before it. */}
      <MediaReveal className={s.photo}>
        <Parallax speed={0.08} className={s.drift}>
          <Picture asset={PAVILION} lang={lang} fill sizes="(min-width: 64rem) min(54rem, 62vw), 113vw" />
        </Parallax>
        <p className={s.tag}>{pavilion.caption[lang]}</p>
      </MediaReveal>

      {notes.length > 0 ? (
        <Reveal delay={0.2} className={s.dockWrap}>
          <Panel float className={s.dock}>
            {notes.map((note) => (
              <div key={note.label} className={s.note}>
                <p className={cx("eyebrow", s.noteLabel)}>{note.label}</p>
                <p className={s.noteText}>{note.text}</p>
              </div>
            ))}
          </Panel>
        </Reveal>
      ) : null}

      <div className={s.reelHead}>
        <p className="eyebrow">{c.reelKicker}</p>
        <p className={cx("eyebrow", s.hint)} aria-hidden="true">
          <Icon name="arrow-left" size={16} />
          <span>{c.reelHint}</span>
          <Icon name="arrow-right" size={16} />
        </p>
      </div>

      <div className={s.window}>
        <GalleryReel
          lang={lang}
          label={c.reelLabel}
          assets={TABLE_REEL.map((frame) => frame.asset)}
          ratios={Object.fromEntries(TABLE_REEL.map((frame) => [frame.asset, frame.ratio]))}
          heights={{ min: 13, max: 19 }}
          speed={26}
          className={s.reel}
        />
      </div>

      <p className={cx("small", "muted", s.reelNote)}>{c.reelNote}</p>
    </Chapter>
  );
}
