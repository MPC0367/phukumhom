import { useId, type ReactNode } from "react";
import type { AssetId, Locale } from "@/content/schema";
import { GalleryReel } from "@/components/media";
import { Reveal, SplitReveal } from "@/components/motion";
import { Phrases } from "@/components/places/Phrases";
import { Icon, cx, type PictureRatio } from "@/components/ui";
// The band's layout is the homepage reel's: one stylesheet, so the two can never drift apart.
import s from "@/components/home/reel/HomeReel.module.css";
import { withAccent } from "./text";

/**
 * A full-bleed band with a row of photographs drifting through it: the homepage's "reel" band, for any
 * page. A heading set as a kicker, a display line that rises line by line, one supporting sentence, an
 * optional action, and the reel from one edge of the screen to the other. Grab and throw the row, or
 * open any frame in the viewer.
 *
 *   <ReelBand lang={lang} kicker="Plates and garden beds" line="…" accent="plate" lead="…"
 *             label="Photographs of plates and garden beds" hint="Drag" frames={DINING_REEL} />
 *
 * Every frame is shown with the catalogue's caption and alt text; a frame that is not cleared for use
 * throws (the viewer refuses it). Not a chapter: the chapter index passes over it.
 */

export interface ReelFrame {
  asset: AssetId;
  ratio?: PictureRatio;
}

export interface ReelBandProps {
  lang: Locale;
  id?: string;
  kicker: string;
  line: string;
  accent?: string;
  lead: string;
  /** Accessible name of the row. */
  label: string;
  /** The cue shown while the row can be dragged. */
  hint: string;
  frames: ReelFrame[];
  /** A pill or link under the lead. */
  action?: ReactNode;
  tone?: "sand" | "paper";
  heights?: { min: number; max: number };
}

export function ReelBand({ lang, id, kicker, line, accent = "", lead, label, hint, frames, action, tone = "sand", heights }: ReelBandProps) {
  const headingId = useId();
  const ratios = Object.fromEntries(frames.filter((frame) => frame.ratio).map((frame) => [frame.asset, frame.ratio as PictureRatio]));

  return (
    <section id={id} lang={lang} aria-labelledby={headingId} className={cx(tone === "sand" && "on-sand", s.band)}>
      <div className={cx("container", s.head)}>
        <div className={s.words}>
          <h2 id={headingId} className={cx("eyebrow", s.kicker)}>
            {kicker}
          </h2>
          <SplitReveal as="p" lang={lang} className={cx("h2", s.line)}>
            {lang === "th" ? <Phrases lang={lang} text={line} /> : withAccent(line, accent)}
          </SplitReveal>
        </div>
        <Reveal delay={0.15} className={s.side}>
          <p className={s.lead}>
            <Phrases lang={lang} text={lead} />
          </p>
          <div className={s.actions}>
            {action}
            <p className={cx("eyebrow", s.hint)} aria-hidden="true">
              <Icon name="arrow-left" size={16} />
              <span>{hint}</span>
              <Icon name="arrow-right" size={16} />
            </p>
          </div>
        </Reveal>
      </div>

      <Reveal className={s.row}>
        <GalleryReel lang={lang} label={label} assets={frames.map((frame) => frame.asset)} ratios={ratios} heights={heights} className={s.reel} />
      </Reveal>
    </section>
  );
}
