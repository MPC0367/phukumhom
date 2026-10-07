import type { ReactNode } from "react";
import { getAsset, isUsable } from "@/content/assets";
import { copy } from "@/content/pages/home/rooftop";
import { copy as skyCopy } from "@/content/pages/sky";
import { getRoom, rooms } from "@/content/rooms";
import { pub, type AssetId, type Locale, type RoomId } from "@/content/schema";
import { href } from "@/lib/routes";
import { MediaReveal, MoonTonight, Reveal, SplitReveal, Stars, SunsetTime } from "@/components/motion";
import { RoomName } from "@/components/site/RoomName";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { formatNumeral } from "@/components/ui/Kicker";
import { Picture } from "@/components/ui/Picture";
import { cx } from "@/components/ui/cx";
import { DayControl } from "./DayControl";
import { DayFrame } from "./DayFrame";
import { DaySky } from "./DaySky";
import { TonightMoon } from "./TonightMoon";
import { keepWhole } from "./keep";
import s from "./rooftop.module.css";

/**
 * Homepage chapter 03, "The rooftop": the site's signature (ART-DIRECTION section 6).
 *
 * A full-bleed band whose whole colour scheme follows one number, --t: 0 is the day, 0.5 low sun,
 * 1 dusk. Three real photographs of the same Executive Pool Spa terrace are stacked in one frame and
 * crossfaded by it; the ground moves from a pale warm sky through clay rose, then in one step to deep
 * fired clay and on through plum to the twilight blue, where the stars and tonight's moon come out.
 * The guest turns it with a real range input, with the three named times, or by dragging across the
 * photograph. It opens at the resort's actual time of day.
 *
 *   <DaySky>            the <section>, and the island that writes --t (DaySky.tsx)
 *     sky               two grounds, stars, the moon: decoration, behind everything
 *     rail              numeral, kicker, title, two paragraphs, two actions (sticky from 64rem)
 *     stage             <DayFrame> with the photographs, caption, <DayControl>, the sky tiles
 *
 * Everything said here is gated on the ledger (BUILD-CONTRACT section 2): a sentence is printed only
 * while the fact behind it is publishable, and the photographs are shown only while all three are
 * catalogued for this room type. The photographs are never recoloured: the day changes because a
 * different real frame is on top.
 *
 * Without JavaScript the band is a plain twilight chapter with the three photographs side by side,
 * each under its name (the <noscript> marker below switches the stylesheet; see rooftop.module.css).
 */

const CHAPTER_ID = "rooftop";
const TITLE_ID = "rooftop-title";
const CHAPTER_NUMBER = 3;
const ROOM: RoomId = "executive-pool-spa";

/** The same terrace at three hours: legacy 04_24, 04_25, 04_27. Order is the order of the day. */
const FRAMES: readonly [AssetId, AssetId, AssetId] = [
  "rooftop-spa-tub-pergola-hill-view",
  "rooftop-terrace-table-lounger-valley-haze",
  "rooftop-terrace-dusk-wall-lamps-spa-tub",
];

/** How wide the photograph is laid out: the content column from 64rem, the page width below it (a 4:3 box crops a 3:2 frame, so a phone lays it out a little wider than the screen). */
const FRAME_SIZES = "(min-width: 64rem) min(54rem, 62vw), (min-width: 40rem) 92vw, 113vw";

/** `pattern` with `node` where `slot` stands, and the words in `keep` held whole (see keep.tsx). */
function withSlot(pattern: string, slot: string, node: ReactNode, keep: readonly string[]): ReactNode {
  const [before, after = ""] = pattern.split(slot);
  return (
    <>
      {keepWhole(before, keep)}
      {node}
      {keepWhole(after, keep)}
    </>
  );
}

export function HomeRooftop({ lang }: { lang: Locale }) {
  const c = copy[lang];
  const sky = skyCopy[lang];
  const room = getRoom(ROOM);

  // A frame may stand for this room type only while the catalogue says so.
  const framesCleared = FRAMES.every((id) => {
    const asset = getAsset(id);
    return isUsable(asset) && asset.rooms.includes(ROOM);
  });
  if (!framesCleared) return null;

  // What may be said (BUILD-CONTRACT section 2): each sentence stands on a publishable fact. The first
  // sentence states two (every room type lists a rooftop; the tub is this room type's), and the tub
  // sentence leans on it ("It is…"), so both are printed together or not at all.
  const everyTypeHasRooftop = rooms.every((r) => pub(r.features.privateRooftop) === true);
  const tubOnRooftop = everyTypeHasRooftop && pub(room.features.rooftopSpaTub) === true;
  const sharedPool = rooms.some((r) => pub(r.features.sharedPoolAccess) === true);

  // A room type's name is never broken across two lines (docs/VOICE.md section 2.4).
  const roomName = (
    <span className={s.roomName}>
      <RoomName lang={lang} name={room.name} />
    </span>
  );
  const stops = [c.stops.day, c.stops.lowSun, c.stops.dusk] as const;

  return (
    <DaySky id={CHAPTER_ID} lang={lang} labelledBy={TITLE_ID} chapter={c.kicker} chapterNumber={formatNumeral(CHAPTER_NUMBER)} className={s.band}>
      <noscript>
        <span className={s.nojs} />
      </noscript>

      <div className={s.sky} aria-hidden="true">
        <div className={s.skyDay} />
        <div className={s.skyDusk} />
        <Stars className={s.stars} density={1.1} />
        <TonightMoon className={s.moon} />
      </div>

      <div className={cx("container", s.grid)}>
        <header className={s.rail}>
          <div className={s.railInner}>
            <p className={cx("numeral", s.numeral)}>{formatNumeral(CHAPTER_NUMBER)}</p>
            <p className={cx("eyebrow", s.kicker)}>{c.kicker}</p>
            <h2 id={TITLE_ID} className={cx("chapter-title", s.title)}>
              <SplitReveal as="span" lang={lang} className={s.titleLine}>
                {c.title}
              </SplitReveal>
            </h2>
            <Reveal className={s.words} stagger={0.09} delay={0.1}>
              {tubOnRooftop ? <p className={s.lead}>{withSlot(c.rooftops, "{room}", roomName, c.keep)}</p> : null}
              {tubOnRooftop || sharedPool ? (
                <p className={s.more}>
                  {tubOnRooftop ? keepWhole(c.tub, c.keep) : null}
                  {tubOnRooftop && sharedPool ? " " : null}
                  {sharedPool ? keepWhole(c.sharedPool, c.keep) : null}
                </p>
              ) : null}
            </Reveal>
            <Reveal className={s.actions} delay={0.25}>
              <Button href={href(lang, "room", { room: ROOM })} icon="arrow-right">
                {withSlot(c.viewRoom, "{room}", roomName, c.keep)}
              </Button>
              <Button href={href(lang, "stay", { hash: "compare" })} variant="ghost" data-open-compare="">
                {c.compare}
              </Button>
            </Reveal>
          </div>
        </header>

        <div className={s.stage}>
          <MediaReveal className={s.reveal}>
            <DayFrame label={c.framesLabel} className={s.frame}>
              {FRAMES.map((id, index) => (
                <figure key={id} className={cx(s.shot, index === 1 && s.shotLow, index === 2 && s.shotDusk)}>
                  <div className={s.shotMedia}>
                    <Picture asset={id} lang={lang} fill sizes={FRAME_SIZES} />
                  </div>
                  <figcaption className={s.shotLabel}>{stops[index]}</figcaption>
                </figure>
              ))}
              <p className={s.when} aria-hidden="true">
                {stops.map((label, index) => (
                  <span key={label} className={cx(s.whenWord, index === 0 && s.when0, index === 1 && s.when1, index === 2 && s.when2)}>
                    {label}
                  </span>
                ))}
              </p>
              <p className={s.hint} aria-hidden="true">
                <Icon name="arrow-left" size={16} />
                <span>{c.hint}</span>
                <Icon name="arrow-right" size={16} />
              </p>
            </DayFrame>
          </MediaReveal>

          <p className={cx("small", s.caption)}>{withSlot(c.caption, "{room}", roomName, c.keep)}</p>

          <DayControl lang={lang} labels={{ slider: c.sliderLabel, stops, now: c.now, invite: c.invite, nowMark: c.nowMark, backToNow: c.backToNow }} keep={c.keep} />

          <div className={s.tonight}>
            <ul role="list" aria-label={c.skyLabel} className={s.tiles}>
              <li className={s.tile}>
                <p className={cx("eyebrow", s.tileLabel)}>{sky.sunsetLabel}</p>
                <p className={s.tileValue}>
                  <SunsetTime lang={lang} format="figure" />
                </p>
              </li>
              <li className={s.tile}>
                <p className={cx("eyebrow", s.tileLabel)}>{sky.moonTonight}</p>
                <p className={s.tileValue}>
                  <MoonTonight lang={lang} showIcon />
                </p>
              </li>
            </ul>
            <div className={s.tonightWords}>
              <p className={s.clear}>{keepWhole(sky.clearEvening, c.keep)}</p>
              <p className={cx("small", s.note)}>{keepWhole(sky.skyNote, c.keep)}</p>
            </div>
          </div>
        </div>
      </div>
    </DaySky>
  );
}
