import type { AssetId, Locale } from "@/content/schema";
import { getAsset, isBand } from "@/content/assets";
import { getRoom } from "@/content/rooms";
import { copy } from "@/content/pages/home/setting";
import { Parallax, Reveal, SplitReveal } from "@/components/motion";
import { RoomName } from "@/components/site/RoomName";
import { Band, Picture } from "@/components/ui";
import s from "./BandRooftopView.module.css";

/**
 * Band A (ART-DIRECTION section 6): the rooftop terrace over the fields, edge to edge, between chapter
 * 01 and chapter 02. A kicker, one pull line set in .statement one step up, and a quiet caption that
 * names the room type the photograph was catalogued against.
 *
 * The photograph drifts inside the band as the page moves (mouse and trackpad only). The line rises out
 * of its masks when the band arrives.
 *
 * Height. The frame is an enlargement of a 1000 px original and may not be cropped tighter than 70% of
 * its width (ART-DIRECTION section 4). On a wide screen the band is 80% of the window; on a narrow or
 * tall one it is capped by its own width instead, so a phone gets a nearly square band, not a sliver of
 * the terrace.
 *
 * The band draws its own scrim (see the stylesheet): the bottom scrim plus a pool in the lower left corner, smaller
 * than the one <Band scrim="hero"> draws, so the sky stays bright. The words also take the halo the band gives
 * every word. Measured with _qa/h2/band-contrast.mjs against the lightest pixels behind each line.
 */

const ROOFTOP: AssetId = "rooftop-round-table-lounger-field-view"; // legacy 02_13

/**
 * Thai has no spaces inside a phrase, so a line may break anywhere the browser's dictionary allows, and
 * a pull line of two phrases can be cut through the middle of the second. Each phrase (the copy separates
 * them with a space) is given a box of its own, so the line breaks between phrases first.
 */
function phrases(text: string) {
  return text.split(" ").flatMap((phrase, index) => [
    index > 0 ? " " : null,
    <span key={phrase} className={s.phrase}>
      {phrase}
    </span>,
  ]);
}

export interface BandRooftopViewProps {
  lang: Locale;
}

export function BandRooftopView({ lang }: BandRooftopViewProps) {
  const c = copy[lang].band;
  const asset = getAsset(ROOFTOP);
  if (!isBand(asset)) throw new Error(`BandRooftopView: "${ROOFTOP}" is not catalogued for full-bleed use.`);
  // A room photograph is named for the room it was catalogued against, never another.
  const room = asset.rooms.length > 0 ? getRoom(asset.rooms[0]) : null;

  return (
    <Band
      className={s.band}
      scrim="none"
      height="tall"
      grain
      media={
        <Parallax speed={0.12} className={s.media}>
          <Picture asset={ROOFTOP} lang={lang} fill />
        </Parallax>
      }
    >
      <div className={s.layout}>
        <div className={s.words}>
          <Reveal as="p" variant="fade" className={`eyebrow ${s.kicker}`}>
            {c.kicker}
          </Reveal>
          <SplitReveal as="p" lang={lang} delay={0.1} className={`statement ${s.line}`}>
            {lang === "th" ? phrases(c.line.before) : c.line.before}
            {c.line.accent ? <em>{c.line.accent}</em> : null}
            {c.line.after}
          </SplitReveal>
        </div>
        <Reveal as="p" variant="fade" delay={0.5} className={s.caption}>
          {room ? (
            <span className={s.captionRoom}>
              <RoomName lang={lang} name={room.name} />
            </span>
          ) : null}
          {" "}
          <span className={s.captionText}>{asset.caption[lang]}</span>
        </Reveal>
      </div>
    </Band>
  );
}
