import type { AssetId } from "@/content/schema";

/**
 * The hero's four photographs, in the order they are shown. Catalogue ids; the legacy frame number is
 * in the comment. They are the four frames ART-DIRECTION section 5 names.
 *
 * THE ORDER. One day at the resort, opening in full light: the garden and the clay-pink building by
 * day, the rooftop by day, the same rooftop at dusk, then the lane in haze before the day comes round
 * again. ART-DIRECTION lists the hazy lane (01_24) first. The integration pass moved it to the end:
 * it is the quietest and darkest of the four once the scrims that keep the words legible are over it,
 * and the first photograph is the one every guest sees and the one the owner's "make the hero pop" is
 * judged by. The sequence is the same cycle entered one frame later. To restore the written order, move
 * the last line of the list back to the top; nothing else depends on it (the first entry is the eager
 * image, the rest load after it).
 *
 * The lane frame cannot tell morning from evening and is never captioned as either (BUILD-CONTRACT
 * section 8); captions are the catalogue's own.
 *
 * A plain module: the Server Component reads the catalogue with these, the client island only counts them.
 */
export const HERO_FRAMES = [
  "pink-building-lily-pond-rocks", // 02_08  the pond and the clay-pink building
  "rooftop-spa-tub-pergola-hill-view", // 04_24  the rooftop spa tub by day (Executive Pool Spa)
  "rooftop-terrace-dusk-wall-lamps-spa-tub", // 04_27  the same terrace at dusk
  "clay-buildings-rooftop-pergolas-hazy-lane", // 01_24  the lane and the rooftop pergolas, hazy light
] as const satisfies readonly AssetId[];

/** The id of the hero's root element: the client islands find the photographs and the words through it. */
export const HERO_ID = "home-hero";

/** The id of the <h1> inside it. */
export const HERO_TITLE_ID = "home-hero-title";

/** Seconds one photograph is held before the next begins to arrive. The active progress bar fills over this. */
export const HERO_HOLD = 7;

/** Seconds a crossfade takes. The outgoing photograph stays opaque underneath for all of it. */
export const HERO_FADE = 1.6;
