import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { experiences } from "@/content/experiences";
import { copy, TILE_IDS, type TileId } from "@/content/pages/home/grounds";
import { pub, type Locale } from "@/content/schema";
import { t } from "@/i18n/ui";
import { href } from "@/lib/routes";
import { MediaReveal, Parallax, Reveal, SplitReveal } from "@/components/motion";
import { Button, Chapter, Icon, Picture, TextLink, cx, type PictureRatio } from "@/components/ui";
import s from "./HomeGrounds.module.css";

/**
 * Homepage chapter 05, "Around the resort" (ART-DIRECTION section 6).
 *
 *   rail      05, the kicker, "Grounds", an intro and the pill to the Experiences page
 *   content   four tiles in a staggered 2×2 of mixed shapes, then the one pointer ("ask the team")
 *
 * THE TILES are the four editorial entries of src/content/experiences.ts, in that file's order: the
 * gardens and the pond, the private rooftop, the shared pool, the kitchen garden. Name, photograph and
 * facts are read from there; the one sentence a tile prints is an excerpt of the entry's description,
 * checked here character for character (see content/pages/home/grounds.ts).
 *
 * A tile is a rounded photograph, a name, one sentence, and a link to that entry on the Experiences
 * page. It has two forms and the stylesheet chooses between them:
 *
 *   plain    the name and the sentence stand under the photograph. This is what the server sends, and
 *            what a touch screen, a visitor without JavaScript and a visitor who asked for reduced
 *            motion all keep: nothing is ever waiting on a hover.
 *   lifted   with a mouse, once the motion system is running (html.motion): the photograph fills the
 *            tile, the name sits on it as a paper tag, and on hover or keyboard focus a white sheet
 *            slides up with the name and the sentence while the photograph eases to 1.04.
 *
 * "By arrangement. Ask the team." is printed on a tile only when the entry publishes
 * `bookingRequired: true`. No entry does today.
 */

/** The shape each photograph is fetched for: the tallest crop its tile ever takes. */
const FETCH: Record<TileId, PictureRatio> = {
  "gardens-and-pond": "3/4",
  "private-rooftop": "4/5",
  "shared-pool": "1/1",
  "kitchen-garden": "3/4",
};

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

export function HomeGrounds({ lang }: { lang: Locale }) {
  const c = copy[lang];
  const ui = t(lang);

  const tiles = TILE_IDS.map((id) => {
    const entry = experiences.find((e) => e.id === id);
    if (!entry || !entry.asset) throw new Error(`HomeGrounds: experiences.ts has no entry with a photograph for "${id}".`);
    const excerpt = c.excerpts[id];
    if (!entry.description[lang].includes(excerpt)) {
      throw new Error(`HomeGrounds: the ${lang} sentence for "${id}" is no longer part of that entry's description in experiences.ts.`);
    }
    return { id, name: entry.name[lang], asset: entry.asset, excerpt, arranged: pub(entry.bookingRequired) === true };
  });

  return (
    <Chapter
      lang={lang}
      id="grounds"
      number={5}
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
        <Button variant="secondary" href={href(lang, "experiences")} icon="arrow-right">
          {ui.nav.experiences}
        </Button>
      }
    >
      <div className={s.field}>
        <ul role="list" className={s.tiles}>
          {tiles.map((tile, index) => {
            const nameId = `grounds-${tile.id}`;
            return (
              <li key={tile.id} className={s.cell}>
                <article className={s.tile} aria-labelledby={nameId}>
                  <MediaReveal className={s.media} delay={index % 2 === 1 ? 0.12 : 0}>
                    {/* The tall tiles drift a little further than the wide ones, so the four never move as one sheet. */}
                    <Parallax speed={index % 3 === 0 ? 0.08 : 0.05} className={s.drift}>
                      <Picture asset={tile.asset} lang={lang} fill ratio={FETCH[tile.id]} sizes="(min-width: 64rem) 27rem, (min-width: 40rem) 46vw, 88vw" />
                    </Parallax>
                    {/* The whole photograph is the link; the name below it (or on the sheet) is its name. */}
                    <Link href={href(lang, "experiences", { hash: tile.id })} className={s.go} aria-labelledby={nameId}>
                      <span className={s.badge} aria-hidden="true">
                        <Icon name="arrow-up-right" size={18} />
                      </span>
                    </Link>
                    <span className={s.tag} aria-hidden="true">
                      {tile.name}
                    </span>
                  </MediaReveal>
                  <div className={s.sheet}>
                    <h3 id={nameId} className={cx("h3", s.name)}>
                      {tile.name}
                    </h3>
                    <p className={s.excerpt}>{tile.excerpt}</p>
                    {tile.arranged ? <p className={cx("eyebrow", s.arranged)}>{c.byArrangement}</p> : null}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>

      <Reveal className={s.ask}>
        <p className={s.askText}>{c.ask}</p>
        <TextLink variant="arrow" href={href(lang, "contact")}>
          {ui.actions.contactResort}
        </TextLink>
      </Reveal>
    </Chapter>
  );
}
