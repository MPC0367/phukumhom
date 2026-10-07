import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { AssetId, Locale } from "@/content/schema";
import { pub } from "@/content/schema";
import { faq } from "@/content/faq";
import { amenities, getRoom } from "@/content/rooms";
import { site } from "@/content/site";
import { isLocale, otherLocale } from "@/i18n/config";
import { t } from "@/i18n/ui";
import { BOOKING, BOOKING_FORM, bookingHref } from "@/lib/booking";
import { formatTime } from "@/lib/format";
import { href, type RouteId } from "@/lib/routes";
import {
  Accordion,
  AtAGlance,
  Band,
  Breadcrumbs,
  Button,
  Chapter,
  Chip,
  FactList,
  Field,
  Frame,
  Horizon,
  Icon,
  ICON_NAMES,
  Kicker,
  LastUpdated,
  LightboxRoot,
  LightboxTrigger,
  PageHero,
  Panel,
  Picture,
  Rule,
  Section,
  SectionHeader,
  Segmented,
  SelectField,
  TextareaField,
  TextLink,
  Tile,
  TileRow,
  ToastRegion,
  lightboxItems,
  lightboxLabels,
  type FactItem,
  type PictureRatio,
} from "@/components/ui";
import { cx } from "@/components/ui/cx";
import { chrome, g, glossary as G } from "./copy";
import { CopyDemo, DialogDemo, DrawerDemo, ToastDemo } from "./Demos";
import { Kit, type Surface } from "./Kit";
import { Spec } from "./Spec";
import s from "./styleguide.module.css";

/**
 * The living style guide, direction 2: every primitive from src/components/ui on every surface, with
 * real photographs and the glossary's wording, in the page language. An internal page: it is not in the
 * route table, the navigation or the sitemap, and it asks not to be indexed.
 */

export const metadata: Metadata = {
  title: "Design system | Phukumhom Resort",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ lang: string }> };

/* Frames, by catalogue id (legacy id in the comment). Each one is catalogued for the use it gets here. */
const PAGE_HERO: AssetId = "forecourt-rooftop-pergolas-late-afternoon"; // 01_08, band
const HERO: AssetId = "clay-buildings-rooftop-pergolas-hazy-lane"; // 01_24, the home hero
const POND: AssetId = "pink-building-lily-pond-rocks"; // 02_08
const BALCONY: AssetId = "balcony-woven-table-chair-steps"; // 02_07, portrait
const ROOFTOP_BAND: AssetId = "rooftop-round-table-lounger-field-view"; // 02_13, band
const DUSK: AssetId = "rooftop-terrace-dusk-wall-lamps-spa-tub"; // 04_27, band
const BATHTUB: AssetId = "bathtub-wooden-surround-trees-hill-view"; // 03_11
const SPA_TUB: AssetId = "rooftop-spa-tub-pergola-hill-view"; // 04_24, band
const CROPS: AssetId = "garden-lawn-glazed-jars-clay-buildings"; // 01_21
const REEL: AssetId[] = [
  POND,
  BATHTUB,
  "dining-pavilion-interior-woven-lamp-dusk", // 01_27, portrait
  SPA_TUB,
  "shared-pool-open-pavilion-blue-sky", // 05_41
  "gac-fruit-hanging-on-vine", // 07_11
  "open-dining-pavilion-lawn-dusk", // 01_25
  "brass-elephant-spout-spa-tub-low-sun", // 04_30
];

const RATIOS: PictureRatio[] = ["3/2", "4/3", "16/9", "1/1", "4/5", "3/4"];
const FAQ_IDS = ["bathtub-spa-tub-pool", "check-in-out", "breakfast"];

const SWATCHES = [
  ["paper", "paper"],
  ["sand", "sand"],
  ["white", "white"],
  ["terracotta", "terracotta"],
  ["terracotta-deep", "terracottaDeep"],
  ["clay", "clay"],
  ["clay-soft", "claySoft"],
  ["clay-deep", "clayDeep"],
  ["forest", "forest"],
  ["forest-deep", "forestDeep"],
  ["ink", "ink"],
  ["ink-muted", "inkMuted"],
  ["stone", "stone"],
  ["stone-deep", "stoneDeep"],
  ["twilight", "twilight"],
  ["twilight-soft", "twilightSoft"],
  ["on-dark", "onDark"],
  ["on-dark-muted", "onDarkMuted"],
] as const;

const SURFACES: Exclude<Surface, "photo">[] = ["paper", "sand", "white", "twilight", "forest"];

export default async function StyleGuidePage({ params }: Props) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const lang: Locale = raw;
  const other = otherLocale(lang);
  const ui = t(lang);
  const c = chrome[lang];

  const checkIn = formatTime(pub(site.checkIn), lang);
  const checkOut = formatTime(pub(site.checkOut), lang);
  // For the tiles: the bare times, with the Thai clock suffix set small beside them.
  const checkInTime = pub(site.checkIn);
  const checkOutTime = pub(site.checkOut);
  const clockUnit = lang === "th" ? "น." : undefined;
  const address = pub(site.address);
  const mapsUrl = pub(site.maps.listingUrl);
  const locality = (l: Locale) => (l === "th" ? `${t(l).names.wangKatha} ${t(l).names.pakChong}` : `${t(l).names.wangKatha}, ${t(l).names.pakChong}`);
  const room = getRoom("deluxe-bathtub");

  const facts: FactItem[] = [
    { term: ui.labels.outdoors, value: room.outdoors[lang] },
    { term: ui.labels.bathing, value: room.bathing[lang] },
    {
      term: ui.labels.inTheRoom,
      value: (
        <span className={s.chips}>
          {room.amenities.map((id) => (
            <Chip key={id}>{amenities[id].label[lang]}</Chip>
          ))}
        </span>
      ),
    },
    ...(checkIn ? [{ term: ui.terms.checkIn, value: checkIn }] : []),
    ...(checkOut ? [{ term: ui.terms.checkOut, value: checkOut }] : []),
  ];

  const questions = faq
    .filter((item) => FAQ_IDS.includes(item.id))
    .map((item, i) => ({
      id: `sg-${item.id}`,
      question: item.question[lang],
      open: i === 0,
      answer: (
        <>
          {item.answer[lang].map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {item.link ? (
            <p>
              <TextLink href={href(lang, item.link.route.id as RouteId, { room: item.link.route.room, hash: item.link.route.hash, query: item.link.route.query })}>
                {item.link.label[lang]}
              </TextLink>
            </p>
          ) : null}
        </>
      ),
    }));

  const reelItems = lightboxItems(REEL, lang);

  /** One row of the type specimen: the class name, then the sample in this language and in the other. */
  const typeRow = (className: string, text: { en: string; th: string }, name = `.${className.split(" ")[0]}`) => (
    <div className={s.typeRow} key={name}>
      <p className={s.typeName} lang="en">
        {name}
      </p>
      <p lang={lang} className={cx(className, lang === "en" ? s.latin : s.clip)}>
        {text[lang]}
      </p>
      <p lang={other} className={cx(className, other === "en" ? s.latin : s.clip)}>
        {text[other]}
      </p>
    </div>
  );

  const heroLine = (l: Locale) =>
    l === "en" ? (
      <>
        {chrome.en.heroLine.first}
        <br />
        {chrome.en.heroLine.second} <em>{chrome.en.heroLine.accent}</em>
      </>
    ) : (
      G.home.display.th
    );

  /** The stay planner's own form, restated with the Field primitives: a real GET to the booking partner. */
  const planner = (id: string) => (
    <form className={s.form} method={BOOKING_FORM.method} action={BOOKING_FORM.action}>
      <div className={s.formPair}>
        <Field id={`${id}-in`} label={ui.terms.arrival} name={BOOKING.params.checkin} type="date" />
        <Field id={`${id}-out`} label={ui.terms.departure} name={BOOKING.params.checkout} type="date" />
      </div>
      <SelectField id={`${id}-adults`} label={ui.terms.adults} name={BOOKING.params.adults} defaultValue="2" hint={ui.planner.help}>
        {Array.from({ length: BOOKING.maxAdultsSelectable }, (_, i) => (
          <option key={i + 1} value={i + 1}>
            {i + 1}
          </option>
        ))}
      </SelectField>
      <Button type="submit" size="lg" icon="arrow-right" fullWidth>
        {ui.actions.checkAvailability}
      </Button>
      <p className="small muted">{g(G.phrases.bookingPartnerNotice, lang)}</p>
    </form>
  );

  /** The enquiry fields, as a specimen only: it has no action and its button does not submit. */
  const enquiry = (id: string) => (
    <div className={s.form}>
      <Segmented
        name={`${id}-type`}
        legend={ui.labels.enquiryType}
        defaultValue="stay"
        options={[
          { value: "stay", label: ui.labels.enquiryStay },
          { value: "dining", label: ui.labels.enquiryDining },
          { value: "general", label: ui.labels.enquiryGeneral },
        ]}
      />
      <div className={s.formPair}>
        <Field id={`${id}-name`} label={ui.labels.name} name="name" autoComplete="name" />
        <Field id={`${id}-phone`} label={ui.labels.phone} name="phone" type="tel" autoComplete="tel" optionalLabel={ui.labels.optional} />
      </div>
      <Field id={`${id}-email`} label={ui.labels.email} name="email" type="email" autoComplete="email" hint={c.demo.emailHint} />
      <TextareaField id={`${id}-message`} label={ui.labels.message} name="message" rows={4} />
      <p className="small muted">{g(G.phrases.enquiryNotReservation, lang)}</p>
    </div>
  );

  return (
    <>
      <ToastRegion />

      {/* ───────────── The page's own hero: PageHero in real use ───────────── */}
      <PageHero
        lang={lang}
        kicker={ui.names.resortFull}
        title={c.title}
        lead={c.lead}
        asset={PAGE_HERO}
        titleId="sg-title"
        breadcrumbs={[{ label: ui.nav.home, href: href(lang, "home") }, { label: c.title }]}
      />

      <Section spacing="tight" labelledBy="sg-title">
        <div className={cx("container", s.intro)}>
          <p className={cx("statement", s.introStatement)}>{c.statement}</p>
          <nav aria-label={c.jump.label} className={s.jump}>
            <Kicker as="span">{c.jump.label}</Kicker>
            <div className={s.chips}>
              {(
                [
                  ["sg-hero", c.jump.hero],
                  ["sg-chapter", c.jump.chapter],
                  ["sg-colour", c.jump.colour],
                  ["sg-type", c.jump.type],
                  ["sg-surfaces", c.jump.surfaces],
                  ["sg-forms", c.jump.forms],
                  ["sg-media", c.jump.media],
                  ["sg-overlays", c.jump.overlays],
                  ["sg-lists", c.jump.lists],
                ] as const
              ).map(([id, label]) => (
                <Chip key={id} as="a" href={`#${id}`}>
                  {label}
                </Chip>
              ))}
            </div>
            <LastUpdated lang={lang} date={site.lastUpdated} />
          </nav>
        </div>
      </Section>

      {/* ───────────── Mock hero ───────────── */}
      <Band
        as="section"
        id="sg-hero"
        height="screen"
        scrim="hero"
        grain
        labelledBy="sg-hero-line"
        className={s.hero}
        media={<Picture asset={HERO} lang={lang} fill />}
      >
        <div className={s.heroText}>
          {/* On a phone the locality takes a second line; from 40rem it follows a rule on the same line. */}
          <p className={cx("eyebrow", s.heroEyebrow)}>
            <span>{ui.names.resortFull}</span>
            <span className={s.heroEyebrowRule}>
              <Rule />
            </span>
            <span className={s.heroEyebrowPlace}>{locality(lang)}</span>
          </p>
          <p id="sg-hero-line" className={cx("hero-line", s.heroLine)}>
            {heroLine(lang)}
          </p>
          <p className={cx("lead", s.heroLead)}>{g(G.phrases.locality, lang)}</p>
          <div className={s.heroActions}>
            <Button size="lg" href={href(lang, "stay")} icon="arrow-right">
              {ui.actions.exploreRooms}
            </Button>
            <Button size="lg" variant="ghost" href={bookingHref()} external>
              {ui.actions.checkAvailability}
            </Button>
          </div>
        </div>
        <p className={cx("eyebrow", s.heroMeta)}>
          <span>{locality(lang)}</span>
          {checkIn ? (
            <span className={s.heroMetaWide}>
              <Rule />
              {c.heroMeta.checkIn} {checkIn}
            </span>
          ) : null}
          {checkOut ? (
            <span className={s.heroMetaWide}>
              <Rule />
              {c.heroMeta.checkOut} {checkOut}
            </span>
          ) : null}
        </p>
      </Band>
      <div className={cx("container", s.note)}>
        <p className="small muted">{c.heroNote}</p>
      </div>

      {/* ───────────── A chapter, as a page would write it ───────────── */}
      <Chapter
        lang={lang}
        id="sg-chapter"
        number={1}
        kicker={g(G.home.sections.setting.label, lang)}
        title={c.chapter.title}
        intro={g(G.phrases.locality, lang)}
        actions={
          <>
            <TextLink variant="arrow" href={href(lang, "stay")}>
              {ui.pageNames.stay}
            </TextLink>
            <Button variant="secondary" href={href(lang, "stay", { hash: "compare" })}>
              {ui.actions.compareRooms}
            </Button>
          </>
        }
      >
        <p className={cx("statement", s.chapterStatement)}>{g(G.home.sections.setting.heading, lang)}</p>
        <TileRow label={c.chapter.tilesLabel} className={s.chapterTiles}>
          <Tile figure="3" label={c.chapter.tileRooms} note={c.chapter.tileRoomsNote} />
          {checkInTime ? <Tile figure={checkInTime} unit={clockUnit} label={ui.terms.checkIn} note={ui.terms.asCurrentlyListed} /> : null}
          {checkOutTime ? <Tile figure={checkOutTime} unit={clockUnit} label={ui.terms.checkOut} note={ui.terms.asCurrentlyListed} /> : null}
        </TileRow>
        <div className={s.pair}>
          <Frame asset={POND} lang={lang} className={s.pairWide} sizes="(min-width: 64rem) 46rem, 100vw" />
          <Frame asset={BALCONY} lang={lang} showRoom className={s.pairDetail} sizes="(min-width: 64rem) 20rem, 60vw" />
        </div>
        <p className={cx("small", "muted", s.chapterNote)}>{c.chapter.note}</p>
      </Chapter>

      {/* ───────────── Colour ───────────── */}
      <Chapter lang={lang} id="sg-colour" number={2} tone="sand" divider={false} kicker={c.parts.colour.kicker} title={c.parts.colour.title} intro={c.parts.colour.intro}>
        <ul role="list" className={s.swatches}>
          {SWATCHES.map(([token, role]) => (
            <li key={token} className={s.swatch}>
              <span className={s.swatchChip} style={{ "--chip": `var(--${token})` } as CSSProperties} />
              <span className={s.swatchName} lang="en">
                {token}
              </span>
              <span className={s.swatchRole}>{c.roles[role]}</span>
            </li>
          ))}
        </ul>
      </Chapter>

      {/* ───────────── Type ───────────── */}
      <Section id="sg-type" tone="white" labelledBy="sg-type-title">
        <div className="container">
          <SectionHeader lang={lang} number={3} label={c.parts.type.kicker} heading={c.parts.type.title} headingId="sg-type-title" lead={c.parts.type.intro} align="split" />
          <div className={s.display}>
            <p className={s.typeName} lang="en">
              .hero-line
            </p>
            <p lang={lang} className={cx("hero-line", lang === "en" ? s.latin : s.clip)}>
              {heroLine(lang)}
            </p>
            <p lang={other} className={cx("hero-line", other === "en" ? s.latin : s.clip)}>
              {heroLine(other)}
            </p>
          </div>
          <div className={s.display}>
            <p className={s.typeName} lang="en">
              .chapter-title
            </p>
            <p lang={lang} className={cx("chapter-title", lang === "en" ? s.latin : s.clip)}>
              {chrome[lang].chapter.title}
              <span className={s.titleGap} />
              {t(lang).pageNames.stay}
            </p>
            <p lang={other} className={cx("chapter-title", other === "en" ? s.latin : s.clip)}>
              {chrome[other].chapter.title}
              <span className={s.titleGap} />
              {t(other).pageNames.stay}
            </p>
          </div>
          <div className={s.type}>
            <div className={cx(s.typeRow, s.typeHead)}>
              <span />
              <p className="eyebrow">{c.type.thisLanguage}</p>
              <p className="eyebrow">{c.type.otherLanguage}</p>
            </div>
            {typeRow("statement", G.home.sections.setting.heading)}
            {typeRow("h1", G.pageNames.dining)}
            {typeRow("h2", G.home.sections.rooftop.heading)}
            {typeRow("h3", G.home.journey.heading)}
            {typeRow("figure", { en: c.type.figureSample, th: c.type.figureSample })}
            {typeRow("lead", G.phrases.locality)}
            {typeRow("body", G.phrases.kitchenGardenSeasonal)}
            {typeRow("small muted", G.phrases.bookingPartnerNotice, ".small")}
            {typeRow("eyebrow", G.home.sections.setting.label)}
            {typeRow("numeral", { en: "01 02 03 04 05 06 07", th: "01 02 03 04 05 06 07" })}
          </div>
          <p className={cx("small", "muted", s.typeNote)}>
            <span className={s.typeNoteName}>{c.type.marks}</span> {c.type.marksNote}
          </p>
        </div>
      </Section>

      {/* ───────────── Every primitive, on each ground ───────────── */}
      <div id="sg-surfaces">
        {SURFACES.map((surface, i) => (
          <Chapter
            key={surface}
            lang={lang}
            tone={surface}
            number={i === 0 ? 4 : undefined}
            divider={false}
            kicker={c.surfaces.kicker}
            title={c.surfaces[surface].title}
            intro={c.surfaces[surface].intro}
          >
            <Kit lang={lang} surface={surface} />
          </Chapter>
        ))}
        <Band as="section" id="sg-photo" height="tall" scrim="hero" align="start" labelledBy="sg-photo-title" className={s.photoBand} media={<Picture asset={DUSK} lang={lang} fill />}>
          <div className={s.photoGrid}>
            <div className={s.photoRail}>
              <Kicker>{c.surfaces.kicker}</Kicker>
              <h2 id="sg-photo-title" className={cx("chapter-title", s.photoTitle)}>
                {c.surfaces.photo.title}
              </h2>
              <p className={s.photoIntro}>{c.surfaces.photo.intro}</p>
            </div>
            <div className={s.photoContent}>
              <Kit lang={lang} surface="photo" />
            </div>
          </div>
        </Band>
      </div>

      {/* ───────────── Forms ───────────── */}
      <Chapter lang={lang} id="sg-forms" number={5} kicker={c.parts.forms.kicker} title={c.parts.forms.title} intro={c.parts.forms.intro} divider={false}>
        <div className={s.specs}>
          <Spec label={c.spec.fields} note={c.spec.fieldsNote} wide>
            <div className={s.formGrid}>
              <Panel>{planner("sg-plan")}</Panel>
              <Panel>{enquiry("sg-ask")}</Panel>
            </div>
          </Spec>
          <Spec label={c.spec.errors} note={c.spec.errorsNote}>
            <Panel>
              <div className={s.form}>
                <Field id="sg-err-name" label={ui.labels.name} name="name-error" error={ui.messages.nameRequired} />
                <Field id="sg-err-email" label={ui.labels.email} name="email-error" type="email" defaultValue="guest@example" error={ui.messages.emailInvalid} />
                <Field id="sg-err-out" label={ui.terms.departure} name="departure-error" type="date" error={ui.messages.departureAfterArrival} />
              </div>
            </Panel>
          </Spec>
          <Spec label={c.spec.onSand} note={c.spec.switch}>
            <Panel tone="sand">
              <div className={s.form}>
                <Segmented
                  name="sg-sand-reply"
                  legend={ui.labels.replyChannel}
                  defaultValue="phone"
                  options={[
                    { value: "phone", label: ui.labels.phone },
                    { value: "email", label: ui.labels.email },
                    { value: "facebook", label: ui.labels.facebook },
                  ]}
                />
                <div className={s.formPair}>
                  <Field id="sg-sand-name" label={ui.labels.name} name="sand-name" defaultValue={ui.names.resortShort} />
                  <SelectField id="sg-sand-room" label={ui.labels.room} name="sand-room" defaultValue="deluxe-bathtub">
                    <option value="deluxe-balcony">{getRoom("deluxe-balcony").name}</option>
                    <option value="deluxe-bathtub">{getRoom("deluxe-bathtub").name}</option>
                    <option value="executive-pool-spa">{getRoom("executive-pool-spa").name}</option>
                  </SelectField>
                </div>
                <Field id="sg-sand-off" label={ui.labels.email} name="sand-email" disabled />
              </div>
            </Panel>
          </Spec>
        </div>
      </Chapter>

      {/* ───────────── Photographs ───────────── */}
      <Chapter lang={lang} id="sg-media" number={6} tone="sand" divider={false} kicker={c.parts.media.kicker} title={c.parts.media.title} intro={c.parts.media.intro}>
        <div className={s.specs}>
          <Spec label={c.spec.frames} note={c.spec.framesNote} wide>
            <ul role="list" className={s.crops}>
              {RATIOS.map((ratio, i) => (
                <li key={ratio} className={s.crop}>
                  <Frame asset={CROPS} lang={lang} ratio={ratio} radius="md" caption={false} alt={i === 0 ? undefined : ""} sizes="(min-width: 80rem) 17rem, (min-width: 64rem) 19vw, (min-width: 40rem) 30vw, 46vw" />
                  <span lang="en" className={s.cropName}>
                    {ratio.replace("/", " : ")}
                  </span>
                </li>
              ))}
            </ul>
          </Spec>
          <Spec label={c.spec.linked} note={c.spec.linkedNote}>
            <div className={s.linked}>
              <Frame asset={BATHTUB} lang={lang} ratio="4/3" showRoom href={href(lang, "room", { room: "deluxe-bathtub" })} sizes="(min-width: 40rem) 24rem, 100vw" />
            </div>
          </Spec>
          <Spec label={c.spec.fill} note={c.spec.fillNote}>
            <div id="sg-fill" className={s.fillTile}>
              <Picture asset={SPA_TUB} lang={lang} fill ratio="4/5" sizes="(min-width: 40rem) 22rem, 100vw" />
              <span className={s.fillScrim} aria-hidden="true" />
              <p className={cx("on-photo", s.fillLabel)}>
                <span className="eyebrow">{getRoom("executive-pool-spa").name}</span>
                <span className="h3">{c.demo.fillLabel}</span>
              </p>
            </div>
          </Spec>
        </div>
      </Chapter>

      <Band id="sg-band" height="half" scrim="hero" media={<Picture asset={ROOFTOP_BAND} lang={lang} fill />}>
        <p className={cx("statement", s.bandLine)}>{g(G.phrases.stargazing, lang)}</p>
        <p className={cx("eyebrow", s.bandMeta)}>
          <span lang="en">{getRoom("deluxe-balcony").name}</span>
          <Rule />
          {ui.terms.privateRooftop}
        </p>
      </Band>
      <div className={cx("container", s.note)}>
        <p className="small muted">{c.spec.bandNote}</p>
      </div>

      {/* ───────────── Overlays ───────────── */}
      <Chapter lang={lang} id="sg-overlays" number={7} kicker={c.parts.overlays.kicker} title={c.parts.overlays.title} intro={c.parts.overlays.intro} divider={false}>
        <div className={s.specs}>
          <Spec label={c.spec.drawer} note={c.spec.drawerNote}>
            <div className={s.row}>
              <DrawerDemo id="sg-drawer" side="auto" variant="primary" openLabel={c.demo.openDrawer} closeLabel={ui.actions.close} title={c.demo.drawerTitle}>
                {planner("sg-drawer-plan")}
              </DrawerDemo>
              <DrawerDemo id="sg-sheet" side="bottom" openLabel={c.demo.openSheet} closeLabel={ui.actions.close} title={c.demo.sheetTitle}>
                <FactList
                  variant="stacked"
                  items={(["deluxe-balcony", "deluxe-bathtub", "executive-pool-spa"] as const).map((id) => ({
                    term: getRoom(id).name,
                    value: getRoom(id).distinction[lang],
                  }))}
                />
                <Button href={href(lang, "stay")} icon="arrow-right">
                  {ui.actions.allRooms}
                </Button>
              </DrawerDemo>
            </div>
          </Spec>
          <Spec label={c.spec.dialog} note={c.spec.dialogNote}>
            <DialogDemo id="sg-dialog" openLabel={c.demo.openDialog} closeLabel={ui.actions.close} title={c.demo.dialogTitle}>
              <p className="body">{g(G.phrases.breakfast, lang)}</p>
              <p className="body">{g(G.phrases.roomChosenOnBookingPage, lang)}</p>
              <Button href={bookingHref()} external icon="arrow-right">
                {ui.actions.continueToBooking}
              </Button>
            </DialogDemo>
          </Spec>
          <Spec label={c.spec.lightbox} note={c.spec.lightboxNote} wide>
            <LightboxRoot items={reelItems} labels={lightboxLabels(lang)}>
              <ul role="list" className={s.reel}>
                {reelItems.map((item, i) => (
                  <li key={item.id} className={s.reelItem} style={{ "--reel-ratio": i % 3 === 2 ? "4 / 5" : "4 / 3" } as CSSProperties}>
                    <LightboxTrigger index={i} label={`${c.demo.openPhoto}: ${item.caption}`} className={s.reelTrigger}>
                      <Picture asset={item.id} lang={lang} fill ratio={i % 3 === 2 ? "4/5" : "4/3"} sizes="(min-width: 64rem) 18rem, 46vw" />
                    </LightboxTrigger>
                  </li>
                ))}
              </ul>
            </LightboxRoot>
          </Spec>
          <Spec label={c.spec.toast} note={c.spec.toastNote}>
            <div className={s.row}>
              {address ? <CopyDemo label={ui.actions.copyAddress} text={address[lang]} message={ui.messages.addressCopied} /> : null}
              <ToastDemo label={ui.actions.copyEnquiry} message={c.demo.toastSaved} />
            </div>
          </Spec>
        </div>
      </Chapter>

      {/* ───────────── Lists and small parts ───────────── */}
      <Chapter lang={lang} id="sg-lists" number={8} tone="white" divider={false} kicker={c.parts.lists.kicker} title={c.parts.lists.title} intro={c.parts.lists.intro}>
        <div className={s.specs}>
          <Spec label={c.spec.facts}>
            <h3 className={cx("h3", s.factTitle)} lang="en">
              {room.name}
            </h3>
            <FactList items={facts} />
          </Spec>
          <Spec label={c.spec.glance}>
            <AtAGlance title={ui.terms.atAGlance} items={[g(G.phrases.locality, lang), g(G.phrases.rooftopsAllRooms, lang), g(G.phrases.sharedPoolNote, lang), g(G.phrases.breakfast, lang)]} />
          </Spec>
          <Spec label={c.spec.accordion} note={c.spec.accordionNote}>
            <Accordion items={questions} />
          </Spec>
          <Spec label={c.spec.breadcrumbs}>
            <div className={s.stackTight}>
              <Breadcrumbs
                lang={lang}
                label={`${ui.a11y.breadcrumb} 2`}
                trail={[{ label: ui.nav.home, href: href(lang, "home") }, { label: ui.pageNames.stay, href: href(lang, "stay") }, { label: room.name }]}
              />
              <LastUpdated lang={lang} date={site.lastUpdated} />
              {mapsUrl ? (
                <TextLink variant="arrow" href={mapsUrl} external>
                  {ui.actions.openInMaps}
                </TextLink>
              ) : null}
            </div>
          </Spec>
          <Spec label={c.spec.horizon}>
            <div className={s.stack}>
              <Horizon />
              <Horizon label={g(G.home.journey.label, lang)} />
              <Horizon number={2} label={g(G.home.sections.stay.label, lang)} draw />
              <SectionHeader lang={lang} level={3} number={4} label={g(G.home.sections.garden.label, lang)} heading={g(G.home.sections.garden.heading, lang)} lead={g(G.phrases.kitchenGardenSeasonal, lang)} />
            </div>
          </Spec>
          <Spec label={c.spec.icons}>
            <ul role="list" className={s.icons}>
              {ICON_NAMES.map((name) => (
                <li key={name} className={s.icon}>
                  <Icon name={name} size={24} />
                  <span lang="en" className={s.iconName}>
                    {name}
                  </span>
                </li>
              ))}
            </ul>
          </Spec>
        </div>
      </Chapter>
    </>
  );
}
