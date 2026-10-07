import { Fragment, type CSSProperties, type ReactNode } from "react";
import type { Locale } from "@/content/schema";
import { getAsset, isBand } from "@/content/assets";
import { copy } from "@/content/pages/home/hero";
import { getRoom } from "@/content/rooms";
import { site } from "@/content/site";
import { Clock, SplitReveal, SunsetTime } from "@/components/motion";
import { BookingLink, RoomName, StayPlanner } from "@/components/site";
import { Button, Icon, Picture, Rule, cx } from "@/components/ui";
import { t } from "@/i18n/ui";
import { bookingHref } from "@/lib/booking";
import { href } from "@/lib/routes";
import { HeroEntrance } from "./HeroEntrance";
import { HeroScrollFade } from "./HeroScrollFade";
import { HeroSlideControl } from "./HeroSlideControl";
import { HERO_FRAMES, HERO_ID, HERO_TITLE_ID } from "./frames";
import styles from "./HomeHero.module.css";

/**
 * The homepage hero (ART-DIRECTION section 5): the screen that sells the site.
 *
 *   <HomeHero lang={lang} />        first thing inside <main>; it brings its own planner dock
 *
 * WHAT IT RENDERS
 * Two siblings. The <section> is the photograph and everything over it; from 64rem a second block
 * follows it in normal flow, the planner dock, whose upper part lies over the foot of the photograph
 * (the photograph is extended downward behind it). So nothing after the hero has to reserve room: the
 * next section simply starts below the dock.
 *
 * THE FIRST SCREEN
 * Phones and tablets: the photograph is exactly one screen (100svh, at least 40rem; capped only on a
 * screen far taller than it is wide, see --hero-cap in the stylesheet).
 * From 64rem: photograph plus dock are exactly one screen, so the whole planner can be used without
 * scrolling and is never cut in half by the fold. The section itself ends where the dock begins, which
 * is where the photograph ends.
 *
 * THE SITE HEADER
 * The header is transparent while a `data-header-over` element is behind it. That element is not the
 * section but a mark inside it (.overMark) which stops short of the slide control: the header takes its
 * paper ground just before the counter, the caption and the round buttons would pass underneath its own
 * language switch and booking pill. With the attribute on the whole section the two sets of words ran
 * through each other for about a hundred pixels of scrolling.
 *
 * WITHOUT SCRIPT, AND UNDER REDUCED MOTION
 * The first photograph, still, with every word in place. The other three are in the markup but not
 * displayed, so they are not fetched. The slide control is only its caption. The clock and the sunset
 * need script and leave no hole when they are absent.
 *
 * CLIENT ISLANDS (each small; none of them holds the words)
 *   HeroSlideControl   the slideshow: counter, caption, progress bars, previous / next / pause, and the
 *                      crossfades and slow zoom of the photographs it finds through data-hero-slide
 *   HeroEntrance       the entrance, once the loader lifts
 *   HeroScrollFade     the words fade and drift up over the first 40% of the hero; the photograph stays
 *
 * Facts: the two rooftop frames belong to one room type, so the control names it beside the counter.
 * The lane frame (the last of the four) cannot tell morning from evening and is never captioned as
 * either (BUILD-CONTRACT section 8); captions are the catalogue's own.
 */

/**
 * What the browser is told about the photographs' width. They cover a box that is usually wider than it
 * is tall, at up to 1.12 times its size (the slow zoom), and on a phone held upright the photograph is
 * laid out far wider than the screen.
 */
const SIZES = "(max-aspect-ratio: 3/4) 160vw, 112vw";

/** Seconds after the loader lifts at which the display line starts to rise; its second line follows 0.12s later. */
const LINE_AT = 0.2;
const LINE_GAP = 0.12;

/**
 * Thai is written without spaces between words; a space marks the end of a phrase. Each phrase is kept
 * whole, so a line of the supporting sentence can only end where the writer paused. English wraps as usual.
 */
function phrases(text: string, lang: Locale): ReactNode {
  if (lang !== "th") return text;
  return text.split(" ").map((phrase, i) => (
    <Fragment key={i}>
      {i > 0 ? " " : null}
      <span className={styles.phrase}>{phrase}</span>
    </Fragment>
  ));
}

export function HomeHero({ lang }: { lang: Locale }) {
  const ui = t(lang);
  const c = copy[lang];

  const frames = HERO_FRAMES.map((id) => {
    const asset = getAsset(id);
    if (!isBand(asset)) throw new Error(`Hero frame "${id}" is not catalogued for full-bleed use.`);
    const room = asset.rooms.length > 0 ? getRoom(asset.rooms[0]) : null;
    return { id, asset, room };
  });

  // The wider place for the meta strip: the province and the country. The <h1> above it carries the
  // sub-district and district, so the strip adds to it instead of repeating it.
  const province = site.addressParts.province[lang];
  const country = ui.names.thailand;

  return (
    <>
      <section id={HERO_ID} className={styles.hero} aria-labelledby={HERO_TITLE_ID}>
        <span aria-hidden="true" className={styles.overMark} data-header-over="true" />
        <div className={styles.stage} data-hero-stage="">
          {frames.map(({ id, asset }, i) => (
            <div
              key={id}
              className={styles.slide}
              data-hero-slide=""
              hidden={i > 0}
              style={{ "--fx": `${asset.focal.x * 100}%`, "--fy": `${asset.focal.y * 100}%` } as CSSProperties}
            >
              <div className={styles.mover} data-hero-mover="" data-fx={asset.focal.x} data-fy={asset.focal.y}>
                <Picture asset={id} lang={lang} fill priority={i === 0} sizes={SIZES} />
              </div>
            </div>
          ))}
          <span aria-hidden="true" className={styles.grain} />
          <span aria-hidden="true" className={styles.scrimTop} />
          <span aria-hidden="true" className={styles.scrimPool} />
          <span aria-hidden="true" className={styles.scrimBottom} />
        </div>

        <div className={cx("container", "on-photo", styles.inner)}>
          <div className={styles.text} data-hero-fade="">
            <h1 id={HERO_TITLE_ID} className={cx("eyebrow", styles.title)} data-hero-enter="eyebrow">
              <span className={styles.titlePart}>{site.name[lang]}</span>
              <Rule className={styles.titleRule} />
              <span className={cx(styles.titlePart, styles.titlePlace)}>{c.locality}</span>
            </h1>

            <p className={cx("hero-line", styles.line)}>
              <SplitReveal as="span" lang={lang} trigger="loader" delay={LINE_AT} className={styles.lineRow}>
                {c.line.first}
              </SplitReveal>{" "}
              <SplitReveal as="span" lang={lang} trigger="loader" delay={LINE_AT + LINE_GAP} className={styles.lineRow}>
                {c.line.second}
                {c.line.accent ? <em>{c.line.accent}</em> : null}
              </SplitReveal>
            </p>

            <p className={cx("lead", styles.sentence)} data-hero-enter="copy">
              {phrases(c.supporting, lang)}
            </p>

            <div className={styles.actions} data-hero-enter="actions">
              <Button href={href(lang, "stay")} size="lg" icon="arrow-right" className={styles.cta}>
                {ui.actions.exploreRooms}
              </Button>
              <BookingLink lang={lang} placement="hero" planner variant="ghost" size="lg" icon={null} className={cx(styles.cta, styles.ctaGhost)} />
              {/* Phones and tablets have no dock: this pill stands in for it and opens the same planner. */}
              <a href={bookingHref()} className={styles.plan} data-open-planner="" data-placement="hero" data-ground="light">
                <span className={styles.planIcon} aria-hidden="true">
                  <Icon name="calendar" size={18} />
                </span>
                <span className={styles.planText}>
                  <span className={styles.planLabel}>{ui.actions.planStay}</span>
                  <span className={styles.planHint}>{c.planHint}</span>
                </span>
                <Icon name="arrow-right" size={18} className={styles.planArrow} />
              </a>
            </div>
          </div>

          <div className={styles.foot} data-hero-fade="">
            <p className={cx("eyebrow", styles.meta)} data-hero-enter="meta">
              <span className={styles.metaItem}>
                <span className={styles.metaWide}>
                  {province}
                  {lang === "en" ? ", " : " "}
                </span>
                {country}
              </span>
              <span className={styles.metaItem}>
                <Rule />
                <Clock lang={lang} label="visible" />
              </span>
              <span className={cx(styles.metaItem, styles.metaSunset)}>
                <Rule />
                <SunsetTime lang={lang} />
              </span>
            </p>
          </div>

          <p className={styles.cue} data-hero-fade="">
            <span className="vh">{c.scroll}</span>
            <span className={styles.cueTrack} data-hero-enter="cue" aria-hidden="true">
              <span className={styles.cueLine} />
            </span>
          </p>

          <HeroSlideControl
            rootId={HERO_ID}
            className={styles.control}
            frames={frames.map(({ asset, room }) => ({
              caption: asset.caption[lang],
              room: room ? <RoomName lang={lang} name={room.name} /> : null,
            }))}
            labels={{ ...c.slides, count: ui.patterns.photoCount }}
          />
        </div>

        <HeroEntrance />
        <HeroScrollFade rootId={HERO_ID} />
      </section>

      <div className={styles.dockZone}>
        <div className="container" data-hero-enter="dock">
          {/* Named for what the form asks, not "Plan your stay": the closing band's heading has that name. */}
          <h2 className="vh">{c.planHint}</h2>
          <StayPlanner lang={lang} variant="dock" />
        </div>
      </div>
    </>
  );
}
