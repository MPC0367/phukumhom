import { useId, type CSSProperties } from "react";
import Link from "next/link";
import type { AssetId, Locale } from "@/content/schema";
import { getAsset } from "@/content/assets";
import { getRoom } from "@/content/rooms";
import { cx } from "./cx";
import { Icon } from "./Icon";
import { Picture, pictureMaxWidth, type PictureRatio } from "./Picture";
import { Rule } from "./Rule";
import styles from "./Frame.module.css";

/**
 * A photograph in the content column: rounded, with an optional quiet caption beneath.
 *
 *   <Frame asset={id} lang={lang} sizes="…" />                          caption from the catalogue
 *   <Frame asset={id} lang={lang} sizes="…" ratio="4/5" caption={false} />   no caption (a grid, a repeat)
 *   <Frame asset={id} lang={lang} sizes="…" ratio="4/3" showRoom href={href(lang, "room", { room })} />
 *   <Frame asset={id} lang={lang} sizes="…" radius="md" />              a card-sized photograph
 *
 * - The caption is a fact about the frame. The default is the catalogued caption; write another only to
 *   say what this photograph shows, never a promise (BUILD-CONTRACT section 8).
 * - `showRoom` leads the caption with the room name, taken from the frame's own `rooms` entry in the
 *   catalogue, so a photograph can never be labelled with a room it was not catalogued against.
 * - `href` wraps the picture (not the caption) in a link named by the caption. On hover and on keyboard
 *   focus the photograph eases to 1.04 inside its frame over 0.9s and a small arrow badge arrives in the
 *   corner; on touch screens the badge is simply there.
 * - `radius`: lg (20px, the default for photographs) · md (14px, cards and tiles) · none.
 * - `align="end"` hangs a frame that is narrower than its column from the column's far edge.
 * - Width follows <Picture>: a framed photograph never outgrows what its source can honestly carry
 *   (about 1000 CSS px). For edge-to-edge photography use <Band> with <Picture fill />.
 *
 * <Plate> is the first build's name for this component and is exported as an alias.
 */

export interface FrameProps {
  asset: AssetId;
  lang: Locale;
  sizes: string;
  ratio?: PictureRatio;
  priority?: boolean;
  /** Defaults to the catalogued caption. `false` renders no caption text. */
  caption?: string | false;
  /** Internal destination, built with `href()` from lib/routes. */
  href?: string;
  radius?: "lg" | "md" | "none";
  showRoom?: boolean;
  align?: "start" | "end";
  /** Overrides the catalogued alt text; "" for a decorative repeat. */
  alt?: string;
  /** @deprecated Plates are no longer numbered. Accepted so first-build pages keep compiling; not rendered. */
  number?: number | string;
  className?: string;
}

export function Frame({ asset, lang, sizes, ratio, priority, caption, href, radius = "lg", showRoom = false, align = "start", alt, className }: FrameProps) {
  const captionId = useId();
  const a = getAsset(asset);
  const text = caption === false ? null : (caption ?? a.caption[lang]);
  // The category name is a proper name: Latin script, identical in both languages (content/rooms.ts).
  const room = showRoom && a.rooms.length > 0 ? getRoom(a.rooms[0]).name : null;
  const hasWords = Boolean(text || room);

  const picture = <Picture asset={asset} lang={lang} sizes={sizes} priority={priority} ratio={ratio} alt={alt} />;

  return (
    <figure
      className={cx(styles.frame, styles[radius], align === "end" && styles.end, className)}
      style={{ "--frame-max": pictureMaxWidth(asset, ratio) } as CSSProperties}
    >
      {href ? (
        <Link href={href} className={cx(styles.media, styles.link)} aria-labelledby={hasWords ? captionId : undefined}>
          {picture}
          <span className={styles.badge} aria-hidden="true">
            <Icon name="arrow-up-right" size={18} />
          </span>
        </Link>
      ) : (
        <div className={styles.media}>{picture}</div>
      )}
      {hasWords ? (
        <figcaption id={captionId} className={styles.caption}>
          {room ? (
            <span className={styles.room}>
              {lang === "th" ? "ห้อง " : null}
              <span lang="en">{room}</span>
            </span>
          ) : null}
          {room && text ? <Rule /> : null}
          {text}
        </figcaption>
      ) : null}
    </figure>
  );
}
