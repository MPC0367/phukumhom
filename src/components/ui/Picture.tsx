import type { CSSProperties } from "react";
import type { AssetId, Locale } from "@/content/schema";
import { getAsset, getDerivative, largest, srcSet } from "@/content/assets";
import { cx } from "./cx";
import styles from "./Picture.module.css";

/**
 * The only place a photograph becomes markup (BUILD-CONTRACT section 4). Never write a raw <img>.
 *
 *   FRAMED (in the content column, a tile, a reel) — `sizes` is required:
 *   <Picture asset={id} lang={lang} sizes="(min-width: 64rem) 56vw, 100vw" />
 *   <Picture asset={id} lang={lang} ratio="4/3" sizes="(min-width: 64rem) 20rem, 100vw" />
 *
 *   FILL (hero slides, bands, stages, tiles whose box is set by the layout):
 *   <Picture asset={id} lang={lang} fill priority />                          a full-bleed band or hero
 *   <Picture asset={id} lang={lang} fill ratio="4/5" sizes="(min-width: 64rem) 24rem, 50vw" />   a tile
 *
 * - <picture> with a WebP <source> and a JPEG <img>, both with the full srcset. Frames catalogued for
 *   full-bleed use (isBand) carry 1440 and 1920 wide WebP files, which the browser picks by itself.
 * - width/height come from the encoded file, so the space is reserved before a byte arrives; the frame's
 *   average colour fills it meanwhile.
 * - `ratio` crops inside a fixed box (object-fit: cover) around the asset's catalogued focal point.
 * - `fill` makes the picture cover its positioned parent: absolute, inset 0, object-fit: cover around the
 *   focal point, and no width cap. The PARENT sets the box (position: relative, a height or an aspect
 *   ratio, overflow: hidden and any radius).
 * - `priority` is for the one image that is the page's largest first paint: eager, high priority, sync
 *   decode. Everything else is lazy and async.
 * - `alt` defaults to the catalogue's description in `lang`; pass alt="" when the same frame has already
 *   been described on the page.
 *
 * SIZES, AND WHY THEY ARE REWRITTEN. The browser chooses a file from `sizes` alone. With object-fit:
 * cover a photograph is often laid out WIDER than its box (a 3:2 frame in a 4:5 box is 1.87 times the
 * box width; in a phone-shaped full-screen hero it is over three times the screen width). Described by
 * the box width, it would fetch a file that is far too small and be painted soft. So:
 *   - with `ratio`, every length in `sizes` is multiplied by source ratio ÷ crop ratio (see coverSizes);
 *     in fill mode `ratio` is the shape of the box you built, used for this arithmetic only;
 *   - fill with no `sizes` asks for "the wider of the viewport and a full-height box at this frame's
 *     ratio": max(100vw, calc(100vh * ratio)). Right for a hero and at worst one file too large for a
 *     shorter band. Pass `sizes` (and `ratio`) when you know the box better.
 *
 * HONEST SIZE. Framed photographs are never painted wider than --plate-max-landscape /
 * --plate-max-portrait, nor wider than their own pixels cover at 1x once cropped. Full-bleed frames are
 * enlarged from 1000px sources until 4K masters exist: soft by nature. Give them a scrim and slow
 * motion, and never crop them tighter than 70% of the frame's width (ART-DIRECTION section 4).
 *
 * The catalogue this reads is about 380 KB of JSON: render pictures in Server Components and hand them
 * to client islands as children, rather than importing this file into a "use client" module.
 */

export type PictureRatio = "3/2" | "4/3" | "1/1" | "4/5" | "3/4" | "16/9" | "2/1" | "21/9";

interface BaseProps {
  asset: AssetId;
  lang: Locale;
  priority?: boolean;
  /** Crop to this width/height ratio. In fill mode: the shape of the box, used to scale `sizes`. */
  ratio?: PictureRatio;
  /** Overrides the catalogue's alt text. Use "" for a decorative repeat. */
  alt?: string;
  className?: string;
}

type FramedProps = BaseProps & {
  fill?: false;
  /** How wide the frame (not the cropped photograph) is laid out at each breakpoint. */
  sizes: string;
};

type FillProps = BaseProps & {
  /** Cover the positioned parent. */
  fill: true;
  /** Defaults to a value that is right for a full-bleed band of any height. */
  sizes?: string;
};

export type PictureProps = FramedProps | FillProps;

/** Four decimals are plenty for a rem length and keep the markup short. */
const round = (n: number) => Math.round(n * 10000) / 10000;

/** "4/5" → 0.8 */
function ratioValue(ratio: PictureRatio): number {
  const [w, h] = ratio.split("/").map(Number);
  return w / h;
}

/**
 * The widest a framed photograph may be painted, as a CSS length: the smaller of the plate token for its
 * orientation and the width its own pixels cover at 1x for the chosen crop. <Frame> uses the same value
 * so a caption is exactly as wide as its photograph.
 */
export function pictureMaxWidth(asset: AssetId, ratio?: PictureRatio): string {
  const d = getDerivative(asset);
  let boxRatio = d.width / d.height;
  let coveredPx = d.width;
  if (ratio) {
    boxRatio = ratioValue(ratio);
    coveredPx = Math.min(d.width, d.height * boxRatio);
  }
  const token = boxRatio < 1 ? "--plate-max-portrait" : "--plate-max-landscape";
  return `min(var(${token}), ${round(coveredPx / 16)}rem)`;
}

/** Splits `value` at every character matching `at` that is outside parentheses, so `min(100vw, 40rem)` stays whole. */
function splitOutsideParens(value: string, at: RegExp): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (depth === 0 && at.test(ch)) {
      parts.push(value.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(value.slice(start));
  return parts;
}

/** A crop within 1% of the source ratio is the source ratio: 1000×667 is not exactly 3:2. */
const COVER_TOLERANCE = 1.01;

/**
 * `sizes` as the browser needs it for a cropped frame.
 *
 * Callers describe the box. A crop narrower than the source is covered by a photograph laid out wider
 * than that box, by k = source ratio ÷ crop ratio. Every length is multiplied by k and the media
 * conditions are kept:
 *
 *   "(min-width: 64rem) 20rem, 60vw"  →  "(min-width: 64rem) calc(20rem * 1.8741), calc(60vw * 1.8741)"
 *
 * A crop as wide as the source or wider is laid out at the box width, and passes through unchanged.
 */
function coverSizes(sizes: string, sourceRatio: number, ratio?: PictureRatio): string {
  if (!ratio) return sizes;
  const k = round(sourceRatio / ratioValue(ratio));
  if (k <= COVER_TOLERANCE) return sizes;
  return splitOutsideParens(sizes, /,/)
    .map((entry) => {
      // "<media condition> <length>": the length is the last token outside parentheses.
      const tokens = splitOutsideParens(entry.trim(), /\s/).filter(Boolean);
      const length = tokens.pop();
      if (!length) return "";
      return [...tokens, length === "auto" ? length : `calc(${length} * ${k})`].join(" ");
    })
    .filter(Boolean)
    .join(", ");
}

export function Picture(props: PictureProps) {
  const { asset, lang, priority = false, ratio, alt, className } = props;
  const fill = props.fill === true;
  const a = getAsset(asset);
  const d = getDerivative(asset);
  const fallback = largest(d);
  const sourceRatio = d.width / d.height;

  // Fill with no sizes: the photograph is as wide as the viewport, or wider when the box is taller than
  // the frame's own shape (every portrait phone). An engine that cannot parse max() falls back to 100vw.
  const described = props.sizes ?? `max(100vw, calc(100vh * ${round(sourceRatio)}))`;
  const sizes = coverSizes(described, sourceRatio, ratio);

  const focus = `${round(a.focal.x * 100)}% ${round(a.focal.y * 100)}%`;
  const style: Record<string, string> = { "--picture-ground": d.dominant };
  if (fill) {
    style["--picture-focus"] = focus;
  } else {
    style["--picture-max"] = pictureMaxWidth(asset, ratio);
    if (ratio) {
      style["--picture-ratio"] = ratio.replace("/", " / ");
      style["--picture-focus"] = focus;
    }
  }

  return (
    <picture className={cx(styles.picture, fill ? styles.fill : ratio && styles.cropped, className)} style={style as CSSProperties}>
      <source type="image/webp" srcSet={srcSet(d, "webp")} sizes={sizes} />
      <img
        className={styles.image}
        src={fallback.jpg}
        srcSet={srcSet(d, "jpg")}
        sizes={sizes}
        width={d.width}
        height={d.height}
        alt={alt ?? a.alt[lang]}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : undefined}
      />
    </picture>
  );
}
