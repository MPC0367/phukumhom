import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeClosing } from "@/components/home/closing";
import { Reveal, SplitReveal } from "@/components/motion";
import { Notes, Onward, PageLead, StatementBand } from "@/components/page";
import { Phrases } from "@/components/places/Phrases";
import { JsonLd } from "@/components/seo/JsonLd";
import { BookingLink } from "@/components/site";
import { CompareTable, RoomStage } from "@/components/stay";
import { Button, Chapter, PageHero, TextLink, Tile, TileRow } from "@/components/ui";
import { STAY_BAND, STAY_HERO, copy } from "@/content/pages/stay";
import { pub } from "@/content/schema";
import { getSeo } from "@/content/seo";
import { site } from "@/content/site";
import { isLocale } from "@/i18n/config";
import { fill, t } from "@/i18n/ui";
import { href } from "@/lib/routes";
import { breadcrumbJsonLd, pageMetadata, webPageJsonLd } from "@/lib/seo";
import s from "./stay.module.css";

/**
 * The Stay page (brief section 9): the main decision page.
 *
 *   hero        a rooftop terrace, the page topic in plain words as the <h1>
 *   lead        the statement, two paragraphs, Check availability, and the short answer beside them
 *   01  rooms   the room stage: the three room types as a list beside the photograph that follows it
 *   band        the forecourt at blue hour, with the sentence that all three have a private rooftop
 *   02  compare the comparison (id="compare": the homepage's Compare rooms link lands here)
 *   03  details check-in and check-out as figures, and the practical lines
 *   onward      the link plan
 *   closing     the forest band, continuous with the footer
 *
 * Every room fact is printed by <RoomStage> and <CompareTable> from src/content/rooms.ts. Times pass
 * through pub() and their tiles and bullet are dropped if either is withheld. No price, size, bed or
 * occupancy figure appears: the page says where each is found instead.
 * The page reads no request data and stays static.
 */

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? pageMetadata(lang, "stay", { ogAsset: STAY_HERO }) : {};
}

export default async function StayPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const c = copy[lang];
  const ui = t(lang);
  const seo = getSeo("stay", lang);
  const checkIn = pub(site.checkIn);
  const checkOut = pub(site.checkOut);
  const unit = lang === "th" ? "น." : undefined;

  const glance = [c.glance.types, c.glance.rooftops, checkIn && checkOut ? fill(c.glance.times, { checkIn, checkOut }) : null, c.glance.chosen].filter(
    (item): item is string => item !== null,
  );

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd(lang, "stay", { ogAsset: STAY_HERO }),
          breadcrumbJsonLd(lang, [
            { name: ui.nav.home, route: "home" },
            { name: ui.pageNames.stay, route: "stay" },
          ]),
        ]}
      />

      <PageHero
        lang={lang}
        kicker={c.heroKicker}
        title={seo.h1}
        long
        asset={STAY_HERO}
        breadcrumbs={[{ label: ui.nav.home, href: href(lang, "home") }, { label: ui.pageNames.stay }]}
      />

      <PageLead
        lang={lang}
        statement={c.statement}
        accent={c.accent}
        body={c.body}
        glance={glance}
        actions={
          <>
            <BookingLink lang={lang} placement="room-ledger" planner size="lg" />
            <TextLink variant="arrow" href={href(lang, "stay", { hash: "compare" })}>
              {ui.actions.compareRooms}
            </TextLink>
          </>
        }
      />

      <Chapter
        lang={lang}
        id="rooms"
        number={1}
        kicker={c.rooms.kicker}
        title={
          <SplitReveal as="span" lang={lang}>
            {c.rooms.title}
          </SplitReveal>
        }
        intro={
          <Reveal as="span" variant="fade" delay={0.2}>
            <Phrases lang={lang} text={c.rooms.intro} />
          </Reveal>
        }
      >
        <RoomStage lang={lang} />
      </Chapter>

      <StatementBand lang={lang} asset={STAY_BAND} line={c.band} />

      <Chapter
        lang={lang}
        id="compare"
        number={2}
        divider={false}
        tone="sand"
        kicker={c.compare.kicker}
        title={
          <SplitReveal as="span" lang={lang}>
            {c.compare.title}
          </SplitReveal>
        }
        intro={
          <Reveal as="span" variant="fade" delay={0.2}>
            <Phrases lang={lang} text={c.compare.intro} />
          </Reveal>
        }
      >
        <Reveal variant="fade">
          <CompareTable lang={lang} />
        </Reveal>
      </Chapter>

      <Chapter
        lang={lang}
        id="details"
        number={3}
        divider={false}
        kicker={c.practical.kicker}
        title={
          <SplitReveal as="span" lang={lang}>
            {c.practical.title}
          </SplitReveal>
        }
        intro={
          <Reveal as="span" variant="fade" delay={0.2}>
            <Phrases lang={lang} text={c.practical.intro} />
          </Reveal>
        }
        actions={
          <Button variant="secondary" icon="arrow-right" href={href(lang, "faq")}>
            {ui.nav.faq}
          </Button>
        }
      >
        <div className={s.details}>
          {checkIn && checkOut ? (
            <Reveal variant="scale">
              <TileRow label={c.practical.tilesLabel}>
                <Tile figure={checkIn} unit={unit} label={c.practical.checkIn} note={c.practical.listed} />
                <Tile figure={checkOut} unit={unit} label={c.practical.checkOut} note={c.practical.listed} />
              </TileRow>
            </Reveal>
          ) : null}
          <Notes items={c.practical.notes} ruled />
          <TextLink variant="arrow" href={href(lang, "contact", { query: { type: "stay" } })}>
            {c.practical.ask}
          </TextLink>
        </div>
      </Chapter>

      <Onward lang={lang} page="stay" />
      <HomeClosing lang={lang} secondary={{ href: href(lang, "contact"), label: c.closingSecondary }} />
    </>
  );
}
