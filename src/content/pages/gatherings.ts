import type { AssetId, L } from "@/content/schema";

/**
 * The Gatherings page (brief section 14): a restrained template for group stays and gatherings.
 *
 * UNPUBLISHED. The page exists only while the `gatherings` flag is on; with it off the route answers
 * 404 and no menu, footer, sitemap or link mentions it. It stays off until the resort confirms what it
 * hosts (docs/HANDOFF.md lists the questions).
 *
 * What may be said today (BUILD-CONTRACT section 8, "Group enquiries"): the resort's own posts invite
 * seminar and group enquiries. Nothing else is known, so nothing else is written: no capacity, no
 * package, no price, no buyout, no equipment list, no catering promise, no wedding wording, no claim
 * that a named space can be reserved. The photographs are captioned by the catalogue as what they show.
 * The page's one job is to carry a well-formed enquiry to the contact form (?type=group).
 * Third person. No middle dots and no dashes.
 */

/** Legacy 05_41: the shared pool and the open-sided pavilion. Catalogued for full-bleed use. */
export const GATHERINGS_HERO: AssetId = "shared-pool-open-pavilion-blue-sky";

/** Settings a group would see, each captioned as what the frame shows. */
export const SETTING_FRAMES: AssetId[] = [
  "dining-pavilion-tables-log-posts-dusk", // 01_26
  "garden-lawn-glazed-jars-clay-buildings", // 01_21
  "reception-lounge-armchairs-antler-chandeliers", // 05_12
];

export interface GatheringsPageCopy {
  heroKicker: string;
  statement: string;
  accent: string;
  body: string[];
  glance: string[];
  enquire: string;
  tell: { kicker: string; title: string; intro: string; items: string[] };
  setting: { kicker: string; title: string; intro: string; label: string; open: string };
}

export const copy = {
  en: {
    heroKicker: "Gatherings",
    statement: "Coming as a group? Tell the team what you have in mind.",
    accent: "group",
    body: [
      "The resort welcomes enquiries from groups, whether for a stay together or a seminar. What it can host depends on your dates and your numbers, so the team answers each enquiry on its own terms.",
      "Every request is subject to availability and to the resort’s confirmation.",
    ],
    glance: [
      "The resort welcomes group and seminar enquiries.",
      "What can be hosted depends on your dates and numbers; the team will say.",
      "An enquiry is a message to the resort, not a confirmed reservation.",
    ],
    enquire: "Tell the team about your group",
    tell: {
      kicker: "What helps the team answer",
      title: "Enquire",
      intro: "A few details make the first reply a useful one.",
      items: [
        "The occasion, in a sentence.",
        "The dates you have in mind, and how flexible they are.",
        "Roughly how many people, and how many would stay overnight.",
        "Anything practical the team should know, such as meals together or time set aside for a meeting.",
      ],
    },
    setting: {
      kicker: "The setting",
      title: "Setting",
      intro: "Parts of the resort, as the photographs show them.",
      label: "Photographs of the resort",
      open: "Open photograph: {caption}",
    },
  },
  th: {
    heroKicker: "หมู่คณะและการจัดงาน",
    statement: "มากันเป็นหมู่คณะ เล่าให้ทีมงานฟังได้ว่าอยากจัดแบบไหน",
    accent: "",
    body: [
      "รีสอร์ทยินดีรับคำถามจากหมู่คณะ ไม่ว่าจะมาพักด้วยกันหรือจัดสัมมนา สิ่งที่รองรับได้ขึ้นอยู่กับวันที่และจำนวนคน ทีมงานจึงตอบแต่ละคำถามตามรายละเอียดของงานนั้น",
      "ทุกคำขอขึ้นอยู่กับห้องว่างและการยืนยันจากรีสอร์ท",
    ],
    glance: ["รีสอร์ทยินดีรับคำถามเรื่องหมู่คณะและการสัมมนา", "สิ่งที่รองรับได้ขึ้นอยู่กับวันที่และจำนวนคน ทีมงานจะแจ้งให้ทราบ", "ข้อความสอบถามเป็นการติดต่อรีสอร์ท ยังไม่ใช่การยืนยันการจอง"],
    enquire: "เล่ารายละเอียดงานของคุณให้ทีมงานฟัง",
    tell: {
      kicker: "ข้อมูลที่ช่วยให้ทีมงานตอบได้ตรง",
      title: "สอบถาม",
      intro: "รายละเอียดไม่กี่ข้อ ช่วยให้คำตอบแรกเป็นประโยชน์",
      items: ["ลักษณะของงาน สรุปสั้นๆ", "วันที่ที่คิดไว้ และเลื่อนได้มากน้อยแค่ไหน", "จำนวนคนโดยประมาณ และมีกี่คนที่จะพักค้างคืน", "เรื่องอื่นที่ทีมงานควรทราบ เช่น การรับประทานอาหารร่วมกัน หรือช่วงเวลาสำหรับประชุม"],
    },
    setting: {
      kicker: "บรรยากาศ",
      title: "บรรยากาศ",
      intro: "บางมุมของรีสอร์ท อย่างที่เห็นในภาพถ่าย",
      label: "ภาพบรรยากาศของรีสอร์ท",
      open: "เปิดดูภาพ {caption}",
    },
  },
} satisfies L<GatheringsPageCopy>;
