import type { L } from "@/content/schema";

/**
 * The room page template (brief section 10; audit of 8 October 2026, finding D): the wording around one
 * room type's facts.
 *
 * No fact is typed here. The name, gloss, distinction, summary, the listed size and adult limit, the
 * outdoor and bathing facts, amenities, notes and photographs all come from src/content/rooms.ts and the
 * photograph catalogue. Times come from src/content/site.ts through pub(). Shared words (Check resort
 * availability, Ask about this room, View room, View all photos, the fact labels) are read from
 * src/i18n/ui.ts by the page.
 *
 * WHAT A GUEST SEES FIRST: the bedroom, how big the room is, how many adults it takes, what sets it
 * apart, and the way to check availability. The size and the adult limit are the booking page's own
 * figures and are labelled as that, once. What is still unknown (beds, a child's place, connecting
 * rooms) is one link to the resort, not a sentence repeated down the page.
 *
 * Rules kept (BUILD-CONTRACT sections 2, 3 and 8): "Check resort availability", never wording that
 * suggests one room's availability is known; no bed size, no combined adult-and-child capacity, no
 * price; nothing about a view from a particular room. Third person. No dots, no dashes.
 */

export interface RoomPageCopy {
  facts: {
    /** Small heading over the two figures. */
    heading: string;
    /** The unit printed beside the size. */
    sizeUnit: string;
    sizeLabel: string;
    guestsLabel: string;
    guestsNote: string;
    /** Under the figures: where they come from. `{date}` is the day they were read. */
    listed: string;
    /** Small heading over the feature list. */
    features: string;
    /** The label on the bedroom photograph. */
    bedroom: string;
  };
  panel: {
    kicker: string;
    /** Glossary phrases.roomChosenOnBookingPage. */
    chosen: string;
    /** Shown only where the booking page uses another name for the room type. `{name}` is that name. */
    listedAs: string;
    timesHeading: string;
    checkIn: string;
    checkOut: string;
    /** `{time}` is the published time. */
    from: string;
    until: string;
    listed: string;
  };
  callout: { label: string };
  photos: {
    kicker: string;
    title: string;
    /** `{count}` is the number of photographs in the set. */
    intro: string;
    /** Accessible name of one photograph; `{caption}` is its catalogued caption. */
    open: string;
  };
  notes: { kicker: string; title: string; intro: string };
  others: { kicker: string; heading: string; lead: string };
  closingSecondary: string;
}

export const copy = {
  en: {
    facts: {
      heading: "At a glance",
      sizeUnit: "sq m",
      sizeLabel: "Room size",
      guestsLabel: "Adults at most",
      guestsNote: "per room",
      listed: "Size and guests as listed on the booking page, checked {date}.",
      features: "What this room type has",
      bedroom: "The bedroom",
    },
    panel: {
      kicker: "Plan a stay",
      chosen: "You choose the room on the booking page.",
      listedAs: "On the booking page this room type is listed as “{name}”.",
      timesHeading: "Arrival and departure",
      checkIn: "Check-in",
      checkOut: "Check-out",
      from: "from {time}",
      until: "until {time}",
      listed: "Your booking confirmation has the times for your stay.",
    },
    callout: { label: "A tub, not a pool" },
    photos: {
      kicker: "Photographs",
      title: "Photos",
      intro: "{count} photographs of this room type. Choose one to see it large, then move through the set.",
      open: "Open photograph: {caption}",
    },
    notes: {
      kicker: "Good to know",
      title: "Details",
      intro: "The practical side of this room type.",
    },
    others: {
      kicker: "The other two room types",
      heading: "Compare the others",
      lead: "Every room type has a balcony and a private rooftop. These two differ in size or in how they are set up for bathing.",
    },
    closingSecondary: "All rooms",
  },
  th: {
    facts: {
      heading: "สรุปสั้นๆ",
      sizeUnit: "ตร.ม.",
      sizeLabel: "ขนาดห้อง",
      guestsLabel: "ผู้ใหญ่สูงสุด",
      guestsNote: "ต่อห้อง",
      listed: "ขนาดห้องและจำนวนผู้เข้าพักตามที่ระบุในหน้าจอง ตรวจสอบเมื่อ {date}",
      features: "สิ่งที่ห้องแบบนี้มี",
      bedroom: "ห้องนอน",
    },
    panel: {
      kicker: "วางแผนการเข้าพัก",
      chosen: "เลือกประเภทห้องพักได้ในหน้าจอง",
      listedAs: "ในหน้าจอง ห้องแบบนี้ใช้ชื่อว่า “{name}”",
      timesHeading: "เวลาเช็กอินและเช็กเอาต์",
      checkIn: "เช็กอิน",
      checkOut: "เช็กเอาต์",
      from: "ตั้งแต่ {time} น.",
      until: "ภายใน {time} น.",
      listed: "เวลาของการเข้าพักแต่ละครั้งระบุไว้ในใบยืนยันการจอง",
    },
    callout: { label: "อ่างแช่ตัว ไม่ใช่สระว่ายน้ำ" },
    photos: {
      kicker: "ภาพถ่าย",
      title: "ภาพถ่าย",
      intro: "ภาพถ่ายของห้องแบบนี้ {count} ภาพ เลือกภาพเพื่อดูขนาดใหญ่ แล้วเลื่อนดูภาพอื่นต่อได้",
      open: "เปิดดูภาพ {caption}",
    },
    notes: {
      kicker: "ข้อควรทราบ",
      title: "ข้อควรทราบ",
      intro: "เรื่องที่ควรรู้ในทางปฏิบัติของห้องแบบนี้",
    },
    others: {
      kicker: "ห้องพักอีกสองแบบ",
      heading: "เทียบกับห้องแบบอื่น",
      lead: "ห้องพักทุกแบบมีระเบียงและดาดฟ้าส่วนตัว อีกสองแบบนี้ต่างกันที่ขนาดห้องหรือเรื่องอาบน้ำและแช่ตัว",
    },
    closingSecondary: "ห้องพักทั้งหมด",
  },
} satisfies L<RoomPageCopy>;
