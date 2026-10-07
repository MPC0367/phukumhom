import type { L } from "@/content/schema";

/**
 * Homepage chapter 05, "Around the resort": the wording around four tiles.
 *
 * The tiles themselves are the four editorial entries in src/content/experiences.ts: their names,
 * photographs and facts are read from there. What is here is the frame around them, and for each tile
 * the ONE sentence of that entry's description the tile prints.
 *
 * Each `excerpts` string must be found, character for character, inside the entry's description in
 * experiences.ts. HomeGrounds checks this when it renders and fails loudly if it is not, so a tile can
 * never say something the content record does not (BUILD-CONTRACT section 2: no second truth).
 *
 * Truth notes:
 * - Nothing here names an activity, a timetable or a charge. None is published.
 * - The pool is always "shared" and is never placed beside the rooms: the sentence chosen for it is the
 *   glossary's own ("set apart from the rooms").
 * - "By arrangement" is printed on a tile only when experiences.ts publishes `bookingRequired: true` for
 *   it. Today no entry does, so the line is not on the page.
 * - No middle dots and no dashes in any string.
 */

export const TILE_IDS = ["gardens-and-pond", "private-rooftop", "shared-pool", "kitchen-garden"] as const;
export type TileId = (typeof TILE_IDS)[number];

export interface GroundsCopy {
  /** Rail kicker: glossary home.sections.time.label. */
  kicker: string;
  /** Rail title. */
  title: string;
  /** Rail intro. */
  intro: string;
  /** One sentence per tile, quoted from the entry's description. */
  excerpts: Record<TileId, string>;
  /** Glossary phrases.byArrangementAsk, rewritten without its dash. */
  byArrangement: string;
  /** Glossary phrases.activitiesAsk: the one pointer this chapter gives. */
  ask: string;
}

export const copy = {
  en: {
    kicker: "Time around the resort",
    title: "Grounds",
    intro: "Unhurried hours in the grounds: a garden to walk, water to sit beside and the evening sky.",
    excerpts: {
      "gardens-and-pond": "Clipped hedges, lawns and mature trees run between the clay-coloured buildings, and there is a pond on the grounds.",
      "private-rooftop": "It is the room’s own piece of open sky, for a first coffee or the last light of the day.",
      "shared-pool": "The resort has a shared outdoor pool, set apart from the rooms.",
      "kitchen-garden": "The resort describes a small kitchen garden of its own.",
    },
    byArrangement: "By arrangement. Ask the team.",
    ask: "Ask the team what is running for your dates.",
  },
  th: {
    kicker: "ใช้เวลาในรีสอร์ท",
    title: "รอบรีสอร์ท",
    intro: "เดินเล่นในสวน นั่งริมน้ำ ชมฟ้ายามเย็น ใช้เวลาในรีสอร์ทได้โดยไม่ต้องรีบ",
    excerpts: {
      "gardens-and-pond": "แนวพุ่มไม้ตัดแต่ง สนามหญ้า และต้นไม้ใหญ่แทรกอยู่ระหว่างอาคารสีดินเผา ในบริเวณรีสอร์ทมีสระน้ำด้วย",
      "private-rooftop": "ดาดฟ้าเป็นพื้นที่กลางแจ้งของห้องเอง จะนั่งจิบกาแฟยามเช้าหรือรอดูแสงสุดท้ายของวันก็ได้",
      "shared-pool": "รีสอร์ทมีสระว่ายน้ำกลางแจ้งส่วนกลาง อยู่แยกจากห้องพัก",
      "kitchen-garden": "รีสอร์ทเล่าว่ามีสวนครัวแปลงเล็กของตัวเอง",
    },
    byArrangement: "ต้องนัดล่วงหน้า สอบถามทีมงานได้",
    ask: "สอบถามทีมงานได้ว่าช่วงที่เข้าพักมีอะไรเปิดให้บริการบ้าง",
  },
} satisfies L<GroundsCopy>;
