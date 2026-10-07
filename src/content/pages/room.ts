import type { L } from "@/content/schema";

/**
 * The room page template (brief section 10): the wording around one room type's facts.
 *
 * No fact is typed here. The name, gloss, distinction, summary, outdoor and bathing facts, amenities,
 * notes and photographs all come from src/content/rooms.ts and the photograph catalogue. Times come from
 * src/content/site.ts through pub(). Shared words (Check resort availability, Ask about this room, View
 * room, View all photos, the fact labels) are read from src/i18n/ui.ts by the page.
 *
 * Glossary sentences used word for word: phrases.roomChosenOnBookingPage, phrases.bookingPartnerNotice.
 *
 * Rules kept (BUILD-CONTRACT sections 2, 3 and 8): "Check resort availability", never wording that
 * suggests one room's availability is known; no size, bed, occupancy or price; nothing about a view from
 * a particular room; the photographs are described as photographs. Third person. No dots, no dashes.
 */

export interface RoomPageCopy {
  /** Small heading over the facts. */
  factsHeading: string;
  panel: {
    kicker: string;
    /** Glossary phrases.roomChosenOnBookingPage. */
    chosen: string;
    timesHeading: string;
    checkIn: string;
    checkOut: string;
    /** `{time}` is the published time. */
    from: string;
    until: string;
    listed: string;
    /** Glossary phrases.bookingPartnerNotice. */
    partner: string;
  };
  callout: { label: string };
  photos: {
    kicker: string;
    title: string;
    /** `{count}` is the number of photographs in the set. */
    intro: string;
    /** Accessible name of the group; `{room}` is the room name. */
    group: string;
    /** Accessible name of one photograph; `{caption}` is its catalogued caption. */
    open: string;
    note: string;
  };
  notes: { kicker: string; title: string; intro: string };
  others: { kicker: string; heading: string; lead: string };
  closingSecondary: string;
}

export const copy = {
  en: {
    factsHeading: "What this room type has",
    panel: {
      kicker: "Plan a stay",
      chosen: "You choose the room on the booking page.",
      timesHeading: "Arrival and departure",
      checkIn: "Check-in",
      checkOut: "Check-out",
      from: "from {time}",
      until: "until {time}",
      listed: "As currently listed. Your booking confirmation is the reference.",
      partner: "Booking is completed on the page of the resort’s booking partner. Your browser’s back button brings you back here.",
    },
    callout: { label: "A tub, not a pool" },
    photos: {
      kicker: "Photographs",
      title: "Photos",
      intro: "{count} photographs of this room type. Choose one to see it large, then move through the set.",
      group: "Photographs of {room}",
      open: "Open photograph: {caption}",
      note: "The photographs are the resort’s own.",
    },
    notes: {
      kicker: "Good to know",
      title: "Details",
      intro: "Plain notes for this room type, and where to ask about the rest.",
    },
    others: {
      kicker: "The other two room types",
      heading: "Or choose differently",
      lead: "Every room type has the balcony and the private rooftop. These two differ in how they are set up for bathing.",
    },
    closingSecondary: "All rooms",
  },
  th: {
    factsHeading: "สิ่งที่ห้องแบบนี้มี",
    panel: {
      kicker: "วางแผนการเข้าพัก",
      chosen: "เลือกประเภทห้องพักได้ในหน้าจอง",
      timesHeading: "เวลาเช็กอินและเช็กเอาต์",
      checkIn: "เช็กอิน",
      checkOut: "เช็กเอาต์",
      from: "ตั้งแต่ {time} น.",
      until: "ภายใน {time} น.",
      listed: "ตามข้อมูลปัจจุบัน โดยให้ยึดเวลาในใบยืนยันการจองเป็นหลัก",
      partner: "การจองจะทำต่อในหน้าจองของผู้ให้บริการระบบจองของรีสอร์ท กดย้อนกลับเมื่อต้องการกลับมาหน้านี้",
    },
    callout: { label: "อ่างแช่ตัว ไม่ใช่สระว่ายน้ำ" },
    photos: {
      kicker: "ภาพถ่าย",
      title: "ภาพถ่าย",
      intro: "ภาพถ่ายของห้องแบบนี้ {count} ภาพ เลือกภาพเพื่อดูขนาดใหญ่ แล้วเลื่อนดูภาพอื่นต่อได้",
      group: "ภาพถ่ายของห้อง {room}",
      open: "เปิดดูภาพ {caption}",
      note: "ภาพถ่ายทั้งหมดเป็นของรีสอร์ท",
    },
    notes: {
      kicker: "ข้อควรทราบ",
      title: "ข้อควรทราบ",
      intro: "ข้อควรทราบของห้องแบบนี้ และช่องทางสอบถามเรื่องอื่นๆ",
    },
    others: {
      kicker: "ห้องพักอีกสองแบบ",
      heading: "หรือเลือกห้องแบบอื่น",
      lead: "ห้องพักทุกแบบมีระเบียงและดาดฟ้าส่วนตัว อีกสองแบบนี้ต่างกันที่เรื่องอาบน้ำและแช่ตัว",
    },
    closingSecondary: "ห้องพักทั้งหมด",
  },
} satisfies L<RoomPageCopy>;
