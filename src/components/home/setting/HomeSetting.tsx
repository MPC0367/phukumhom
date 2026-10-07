import type { AssetId, Locale } from "@/content/schema";
import { pub } from "@/content/schema";
import { getAsset } from "@/content/assets";
import { getRoom, rooms } from "@/content/rooms";
import { site } from "@/content/site";
import { copy } from "@/content/pages/home/setting";
import { CountUp, MediaReveal, Parallax, Reveal, SplitReveal } from "@/components/motion";
import { RoomName } from "@/components/site/RoomName";
import { Chapter, LightboxRoot, LightboxTrigger, Picture, TextLink, Tile, TileRow, lightboxItems, lightboxLabels } from "@/components/ui";
import { t } from "@/i18n/ui";
import { href } from "@/lib/routes";
import { Drift } from "./Drift";
import s from "./HomeSetting.module.css";

/**
 * Homepage chapter 01, "The setting" (ART-DIRECTION section 6). The section id is "story": legacy links
 * and the "Our story" navigation entry land on it.
 *
 *   rail      01, the kicker, the chapter title (rises out of its mask), one sentence that names the
 *             place, a link to the gallery
 *   content   the statement: its lines rise in turn
 *             three truthful tiles, wiped open: the count of room types (counts up), check-in, check-out,
 *             and the line that says the booking confirmation rules
 *             two photographs: a clay-pink building with its rooftop pergolas across the lawn, wide
 *             (legacy 04_29: the hero now opens on the pond frame, 02_08, which ART-DIRECTION also
 *             placed here, and a guest would meet it twice within two screens), and a balcony, portrait, hung
 *             lower so it overlaps the wide frame's corner. Each unveils, drifts inside its frame as the
 *             page moves (the portrait also rides a few pixels against the wide frame), and opens in the
 *             photograph viewer.
 *             in the open corner beside them: the sentence that the resort is in the Khao Yai area, not
 *             inside the national park, and the way on to the location page
 *
 * FACTS. The figure is the number of active room types and is shown only if every one of them lists a
 * private rooftop as a publishable fact; a time is shown only if `pub()` returns it. A tile whose fact is
 * withheld is simply absent, and if all three are, so is the strip. Captions are the catalogue's own; the
 * portrait is a room photograph and is named for the room it was catalogued against.
 *
 * Everything is plain HTML until the motion provider is up: the entrances hide nothing on the server,
 * without JavaScript or under reduced motion.
 */

const GARDEN: AssetId = "pink-building-rooftop-pergolas-lawn"; // legacy 04_29
const BALCONY: AssetId = "balcony-woven-table-chair-steps"; // legacy 02_07, catalogued for Deluxe Balcony

export interface HomeSettingProps {
  lang: Locale;
  /** The hairline above the chapter. Off by default: on the homepage this chapter follows the hero. */
  divider?: boolean;
}

export function HomeSetting({ lang, divider = false }: HomeSettingProps) {
  const c = copy[lang];
  const ui = t(lang);
  const unit = lang === "th" ? "น." : undefined;

  const active = rooms.filter((room) => room.active);
  const everyRooftopListed = active.length > 0 && active.every((room) => pub(room.features.privateRooftop) === true);
  const checkIn = pub(site.checkIn);
  const checkOut = pub(site.checkOut);
  const hasTiles = everyRooftopListed || Boolean(checkIn) || Boolean(checkOut);

  const garden = getAsset(GARDEN);
  const balcony = getAsset(BALCONY);
  const balconyRoom = balcony.rooms.length > 0 ? getRoom(balcony.rooms[0]) : null;

  return (
    <Chapter
      id="story"
      number={1}
      lang={lang}
      divider={divider}
      kicker={c.kicker}
      title={
        <SplitReveal as="span" lang={lang} className={s.railTitle}>
          {c.title}
        </SplitReveal>
      }
      intro={
        <Reveal as="span" variant="fade" delay={0.2} className={s.railIntro}>
          {c.intro}
        </Reveal>
      }
      actions={
        <TextLink variant="arrow" href={href(lang, "gallery")}>
          {ui.nav.gallery}
        </TextLink>
      }
    >
      <SplitReveal as="p" lang={lang} className={`statement ${s.statement}`}>
        {c.statement.before}
        {c.statement.accent ? <em>{c.statement.accent}</em> : null}
        {c.statement.after} {c.statementMore}
      </SplitReveal>

      {hasTiles ? (
        <div className={s.facts}>
          <Reveal variant="clip">
            <TileRow label={c.tiles.label}>
              {everyRooftopListed ? (
                <Tile
                  figure={
                    <span className={s.digits}>
                      <CountUp value={active.length} />
                    </span>
                  }
                  figureLength={String(active.length).length}
                  label={c.tiles.roomTypes.label}
                  note={c.tiles.roomTypes.note}
                />
              ) : null}
              {checkIn ? (
                <Tile figure={<span className={s.digits}>{checkIn}</span>} figureLength={checkIn.length} unit={unit} label={c.tiles.checkIn.label} note={c.tiles.checkIn.note} />
              ) : null}
              {checkOut ? (
                <Tile figure={<span className={s.digits}>{checkOut}</span>} figureLength={checkOut.length} unit={unit} label={c.tiles.checkOut.label} note={c.tiles.checkOut.note} />
              ) : null}
            </TileRow>
          </Reveal>
          {checkIn || checkOut ? (
            <Reveal as="p" variant="fade" delay={0.25} className={s.reference}>
              {c.tiles.reference}
            </Reveal>
          ) : null}
        </div>
      ) : null}

      <LightboxRoot items={lightboxItems([GARDEN, BALCONY], lang)} labels={lightboxLabels(lang)}>
        <div className={s.duo}>
          <div className={s.duoGrid}>
            <figure className={s.wide}>
              <LightboxTrigger index={0} label={`${c.openPhoto}: ${garden.caption[lang]}`} className={s.wideTrigger}>
                <MediaReveal className={s.wideFrame}>
                  <Parallax speed={0.1} className={s.fill}>
                    <Picture asset={GARDEN} lang={lang} fill ratio="3/2" sizes="(min-width: 64rem) min(46vw, 40rem), 100vw" />
                  </Parallax>
                </MediaReveal>
              </LightboxTrigger>
              <figcaption className={s.caption}>{garden.caption[lang]}</figcaption>
            </figure>

            <Drift distance={26} className={s.tall}>
              <figure className={s.tallFigure}>
                <LightboxTrigger index={1} label={`${c.openPhoto}: ${balcony.caption[lang]}`} className={s.tallTrigger}>
                  <MediaReveal delay={0.18} className={s.tallFrame}>
                    <div className={s.tallInner}>
                      <Parallax speed={-0.07} className={s.fill}>
                        <Picture asset={BALCONY} lang={lang} fill ratio="4/5" sizes="(min-width: 64rem) min(24vw, 21rem), 58vw" />
                      </Parallax>
                    </div>
                  </MediaReveal>
                </LightboxTrigger>
                <figcaption className={s.caption}>
                  {balconyRoom ? (
                    <span className={s.captionRoom}>
                      <RoomName lang={lang} name={balconyRoom.name} />
                    </span>
                  ) : null}
                  {" "}
                  <span className={s.captionText}>{balcony.caption[lang]}</span>
                </figcaption>
              </figure>
            </Drift>

            <Reveal className={s.note}>
              <p className={s.noteText}>{c.note}</p>
              <TextLink variant="arrow" href={href(lang, "location")}>
                {ui.pageNames.location}
              </TextLink>
            </Reveal>
          </div>
        </div>
      </LightboxRoot>
    </Chapter>
  );
}
