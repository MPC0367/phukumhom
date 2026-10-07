import type { AssetId, GalleryFilter, L } from "@/content/schema";

/**
 * The Gallery page (brief section 15): the wording around the photographs.
 *
 * Every frame, its caption, its alt text and its filter come from the photograph catalogue
 * (src/content/assets). A room photograph's caption is led by its own room type, read from the frame's
 * catalogue entry. The filter labels are the shared table's (src/i18n/ui.ts → gallery).
 *
 * Kept (BUILD-CONTRACT sections 4 and 8): only frames the catalogue has cleared; no identifiable
 * people; a caption says what the frame shows and never promises how things are today; the guest label
 * for "rooftops" is "Rooftops", never "Rooftops and Spa". Of each set of near-identical frames the
 * gallery shows one (the list below names the ones left out). Third person. No dots, no dashes.
 */

/** Legacy 02_15: the carved standing stone, a pink building and the lawn. Catalogued for hero use. */
export const GALLERY_HERO: AssetId = "carved-standing-stone-pink-building-lawn";

/**
 * Left out of the gallery because a near twin is in it (contract section 8, "at most one frame from any
 * near-identical set on a page"), by legacy id:
 *   01_11, 01_15 (twins of 01_06) · 01_05 (01_01) · 05_03, 05_04 (05_02) · 01_19, 01_20, 01_23 (01_21) · 04_25 (04_27)
 */
export const GALLERY_TWINS: string[] = ["01_11", "01_15", "01_05", "05_03", "05_04", "01_19", "01_20", "01_23", "04_25"];

/** The order the groups take turns in when every photograph is shown, so the page opens varied. */
export const WEAVE: GalleryFilter[] = ["gardens", "rooftops", "rooms", "dining", "experiences"];

export interface GalleryPageCopy {
  heroKicker: string;
  statement: string;
  accent: string;
  body: string[];
  glance: {
    /** `{count}` is the number of photographs shown. */
    count: string;
    rooms: string;
    ask: string;
  };
  /** Names the row of filter chips. */
  filterLabel: string;
  /** Announced politely when the filter changes. */
  countOne: string;
  countMany: string;
  /** Accessible name of one photograph; `{caption}` is its caption. */
  open: string;
  /** A room photograph's caption: `{room}` then `{caption}`. */
  room: string;
  /** Accessible name of the grid. */
  gridLabel: string;
}

export const copy = {
  en: {
    heroKicker: "Gallery",
    statement: "The rooms, the rooftops and the gardens, one frame at a time.",
    accent: "frame",
    body: ["Choose a group, then open any photograph to see it whole and move through the rest. Each caption says what the frame shows."],
    glance: {
      count: "{count} photographs, all of them the resort’s own.",
      rooms: "A photograph of a room is labelled with its room type.",
      ask: "If a detail in a photograph matters for your stay, ask the resort before you book.",
    },
    filterLabel: "Show photographs of",
    countOne: "{count} photograph",
    countMany: "{count} photographs",
    open: "Open photograph: {caption}",
    room: "{room}: {caption}",
    gridLabel: "Photographs of the resort",
  },
  th: {
    heroKicker: "ภาพบรรยากาศ",
    statement: "ห้องพัก ดาดฟ้า และสวน ค่อยๆ ดูไปทีละภาพ",
    accent: "",
    body: ["เลือกหมวดที่สนใจ แล้วกดที่ภาพเพื่อดูเต็มจอและเลื่อนดูภาพอื่นต่อได้ คำบรรยายใต้ภาพบอกว่าภาพนั้นคืออะไร"],
    glance: {
      count: "ภาพถ่ายทั้งหมด {count} ภาพ เป็นภาพของรีสอร์ทเอง",
      rooms: "ภาพห้องพักจะระบุชื่อประเภทห้องไว้ด้วย",
      ask: "หากรายละเอียดในภาพมีผลต่อการตัดสินใจ สอบถามรีสอร์ทก่อนจองได้",
    },
    filterLabel: "เลือกดูภาพ",
    countOne: "{count} ภาพ",
    countMany: "{count} ภาพ",
    open: "เปิดดูภาพ {caption}",
    room: "ห้อง {room} {caption}",
    gridLabel: "ภาพบรรยากาศของรีสอร์ท",
  },
} satisfies L<GalleryPageCopy>;
