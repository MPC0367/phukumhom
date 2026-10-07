import type { L } from "@/content/schema";

/**
 * Homepage copy: chapter 01 "The setting" and Band A (the rooftop view between chapters 01 and 02).
 *
 * Each language was written on its own, by docs/VOICE.md. Where the glossary already has the words they
 * are used as they stand:
 *   kicker            glossary home.sections.setting.label
 *   statement, first sentence   glossary home.sections.setting.heading
 *   intro             VOICE.md section 1, "Ours" (the sentence that names the place)
 *   tile notes        glossary terms.asCurrentlyListed
 *   note              glossary phrases.notInPark
 *   band.line         VOICE.md section 6, display line C
 *
 * No fact is typed here. The figure 3 is `rooms.length`, the two times come from `pub(site.checkIn)` and
 * `pub(site.checkOut)`, and the captions are the catalogue's own.
 *
 * A sentence with one italic accent word is stored in three parts, so the accent can be an <em> without
 * markup in the copy. Thai is never italic: its `accent` and `after` are empty.
 */

export interface AccentLine {
  before: string;
  /** The single italic word English is allowed. Empty in Thai. */
  accent: string;
  after: string;
}

export interface SettingCopy {
  kicker: string;
  title: string;
  intro: string;
  statement: AccentLine;
  /** A second, plain sentence set with the statement. */
  statementMore: string;
  tiles: {
    /** Accessible name of the strip. */
    label: string;
    roomTypes: { label: string; note: string };
    checkIn: { label: string; note: string };
    checkOut: { label: string; note: string };
    /** The line under the strip that says which document rules. */
    reference: string;
  };
  /** The plain sentence beside the photographs; the link under it goes to the location page. */
  note: string;
  /** Accessible name of the control that opens a photograph in the viewer; the caption follows it. */
  openPhoto: string;
  band: {
    kicker: string;
    line: AccentLine;
  };
}

export const copy = {
  en: {
    kicker: "The setting",
    title: "Garden",
    intro: "Phukumhom is a garden resort in Wang Katha, on the quieter side of the Khao Yai area.",
    statement: { before: "A garden, a pond and a great deal of ", accent: "sky.", after: "" },
    statementMore: "Clay-pink buildings stand among clipped hedges, and each of the three room types has a private rooftop.",
    tiles: {
      label: "The stay at a glance",
      roomTypes: { label: "Room types", note: "each with a private rooftop" },
      checkIn: { label: "Check-in from", note: "as currently listed" },
      checkOut: { label: "Check-out until", note: "as currently listed" },
      reference: "Your booking confirmation is the reference for both times.",
    },
    note: "The resort is in the Khao Yai area, not inside the national park.",
    openPhoto: "Open photograph",
    band: {
      kicker: "A private rooftop with every room type",
      line: { before: "Gardens below, open ", accent: "sky", after: " above." },
    },
  },
  th: {
    kicker: "รู้จักภูคำหอม",
    title: "สวน",
    intro: "ภูคำหอมเป็นรีสอร์ทกลางสวนในตำบลวังกะทะ ฝั่งที่เงียบกว่าของย่านเขาใหญ่",
    statement: { before: "สวน สระน้ำ และท้องฟ้ากว้าง", accent: "", after: "" },
    statementMore: "อาคารสีชมพูอิฐตั้งอยู่กลางแนวพุ่มไม้เขียว ห้องพักทั้งสามแบบมีดาดฟ้าส่วนตัว",
    tiles: {
      label: "ข้อมูลการเข้าพักโดยสรุป",
      roomTypes: { label: "ประเภทห้องพัก", note: "แต่ละประเภทมีดาดฟ้าส่วนตัว" },
      checkIn: { label: "เช็กอินได้ตั้งแต่", note: "ตามข้อมูลปัจจุบัน" },
      checkOut: { label: "เช็กเอาต์ภายใน", note: "ตามข้อมูลปัจจุบัน" },
      reference: "เวลาเช็กอินและเช็กเอาต์ให้ยึดตามใบยืนยันการจองเป็นหลัก",
    },
    note: "รีสอร์ทอยู่ในย่านเขาใหญ่ ไม่ได้อยู่ในเขตอุทยานแห่งชาติเขาใหญ่",
    openPhoto: "เปิดดูภาพ",
    band: {
      kicker: "ทุกประเภทห้องพักมีดาดฟ้าส่วนตัว",
      line: { before: "สวนรอบตัว ฟ้ากว้างเหนือดาดฟ้า", accent: "", after: "" },
    },
  },
} satisfies L<SettingCopy>;
