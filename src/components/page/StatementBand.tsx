import { getAsset, isBand } from "@/content/assets";
import { getRoom } from "@/content/rooms";
import type { AssetId, Locale } from "@/content/schema";
import { Parallax, Reveal, SplitReveal } from "@/components/motion";
import { Phrases } from "@/components/places/Phrases";
import { RoomName } from "@/components/site/RoomName";
import { Band, Picture, cx } from "@/components/ui";
import { withAccent } from "./text";
import s from "./StatementBand.module.css";

/**
 * A full-bleed photograph between two chapters of an inner page, with a kicker, one line set large and
 * the catalogue's caption for the frame (led by its room type when it is a room photograph).
 *
 *   <StatementBand lang={lang} asset={STAY_BAND} kicker={c.band.kicker} line={c.band.line} accent="rooftop" />
 *
 * The frame must be catalogued for full-bleed use (isBand), so its large files exist; anything else
 * throws. The photograph drifts inside the band (mouse and trackpad only) and the line rises out of its
 * masks as the band arrives. The words sit on <Band>'s hero scrim: the bottom scrim plus a pool of the
 * twilight colour in the lower left, which keeps several lines at 4.5:1 over the lightest pixels.
 */

export interface StatementBandProps {
  lang: Locale;
  asset: AssetId;
  kicker?: string;
  line: string;
  accent?: string;
  /** Print the catalogued caption at the band's foot. Default true. */
  caption?: boolean;
  height?: "half" | "tall";
}

export function StatementBand({ lang, asset, kicker, line, accent = "", caption = true, height = "tall" }: StatementBandProps) {
  const frame = getAsset(asset);
  if (!isBand(frame)) throw new Error(`StatementBand: "${asset}" is not catalogued for full-bleed use.`);
  const room = frame.rooms.length > 0 ? getRoom(frame.rooms[0]) : null;

  return (
    <Band
      className={s.band}
      scrim="hero"
      height={height}
      grain
      media={
        <Parallax speed={0.1} className={s.media}>
          <Picture asset={asset} lang={lang} fill />
        </Parallax>
      }
    >
      <div className={s.layout}>
        <div className={s.words}>
          {kicker ? (
            <Reveal as="p" variant="fade" className="eyebrow">
              {kicker}
            </Reveal>
          ) : null}
          <SplitReveal as="p" lang={lang} delay={0.1} className={cx("statement", s.line)}>
            {lang === "th" ? <Phrases lang={lang} text={line} /> : withAccent(line, accent)}
          </SplitReveal>
        </div>
        {caption ? (
          <Reveal as="p" variant="fade" delay={0.5} className={s.caption}>
            {room ? (
              <span className={s.captionRoom}>
                <RoomName lang={lang} name={room.name} />
              </span>
            ) : null}{" "}
            <span className={s.captionText}>{frame.caption[lang]}</span>
          </Reveal>
        ) : null}
      </div>
    </Band>
  );
}
