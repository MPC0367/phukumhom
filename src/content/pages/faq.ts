import type { AssetId, FaqItem, L } from "@/content/schema";

/**
 * The FAQ page (brief section 18): the wording around the questions.
 *
 * The questions and answers themselves are data in src/content/faq.ts; this file holds the page's own
 * words: the lead, the group names, the search field and the closing invitation. The four bullets of
 * "At a glance" are the first sentences of four answers, read from the data, so they cannot be worded
 * a second way.
 *
 * Kept: an answer never states a rule the resort has not published; where there is none it gives a
 * route (the booking page, or the resort). The page reads as hospitality, not as a validation report.
 * Third person. No middle dots and no dashes.
 */

/** Legacy 01_10: twin rooftop pergolas over an entrance at blue hour. Catalogued for full-bleed use. */
export const FAQ_HERO: AssetId = "twin-rooftop-pergolas-entrance-blue-hour";

/** The answers whose first sentence makes a bullet of "At a glance", by id, in this order. */
export const GLANCE_ANSWERS: string[] = ["check-in-out", "breakfast", "pets", "parking"];

/** The order the groups are shown in. */
export const GROUP_ORDER: FaqItem["group"][] = ["stay", "rooms", "booking", "dining", "arrival", "property"];

export interface FaqPageCopy {
  heroKicker: string;
  statement: string;
  accent: string;
  body: string[];
  groups: Record<FaqItem["group"], string>;
  search: {
    label: string;
    /** Announced politely as the list changes. `{count}` is the number of questions showing. */
    countOne: string;
    countMany: string;
    none: string;
    clear: string;
    /** Names the list of group links. */
    jump: string;
  };
  ask: { kicker: string; heading: string; lead: string };
}

export const copy = {
  en: {
    heroKicker: "FAQ",
    statement: "Plain answers before you book, and someone to ask when a question is your own.",
    accent: "ask",
    body: [
      "Where the resort has a published answer, it is here. Where a rule depends on the rate or the dates, the answer says where to find it: on the booking page, or from the team.",
    ],
    groups: {
      stay: "Your stay",
      rooms: "Rooms",
      booking: "Booking",
      dining: "Dining",
      arrival: "Getting here",
      property: "Around the resort",
    },
    search: {
      label: "Search the questions",
      countOne: "{count} question",
      countMany: "{count} questions",
      none: "No question matches that. Try another word, or ask the resort.",
      clear: "Clear the search",
      jump: "Jump to a group",
    },
    ask: {
      kicker: "Still unsure",
      heading: "Ask the resort directly",
      lead: "If your question is not here, the team is the one to ask. Call, write on Facebook, or send an enquiry from the contact page.",
    },
  },
  th: {
    heroKicker: "คำถามที่พบบ่อย",
    statement: "คำตอบตรงไปตรงมาก่อนจอง และช่องทางสอบถาม เมื่อคำถามเป็นเรื่องเฉพาะของคุณ",
    accent: "",
    body: ["เรื่องใดที่รีสอร์ทมีคำตอบชัดเจน จะอยู่ในหน้านี้ ส่วนเรื่องที่ขึ้นอยู่กับราคาหรือวันที่เข้าพัก คำตอบจะบอกว่าดูได้จากที่ใด ทั้งในหน้าจองหรือสอบถามจากทีมงาน"],
    groups: {
      stay: "การเข้าพัก",
      rooms: "ห้องพัก",
      booking: "การจอง",
      dining: "ร้านอาหาร",
      arrival: "การเดินทาง",
      property: "รอบรีสอร์ท",
    },
    search: {
      label: "ค้นหาคำถาม",
      countOne: "{count} คำถาม",
      countMany: "{count} คำถาม",
      none: "ไม่พบคำถามที่ตรงกับคำค้น ลองใช้คำอื่น หรือสอบถามรีสอร์ทได้",
      clear: "ล้างคำค้น",
      jump: "ไปยังหมวดคำถาม",
    },
    ask: {
      kicker: "ยังไม่แน่ใจ",
      heading: "สอบถามรีสอร์ทโดยตรง",
      lead: "หากไม่พบคำถามของคุณในหน้านี้ สอบถามทีมงานได้เลย จะโทร ติดต่อทาง Facebook หรือส่งข้อความสอบถามจากหน้าติดต่อรีสอร์ทก็ได้",
    },
  },
} satisfies L<FaqPageCopy>;
