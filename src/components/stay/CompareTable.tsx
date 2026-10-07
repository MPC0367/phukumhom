import { useId, type ReactNode } from "react";
import type { Locale, Room } from "@/content/schema";
import { copy } from "@/content/pages/home/stay";
import { BookingLink } from "@/components/site/BookingLink";
import { RoomName } from "@/components/site/RoomName";
import { Chip, Picture, TextLink, VisuallyHidden, cx } from "@/components/ui";
import { t } from "@/i18n/ui";
import type { AnalyticsPlacement } from "@/lib/analytics";
import { href } from "@/lib/routes";
import { activeRooms, amenityLabels, bathingFact, bathingSetsApart, outdoorsFact, ownNotes, roomNumeral, sharedNotes } from "./room-facts";
import s from "./CompareTable.module.css";

/**
 * The three room types side by side. Used inside the comparison drawer on the homepage and as the
 * "#compare" section of the stay page: give the section its own title, this component brings none.
 *
 *   <CompareTable lang={lang} />
 *
 * WIDE (the component is 46rem or more)   a real <table>: room types are the columns, facts are the rows.
 * NARROW                                   one group per room type, each a heading and a definition list
 *                                          whose labels share one column, so the groups read as aligned
 *                                          rows down the page. Nothing scrolls sideways.
 * Both are in the HTML; a container query shows one. The hidden one is display: none, so it is not read
 * out and its links are not in the tab order.
 *
 * ROWS (each is built from src/content/rooms.ts; a row is absent when its fact may not be published for
 * every room type, so there is never an empty cell or a placeholder)
 *   Outdoors       balcony and private rooftop, only while both are publishable facts for every room type
 *   Bathing        the bathing fact; the cell that sets a room type apart carries the clay mark
 *   In the room    the six listed amenities
 *   Good to know   each room type's own notes. Notes that all three share are said once, under the table.
 * A row whose value is the same for every room type is written once across the columns and labelled
 * "All three room types": sameness is shown as sameness, and the eye goes to what differs.
 *
 * UNDER THE TABLE
 *   the notes all three share (breakfast depends on the rate; beds, occupancy and connecting rooms are a
 *   question for the resort), the link that carries that question to the contact page (?type=stay), and
 *   Check availability with the line that the room is chosen on the booking page.
 * Size, beds, occupancy and connecting rooms have no row: the ledger withholds them (BUILD-CONTRACT 2).
 */

export interface CompareTableProps {
  lang: Locale;
  /** Heading level of the room names in the narrow layout: 3 (default) or 4. */
  headingLevel?: 3 | 4;
  /** The analytics placement written on the booking link. */
  placement?: AnalyticsPlacement;
  className?: string;
}

interface Cell {
  /** What makes two cells "the same". */
  key: string;
  node: ReactNode;
  marked?: boolean;
}

interface Row {
  id: string;
  label: string;
  cells: Cell[];
}

export function CompareTable({ lang, headingLevel = 3, placement = "compare", className }: CompareTableProps) {
  const uid = useId();
  const c = copy[lang];
  const ui = t(lang);
  const list = activeRooms();
  if (list.length === 0) return null;
  const Heading = `h${headingLevel}` as "h3" | "h4";

  /* ── Rows ── */

  const rows: Row[] = [];

  const outdoors = list.map((room) => outdoorsFact(room, lang));
  if (outdoors.every((value): value is string => value !== null)) {
    rows.push({ id: "outdoors", label: ui.labels.outdoors, cells: outdoors.map((value) => ({ key: value, node: value })) });
  }

  rows.push({
    id: "bathing",
    label: ui.labels.bathing,
    cells: list.map((room) => ({ key: bathingFact(room, lang), node: bathingFact(room, lang), marked: bathingSetsApart(room) })),
  });

  if (list.every((room) => room.amenities.length > 0)) {
    rows.push({
      id: "in-room",
      label: ui.labels.inTheRoom,
      cells: list.map((room) => ({
        key: room.amenities.join("|"),
        node: (
          <ul className={s.chips}>
            {amenityLabels(room.amenities, lang).map((label) => (
              <li key={label}>
                <Chip>{label}</Chip>
              </li>
            ))}
          </ul>
        ),
      })),
    });
  }

  const notes = list.map((room) => ownNotes(room, list, lang));
  if (notes.every((own) => own.length > 0)) {
    rows.push({
      id: "notes",
      label: ui.labels.goodToKnow,
      cells: notes.map((own) => ({
        key: own.join("|"),
        node: (
          <ul className={s.notes}>
            {own.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        ),
      })),
    });
  }

  const shared = sharedNotes(list, lang);
  const anyMarked = rows.some((row) => row.cells.some((cell) => cell.marked));
  const isSame = (row: Row) => list.length > 1 && row.cells.every((cell) => cell.key === row.cells[0].key);

  /** A cell's value, with the clay mark when it is the room type's difference. */
  const value = (cell: Cell) =>
    cell.marked ? (
      <span className={s.marked}>
        <span className={s.mark} aria-hidden="true" />
        <span>
          <VisuallyHidden>{c.distinctLabel}: </VisuallyHidden>
          {cell.node}
        </span>
      </span>
    ) : (
      cell.node
    );

  const links = (room: Room) => (
    <div className={s.links}>
      <TextLink variant="arrow" href={href(lang, "room", { room: room.id })}>
        {ui.actions.viewRoom}
        <VisuallyHidden>: {room.name}</VisuallyHidden>
      </TextLink>
      <TextLink variant="arrow" href={href(lang, "contact", { query: { type: "stay", room: room.id } })}>
        {ui.actions.askAboutRoom}
        <VisuallyHidden>: {room.name}</VisuallyHidden>
      </TextLink>
    </div>
  );

  const thumb = (room: Room, sizes: string) => (
    <div className={s.thumb}>
      {/* The column or the group is named in words beside it: the photograph is a repeat, so it is silent. */}
      <Picture asset={room.media.lead} lang={lang} ratio="3/2" sizes={sizes} alt="" />
    </div>
  );

  return (
    <div className={cx(s.root, className)}>
      {/* ── Wide: the table ── */}
      <div className={s.wideView}>
        <table className={s.table}>
          <caption className="vh">{c.compare.caption}</caption>
          <thead>
            <tr>
              <th scope="col" className={s.corner}>
                <VisuallyHidden>{c.compare.rowHeader}</VisuallyHidden>
              </th>
              {list.map((room) => (
                <th key={room.id} scope="col" className={s.colHead}>
                  {thumb(room, "(min-width: 64rem) 16rem, 28vw")}
                  <span className={`numeral ${s.colNumeral}`} aria-hidden="true">
                    {roomNumeral(room)}
                  </span>
                  <span className={`h3 ${s.colName}`}>
                    <RoomName lang={lang} name={room.name} />
                  </span>
                  <span className={s.colGloss}>{room.gloss[lang]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <th scope="row" className={s.rowHead}>
                  <span className="eyebrow">{row.label}</span>
                </th>
                {isSame(row) ? (
                  <td colSpan={list.length} className={s.cell}>
                    <div className={s.sameValue}>
                      <span className={s.sameTag}>{c.compare.allThree}</span>
                      <div className={s.sameNode}>{row.cells[0].node}</div>
                    </div>
                  </td>
                ) : (
                  row.cells.map((cell, index) => (
                    <td key={list[index].id} className={s.cell}>
                      {value(cell)}
                    </td>
                  ))
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className={s.corner} />
              {list.map((room) => (
                <td key={room.id} className={s.cell}>
                  {links(room)}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── Narrow: one group per room type ── */}
      <div className={s.stackView}>
        {list.map((room, index) => (
          <section key={room.id} className={s.group} aria-labelledby={`${uid}-${room.id}`}>
            <header className={s.groupHead}>
              {thumb(room, "6rem")}
              <div className={s.groupTitles}>
                <span className="numeral" aria-hidden="true">
                  {roomNumeral(room)}
                </span>
                <Heading id={`${uid}-${room.id}`} className={`h3 ${s.groupName}`}>
                  <RoomName lang={lang} name={room.name} />
                </Heading>
                <p className={s.colGloss}>{room.gloss[lang]}</p>
              </div>
            </header>
            <dl className={s.groupFacts}>
              {rows.map((row) => (
                <div key={row.id} className={s.groupRow}>
                  <dt className="eyebrow">{row.label}</dt>
                  <dd>{value(row.cells[index])}</dd>
                </div>
              ))}
            </dl>
            {links(room)}
          </section>
        ))}
      </div>

      {anyMarked ? (
        <p className={s.legend}>
          <span className={s.mark} aria-hidden="true" />
          {c.compare.legend}
        </p>
      ) : null}

      {/* ── For all three, and the way on ── */}
      <div className={s.foot}>
        <div className={s.shared}>
          {shared.length > 0 ? (
            <>
              <p className="eyebrow">{c.compare.sharedHeading}</p>
              <ul className={s.sharedList}>
                {shared.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </>
          ) : null}
          <TextLink variant="arrow" href={href(lang, "contact", { query: { type: "stay" } })}>
            {c.compare.askLink}
          </TextLink>
        </div>
        <div className={s.book}>
          <BookingLink lang={lang} placement={placement} planner />
          <p className={s.chosen}>
            {c.chosenOnBookingPage}
          </p>
        </div>
      </div>
    </div>
  );
}
