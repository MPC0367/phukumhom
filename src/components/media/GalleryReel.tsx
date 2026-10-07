import type { CSSProperties } from "react";
import type { AssetId, Locale } from "@/content/schema";
import { getAsset, getDerivative } from "@/content/assets";
import { getRoom } from "@/content/rooms";
import { fill } from "@/i18n/ui";
import { DriftReel } from "@/components/motion";
import { LightboxRoot, LightboxTrigger, Picture, cx, lightboxItems, lightboxLabels, type PictureRatio } from "@/components/ui";
import { mediaCopy } from "./copy";
import { ReelAssist } from "./ReelAssist";
import styles from "./GalleryReel.module.css";

/**
 * A row of photographs that drifts, can be grabbed and thrown, and opens the photograph viewer.
 *
 *   <GalleryReel lang={lang} label="Photographs of the resort" assets={ids} />
 *   <GalleryReel lang={lang} label={…} assets={ids} heights={{ min: 13, max: 19 }} />      a smaller row
 *   <GalleryReel lang={lang} label={…} assets={ids} ratios={{ [id]: "4/5" }} className={s.reel} />
 *
 * What it is made of: a <LightboxRoot> (the viewer, fed by lightboxItems) round a <DriftReel> whose
 * items are <LightboxTrigger>s, each holding one rounded <Picture>. All frames share one height and
 * differ in width.
 *
 *   assets    catalogue ids, in drifting order. The order is also the order of the viewer. A frame that
 *             is not cleared for use throws (lightboxItems refuses it).
 *   label     the accessible name of the group, in the page language.
 *   heights   the frame height in rem: `min` on phones, `max` on wide screens, fluid in between
 *             (it reaches `max` at a 1387px viewport). Default 17 and 26.
 *   ratios    the crop for a frame, by id. Any frame not named gets one from the rhythm below.
 *   speed     pixels per second, passed to the reel. Default 32.
 *   className for the reel itself: set --reel-inset here to rest the first frame in from the edge
 *             (for example at the page gutter), and margins.
 *
 * THE RHYTHM. Unnamed frames alternate wide, narrow and middling so the row never reads as a strip of
 * equal boxes. A landscape frame is never cropped tighter than the catalogue's own phone crop for it
 * (`mobileCrop`), which a person chose with the subject in view; a portrait frame is shown upright.
 *
 * WORDS. Each photograph is named for assistive technology by its catalogued caption ("Open photograph:
 * Gac fruit hanging on the vine") and carries its catalogued alt text; the viewer shows the caption.
 * A room photograph's caption is led by its room type, read from the frame's own catalogue entry, so a
 * frame can never be labelled with a room it was not catalogued against.
 *
 * WITHOUT MOTION (no JavaScript, reduced motion): a native horizontal scroller, and each photograph is
 * a plain link to its largest file.
 *
 * A Server Component: it reads the catalogue. The only script of its own is <ReelAssist>.
 */

export interface GalleryReelProps {
  lang: Locale;
  assets: AssetId[];
  label: string;
  heights?: { min: number; max: number };
  ratios?: Partial<Record<AssetId, PictureRatio>>;
  speed?: number;
  className?: string;
}

/** The viewport width, in rem, at which the frames reach their full height. */
const FULL_AT = 86.6875;

/** Crops from widest to narrowest. */
const TIGHTNESS: PictureRatio[] = ["3/2", "4/3", "1/1", "4/5", "3/4"];
/** The width a frame is asked for, by its place in the row: an index into TIGHTNESS. */
const RHYTHM = [0, 2, 1, 3, 0, 1, 2, 1];
const PHONE_CROP: Record<string, number> = { "3:2": 0, "4:3": 1, "1:1": 2, "4:5": 3, "3:4": 4 };

/** The class that gives a frame its shape (GalleryReel.module.css). */
const SHAPE: Record<PictureRatio, string> = {
  "21/9": styles.r21x9,
  "2/1": styles.r2x1,
  "16/9": styles.r16x9,
  "3/2": styles.r3x2,
  "4/3": styles.r4x3,
  "1/1": styles.r1x1,
  "4/5": styles.r4x5,
  "3/4": styles.r3x4,
};

const value = (ratio: PictureRatio) => {
  const [w, h] = ratio.split("/").map(Number);
  return w / h;
};
const round = (n: number) => Math.round(n * 1000) / 1000;

function rhythmRatio(asset: AssetId, index: number): PictureRatio {
  const a = getAsset(asset);
  const d = getDerivative(asset);
  if (d.height > d.width) return "3/4";
  const want = RHYTHM[index % RHYTHM.length];
  const tightest = PHONE_CROP[a.mobileCrop] ?? 1;
  // A frame shot wider than 3:2 keeps its width when the row asks for a wide one.
  if (want === 0 && d.width / d.height > 1.7) return "16/9";
  return TIGHTNESS[Math.min(want, tightest)];
}

export function GalleryReel({ lang, assets, label, heights = { min: 17, max: 26 }, ratios, speed, className }: GalleryReelProps) {
  const words = mediaCopy[lang];
  if (assets.length === 0) return null;
  const twice = assets.find((id, index) => assets.indexOf(id) !== index);
  if (twice) throw new Error(`GalleryReel: "${twice}" is listed twice. A reel shows each photograph once.`);

  // The viewer's items, with a room photograph's caption led by its room type.
  const items = lightboxItems(assets, lang).map((item) => {
    const rooms = getAsset(item.id).rooms;
    return rooms.length === 1 ? { ...item, caption: fill(words.room, { room: getRoom(rooms[0]).name, caption: item.caption }) } : item;
  });

  // Height: min on phones, max from FULL_AT, and the same share of the viewport width in between.
  const fluid = round((heights.max / FULL_AT) * 100);
  const fluidFrom = round((heights.min / heights.max) * FULL_AT);
  const frame = {
    "--gallery-reel-min": `${heights.min}rem`,
    "--gallery-reel-max": `${heights.max}rem`,
    "--gallery-reel-fluid": `${fluid}vw`,
  } as CSSProperties;

  return (
    <LightboxRoot items={items} labels={lightboxLabels(lang)}>
      <ReelAssist className={styles.shell} style={frame}>
        <DriftReel label={label} speed={speed} gap="var(--gallery-reel-gap)" className={cx(styles.reel, className)}>
          {items.map((item, index) => {
            const ratio = ratios?.[item.id] ?? rhythmRatio(item.id, index);
            const r = value(ratio);
            // The box is height × ratio at each of the three stages of the height.
            const sizes = `(min-width: ${FULL_AT}rem) ${round(heights.max * r)}rem, (min-width: ${fluidFrom}rem) ${round(fluid * r)}vw, ${round(heights.min * r)}rem`;
            return (
              <LightboxTrigger key={item.id} index={index} label={fill(words.open, { caption: item.caption })} className={cx(styles.item, SHAPE[ratio])}>
                <Picture asset={item.id} lang={lang} fill ratio={ratio} sizes={sizes} />
              </LightboxTrigger>
            );
          })}
        </DriftReel>
      </ReelAssist>
    </LightboxRoot>
  );
}
