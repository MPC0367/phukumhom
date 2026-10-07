import type { AssetId, L } from "@/content/schema";

/**
 * The Stay page (brief section 9): the wording around the room facts.
 *
 * No fact is typed here. Room names, glosses, distinctions, outdoor and bathing facts, amenities and
 * notes come from src/content/rooms.ts; times come from src/content/site.ts through pub(); the
 * comparison's own words live in src/content/pages/home/stay.ts, which this page reuses.
 *
 * Glossary sentences used word for word: phrases.rooftopsAllRooms (the band), phrases.breakfast,
 * phrases.childrenOnBookingPage, phrases.occupancyOnBookingPage, phrases.bookingPartnerNotice,
 * phrases.bookingLanguageNote, phrases.accessConversation, phrases.roomChosenOnBookingPage.
 *
 * Rules kept (BUILD-CONTRACT sections 2, 3, 8 and 9): "three room types", never "three rooms"; no
 * room count, size, bed or occupancy figure; no price, saving or scarcity; the spa tub is a tub; third
 * person; no middle dots and no dashes.
 */

/** Legacy 04_20: a rooftop terrace with a parasol and a table, the hills beyond. Catalogued for hero use. */
export const STAY_HERO: AssetId = "rooftop-terrace-parasol-table-hill-view";
/** Legacy 01_12: the forecourt at blue hour, the buildings and their rooftop pergolas lit. */
export const STAY_BAND: AssetId = "topiary-forecourt-pergola-buildings-blue-hour";

export interface StayPageCopy {
  heroKicker: string;
  statement: string;
  /** The one italic word of the statement (English only). */
  accent: string;
  body: string[];
  glance: {
    types: string;
    /** Glossary phrases.rooftopsAllRooms. */
    rooftops: string;
    /** `{checkIn}` and `{checkOut}` are filled from site settings; the bullet is dropped if either is withheld. */
    times: string;
    chosen: string;
  };
  rooms: { kicker: string; title: string; intro: string };
  /** The line over the band. */
  band: string;
  compare: { kicker: string; title: string; intro: string };
  practical: {
    kicker: string;
    title: string;
    intro: string;
    checkIn: string;
    checkOut: string;
    listed: string;
    tilesLabel: string;
    notes: string[];
    ask: string;
  };
  closingSecondary: string;
}

export const copy = {
  en: {
    heroKicker: "Rooms",
    statement: "Three kinds of room, each with a balcony and a rooftop of its own.",
    accent: "rooftop",
    body: [
      "What separates them is how you would like to bathe. Deluxe Balcony has a private bathroom, Deluxe Bathtub has a bathtub, and Executive Pool Spa has a circular spa tub on its rooftop, which is a tub for soaking and not a swimming pool.",
      "Rates change with the dates, so none are printed here. Choose your dates and the booking page shows the rooms and the rates for them.",
    ],
    glance: {
      types: "There are three room types: Deluxe Balcony, Deluxe Bathtub and Executive Pool Spa.",
      rooftops: "All three room types have a private rooftop; the rooftop spa tub belongs to Executive Pool Spa.",
      times: "Check-in is from {checkIn} and check-out is until {checkOut}, as currently listed.",
      chosen: "You choose the room on the booking page.",
    },
    rooms: {
      kicker: "The three room types",
      title: "Rooms",
      intro: "Choose a room type to see it. Each one has a page of its own, with more photographs.",
    },
    band: "All three room types have a private rooftop; the rooftop spa tub belongs to Executive Pool Spa.",
    compare: {
      kicker: "Side by side",
      title: "Compare",
      intro: "What is the same in every room type is said once. The clay mark shows what differs.",
    },
    practical: {
      kicker: "Before you book",
      title: "Details",
      intro: "The few things worth knowing before choosing dates.",
      checkIn: "Check-in",
      checkOut: "Check-out",
      listed: "as currently listed",
      tilesLabel: "Arrival and departure times",
      notes: [
        "Whether breakfast is included depends on the rate you choose; each rate on the booking page says so.",
        "Children are added on the booking page.",
        "The booking page shows how many guests each room takes for your dates.",
        "Booking is completed on the page of the resort’s booking partner. Your browser’s back button brings you back here.",
        "If steps, distances or getting around matter for your stay, contact the resort to talk it through privately before you book.",
      ],
      ask: "Ask about beds, occupancy and connecting rooms",
    },
    closingSecondary: "Contact the resort",
  },
  th: {
    heroKicker: "ห้องพัก",
    statement: "ห้องพักสามแบบ ทุกแบบมีระเบียง และดาดฟ้าส่วนตัว",
    accent: "",
    body: [
      "สิ่งที่ต่างกันคือเรื่องอาบน้ำและแช่ตัว ห้อง Deluxe Balcony มีห้องน้ำในตัว ห้อง Deluxe Bathtub มีอ่างอาบน้ำ ส่วนห้อง Executive Pool Spa มีอ่างแช่ตัวทรงกลมบนดาดฟ้า ซึ่งเป็นอ่างแช่ตัว ไม่ใช่สระว่ายน้ำ",
      "ราคาห้องพักเปลี่ยนไปตามวันที่เข้าพัก หน้านี้จึงไม่ได้ระบุราคาไว้ เลือกวันที่ แล้วหน้าจองจะแสดงห้องพักและราคาของช่วงวันนั้น",
    ],
    glance: {
      types: "ห้องพักมีสามแบบ คือห้อง Deluxe Balcony ห้อง Deluxe Bathtub และห้อง Executive Pool Spa",
      rooftops: "ห้องพักทั้งสามแบบมีดาดฟ้าส่วนตัว ส่วนอ่างแช่ตัวบนดาดฟ้ามีเฉพาะห้อง Executive Pool Spa",
      times: "เช็กอินได้ตั้งแต่ {checkIn} น. และเช็กเอาต์ภายใน {checkOut} น. ตามข้อมูลปัจจุบัน",
      chosen: "เลือกประเภทห้องพักได้ในหน้าจอง",
    },
    rooms: {
      kicker: "ห้องพักสามแบบ",
      title: "ห้องพัก",
      intro: "เลือกห้องพักที่สนใจเพื่อดูภาพ แต่ละแบบมีหน้าของตัวเอง พร้อมภาพเพิ่มเติม",
    },
    band: "ห้องพักทั้งสามแบบมีดาดฟ้าส่วนตัว ส่วนอ่างแช่ตัวบนดาดฟ้ามีเฉพาะห้อง Executive Pool Spa",
    compare: {
      kicker: "เทียบกันทีละข้อ",
      title: "เปรียบเทียบ",
      intro: "สิ่งที่เหมือนกันทุกแบบจะบอกไว้ครั้งเดียว ส่วนจุดสีอิฐบอกสิ่งที่ต่างกัน",
    },
    practical: {
      kicker: "ก่อนจองห้องพัก",
      title: "ข้อควรทราบ",
      intro: "เรื่องที่ควรรู้ก่อนเลือกวันที่เข้าพัก",
      checkIn: "เช็กอิน",
      checkOut: "เช็กเอาต์",
      listed: "ตามข้อมูลปัจจุบัน",
      tilesLabel: "เวลาเช็กอินและเช็กเอาต์",
      notes: [
        "อาหารเช้าจะรวมอยู่ในค่าห้องหรือไม่ ขึ้นอยู่กับราคาที่เลือก โดยหน้าจองระบุไว้ในแต่ละราคา",
        "เพิ่มจำนวนเด็กได้ในหน้าจอง",
        "หน้าจองจะแสดงจำนวนผู้เข้าพักของแต่ละห้องตามวันที่เลือก",
        "การจองจะทำต่อในหน้าจองของผู้ให้บริการระบบจองของรีสอร์ท กดย้อนกลับเมื่อต้องการกลับมาหน้านี้",
        "หากมีข้อจำกัดเรื่องขั้นบันได ระยะทางเดิน หรือการเคลื่อนไหว ติดต่อรีสอร์ทเพื่อพูดคุยเป็นการส่วนตัวก่อนจองได้",
      ],
      ask: "สอบถามเรื่องเตียง จำนวนผู้เข้าพัก และห้องที่เชื่อมถึงกัน",
    },
    closingSecondary: "ติดต่อรีสอร์ท",
  },
} satisfies L<StayPageCopy>;
