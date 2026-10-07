/**
 * The homepage's copy, in one place to import from.
 *
 * The page is written section by section: each file in this folder holds one section's words in both
 * languages (`copy = { th, en } satisfies L<Shape>`, identical keys), and each section component reads
 * its own file. This index names them in the order the page shows them, for anything that needs the
 * page as a whole (a content check, a search index, a second page quoting a line):
 *
 *   import { homeCopy, HOME_SECTIONS } from "@/content/pages/home";
 *   homeCopy.hero[lang].line          homeCopy.closing[lang].line
 *
 * Shared words (button labels, navigation, patterns) are not here: they are in src/i18n/ui.ts. Facts
 * (times, the phone number, the address, room names) are not here either: they are in src/content/*.ts
 * and are interpolated where they are shown.
 *
 * PHOTOGRAPHS. Which frame a section shows is decided in that section (its content file or its
 * component), and the page as a whole keeps to two rules: no photograph twice on the way down the
 * page, and at most one frame from a near-identical set (BUILD-CONTRACT section 8). `node
 * _qa/home/frames.mjs` reads the rendered page and reports both. Two repeats are deliberate and are
 * the only ones: the rooftop chapter stacks three frames of one terrace (04_24, 04_25, 04_27), which
 * is its whole subject, and two of those are also hero slides (ART-DIRECTION sections 5 and 6).
 */

import { copy as arrive } from "./arrive";
import { copy as closing } from "./closing";
import { copy as grounds } from "./grounds";
import { copy as hero } from "./hero";
import { copy as nearby, places } from "./nearby";
import { copy as reel } from "./reel";
import { copy as rooftop } from "./rooftop";
import { copy as setting } from "./setting";
import { copy as stay } from "./stay";
import { copy as table } from "./table";

/** Every section's words, keyed by section, each `{ th, en }`. */
export const homeCopy = { hero, setting, stay, rooftop, table, grounds, reel, nearby, places, arrive, closing } as const;

/**
 * The page from top to bottom: the element id each section renders, and its chapter number when it is
 * a numbered chapter (bands and the hero have none and are skipped by the chapter index).
 * `story` is a public anchor: legacy URLs redirect to it (BUILD-CONTRACT section 8).
 */
export const HOME_SECTIONS = [
  { id: "home-hero", chapter: null },
  { id: "story", chapter: 1 },
  { id: "stay", chapter: 2 },
  { id: "rooftop", chapter: 3 },
  { id: "table", chapter: 4 },
  { id: "grounds", chapter: 5 },
  { id: "reel", chapter: null },
  { id: "around", chapter: 6 },
  { id: "arrive", chapter: 7 },
] as const;

export type HomeSectionId = (typeof HOME_SECTIONS)[number]["id"];
