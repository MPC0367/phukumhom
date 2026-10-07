import type { CSSProperties, ReactNode } from "react";
import { cx } from "./cx";
import styles from "./Tile.module.css";

/**
 * The truthful stat tiles: a rounded outline panel divided by hairlines, each cell a large figure, a
 * label and a small note.
 *
 *   <TileRow label="The stay at a glance">
 *     <Tile figure="3" label="Room types" note="each with a private rooftop" />
 *     <Tile figure={checkIn} unit={lang === "th" ? "น." : undefined} label="Check-in" note="as currently listed" />
 *     <Tile figure={<CountUp to={3} />} figureLength={1} label="Room types" />
 *   </TileRow>
 *
 * Only publishable facts become figures: build them from `pub(fact)` and drop the tile when it is null.
 * No room count, no area, no distance, no rating (BUILD-CONTRACT section 2).
 *
 *   figure        a string, a number, or a node (a <CountUp> from the motion system). A tile with no
 *                 figure is a label and a note.
 *   unit          set small beside the figure: the Thai clock suffix "น.", never a unit the facts do not
 *                 support. Pass the bare time ("14:00") as the figure, not formatTime()'s "14:00 น.".
 *   figureLength  how many characters the figure shows, when it is a node and cannot be counted here.
 *
 * A figure never leaves its tile: its size is capped by the tile's own width and its length, so
 * "14:00" in a narrow three-up row is simply set smaller.
 *
 * Tiles sit side by side from 40rem and stack below it, where each becomes a row: figure on the left,
 * words on the right. The row is a list; `label` names it for assistive technology.
 */

export interface TileProps {
  figure?: ReactNode;
  unit?: string;
  figureLength?: number;
  label: string;
  note?: string;
  className?: string;
}

export function Tile({ figure, unit, figureLength, label, note, className }: TileProps) {
  const hasFigure = figure !== undefined && figure !== null && figure !== false && figure !== "";
  const counted = typeof figure === "string" || typeof figure === "number" ? [...String(figure)].length : undefined;
  // Half an em a character (Cormorant's lining figures are a little narrower), the unit at a third of that.
  const length = (figureLength ?? counted ?? 3) + (unit ? [...unit].length * 0.35 + 0.3 : 0);
  const cap = `${Math.round(20000 / Math.max(length, 2)) / 100}cqi`;
  return (
    <li className={cx(styles.tile, !hasFigure && styles.plain, className)}>
      {hasFigure ? (
        <p className={cx("figure", styles.figure)} style={{ "--tile-figure-cap": cap } as CSSProperties}>
          {figure}
          {unit ? <span className={styles.unit}>{unit}</span> : null}
        </p>
      ) : null}
      <div className={styles.words}>
        <p className={styles.label}>{label}</p>
        {note ? <p className={styles.note}>{note}</p> : null}
      </div>
    </li>
  );
}

export interface TileRowProps {
  /** Accessible name of the list. */
  label?: string;
  className?: string;
  children: ReactNode;
}

export function TileRow({ label, className, children }: TileRowProps) {
  return (
    <ul role="list" aria-label={label} className={cx(styles.row, className)}>
      {children}
    </ul>
  );
}
