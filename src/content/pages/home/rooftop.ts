import type { L } from "@/content/schema";

/**
 * Homepage copy: chapter 03 "The rooftop", the band whose colours follow the time of day.
 *
 * Each language was written on its own, by docs/VOICE.md. Where the glossary already has the words they
 * are used as they stand:
 *   kicker        glossary home.sections.rooftop.label
 *   rooftops      glossary phrases.rooftopsAllRooms (the room name is the `{room}` slot)
 *   sharedPool    glossary phrases.sharedPoolNote
 *   compare       glossary actions.compareRooms
 *   stops.day     glossary labels.day
 * The title pairs with the kicker the way the glossary heading does ("ยามเย็นบนดาดฟ้าส่วนตัว",
 * "Evening, from your own rooftop"): kicker and title read as one line.
 *
 * No fact is typed here as a separate truth:
 *   `{room}`   the name of the room type, from src/content/rooms.ts (Thai adds the classifier ห้อง)
 *   `{time}`   the live clock, from the motion system's <Clock>
 * and each sentence is printed only while the fact behind it is publishable (HomeRooftop.tsx checks
 * `pub()` on the three rooftops, the Executive rooftop spa tub and the shared pool).
 *
 * The sunset, the moon and the clear-evening sentence are not here: they are the motion system's own
 * words (src/content/pages/sky.ts), so they read the same wherever the sky is printed.
 *
 * THE THREE NAMES. The art direction sketches the stops as "Afternoon, Low sun, Dusk". The first is
 * written "Day" / กลางวัน here: the catalogue records frame 04_24 as taken by day and cannot tell morning
 * from afternoon (the same caution BUILD-CONTRACT section 8 gives for the hero frame), and the band opens
 * on that frame for the whole of the daytime, so at nine in the morning "Afternoon" would be wrong twice.
 * "Low sun" names the light, not the hour; "Dusk" is the catalogue's own word for 04_27.
 *
 * Rules kept: third person; "room types", never a count of rooms; the tub is a "spa tub" / อ่างแช่ตัว,
 * never a pool; nothing about how a rooftop is reached, how big it is or what can be seen from it; no
 * middle dot and no dash anywhere.
 */

export interface RooftopCopy {
  /** Small label over the title, and the name the chapter index shows. */
  kicker: string;
  /** One word, set large. */
  title: string;
  /** First paragraph. `{room}` is the Executive room type. */
  rooftops: string;
  /** Second paragraph, first sentence: what the tub is and is not. */
  tub: string;
  /** Second paragraph, second sentence: where the pool is. */
  sharedPool: string;
  /** Label of the link to the room page. `{room}` is the Executive room type. */
  viewRoom: string;
  compare: string;
  /** Accessible name of the group of three photographs. */
  framesLabel: string;
  /** The three named times: the stops of the control, the labels of the photographs. */
  stops: { day: string; lowSun: string; dusk: string };
  /** Accessible name of the range control. */
  sliderLabel: string;
  /** `{time}` is the live clock. Printed only once the time is known. */
  now: string;
  /** The invitation to drag, set beside the time. */
  invite: string;
  /** The small prompt on the photograph itself. */
  hint: string;
  /** The mark on the track at the present time. */
  nowMark: string;
  /** Accessible name of that mark: it is a button that takes the control back to the present. */
  backToNow: string;
  /** Under the photographs. `{room}` is the Executive room type. */
  caption: string;
  /** Accessible name of the two sky tiles. */
  skyLabel: string;
  /**
   * Words that a line may not be broken inside. Thai is written without spaces, and a browser's
   * dictionary will break a compound in two (กลาง | แจ้ง) when a line happens to end there. The
   * component sets each of these in a span that does not wrap; nothing is typed into the sentences.
   */
  keep: readonly string[];
}

export const copy = {
  en: {
    kicker: "The rooftop",
    title: "Evening",
    rooftops: "All three room types have a private rooftop; the rooftop spa tub belongs to {room}.",
    tub: "It is a circular tub for soaking in the open air, not a swimming pool.",
    sharedPool: "The resort has a shared outdoor pool, set apart from the rooms.",
    viewRoom: "View {room}",
    compare: "Compare rooms",
    framesLabel: "The rooftop terrace at three times of day",
    stops: { day: "Day", lowSun: "Low sun", dusk: "Dusk" },
    sliderLabel: "Time of day on the rooftop",
    now: "It is {time} at the resort now.",
    invite: "Drag the day along, or drag across the photograph.",
    hint: "Drag the day",
    nowMark: "Now",
    backToNow: "Back to the time at the resort now",
    caption: "{room}. Three photographs of the same rooftop terrace, taken at different hours.",
    skyLabel: "The sky over Pak Chong today",
    keep: [],
  },
  th: {
    kicker: "ดาดฟ้าส่วนตัว",
    title: "ยามเย็น",
    rooftops: "ห้องพักทั้งสามแบบมีดาดฟ้าส่วนตัว ส่วนอ่างแช่ตัวบนดาดฟ้ามีเฉพาะ{room}",
    tub: "เป็นอ่างทรงกลมสำหรับนอนแช่กลางแจ้ง ไม่ใช่สระว่ายน้ำ",
    sharedPool: "รีสอร์ทมีสระว่ายน้ำกลางแจ้งส่วนกลาง อยู่แยกจากห้องพัก",
    viewRoom: "ดู{room}",
    compare: "เปรียบเทียบห้องพัก",
    framesLabel: "ดาดฟ้าในสามช่วงเวลาของวัน",
    stops: { day: "กลางวัน", lowSun: "ตะวันคล้อย", dusk: "พลบค่ำ" },
    sliderLabel: "ช่วงเวลาบนดาดฟ้า",
    now: "ขณะนี้ที่รีสอร์ทเป็นเวลา {time}",
    invite: "ลากแถบเวลา หรือลากบนภาพ เพื่อดูดาดฟ้าตั้งแต่กลางวันจนพลบค่ำ",
    hint: "ลากเพื่อเปลี่ยนเวลา",
    nowMark: "ตอนนี้",
    backToNow: "กลับไปที่เวลาตอนนี้ของรีสอร์ท",
    caption: "{room} ภาพถ่ายสามภาพของดาดฟ้าเดียวกัน ถ่ายในช่วงเวลาต่างกัน",
    skyLabel: "ท้องฟ้าที่ปากช่องวันนี้",
    keep: ["ดาดฟ้าส่วนตัว", "อ่างแช่ตัว", "สระว่ายน้ำ", "กลางแจ้ง", "ส่วนกลาง", "ห้องพัก", "ดาดฟ้า", "ทรงกลม", "นอนแช่", "รีสอร์ท", "แถบเวลา", "กลางวัน", "พลบค่ำ", "ช่วงเวลา", "ฟ้าเปิด", "ดูดาว", "ปากช่อง", "โดยประมาณ"],
  },
} satisfies L<RooftopCopy>;
