import type { L } from "@/content/schema";

/**
 * Copy for chapter 02 "Stay" (the room stage) and for the room comparison, which the stay page reuses.
 *
 * Each language was written on its own, by docs/VOICE.md. Glossary strings are used as they stand:
 *   kicker                  glossary home.sections.stay.label
 *   compare.intro           glossary home.sections.stay.heading
 *   chosenOnBookingPage     glossary phrases.roomChosenOnBookingPage
 *
 * Words that already live in the shared table are NOT repeated here; the components read them from
 * src/i18n/ui.ts: Compare rooms, All rooms, View room, Ask about this room, Check availability, and the
 * fact labels Size, Guests, Outdoors, Bathing, In the room.
 *
 * No fact is typed here. Room names, glosses, the one-sentence distinctions, the listed size and adult
 * limit, the outdoor and bathing facts, the amenities and the notes all come from src/content/rooms.ts.
 *
 * Revision of 8 October 2026 (audit finding D): the stage and the comparison now print the size and the
 * adult limit the booking page lists, with one line saying where they come from; the stage shows the
 * bedroom beside the rooftop; and the one question the page cannot answer (beds, a child's place,
 * connecting rooms) is a single link, not a sentence repeated per room.
 */

export interface StayCopy {
  kicker: string;
  title: string;
  intro: string;
  stage: {
    /** Accessible name of the list of room types. */
    listLabel: string;
    /** Accessible name of the photograph stage. */
    photoLabel: string;
    /** The small label on a room's bedroom photograph. */
    bedroom: string;
  };
  /** For a screen reader, before the fact that sets a room type apart; the clay mark is decoration. */
  distinctLabel: string;
  chosenOnBookingPage: string;
  compare: {
    intro: string;
    /** The table's caption (visually hidden: the drawer or the page gives the visible title). */
    caption: string;
    /** Header of the column that holds the row labels (visually hidden). */
    rowHeader: string;
    /** Shown on a row whose value is the same for every room type. */
    allThree: string;
    /** Explains the clay mark. */
    legend: string;
    /** Where the size and guest figures come from. `{date}` is the day they were read. */
    listedNote: string;
    sharedHeading: string;
    askLink: string;
  };
}

export const copy = {
  en: {
    kicker: "Choose your stay",
    title: "Stay",
    intro: "Three kinds of room. All three have a balcony and a private rooftop, and each has one clear difference.",
    stage: {
      listLabel: "The three room types",
      photoLabel: "Photograph of the selected room type",
      bedroom: "The bedroom",
    },
    distinctLabel: "Sets this room type apart",
    chosenOnBookingPage: "You choose the room on the booking page.",
    compare: {
      intro: "Three kinds of room, each with one clear difference",
      caption: "The three room types compared",
      rowHeader: "Feature",
      allThree: "All three room types",
      legend: "The mark shows the feature that sets a room type apart.",
      listedNote: "Size and guests are as listed on the booking page, checked {date}.",
      sharedHeading: "For all three room types",
      askLink: "Ask about beds, a child’s place and connecting rooms",
    },
  },
  th: {
    kicker: "เลือกห้องพัก",
    title: "ห้องพัก",
    intro: "ห้องพักสามแบบ ทุกแบบมีระเบียงและดาดฟ้าส่วนตัว ต่างกันที่เรื่องอาบน้ำและแช่ตัว",
    stage: {
      listLabel: "ห้องพักสามแบบ",
      photoLabel: "ภาพถ่ายของห้องพักแบบที่เลือก",
      bedroom: "ห้องนอน",
    },
    distinctLabel: "จุดที่ต่างจากห้องแบบอื่น",
    chosenOnBookingPage: "เลือกประเภทห้องพักได้ในหน้าจอง",
    compare: {
      intro: "ห้องพักสามแบบ ต่างกันตรงไหน",
      caption: "เปรียบเทียบห้องพักสามแบบ",
      rowHeader: "รายการ",
      allThree: "ทั้งสามแบบ",
      legend: "จุดสีอิฐบอกสิ่งที่ทำให้ห้องแบบนั้นต่างจากแบบอื่น",
      listedNote: "ขนาดห้องและจำนวนผู้เข้าพักเป็นไปตามที่ระบุในหน้าจอง ตรวจสอบเมื่อ {date}",
      sharedHeading: "สำหรับห้องพักทั้งสามแบบ",
      askLink: "สอบถามเรื่องเตียง ที่นอนสำหรับเด็ก และห้องที่เชื่อมถึงกัน",
    },
  },
} satisfies L<StayCopy>;
