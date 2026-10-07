import type { L } from "@/content/schema";

/**
 * The homepage hero: every word in it that is not already a shared interface string.
 *
 * WHERE THE WORDS COME FROM
 *   locality, line, supporting   docs/glossary.json home.eyebrow, home.display and home.supporting
 *                                (docs/VOICE.md section 6, row A in each language)
 *   everything else              written here, each language on its own terms
 * The button labels (Explore rooms, Check availability, Plan your stay), the photograph counter
 * ("Photograph 2 of 4") and the planner's own words are shared strings and are read from src/i18n/ui.ts.
 * The resort's name, the province and the room names are read from src/content, never typed here.
 *
 * TWO DEPARTURES from the glossary as it stood on 7 Oct 2026:
 *   - home.eyebrow joins the name and the locality with a middle dot, which this site never prints
 *     (BUILD-CONTRACT section 9). The two halves are kept and the hero draws a rule element between them.
 *   - home.supporting.th ends "ทุกห้องมีดาดฟ้าส่วนตัว" (every room). The ledger supports a private rooftop
 *     for each room TYPE only (first review, finding 2), so the line says "ห้องพักทุกแบบ", which is what the
 *     English line and the room pages say.
 *
 * The display line is stored in its two lines. English sets its last word in italics (`accent`); Thai has
 * no accent word and is never italicised, so `accent` is empty there.
 *
 * No middle dots and no dashes anywhere in these strings.
 */

interface HeroCopy {
  /** The second half of the <h1>: where the resort is. The first half is the resort's name, from src/content/site.ts. */
  locality: string;
  /** The display line, as its two lines. `second` is followed directly by `accent`, which English italicises. */
  line: { first: string; second: string; accent: string };
  supporting: string;
  /** The small line inside the phone "Plan your stay" pill: what the planner asks for. */
  planHint: string;
  /** Visually hidden text of the scroll cue. */
  scroll: string;
  slides: {
    /** Accessible name of the slide control. */
    label: string;
    previous: string;
    next: string;
    pause: string;
    play: string;
  };
}

export const copy = {
  en: {
    locality: "Wang Katha, Pak Chong",
    line: { first: "A little closer", second: "to ", accent: "nature." },
    supporting: "Garden stays and private rooftops in Wang Katha, on the quieter side of the Khao Yai area.",
    planHint: "Dates and guests",
    scroll: "Scroll",
    slides: {
      label: "Photographs of the resort",
      previous: "Previous photograph",
      next: "Next photograph",
      pause: "Pause the photographs",
      play: "Play the photographs",
    },
  },
  th: {
    locality: "วังกะทะ ปากช่อง",
    line: { first: "ใกล้ธรรมชาติ", second: "ขึ้นอีกนิด", accent: "" },
    supporting: "ที่พักกลางสวนในวังกะทะ ฝั่งที่เงียบกว่าของย่านเขาใหญ่ ห้องพักทุกแบบมีดาดฟ้าส่วนตัว",
    planHint: "วันที่และจำนวนผู้เข้าพัก",
    scroll: "เลื่อนลง",
    slides: {
      label: "ภาพบรรยากาศของรีสอร์ท",
      previous: "ภาพก่อนหน้า",
      next: "ภาพถัดไป",
      pause: "หยุดเล่นภาพ",
      play: "เล่นภาพต่อ",
    },
  },
} satisfies L<HeroCopy>;

export type HeroCopyShape = HeroCopy;
