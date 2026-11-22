import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeClosing } from "@/components/home/closing";
import { Reveal, SplitReveal } from "@/components/motion";
import { Callout, Notes, Onward, withAccent } from "@/components/page";
import { Phrases } from "@/components/places/Phrases";
import { ViewAllPhotos } from "@/components/room/ViewAllPhotos";
import { JsonLd } from "@/components/seo/JsonLd";
import { BookingLink, ContactActions, RoomName } from "@/components/site";
import { amenityLabels, bedroomFor, bookingPageName, listedFactsChecked, outdoorsFact } from "@/components/stay/room-facts";
import {
  Button,
  Chapter,
  Chip,
  FactList,
  Frame,
  Kicker,
  LightboxRoot,
  LightboxTrigger,
  PageHero,
  Panel,
  Picture,
  Section,
  TextLink,
  Tile,
  TileRow,
  cx,
  lightboxItems,
  lightboxLabels,
  type FactItem,
} from "@/components/ui";
import { getAsset, getDerivative } from "@/content/assets";
import { copy } from "@/content/pages/room";
import { POOL_NOTE, POOL_SPA_CLARIFICATION, getRoom } from "@/content/rooms";
import { ROOM_IDS, pub } from "@/content/schema";
import { getSeo } from "@/content/seo";
import { site } from "@/content/site";
import { isLocale } from "@/i18n/config";
import { fill, t } from "@/i18n/ui";
import { formatDate } from "@/lib/format";
import { href, isRoomId } from "@/lib/routes";
import { breadcrumbJsonLd, pageMetadata, roomJsonLd, webPageJsonLd } from "@/lib/seo";
import s from "./room.module.css";

/**
 * One room type (brief section 10), from one shared template.
 *
 *   hero         the room's catalogued lead photograph, the page topic as the <h1>, the breadcrumb trail
 *   lead         the distinction set large and the summary; the two figures the booking page lists (size,
 *                adults per room) with the line that says where they come from; the BEDROOM photograph;
 *                the feature list. Beside them the booking panel, which names the room as the booking
 *                page names it when the two differ ("Deluxe with Bathtub")
 *   callout      Executive Pool Spa only: the tub is a tub, and the pool is elsewhere
 *   01  photos   the room's own photograph set as a mosaic that opens the viewer
 *   02  details  the room's practical notes
 *   others       the two other room types, in the order the ledger offers them
 *   onward       the link plan
 *   closing      the forest band, continuous with the footer
 *
 * FACTS. Everything printed about the room comes from src/content/rooms.ts. The size and the adult limit
 * are the booking page's own listing and are printed as that. Bed types, a child's place, connecting
 * rooms and how the rooftop is reached are withheld there, so they have no row here: one note says
 * where to ask. The adult and child figures are never added together. A photograph appears only if it is catalogued for this room.
 *
 * BOOKING. The provider cannot preselect a room (BUILD-CONTRACT section 3), so the action reads "Check
 * resort availability" and one line says the room is chosen on the booking page. "Ask about this room"
 * carries the room id to the contact page.
 *
 * The page reads no request data and is generated once per room and language.
 */

type Props = { params: Promise<{ lang: string; room: string }> };

export function generateStaticParams() {
  return ROOM_IDS.map((room) => ({ room }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, room } = await params;
  if (!isLocale(lang) || !isRoomId(room)) return {};
  return pageMetadata(lang, "room", { room, ogAsset: getRoom(room).media.lead });
}

export default async function RoomPage({ params }: Props) {
  const { lang, room: slug } = await params;
  if (!isLocale(lang) || !isRoomId(slug)) notFound();
  const room = getRoom(slug);
  if (!room.active) notFound();

  const c = copy[lang];
  const ui = t(lang);
  const seo = getSeo("room", lang, room.id);
  const checkIn = pub(site.checkIn);
  const checkOut = pub(site.checkOut);

  /* ── The two figures the booking page lists, the bedroom, and the name used after the handoff ── */
  const listedSqm = pub(room.area.listedSqm);
  const maxAdults = pub(room.occupancy.maxAdults);
  const listedChecked = listedFactsChecked(room);
  const bedroom = bedroomFor(room);
  const listedAs = bookingPageName(room);

  /* ── Facts ── */
  const outdoors = outdoorsFact(room, lang);
  const facts: FactItem[] = [];
  if (outdoors) facts.push({ term: ui.labels.outdoors, value: outdoors });
  facts.push({ term: ui.labels.bathing, value: room.bathing[lang] });
  if (room.amenities.length > 0) {
    facts.push({
      term: ui.labels.inTheRoom,
      value: (
        <ul role="list" className={s.chips}>
          {amenityLabels(room.amenities, lang).map((label) => (
            <li key={label}>
              <Chip>{label}</Chip>
            </li>
          ))}
        </ul>
      ),
    });
  }

  /* ── The pool and spa-tub clarification stands apart where the room's name could mislead ── */
  const clarification = pub(room.features.rooftopSpaTub) === true ? POOL_SPA_CLARIFICATION[lang] : null;
  // The callout already says where the pool is: the same sentence is not repeated in the notes below it.
  const notes = clarification ? room.goodToKnow[lang].filter((note) => note !== clarification && note !== POOL_NOTE[lang]) : room.goodToKnow[lang];

  /* ── Photographs ── */
  const ids = room.media.gallery;
  const items = lightboxItems(ids, lang);

  const askHref = href(lang, "contact", { query: { type: "stay", room: room.id } });

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd(lang, "room", { room: room.id, ogAsset: room.media.lead }),
          breadcrumbJsonLd(lang, [
            { name: ui.nav.home, route: "home" },
            { name: ui.pageNames.stay, route: "stay" },
            { name: room.name, route: "room", room: room.id },
          ]),
          roomJsonLd(lang, room.id),
        ]}
      />

      <PageHero
        lang={lang}
        kicker={room.gloss[lang]}
        title={seo.h1}
        long
        asset={room.media.lead}
        breadcrumbs={[{ label: ui.nav.home, href: href(lang, "home") }, { label: ui.pageNames.stay, href: href(lang, "stay") }, { label: room.name }]}
      />

      <Section spacing="tight">
        <div className={cx("container", s.lead)}>
          <div className={s.main}>
            <SplitReveal as="p" lang={lang} trigger="load" className={cx("statement", s.statement)}>
              {lang === "th" ? <Phrases lang={lang} text={room.distinction[lang]} /> : withAccent(room.distinction[lang], "")}
            </SplitReveal>
            <Reveal variant="fade" delay={0.2} trigger="load" className={cx("lead", s.summary)}>
              {room.summary[lang]}
            </Reveal>

            {listedSqm !== null || maxAdults !== null ? (
              <Reveal delay={0.25} trigger="load" className={s.figures}>
                <h2 className={cx("eyebrow", s.factsHeading)}>{c.facts.heading}</h2>
                <TileRow label={c.facts.heading}>
                  {listedSqm !== null ? <Tile figure={listedSqm} unit={c.facts.sizeUnit} label={c.facts.sizeLabel} /> : null}
                  {maxAdults !== null ? <Tile figure={maxAdults} label={c.facts.guestsLabel} note={c.facts.guestsNote} /> : null}
                </TileRow>
                {listedChecked ? <p className={cx("small", "muted", s.listed)}>{fill(c.facts.listed, { date: formatDate(listedChecked, lang) })}</p> : null}
              </Reveal>
            ) : null}

            {bedroom ? (
              <Reveal delay={0.3} trigger="load" className={s.bedroom}>
                <Frame asset={bedroom} lang={lang} ratio="3/2" sizes="(min-width: 64rem) 42rem, 92vw" caption={`${c.facts.bedroom}: ${getAsset(bedroom).caption[lang]}`} />
              </Reveal>
            ) : null}

            <Reveal delay={0.3} className={s.facts}>
              <h2 className={cx("eyebrow", s.factsHeading)}>{c.facts.features}</h2>
              <FactList items={facts} />
            </Reveal>

            {clarification ? (
              <Callout lang={lang} label={c.callout.label} className={s.callout}>
                {clarification}
              </Callout>
            ) : null}
          </div>

          <Reveal delay={0.25} trigger="load" className={s.aside}>
            <Panel as="aside" padding="lg" className={s.panel}>
              <Kicker>{c.panel.kicker}</Kicker>
              <p className={cx("h3", s.panelName)}>
                <RoomName lang={lang} name={room.name} />
              </p>
              <div className={s.panelActions}>
                <BookingLink lang={lang} placement="room-panel" room={room.id} planner size="lg" fullWidth>
                  {ui.actions.checkResortAvailability}
                </BookingLink>
                <p className={cx("small", "muted", s.panelNote)}>
                  {c.panel.chosen}
                  {listedAs ? <> {fill(c.panel.listedAs, { name: listedAs })}</> : null}
                </p>
                <Button href={askHref} variant="secondary" fullWidth icon="arrow-right">
                  {ui.actions.askAboutRoom}
                </Button>
                <ContactActions lang={lang} variant="stack" include={["call", "line"]} placement="room-panel" />
              </div>
              {checkIn && checkOut ? (
                <div className={s.times}>
                  <p className={cx("eyebrow", s.timesHeading)}>{c.panel.timesHeading}</p>
                  <dl className={s.timesList}>
                    <div className={s.time}>
                      <dt>{c.panel.checkIn}</dt>
                      <dd className="tabular">{fill(c.panel.from, { time: checkIn })}</dd>
                    </div>
                    <div className={s.time}>
                      <dt>{c.panel.checkOut}</dt>
                      <dd className="tabular">{fill(c.panel.until, { time: checkOut })}</dd>
                    </div>
                  </dl>
                  <p className={cx("small", "muted")}>{c.panel.listed}</p>
                </div>
              ) : null}
            </Panel>
          </Reveal>
        </div>
      </Section>

      <LightboxRoot items={items} labels={lightboxLabels(lang)}>
        <Chapter
          lang={lang}
          id="photos"
          number={1}
          tone="sand"
          divider={false}
          kicker={c.photos.kicker}
          title={
            <SplitReveal as="span" lang={lang}>
              {c.photos.title}
            </SplitReveal>
          }
          intro={
            <Reveal as="span" variant="fade" delay={0.2}>
              <Phrases lang={lang} text={fill(c.photos.intro, { count: ids.length })} />
            </Reveal>
          }
          actions={<ViewAllPhotos label={ui.actions.viewAllPhotos} fallbackHref={items[0].src} />}
        >
          <Reveal as="ul" stagger={0.08} variant="scale" className={s.mosaic}>
            {items.map((item, index) => {
              const d = getDerivative(item.id);
              const upright = d.height > d.width;
              return (
                <li key={item.id} className={cx(s.cell, upright && s.upright)}>
                  <LightboxTrigger index={index} label={fill(c.photos.open, { caption: item.caption })}>
                    <Picture
                      asset={item.id}
                      lang={lang}
                      sizes={upright ? "(min-width: 64rem) 17rem, (min-width: 40rem) 30vw, 46vw" : "(min-width: 64rem) 26rem, (min-width: 40rem) 46vw, 92vw"}
                    />
                  </LightboxTrigger>
                  <p className={s.cellCaption}>{item.caption}</p>
                </li>
              );
            })}
          </Reveal>
        </Chapter>
      </LightboxRoot>

      <Chapter
        lang={lang}
        id="details"
        number={2}
        divider={false}
        kicker={c.notes.kicker}
        title={
          <SplitReveal as="span" lang={lang}>
            {c.notes.title}
          </SplitReveal>
        }
        intro={
          <Reveal as="span" variant="fade" delay={0.2}>
            <Phrases lang={lang} text={c.notes.intro} />
          </Reveal>
        }
        actions={
          <TextLink variant="arrow" href={askHref}>
            {ui.actions.askAboutRoom}
          </TextLink>
        }
      >
        <Notes items={notes} ruled />
      </Chapter>

      <Section tone="sand" labelledBy="other-rooms">
        <div className={cx("container", s.others)}>
          <header className={s.othersHead}>
            <Kicker>{c.others.kicker}</Kicker>
            <h2 id="other-rooms" className="h2">
              {c.others.heading}
            </h2>
            <p className={cx("lead", s.othersLead)}>{c.others.lead}</p>
          </header>
          <Reveal as="ul" stagger={0.12} className={s.othersList}>
            {room.alternatives.map((id) => {
              const other = getRoom(id);
              const to = href(lang, "room", { room: other.id });
              return (
                <li key={other.id} className={s.other}>
                  <Frame asset={other.media.lead} lang={lang} ratio="3/2" href={to} showRoom caption={false} sizes="(min-width: 48rem) 38rem, 92vw" />
                  <p className={s.otherText}>{other.distinction[lang]}</p>
                  <TextLink variant="arrow" href={to}>
                    {ui.actions.viewRoom}
                    <span className="vh">
                      {" "}
                      <RoomName lang={lang} name={other.name} />
                    </span>
                  </TextLink>
                </li>
              );
            })}
          </Reveal>
        </div>
      </Section>

      <Onward lang={lang} page={`room:${room.id}`} tone="paper" />
      <HomeClosing lang={lang} secondary={{ href: href(lang, "stay"), label: c.closingSecondary }} />
    </>
  );
}
