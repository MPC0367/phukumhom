import type { L } from "@/content/schema";
import type { Moonlight, MoonPhaseName } from "@/lib/sky";

/**
 * Every word the clock, the sunset and the moon print (components/motion: Clock, SunsetTime,
 * MoonTonight, SkyTonight). Each language is written on its own terms; `{time}` marks where the figure goes.
 *
 * Truth notes (BUILD-CONTRACT section 2):
 * - The sunset is worked out for Pak Chong town, a district-level point, never for the resort's own
 *   position. It is always printed with "about" / "ประมาณ".
 * - On the rooftop, stargazing is "on clear evenings": the caveat is the glossary's own sentence, word for word.
 * - The resort is a dark sky protection area with stargazing all year round (the resort's own message of
 *   22 Nov 2026, source S-40). The night planner never promises a clear sky: the clouds decide.
 * - The planner's moonlight is read from the moon's phase alone; it does not claim moonrise or moonset.
 * - No middle dots and no dashes anywhere in these strings.
 */

interface SkyCopy {
  /** How a clock time is written in this language. Thai times take "น." (docs/VOICE.md 2.4). */
  time: string;
  /** The live clock with its visible label, as one phrase. */
  localTime: string;
  /** Name of the clock for assistive technology, and a heading for it where one is wanted. */
  localTimeLabel: string;
  /** The whole sunset phrase for a meta strip. */
  sunsetToday: string;
  /** Label above the sunset figure where the two are set apart (the rooftop sky panel). */
  sunsetLabel: string;
  /** The figure on its own, still carrying "about". */
  sunsetAbout: string;
  /** Label for tonight's moon. */
  moonTonight: string;
  phases: Record<MoonPhaseName, string>;
  /** The glossary's stargazing sentence: the only way stars are ever promised. */
  clearEvening: string;
  /** One line saying what the figures are and are not. */
  skyNote: string;
  /** The stargazing planner on the Experiences page (StarNights). */
  nights: {
    /** Name of the row of nights. */
    listLabel: string;
    tonight: string;
    sunset: string;
    darkFrom: string;
    moon: string;
    /** `{pct}` is the lit part of the moon, a whole number. */
    lit: string;
    moonlight: Record<Moonlight, string>;
    legend: string;
    /** `{date}` is the short date of the evening. */
    book: string;
    bookTonight: string;
    note: string;
  };
}

export const copy = {
  en: {
    time: "{time}",
    localTime: "{time} local time",
    localTimeLabel: "Local time at the resort",
    sunsetToday: "Sunset today about {time}",
    sunsetLabel: "Sunset today in Pak Chong",
    sunsetAbout: "about {time}",
    moonTonight: "Moon tonight",
    phases: {
      new: "New moon",
      "waxing-crescent": "Waxing crescent",
      "first-quarter": "First quarter",
      "waxing-gibbous": "Waxing gibbous",
      full: "Full moon",
      "waning-gibbous": "Waning gibbous",
      "last-quarter": "Last quarter",
      "waning-crescent": "Waning crescent",
    },
    clearEvening: "On clear evenings, the rooftop is a good place to watch the stars come out.",
    skyNote: "Times are worked out for Pak Chong town and are approximate.",
    nights: {
      listLabel: "The next 30 nights",
      tonight: "Tonight",
      sunset: "Sunset",
      darkFrom: "Fully dark",
      moon: "Moon",
      lit: "{pct}% lit",
      moonlight: { little: "Little moonlight", some: "Some moonlight", bright: "Bright moonlight" },
      legend: "A star marks the nights with little moonlight.",
      book: "Check availability for {date}",
      bookTonight: "Check availability for tonight",
      note: "Worked out for Pak Chong town from the sun and the moon’s phase, so the times are approximate. How much you see depends on the clouds on the night.",
    },
  },
  th: {
    time: "{time} น.",
    localTime: "เวลาท้องถิ่น {time}",
    localTimeLabel: "เวลาท้องถิ่นที่รีสอร์ท",
    sunsetToday: "พระอาทิตย์ตกวันนี้ประมาณ {time}",
    sunsetLabel: "พระอาทิตย์ตกวันนี้ที่ปากช่อง",
    sunsetAbout: "ประมาณ {time}",
    moonTonight: "ดวงจันทร์คืนนี้",
    phases: {
      new: "จันทร์ดับ",
      "waxing-crescent": "จันทร์เสี้ยวข้างขึ้น",
      "first-quarter": "จันทร์ครึ่งดวงข้างขึ้น",
      "waxing-gibbous": "จันทร์ค่อนดวงข้างขึ้น",
      full: "จันทร์เต็มดวง",
      "waning-gibbous": "จันทร์ค่อนดวงข้างแรม",
      "last-quarter": "จันทร์ครึ่งดวงข้างแรม",
      "waning-crescent": "จันทร์เสี้ยวข้างแรม",
    },
    clearEvening: "ในคืนที่ฟ้าเปิด ดาดฟ้าเป็นมุมที่เหมาะกับการนั่งดูดาว",
    skyNote: "เวลาคำนวณจากตัวอำเภอปากช่อง และเป็นเวลาโดยประมาณ",
    nights: {
      listLabel: "30 คืนข้างหน้า",
      tonight: "คืนนี้",
      sunset: "พระอาทิตย์ตก",
      darkFrom: "ฟ้ามืดสนิท",
      moon: "ดวงจันทร์",
      lit: "สว่าง {pct}%",
      moonlight: { little: "แสงจันทร์น้อย", some: "มีแสงจันทร์บ้าง", bright: "แสงจันทร์สว่าง" },
      legend: "คืนที่มีรูปดาวกำกับคือคืนที่แสงจันทร์น้อย",
      book: "ตรวจสอบห้องว่างคืนวันที่ {date}",
      bookTonight: "ตรวจสอบห้องว่างคืนนี้",
      note: "คำนวณจากดวงอาทิตย์และข้างขึ้นข้างแรมสำหรับตัวอำเภอปากช่อง เวลาจึงเป็นเวลาโดยประมาณ จะเห็นดาวชัดแค่ไหนขึ้นอยู่กับเมฆในคืนนั้น",
    },
  },
} satisfies L<SkyCopy>;

export type SkyCopyShape = SkyCopy;
