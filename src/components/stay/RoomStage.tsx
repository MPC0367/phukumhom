import type { CSSProperties } from "react";
import type { AssetId, Locale, RoomId } from "@/content/schema";
import { getAsset } from "@/content/assets";
import { copy } from "@/content/pages/home/stay";
import { Reveal } from "@/components/motion";
import { BookingLink } from "@/components/site/BookingLink";
import { RoomName } from "@/components/site/RoomName";
import { Button, Frame, Picture, VisuallyHidden, cx } from "@/components/ui";
import { t } from "@/i18n/ui";
import type { AnalyticsPlacement } from "@/lib/analytics";
import { href } from "@/lib/routes";
import { RoomStageClient, type StageEntry } from "./RoomStageClient";
import { activeRooms, amenitySummary, bathingFact, bathingSetsApart, leadFor, outdoorsFact, roomNumeral } from "./room-facts";
import s from "./RoomStage.module.css";

/**
 * The room stage: the three room types as a list you choose from, beside a photograph that follows the
 * choice (ART-DIRECTION section 6, chapter 02). Reusable: the homepage mounts it inside chapter 02, and
 * the stay page can mount it directly under its own heading.
 *
 *   <RoomStage lang={lang} />
 *   <RoomStage lang={lang} headingLevel={2} placement="room-ledger" leads={{ "deluxe-balcony": "…" }} />
 *
 * This Server Component builds every word and every photograph from src/content/rooms.ts and hands them
 * to the small client island (RoomStageClient) as rendered nodes, so the photograph catalogue and the
 * room ledger never reach the browser bundle.
 *
 * Each entry: numeral · the room name (a heading; Latin script, after the classifier ห้อง on Thai pages)
 * · the gloss · the one-sentence distinction · three fact chips (Outdoors, Bathing, In the room) · View
 * room and Check availability · the line that the room is chosen on the booking page.
 *
 * FACTS
 *   - A chip is printed only when its fact may be: Outdoors needs the balcony and the private rooftop to
 *     be publishable for that room type; a room with no listed amenities has no "In the room" chip.
 *   - The Bathing chip of a room type whose bathing feature sets it apart (a bathtub, the rooftop spa
 *     tub) carries the clay mark. It means "this is the difference", not "only here".
 *   - Check availability is the shell's <BookingLink planner>: a plain link to the booking page that the
 *     layout's planner host upgrades to open the stay planner. It never names a room as available: the
 *     booking page is where a room is chosen, and the line under the buttons says so.
 *   - A photograph illustrates a room only if it is catalogued for that room (leadFor() enforces it).
 *
 *   leads         another catalogued frame of the same room, per room, in place of its lead
 *   initial       the room that is open at first (default: the first)
 *   headingLevel  3 (default, under a chapter's <h2>) or 2
 *   placement     the analytics placement written on the booking links
 */

export interface RoomStageProps {
  lang: Locale;
  leads?: Partial<Record<RoomId, AssetId>>;
  initial?: RoomId;
  headingLevel?: 2 | 3;
  placement?: AnalyticsPlacement;
  className?: string;
}

export function RoomStage({ lang, leads, initial, headingLevel = 3, placement = "room-ledger", className }: RoomStageProps) {
  const c = copy[lang];
  const ui = t(lang);
  const list = activeRooms();
  if (list.length === 0) return null;
  const first = list.some((room) => room.id === initial) ? (initial as RoomId) : list[0].id;

  const entries: StageEntry[] = list.map((room) => {
    const lead = leadFor(room, leads);
    const asset = getAsset(lead);
    const outdoors = outdoorsFact(room, lang);
    const inRoom = amenitySummary(room, lang);
    const setsApart = bathingSetsApart(room);

    const facts: Array<{ key: string; label: string; value: string; marked?: boolean; wide?: boolean }> = [];
    if (outdoors) facts.push({ key: "outdoors", label: ui.labels.outdoors, value: outdoors });
    facts.push({ key: "bathing", label: ui.labels.bathing, value: bathingFact(room, lang), marked: setsApart });
    if (inRoom) facts.push({ key: "in-room", label: ui.labels.inTheRoom, value: inRoom, wide: true });

    const chips = facts.map((fact, index) => (
      <li key={fact.key} className={cx(s.factSlot, fact.wide && s.factWide)}>
        <div className={cx(s.fact, fact.marked && s.factMarked)} style={{ "--i": index } as CSSProperties}>
          <span className={cx("eyebrow", s.factLabel)}>{fact.label}</span>
          <span className={s.factValue}>
            {fact.marked ? (
              <>
                <span className={s.mark} aria-hidden="true" />
                <VisuallyHidden>{c.distinctLabel}: </VisuallyHidden>
              </>
            ) : null}
            {fact.value}
          </span>
        </div>
      </li>
    ));

    const panel = (
      <div className={s.body}>
        <div className={s.inlinePhoto}>
          <Frame asset={lead} lang={lang} ratio="3/2" radius="md" sizes="(min-width: 64rem) 30rem, (min-width: 40rem) 60vw, 100vw" />
        </div>
        <p className={s.distinction}>{room.distinction[lang]}</p>
        {room.id === first ? (
          <Reveal as="ul" stagger={0.07} delay={0.2} className={s.facts}>
            {chips}
          </Reveal>
        ) : (
          <ul className={s.facts}>{chips}</ul>
        )}
        <div className={s.actions}>
          <BookingLink lang={lang} placement={placement} room={room.id} planner />
          <Button variant="quiet" icon="arrow-right" href={href(lang, "room", { room: room.id })}>
            {ui.actions.viewRoom}
            <VisuallyHidden>: {room.name}</VisuallyHidden>
          </Button>
        </div>
        <p className={s.chosen}>
          {c.chosenOnBookingPage}
        </p>
      </div>
    );

    return {
      id: room.id,
      numeral: roomNumeral(room),
      name: <RoomName lang={lang} name={room.name} />,
      sub: room.gloss[lang],
      panel,
      photo: <Picture asset={lead} lang={lang} fill ratio="4/5" sizes="(min-width: 64rem) min(30vw, 26rem), 40vw" />,
      caption: (
        <>
          <span className={s.captionRoom}>
            <RoomName lang={lang} name={room.name} />
          </span>
          {" "}
          <span className={s.captionText}>{asset.caption[lang]}</span>
        </>
      ),
    };
  });

  return (
    <div className={className}>
      <RoomStageClient entries={entries} initial={first} listLabel={c.stage.listLabel} photoLabel={c.stage.photoLabel} headingLevel={headingLevel} />
    </div>
  );
}
