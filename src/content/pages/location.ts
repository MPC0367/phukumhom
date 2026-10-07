import type { AssetId, L } from "@/content/schema";

/**
 * The Location page (brief section 13): the wording around the address, the map link and arrival.
 *
 * The facts are not here. The address, the phone number and the Google Maps listing come from
 * src/content/site.ts through pub(); the check-in and parking sentences are the FAQ's own answers
 * (src/content/faq.ts), printed here so they can never be worded two ways; the places come from
 * src/content/nearby.ts through <PlacesFilter>.
 *
 * Kept (BUILD-CONTRACT sections 2 and 8): the map link is the resort's own Google Maps listing and is
 * never called the entrance or the gate; no coordinates, no distance, no journey time, no "walking
 * distance"; the resort is in the Khao Yai area and not inside the national park; the places list is
 * "places to visit around Khao Yai", never "nearby". No map is embedded while the `mapEmbed` flag is
 * off, and a disabled feature leaves no trace.
 * Glossary sentences used word for word: phrases.locality (the statement), phrases.notInPark.
 * Third person. No middle dots and no dashes.
 */

/** Legacy 01_08: the buildings and their rooftop pergolas in late-afternoon light. Catalogued for "location". */
export const LOCATION_HERO: AssetId = "forecourt-rooftop-pergolas-late-afternoon";
/** Legacy 05_02: the reception building at dusk. One frame only from {05_02, 05_03, 05_04}. */
export const RECEPTION_FRAME: AssetId = "reception-building-front-dusk";

/** The arrival questions answered on this page, by their id in src/content/faq.ts, in this order. */
export const ARRIVAL_QUESTIONS: string[] = ["getting-there", "check-in-out", "parking", "national-park"];

export interface LocationPageCopy {
  heroKicker: string;
  /** Glossary phrases.locality. */
  statement: string;
  accent: string;
  body: string[];
  glance: {
    /** `{address}` is the published address. */
    address: string;
    notInPark: string;
    maps: string;
    call: string;
  };
  address: { kicker: string; title: string; intro: string };
  arrival: {
    kicker: string;
    title: string;
    intro: string;
    receptionTitle: string;
    receptionBody: string[];
    questionsHeading: string;
  };
}

export const copy = {
  en: {
    heroKicker: "Location",
    statement: "In Wang Katha, on the quieter side of the Khao Yai area.",
    accent: "quieter",
    body: [
      "The resort is in the Khao Yai area, not inside the national park. Its address is in Wang Katha, a sub-district of Pak Chong in Nakhon Ratchasima province.",
      "Copy the address, open the map listing or call the resort from this page. If the journey raises a question, the team is the one to ask.",
    ],
    glance: {
      address: "The address is {address}.",
      notInPark: "The resort is in the Khao Yai area, not inside the national park.",
      maps: "The map link opens the resort’s own listing on Google Maps.",
      call: "If you need help finding the way, call the resort.",
    },
    address: {
      kicker: "Address and contact",
      title: "Address",
      intro: "The address to give a driver or type into a map, and the number to call on the way.",
    },
    arrival: {
      kicker: "When you arrive",
      title: "Arrival",
      intro: "The reception building, and the questions guests ask about getting here.",
      receptionTitle: "Reception",
      receptionBody: ["The photograph shows the reception building at dusk, with its lamps lit.", "Arriving later than you planned? Call the resort so the team knows when to expect you."],
      questionsHeading: "Arrival questions",
    },
  },
  th: {
    heroKicker: "ที่ตั้ง",
    statement: "อยู่ที่ตำบลวังกะทะ ฝั่งที่เงียบกว่าของย่านเขาใหญ่",
    accent: "",
    body: [
      "รีสอร์ทอยู่ในย่านเขาใหญ่ ไม่ได้อยู่ในเขตอุทยานแห่งชาติเขาใหญ่ ที่อยู่ของรีสอร์ทคือตำบลวังกะทะ อำเภอปากช่อง จังหวัดนครราชสีมา",
      "คัดลอกที่อยู่ เปิดแผนที่ หรือโทรหารีสอร์ทได้จากหน้านี้ มีคำถามเรื่องเส้นทาง สอบถามทีมงานได้โดยตรง",
    ],
    glance: {
      address: "ที่อยู่ของรีสอร์ทคือ {address}",
      notInPark: "รีสอร์ทอยู่ในย่านเขาใหญ่ ไม่ได้อยู่ในเขตอุทยานแห่งชาติเขาใหญ่",
      maps: "ลิงก์แผนที่จะเปิดหน้าของรีสอร์ทบน Google Maps",
      call: "หากหาทางไม่เจอ โทรหารีสอร์ทได้",
    },
    address: {
      kicker: "ที่อยู่และการติดต่อ",
      title: "ที่อยู่",
      intro: "ที่อยู่สำหรับบอกคนขับรถหรือพิมพ์ลงในแผนที่ และหมายเลขโทรศัพท์ไว้โทรระหว่างทาง",
    },
    arrival: {
      kicker: "เมื่อมาถึง",
      title: "เมื่อมาถึง",
      intro: "อาคารต้อนรับ และคำถามที่ผู้เข้าพักมักถามเรื่องการเดินทาง",
      receptionTitle: "อาคารต้อนรับ",
      receptionBody: ["ภาพนี้คืออาคารต้อนรับยามพลบค่ำ ช่วงที่โคมไฟเปิดแล้ว", "หากจะมาถึงช้ากว่าที่วางแผนไว้ โทรแจ้งรีสอร์ทได้ เพื่อให้ทีมงานทราบเวลาที่จะมาถึง"],
      questionsHeading: "คำถามเรื่องการเดินทาง",
    },
  },
} satisfies L<LocationPageCopy>;
