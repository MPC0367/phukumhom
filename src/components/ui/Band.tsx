import type { ReactNode } from "react";
import { cx } from "./cx";
import styles from "./Band.module.css";

/**
 * A full-bleed band: a photograph (or any node) edge to edge, a scrim, and words over it.
 *
 *   <Band media={<Picture asset={id} lang={lang} fill />} scrim="bottom" height="tall">
 *     <p className="statement">…</p>
 *   </Band>
 *
 *   <Band as="section" overHeader height="screen" scrim="hero" labelledBy="hero-title"
 *         media={<Picture asset={id} lang={lang} fill priority />}> …hero text… </Band>
 *
 *   media       any node that fills the band. Usually <Picture fill />; page authors may wrap it in the
 *               motion system's <Parallax>. It is clipped to the band and has no radius.
 *   scrim       bottom (default) · top · full · hero · none. bottom, top and full are the tokens
 *               --scrim-bottom, --scrim-top and --scrim-full. `hero` is --scrim-bottom plus a pool of the
 *               twilight colour in the lower left corner, where a text block sits: it darkens what is
 *               behind the words and leaves the upper right of the photograph bright. Use it whenever
 *               more than two lines of text sit over a photograph (--scrim-bottom alone has faded to
 *               nothing at 78% of the band's height). docs/contrast.md has the measured ratios.
 *   height      half (62svh, at least 22rem) · tall (80svh, at least 28rem) · screen (100svh, at least 40rem)
 *   align       where the words sit vertically: start · center · end (default)
 *   overHeader  the band runs behind the site header: writes data-header-over on the root (the header
 *               turns transparent while the band is behind it), adds the top scrim and keeps the words
 *               clear of the header's height.
 *   grain       a static fine grain over the photograph (about 6%, multiply). It suits the enlarged
 *               full-bleed frames. Off on phones; never use it on a flat dark surface.
 *
 * The children are wrapped in a .container wearing .on-photo, so every primitive inside reads from the
 * photo tokens: paper text, a paper focus ring, ghost buttons that fill with paper. Inside a band every
 * word also takes a soft halo in the scrim colour (a text-shadow sized to its own type), kickers are full
 * paper and numerals clay-soft: together with the scrim that is what keeps small text at 4.5:1 against
 * the LIGHTEST pixels behind it. Pills, chips and light panels switch the halo off for themselves.
 * Check a new frame with `node _qa/ui/contrast.mjs` before using it under words.
 */

export interface BandProps {
  media: ReactNode;
  scrim?: "bottom" | "top" | "full" | "hero" | "none";
  height?: "half" | "tall" | "screen";
  align?: "start" | "center" | "end";
  overHeader?: boolean;
  grain?: boolean;
  as?: "div" | "section" | "header";
  id?: string;
  /** id of the heading inside that names the band (with as="section"). */
  labelledBy?: string;
  className?: string;
  children?: ReactNode;
}

export function Band({
  media,
  scrim = "bottom",
  height = "tall",
  align = "end",
  overHeader = false,
  grain = false,
  as: Tag = "div",
  id,
  labelledBy,
  className,
  children,
}: BandProps) {
  return (
    <Tag
      id={id}
      aria-labelledby={labelledBy}
      data-header-over={overHeader ? "true" : undefined}
      className={cx(styles.band, styles[height], overHeader && styles.overHeader, className)}
    >
      <div className={styles.media}>{media}</div>
      {grain ? <span aria-hidden="true" className={styles.grain} /> : null}
      {scrim !== "none" ? <span aria-hidden="true" className={cx(styles.scrim, styles[`scrim-${scrim}`])} /> : null}
      {overHeader && scrim !== "top" ? <span aria-hidden="true" className={cx(styles.scrim, styles["scrim-top"])} /> : null}
      {children ? <div className={cx("container", "on-photo", styles.inner, styles[align])}>{children}</div> : null}
    </Tag>
  );
}
