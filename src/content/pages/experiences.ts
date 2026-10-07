import type { AssetId, L } from "@/content/schema";

/**
 * The Experiences page, "Around the resort" (brief section 12): the wording around the four editorial
 * entries in src/content/experiences.ts.
 *
 * Nothing here is a bookable activity and nothing names one. The legacy activity list (cycling,
 * kayaking, archery, pedal boats, petanque, campfire, barbecue, pony rides) is unconfirmed and is not
 * mentioned, pictured or hinted at. Each entry's name and description are printed from the content
 * file; this file adds the chapter words, the "before you plan" note and the frames beside the entries.
 *
 * Kept (BUILD-CONTRACT sections 2 and 8): the shared pool is always told apart from the Executive
 * rooftop spa tub; no pool hours, cart or lifeguard language; stargazing is "on clear evenings" only;
 * no spa or wellness treatment is implied by a room's name; a frame is captioned as what it shows.
 * Glossary sentences used word for word: phrases.stargazing (the band), phrases.rooftopsAllRooms,
 * phrases.sharedPoolNote, phrases.activitiesAsk. Third person. No middle dots and no dashes.
 */

/** Legacy 01_01: sunset over the buildings and clipped hedges. Catalogued for "experiences" and "band". */
export const EXPERIENCES_HERO: AssetId = "clay-buildings-hedge-columns-sunset-wide";
/** Legacy 04_27: an Executive Pool Spa rooftop terrace at dusk, lamps lit. */
export const ROOFTOP_BAND: AssetId = "rooftop-terrace-dusk-wall-lamps-spa-tub";

/** Around the gardens. Never 01_19, 01_20 or 01_23 beside 01_21 (the gardens entry's own frame). */
export const GARDEN_MOSAIC: AssetId[] = [
  "pond-islet-yellow-leaved-tree", // 07_27
  "garden-bench-lamps-twilight-sky", // 07_23
  "garden-path-flower-borders-twilight", // 07_21
  "gourds-hanging-from-garden-trellis", // 07_12
];

/** The shared pool, beside the entry's own frame (05_45). */
export const POOL_MOSAIC: AssetId[] = [
  "shared-pool-open-pavilion-blue-sky", // 05_41
  "shared-pool-water-spouts-loungers", // 05_43
];

export interface ExperiencesPageCopy {
  heroKicker: string;
  statement: string;
  accent: string;
  body: string[];
  glance: { grounds: string; pool: string; rooftops: string; ask: string };
  askTeam: string;
  gardens: { kicker: string; title: string; intro: string; mosaicLabel: string; diningLink: string };
  band: { kicker: string; line: string };
  rooftop: { kicker: string; title: string; intro: string; skyHeading: string; roomLink: string };
  pool: { kicker: string; title: string; intro: string; mosaicLabel: string };
  plan: { label: string; text: string };
  open: string;
}

export const copy = {
  en: {
    heroKicker: "Around the resort",
    statement: "Gardens to walk, a pond to sit by, and a rooftop for the evening sky.",
    accent: "sky",
    body: [
      "Most of what there is to do at Phukumhom is unhurried. The gardens run between the clay-coloured buildings, there is a pond on the grounds and a shared outdoor pool set apart from the rooms, and every room type has a private rooftop.",
      "Before you plan around an activity, ask the team what is running for your dates.",
    ],
    glance: {
      grounds: "Landscaped gardens, mature trees and a pond are part of the grounds.",
      pool: "The resort has a shared outdoor pool, set apart from the rooms.",
      rooftops: "All three room types have a private rooftop; the rooftop spa tub belongs to Executive Pool Spa.",
      ask: "Ask the team what is running for your dates.",
    },
    askTeam: "Ask the team",
    gardens: {
      kicker: "Around the gardens",
      title: "Gardens",
      intro: "Hedges, lawns, old trees, a pond, and a small kitchen garden the resort tells of.",
      mosaicLabel: "Photographs of the gardens and the pond",
      diningLink: "The kitchen garden and the restaurant",
    },
    band: {
      kicker: "Rooftop evenings",
      line: "On clear evenings, the rooftop is a good place to watch the stars come out.",
    },
    rooftop: {
      kicker: "Rooftop mornings and evenings",
      title: "Rooftop",
      intro: "The room’s own piece of open sky, and what the sky is doing tonight.",
      skyHeading: "The sky tonight",
      roomLink: "The room with a spa tub on its rooftop",
    },
    pool: {
      kicker: "Shared facilities",
      title: "Pool",
      intro: "One pool for everyone, away from the rooms.",
      mosaicLabel: "Photographs of the shared pool",
    },
    plan: {
      label: "Before you plan",
      text: "Evenings on the rooftop and time in the gardens depend on the weather. Before you plan around an activity, ask the team what is running for your dates.",
    },
    open: "Open photograph: {caption}",
  },
  th: {
    heroKicker: "รอบรีสอร์ท",
    statement: "มีสวนให้เดินเล่น มีสระน้ำให้นั่งพัก และมีดาดฟ้าไว้ดูฟ้ายามเย็น",
    accent: "",
    body: [
      "การใช้เวลาที่ภูคำหอมส่วนใหญ่เป็นแบบไม่ต้องรีบ สวนแทรกอยู่ระหว่างอาคารสีดินเผา ในบริเวณรีสอร์ทมีสระน้ำ มีสระว่ายน้ำกลางแจ้งส่วนกลางซึ่งอยู่แยกจากห้องพัก และห้องพักทุกแบบมีดาดฟ้าส่วนตัว",
      "ก่อนวางแผนทำกิจกรรมใด สอบถามทีมงานก่อนว่าช่วงที่เข้าพักมีอะไรเปิดให้บริการบ้าง",
    ],
    glance: {
      grounds: "ในบริเวณรีสอร์ทมีสวนจัดแต่ง ต้นไม้ใหญ่ และสระน้ำ",
      pool: "รีสอร์ทมีสระว่ายน้ำกลางแจ้งส่วนกลาง อยู่แยกจากห้องพัก",
      rooftops: "ห้องพักทั้งสามแบบมีดาดฟ้าส่วนตัว ส่วนอ่างแช่ตัวบนดาดฟ้ามีเฉพาะห้อง Executive Pool Spa",
      ask: "สอบถามทีมงานได้ว่าช่วงที่เข้าพักมีอะไรเปิดให้บริการบ้าง",
    },
    askTeam: "สอบถามทีมงาน",
    gardens: {
      kicker: "รอบสวน",
      title: "สวน",
      intro: "แนวพุ่มไม้ สนามหญ้า ต้นไม้ใหญ่ สระน้ำ และสวนครัวแปลงเล็กที่รีสอร์ทเล่าถึง",
      mosaicLabel: "ภาพถ่ายสวนและสระน้ำ",
      diningLink: "สวนครัวและร้านอาหาร",
    },
    band: {
      kicker: "ยามเย็นบนดาดฟ้า",
      line: "ในคืนที่ฟ้าเปิด ดาดฟ้าเป็นมุมที่เหมาะกับการนั่งดูดาว",
    },
    rooftop: {
      kicker: "เช้าและเย็นบนดาดฟ้า",
      title: "ดาดฟ้า",
      intro: "พื้นที่กลางแจ้งของห้องเอง และท้องฟ้าของคืนนี้",
      skyHeading: "ท้องฟ้าคืนนี้",
      roomLink: "ห้องที่มีอ่างแช่ตัวบนดาดฟ้า",
    },
    pool: {
      kicker: "ส่วนกลาง",
      title: "สระว่ายน้ำ",
      intro: "สระว่ายน้ำส่วนกลางสำหรับผู้เข้าพักทุกห้อง อยู่แยกจากห้องพัก",
      mosaicLabel: "ภาพถ่ายสระว่ายน้ำส่วนกลาง",
    },
    plan: {
      label: "ก่อนวางแผน",
      text: "ยามเย็นบนดาดฟ้าและการเดินเล่นในสวนขึ้นอยู่กับสภาพอากาศ ก่อนวางแผนทำกิจกรรมใด สอบถามทีมงานก่อนว่าช่วงที่เข้าพักมีอะไรเปิดให้บริการบ้าง",
    },
    open: "เปิดดูภาพ {caption}",
  },
} satisfies L<ExperiencesPageCopy>;
