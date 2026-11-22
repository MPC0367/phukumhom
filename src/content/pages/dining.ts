import type { AssetId, L } from "@/content/schema";

/**
 * The Dining page (brief section 11): the wording around the dining facts.
 *
 * The facts are not here. The kitchen-garden account is printed from `dining.kitchenGarden.points` and
 * the breakfast sentence from `dining.breakfast` (src/content/dining.ts), both through their
 * publication status. Photograph captions are the catalogue's.
 *
 * What is known and may be said (BUILD-CONTRACT sections 2 and 8): the resort has a restaurant of its
 * own; the photographs show it in an open-sided pavilion; the resort describes a small kitchen garden.
 * What is not known is not written: no restaurant name, hours, menu, wine, dietary handling, service to
 * visitors who are not staying, room service. The page says who to ask instead.
 * Never "organic", "pesticide-free" or "farm to table". A plate in a photograph is a plate, not a dish
 * on a menu and not "breakfast": the two breakfast-table frames (05_18, 05_20) and the stemmed-glass
 * frame (05_17) are left out. Third person. No middle dots and no dashes.
 */

/** Legacy 01_25: the open-sided dining pavilion at dusk. Catalogued for "dining" and "band". */
export const DINING_HERO: AssetId = "open-dining-pavilion-lawn-dusk";

/** The two kitchen-garden features. */
export const GARDEN_FRAMES: { grows: AssetId; season: AssetId } = {
  grows: "serrated-salad-greens-garden-bed", // 07_07
  season: "gac-fruit-hanging-on-vine", // 07_11
};

/** The pavilion, from outside to inside. One frame only from {05_14, 05_15}. */
export const PAVILION_FRAMES: Array<{ asset: AssetId; ratio: "3/2" | "4/3" | "3/4" | "4/5" }> = [
  { asset: "dining-pavilion-tables-log-posts-dusk", ratio: "3/2" }, // 01_26
  { asset: "dining-pavilion-interior-woven-lamp-dusk", ratio: "3/4" }, // 01_27
  { asset: "dining-pavilions-lit-night-lawn", ratio: "3/2" }, // 05_14
  { asset: "restaurant-pavilion-timber-roof-night", ratio: "3/4" }, // 05_16
  { asset: "dining-pavilion-stepping-stones-dusk", ratio: "4/3" }, // 05_06
];

/** Plates and garden beds in turn. */
export const DINING_REEL: Array<{ asset: AssetId; ratio: "3/2" | "4/3" | "1/1" | "4/5" }> = [
  { asset: "mixed-leaf-salad-fruit-green-dressing", ratio: "4/3" }, // 05_30
  { asset: "red-lettuce-leaves-water-droplets", ratio: "1/1" }, // 07_09
  { asset: "dried-shrimp-dip-carved-vegetables", ratio: "4/3" }, // 05_22
  { asset: "frilly-green-lettuce-garden-bed", ratio: "4/5" }, // 07_08
  { asset: "prawn-vegetable-soup-white-bowl", ratio: "4/3" }, // 05_24
  { asset: "gourds-hanging-from-garden-trellis", ratio: "3/2" }, // 07_12
  { asset: "sliced-meat-salad-shallots-herbs-lettuce", ratio: "1/1" }, // 05_23
  { asset: "dark-red-iced-drinks-wooden-table", ratio: "4/5" }, // 05_31
  { asset: "fried-whole-fish-pineapple-banana-leaf", ratio: "4/3" }, // 05_39
  { asset: "clear-mushroom-soup-coriander-cup", ratio: "1/1" }, // 05_27
  { asset: "braised-ribs-sesame-orchid-garnish", ratio: "4/3" }, // 05_36
  { asset: "fried-pastry-ice-cream-orchid-dessert", ratio: "1/1" }, // 05_28
  { asset: "chilli-relish-raw-vegetable-plate", ratio: "4/3" }, // 05_37
];

export interface DiningPageCopy {
  heroKicker: string;
  statement: string;
  accent: string;
  body: string[];
  glance: { restaurant: string; garden: string; ask: string };
  askMeals: string;
  garden: {
    kicker: string;
    title: string;
    intro: string;
    growsTitle: string;
    seasonTitle: string;
    seasonLabel: string;
  };
  pavilion: {
    kicker: string;
    title: string;
    intro: string;
    body: string[];
    label: string;
    open: string;
  };
  meals: {
    kicker: string;
    title: string;
    intro: string;
    notes: string[];
  };
  reel: { kicker: string; line: string; accent: string; lead: string; label: string; hint: string };
}

export const copy = {
  en: {
    heroKicker: "Dining",
    statement: "An open pavilion on the lawn, and a kitchen garden that follows the season.",
    accent: "season",
    body: [
      "The resort’s restaurant is an open-sided pavilion in the garden, with tables under a timber roof.",
      "Menus and garden produce change with the season. Ask the team about today’s menu and seasonal dishes.",
    ],
    glance: {
      restaurant: "The resort has a restaurant of its own, in an open-sided pavilion.",
      garden: "The resort tells of a small kitchen garden that follows the season.",
      ask: "For opening hours, the menu or a dietary request, ask the team before you travel.",
    },
    askMeals: "Ask the team about meals",
    garden: {
      kicker: "The kitchen garden",
      title: "Garden",
      intro: "What grows there, and what is made from it.",
      growsTitle: "What grows there",
      seasonTitle: "Made, poured and taken home",
      seasonLabel: "By the season",
    },
    pavilion: {
      kicker: "The dining pavilion",
      title: "Pavilion",
      intro: "An open-sided pavilion on the lawn, from outside and from within.",
      body: [
        "At dusk the lamps under the roof are lit and the pavilion glows on the lawn.",
        "Tables stand between timber posts, open to the garden on every side.",
      ],
      label: "Photographs of the dining pavilion",
      open: "Open photograph: {caption}",
    },
    meals: {
      kicker: "Breakfast and meals",
      title: "Meals",
      intro: "Breakfast, opening hours and special requests.",
      notes: [
        "For opening hours and the current menu, ask the team before you travel.",
        "If you have a dietary request, tell the team in advance. A request is a message to the kitchen, not a guarantee of a particular preparation.",
        "If you would like to come for a meal without staying, ask the resort first.",
      ],
    },
    reel: {
      kicker: "Plates and garden beds",
      line: "From the garden bed to the plate, as the camera found them.",
      accent: "plate",
      lead: "Plates, drinks and garden beds, photographed at the resort. For today’s menu, ask the team.",
      label: "Photographs of plates and garden beds",
      hint: "Drag",
    },
  },
  th: {
    heroKicker: "ร้านอาหาร",
    statement: "ศาลาโล่งกลางสนามหญ้า กับสวนครัวที่เปลี่ยนไปตามฤดูกาล",
    accent: "",
    body: [
      "ร้านอาหารของรีสอร์ทเป็นศาลาเปิดโล่งกลางสวน โต๊ะอาหารตั้งอยู่ใต้หลังคาไม้",
      "เมนูและผลผลิตจากสวนครัวเปลี่ยนไปตามฤดูกาล สอบถามทีมงานเรื่องเมนูของวันนี้และอาหารตามฤดูกาลได้",
    ],
    glance: {
      restaurant: "รีสอร์ทมีร้านอาหารของตัวเอง อยู่ในศาลาแบบเปิดโล่ง",
      garden: "รีสอร์ทเล่าถึงสวนครัวแปลงเล็กที่เปลี่ยนไปตามฤดูกาล",
      ask: "เรื่องเวลาเปิดปิด เมนู หรืออาหารเฉพาะ สอบถามทีมงานก่อนเดินทางได้",
    },
    askMeals: "สอบถามทีมงานเรื่องอาหาร",
    garden: {
      kicker: "สวนครัว",
      title: "สวนครัว",
      intro: "ปลูกอะไร และนำไปทำอะไรบ้าง",
      growsTitle: "ในแปลงปลูก",
      seasonTitle: "ของทำเองและเครื่องดื่มต้อนรับ",
      seasonLabel: "ตามฤดูกาล",
    },
    pavilion: {
      kicker: "ศาลาอาหาร",
      title: "ศาลาอาหาร",
      intro: "ศาลาเปิดโล่งบนสนามหญ้า ทั้งจากด้านนอกและด้านใน",
      body: [
        "ยามพลบค่ำ โคมไฟใต้หลังคาเปิดขึ้น และศาลาสว่างอยู่กลางสนามหญ้า",
        "โต๊ะอาหารตั้งอยู่ระหว่างเสาไม้ เปิดโล่งเห็นสวนรอบด้าน",
      ],
      label: "ภาพถ่ายศาลาอาหาร",
      open: "เปิดดูภาพ {caption}",
    },
    meals: {
      kicker: "อาหารเช้าและมื้ออาหาร",
      title: "มื้ออาหาร",
      intro: "อาหารเช้า เวลาเปิดปิด และอาหารเฉพาะ",
      notes: [
        "เรื่องเวลาเปิดปิดและเมนูปัจจุบันของร้านอาหาร สอบถามทีมงานก่อนเดินทางได้",
        "หากต้องการอาหารเฉพาะ แจ้งทีมงานล่วงหน้าได้ การแจ้งเป็นการบอกให้ครัวทราบ ยังไม่ใช่การรับรองว่าจะจัดเตรียมได้ตามนั้นทุกอย่าง",
        "หากอยากแวะมารับประทานอาหารโดยไม่ได้เข้าพัก สอบถามรีสอร์ทก่อน",
      ],
    },
    reel: {
      kicker: "จานอาหารและแปลงผัก",
      line: "จากแปลงผักถึงจานอาหาร อย่างที่กล้องบันทึกไว้",
      accent: "",
      lead: "จานอาหาร เครื่องดื่ม และแปลงผักที่ถ่ายไว้ในรีสอร์ท ส่วนเมนูของวันนี้ สอบถามทีมงานได้",
      label: "ภาพจานอาหารและแปลงผัก",
      hint: "ลากเพื่อเลื่อนดู",
    },
  },
} satisfies L<DiningPageCopy>;
