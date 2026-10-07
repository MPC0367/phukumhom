import type { RouteId } from "@/lib/routes";
import type { L, Locale, PageSeo, RoomId } from "./schema";

/**
 * Per-route search metadata: the plain-words <h1>, the complete <title> and the meta description,
 * in both languages. The strings are copied from docs/seo-map.json (reasoning in docs/seo-map.md);
 * nothing is imported from docs/ at runtime.
 *
 * Bounds (contract §5, inclusive, counted as Unicode code points — [...s].length):
 *   title 50–60 including the brand suffix, description 140–160. Every string below was re-counted
 *   after copying; the figures are in the trailing comments.
 * There is no title template: each `title` is the full string (docs/NEXT16-NOTES.md §5).
 *
 * Two departures from docs/seo-map.json, both to obey contract §2 ("Deluxe Balcony: a private bathroom —
 * say nothing more; no source names a shower or a tub for it"):
 *   - the Deluxe Balcony descriptions say "a private bathroom" / ห้องน้ำในตัว where the map said "a shower room";
 *   - the Deluxe Bathtub → Deluxe Balcony link anchor no longer mentions a shower room.
 *
 * Two more, from the content review (docs/seo-map.json still has the old strings):
 *   - the English Gallery description says "private rooftops", not "their private rooftops": the catalogue has
 *     rooftop frames for Deluxe Balcony and Executive Pool Spa only, none for Deluxe Bathtub (RESEARCH §6);
 *   - the Experiences → Location anchor is "places to visit around Khao Yai" / สถานที่น่าแวะรอบเขาใหญ่, the
 *     heading it lands on (contract §8), where the map said "nearby places": no closeness is claimed for the list.
 */

export const brandSuffix: L = { en: "| Phukumhom Resort", th: "| ภูคำหอม รีสอร์ท" };

/** The 404 page: served with a 404 status and never indexed, so it carries a title and a heading only. */
export const notFoundSeo: L<{ title: string; h1: string }> = {
  en: { title: "Page not found: rooms, location, contact | Phukumhom Resort", h1: "Page not found" }, // 59
  th: { title: "ไม่พบหน้าที่ต้องการ ดูห้องพักหรือที่ตั้ง | ภูคำหอม รีสอร์ท", h1: "ไม่พบหน้าที่ต้องการ" }, // 58
};

export type SeoKey =
  | "home"
  | "stay"
  | "room:deluxe-balcony"
  | "room:deluxe-bathtub"
  | "room:executive-pool-spa"
  | "dining"
  | "experiences"
  | "gallery"
  | "location"
  | "contact"
  | "faq"
  | "privacy"
  | "terms"
  | "gatherings";

export const seo: Record<SeoKey, L<PageSeo>> = {
  home: {
    en: {
      h1: "Phukumhom, a Khao Yai resort with private rooftops",
      title: "Khao Yai resort with private rooftops | Phukumhom Resort", // 56
      description: "Phukumhom Resort Khao Yai sits in Wang Katha, on the quieter side of the Khao Yai area. Each room type has a private rooftop. Check rates for your dates.", // 153
    },
    th: {
      h1: "ภูคำหอม รีสอร์ท เขาใหญ่ ที่พักกลางสวนพร้อมดาดฟ้าส่วนตัว",
      title: "รีสอร์ทเขาใหญ่มีดาดฟ้าส่วนตัว ในวังกะทะ | ภูคำหอม รีสอร์ท", // 57
      description: "ภูคำหอม รีสอร์ท เขาใหญ่ อยู่ที่ตำบลวังกะทะ ฝั่งที่เงียบกว่าของย่านเขาใหญ่ ห้องพักทั้งสามแบบมีดาดฟ้าส่วนตัว เลือกห้องพักแล้วดูราคาตามวันที่เข้าพักได้เลย", // 151
    },
  },
  stay: {
    en: {
      h1: "Khao Yai rooms with a private rooftop: three types compared",
      title: "Khao Yai rooms with a private rooftop | Phukumhom Resort", // 56
      description: "Compare the three room types at Phukumhom: Deluxe Balcony, Deluxe Bathtub and Executive Pool Spa, each with a private rooftop. Check rates for your dates.", // 154
    },
    th: {
      h1: "ห้องพัก 3 แบบ ที่พักเขาใหญ่พร้อมดาดฟ้าส่วนตัว",
      title: "ที่พักเขาใหญ่ ดาดฟ้าส่วนตัว ห้องพัก 3 แบบ | ภูคำหอม รีสอร์ท", // 59
      description: "เปรียบเทียบห้องพักสามแบบของภูคำหอม ห้อง Deluxe Balcony ห้อง Deluxe Bathtub และห้อง Executive Pool Spa ทุกแบบมีดาดฟ้าส่วนตัว ดูราคาตามวันที่เข้าพักได้เลย", // 152
    },
  },
  "room:deluxe-balcony": {
    en: {
      h1: "Deluxe Balcony: a balcony room in Khao Yai with a private rooftop",
      title: "Deluxe Balcony room in Khao Yai | Phukumhom Resort", // 50
      description: "The Deluxe Balcony room at Phukumhom Resort Khao Yai has a balcony, a private rooftop and a private bathroom. See the room, then check resort availability.", // 155
    },
    th: {
      h1: "ห้อง Deluxe Balcony ห้องพักเขาใหญ่มีระเบียงและดาดฟ้าส่วนตัว",
      title: "Deluxe Balcony ห้องพักเขาใหญ่มีระเบียง | ภูคำหอม รีสอร์ท", // 56
      description: "ห้อง Deluxe Balcony ของภูคำหอม รีสอร์ท เขาใหญ่ มีระเบียง ดาดฟ้าส่วนตัว และห้องน้ำในตัว ดูรายละเอียดและภาพของห้อง แล้วตรวจสอบห้องว่างของรีสอร์ทได้เลย", // 148
    },
  },
  "room:deluxe-bathtub": {
    en: {
      h1: "Deluxe Bathtub: a bathtub room in Khao Yai",
      title: "Deluxe Bathtub room in Khao Yai | Phukumhom Resort", // 50
      description: "Want a bathtub room in Khao Yai? The Deluxe Bathtub at Phukumhom has a bathtub, a private rooftop and a balcony. See the room and check resort availability.", // 156
    },
    th: {
      h1: "ห้อง Deluxe Bathtub ที่พักเขาใหญ่มีอ่างอาบน้ำ",
      title: "Deluxe Bathtub ที่พักเขาใหญ่มีอ่างอาบน้ำ | ภูคำหอม รีสอร์ท", // 58
      description: "กำลังหาที่พักเขาใหญ่มีอ่างอาบน้ำใช่ไหม ห้อง Deluxe Bathtub ของภูคำหอมมีอ่างอาบน้ำ พร้อมระเบียงและดาดฟ้าส่วนตัว ดูรายละเอียดห้อง แล้วตรวจสอบห้องว่างของรีสอร์ท", // 157
    },
  },
  "room:executive-pool-spa": {
    en: {
      h1: "Executive Pool Spa: a rooftop spa tub room in Khao Yai",
      title: "Executive Pool Spa: Khao Yai rooftop tub | Phukumhom Resort", // 59
      description: "The Executive Pool Spa room has a circular spa tub on its private rooftop: a soaking tub, not a swimming pool. See the photos, then check resort availability.", // 158
    },
    th: {
      h1: "ห้อง Executive Pool Spa ที่พักเขาใหญ่มีอ่างแช่ตัวบนดาดฟ้าส่วนตัว",
      title: "Executive Pool Spa อ่างแช่ตัวบนดาดฟ้า | ภูคำหอม รีสอร์ท", // 55
      description: "ห้อง Executive Pool Spa มีอ่างแช่ตัวทรงกลมบนดาดฟ้าส่วนตัว เป็นอ่างแช่ตัว ไม่ใช่สระว่ายน้ำ ดูภาพห้องและดาดฟ้า แล้วตรวจสอบห้องว่างของภูคำหอม รีสอร์ท เขาใหญ่", // 154
    },
  },
  dining: {
    en: {
      h1: "Restaurant and kitchen garden at Phukumhom Resort Khao Yai",
      title: "Restaurant and kitchen garden in Khao Yai | Phukumhom Resort", // 60
      description: "The restaurant at Phukumhom Resort Khao Yai, and the kitchen garden the resort describes. Breakfast depends on the rate you choose. Ask the team for details.", // 157
    },
    th: {
      h1: "ร้านอาหารและสวนครัวของภูคำหอม รีสอร์ท เขาใหญ่",
      title: "ร้านอาหารและสวนครัวของรีสอร์ท ย่านเขาใหญ่ | ภูคำหอม รีสอร์ท", // 59
      description: "ร้านอาหารของภูคำหอม รีสอร์ท เขาใหญ่ กับสวนครัวแปลงเล็กและผักผลไม้ตามฤดูกาลที่รีสอร์ทเล่าถึง อาหารเช้าจะรวมหรือไม่ขึ้นอยู่กับราคาที่เลือก สอบถามทีมงานได้เลย", // 155
    },
  },
  experiences: {
    en: {
      h1: "Around the grounds of a Khao Yai garden resort",
      title: "Khao Yai garden resort: pond and rooftops | Phukumhom Resort", // 60
      description: "Walk the gardens, sit by the pond, swim in the shared pool and watch the sky from your rooftop on a clear evening. Ask the team what is running for your dates.", // 159
    },
    th: {
      h1: "รอบรีสอร์ท ที่พักเขาใหญ่ใกล้ชิดธรรมชาติ กับสวน สระน้ำ และดาดฟ้า",
      title: "ที่พักเขาใหญ่ใกล้ชิดธรรมชาติ สวนและดาดฟ้า | ภูคำหอม รีสอร์ท", // 59
      description: "วันสบายๆ ที่ภูคำหอม เดินเล่นในสวน นั่งริมน้ำ ลงสระว่ายน้ำส่วนกลาง แล้วขึ้นดาดฟ้าดูดาวในคืนที่ฟ้าเปิด สอบถามทีมงานได้ว่าช่วงที่เข้าพักมีอะไรเปิดให้บริการบ้าง", // 156
    },
  },
  gallery: {
    en: {
      h1: "Photos of Phukumhom Resort Khao Yai: rooms, rooftops and gardens",
      title: "Photos of rooms, rooftops and gardens | Phukumhom Resort", // 56
      description: "Browse photos of Phukumhom Resort Khao Yai: the three room types, private rooftops, the gardens and the shared pool. Then check rates for your dates.", // 149
    },
    th: {
      h1: "ภาพบรรยากาศภูคำหอม รีสอร์ท เขาใหญ่ ห้องพัก ดาดฟ้า และสวน",
      title: "ภาพบรรยากาศห้องพัก ดาดฟ้า และสวน เขาใหญ่ | ภูคำหอม รีสอร์ท", // 58
      description: "รวมภาพถ่ายของภูคำหอม รีสอร์ท เขาใหญ่ ทั้งห้องพักสามแบบ ดาดฟ้าส่วนตัว สวน และสระว่ายน้ำส่วนกลาง เลือกดูตามหมวดที่สนใจ แล้วดูราคาตามวันที่เข้าพักได้เลย", // 149
    },
  },
  location: {
    en: {
      h1: "Location and getting here: a resort in Wang Katha, Khao Yai",
      title: "Wang Katha, Khao Yai: location and map | Phukumhom Resort", // 57
      description: "Phukumhom Resort Khao Yai is in Wang Katha, Pak Chong, in the Khao Yai area and not inside the national park. See the address, then open it in Google Maps.", // 155
    },
    th: {
      h1: "ที่ตั้งและการเดินทาง รีสอร์ทในวังกะทะ ฝั่งที่เงียบกว่าของย่านเขาใหญ่",
      title: "ที่ตั้งและแผนที่ รีสอร์ทในวังกะทะ เขาใหญ่ | ภูคำหอม รีสอร์ท", // 59
      description: "ภูคำหอม รีสอร์ท เขาใหญ่ อยู่ที่ตำบลวังกะทะ อำเภอปากช่อง ฝั่งที่เงียบกว่าของย่านเขาใหญ่ ไม่ได้อยู่ในเขตอุทยานแห่งชาติเขาใหญ่ ดูที่อยู่แล้วเปิดใน Google Maps", // 155
    },
  },
  contact: {
    en: {
      h1: "Contact Phukumhom Resort Khao Yai",
      title: "Contact the resort: phone and Facebook | Phukumhom Resort", // 57
      description: "Call Phukumhom Resort Khao Yai or contact the team on Facebook with questions about rooms, dates or practical needs. Get in touch before you book your stay.", // 156
    },
    th: {
      h1: "ติดต่อภูคำหอม รีสอร์ท เขาใหญ่",
      title: "ติดต่อและสอบถามห้องพัก โทรศัพท์ Facebook | ภูคำหอม รีสอร์ท", // 58
      description: "โทรหาภูคำหอม รีสอร์ท เขาใหญ่ หรือติดต่อทาง Facebook เพื่อสอบถามเรื่องห้องพัก วันที่เข้าพัก หรือเรื่องที่อยากให้ทีมงานช่วยดูแล ติดต่อรีสอร์ทได้ก่อนตัดสินใจจอง", // 157
    },
  },
  faq: {
    en: {
      h1: "Phukumhom Resort Khao Yai FAQ: check-in, breakfast, pets and booking",
      title: "Guest FAQ: check-in, breakfast and pets | Phukumhom Resort", // 58
      description: "Answers on check-in and check-out times, breakfast, pets, the rooftop spa tub and how booking works at Phukumhom Resort Khao Yai. Still unsure? Ask the resort.", // 159
    },
    th: {
      h1: "คำถามที่พบบ่อยเกี่ยวกับภูคำหอม รีสอร์ท เขาใหญ่",
      title: "คำถามที่พบบ่อย เช็กอิน อาหารเช้า การจอง | ภูคำหอม รีสอร์ท", // 57
      description: "รวมคำตอบเรื่องเวลาเช็กอิน เช็กเอาต์ อาหารเช้า สัตว์เลี้ยง อ่างแช่ตัวบนดาดฟ้า และขั้นตอนการจองของภูคำหอม รีสอร์ท เขาใหญ่ มีคำถามอื่น สอบถามรีสอร์ทได้เลย", // 151
    },
  },
  privacy: {
    en: {
      h1: "Privacy policy for the Phukumhom Resort Khao Yai website",
      title: "Privacy policy and your personal data | Phukumhom Resort", // 56
      description: "How the Phukumhom Resort Khao Yai website handles personal data: what it collects, why, and how to contact the resort about your details. Read the full policy.", // 159
    },
    th: {
      h1: "นโยบายความเป็นส่วนตัวของเว็บไซต์ภูคำหอม รีสอร์ท เขาใหญ่",
      title: "นโยบายความเป็นส่วนตัวและข้อมูลส่วนบุคคล | ภูคำหอม รีสอร์ท", // 57
      description: "เว็บไซต์ภูคำหอม รีสอร์ท เขาใหญ่ เก็บข้อมูลส่วนบุคคลอะไรบ้าง นำไปใช้เพื่ออะไร และคุณติดต่อรีสอร์ทเรื่องข้อมูลของตัวเองได้อย่างไร อ่านนโยบายฉบับเต็มได้ที่หน้านี้", // 159
    },
  },
  terms: {
    en: {
      h1: "Website terms for Phukumhom Resort Khao Yai",
      title: "Website terms of use and booking links | Phukumhom Resort", // 57
      description: "Terms for using the Phukumhom Resort Khao Yai website: how links to the external booking page work and where rate terms are set. Read them before you book.", // 155
    },
    th: {
      h1: "ข้อกำหนดและเงื่อนไขการใช้เว็บไซต์ภูคำหอม รีสอร์ท เขาใหญ่",
      title: "ข้อกำหนดและเงื่อนไขการใช้เว็บไซต์รีสอร์ท | ภูคำหอม รีสอร์ท", // 58
      description: "ข้อกำหนดและเงื่อนไขการใช้เว็บไซต์ภูคำหอม รีสอร์ท เขาใหญ่ รวมถึงลิงก์ไปยังหน้าจองของผู้ให้บริการระบบจอง ซึ่งเป็นที่กำหนดเงื่อนไขของแต่ละราคา อ่านก่อนจองห้องพัก", // 158
    },
  },
  gatherings: {
    en: {
      h1: "Group stays and gatherings at Phukumhom Resort Khao Yai",
      title: "Group stays and gatherings in Khao Yai | Phukumhom Resort", // 57
      description: "Planning a family gathering or small celebration in the Khao Yai area? Tell the Phukumhom team your dates and group size, and ask what the resort can host.", // 155
    },
    th: {
      h1: "เข้าพักเป็นหมู่คณะและการจัดงานที่ภูคำหอม รีสอร์ท เขาใหญ่",
      title: "เข้าพักเป็นหมู่คณะและการจัดงาน ย่านเขาใหญ่ | ภูคำหอม รีสอร์ท", // 60
      description: "กำลังวางแผนงานเลี้ยงครอบครัวหรืองานฉลองเล็กๆ ในย่านเขาใหญ่ใช่ไหม บอกวันที่และจำนวนคนกับทีมงานภูคำหอม แล้วสอบถามได้เลยว่ารีสอร์ทรองรับงานแบบใดได้บ้าง", // 148
    },
  },
};

/** Pages kept out of the index whatever their flag says (the gatherings template). */
export const noindex: SeoKey[] = ["gatherings"];

export function seoKey(id: RouteId, room?: RoomId): SeoKey {
  if (id === "room") {
    if (!room) throw new Error("seoKey('room') needs a room id.");
    return `room:${room}`;
  }
  // Offer pages bring their own metadata from content when that flag is on; until then they share Stay's.
  if (id === "offers") return "stay";
  return id;
}

/** The metadata for one route in one language. Pass the room id for the `room` route. */
export function getSeo(id: RouteId, lang: Locale, room?: RoomId): PageSeo {
  return seo[seoKey(id, room)][lang];
}

/* ───────────── Internal link plan ───────────── */

export interface InternalLink {
  /** Resolve with `href(lang, to.id, { room: to.room })` from lib/routes. */
  to: { id: RouteId; room?: RoomId };
  /** Anchor text, written to sit inside a sentence — never inside a heading. */
  anchor: L;
}

/** For each page, the onward links its prose should carry (docs/seo-map.md §5). */
export const internalLinks: Record<SeoKey, InternalLink[]> = {
  home: [
    { to: { id: "stay" }, anchor: { en: "compare the three room types", th: "เปรียบเทียบห้องพักทั้งสามแบบ" } },
    { to: { id: "room", room: "executive-pool-spa" }, anchor: { en: "the room with a spa tub on its rooftop", th: "ห้องที่มีอ่างแช่ตัวบนดาดฟ้า" } },
    { to: { id: "dining" }, anchor: { en: "the resort’s restaurant and kitchen garden", th: "ร้านอาหารและสวนครัวของรีสอร์ท" } },
    { to: { id: "experiences" }, anchor: { en: "the gardens and grounds", th: "สวนและบริเวณรีสอร์ท" } },
    { to: { id: "location" }, anchor: { en: "where Wang Katha sits in the Khao Yai area", th: "วังกะทะอยู่ตรงไหนของย่านเขาใหญ่" } },
  ],
  stay: [
    { to: { id: "room", room: "deluxe-balcony" }, anchor: { en: "the Deluxe Balcony room", th: "ห้อง Deluxe Balcony" } },
    { to: { id: "room", room: "deluxe-bathtub" }, anchor: { en: "a room with a bathtub", th: "ห้องพักที่มีอ่างอาบน้ำ" } },
    { to: { id: "room", room: "executive-pool-spa" }, anchor: { en: "Executive Pool Spa and its rooftop spa tub", th: "ห้อง Executive Pool Spa กับอ่างแช่ตัวบนดาดฟ้า" } },
    { to: { id: "faq" }, anchor: { en: "check-in times and other practical questions", th: "เวลาเช็กอินและคำถามอื่นๆ ก่อนเข้าพัก" } },
    { to: { id: "gallery" }, anchor: { en: "photographs of each room type", th: "ภาพถ่ายของห้องพักแต่ละแบบ" } },
  ],
  "room:deluxe-balcony": [
    { to: { id: "stay" }, anchor: { en: "see all three room types side by side", th: "ดูห้องพักทั้งสามแบบเทียบกัน" } },
    { to: { id: "room", room: "deluxe-bathtub" }, anchor: { en: "Deluxe Bathtub, if you would like a bath", th: "ห้อง Deluxe Bathtub สำหรับคนที่อยากมีอ่างอาบน้ำ" } },
    { to: { id: "room", room: "executive-pool-spa" }, anchor: { en: "a spa tub up on the rooftop", th: "อ่างแช่ตัวบนดาดฟ้าของห้อง Executive Pool Spa" } },
    { to: { id: "experiences" }, anchor: { en: "evenings on the rooftop", th: "ยามเย็นบนดาดฟ้า" } },
    { to: { id: "contact" }, anchor: { en: "ask about this room", th: "สอบถามเกี่ยวกับห้องนี้" } },
  ],
  "room:deluxe-bathtub": [
    { to: { id: "stay" }, anchor: { en: "all the room types at Phukumhom", th: "ห้องพักทุกแบบของภูคำหอม" } },
    { to: { id: "room", room: "executive-pool-spa" }, anchor: { en: "the room whose tub is on the rooftop", th: "ห้องที่อ่างแช่ตัวอยู่บนดาดฟ้า" } },
    { to: { id: "room", room: "deluxe-balcony" }, anchor: { en: "Deluxe Balcony, with its balcony and private rooftop", th: "ห้อง Deluxe Balcony ที่มีระเบียงและดาดฟ้าส่วนตัว" } },
    { to: { id: "faq" }, anchor: { en: "how booking works", th: "ขั้นตอนการจองห้องพัก" } },
    { to: { id: "gallery" }, anchor: { en: "more photographs of the rooms", th: "ภาพห้องพักเพิ่มเติม" } },
  ],
  "room:executive-pool-spa": [
    { to: { id: "stay" }, anchor: { en: "how the three room types differ", th: "ห้องพักแต่ละแบบต่างกันอย่างไร" } },
    { to: { id: "room", room: "deluxe-bathtub" }, anchor: { en: "the Deluxe Bathtub room", th: "ห้อง Deluxe Bathtub" } },
    { to: { id: "experiences" }, anchor: { en: "the shared outdoor pool", th: "สระว่ายน้ำกลางแจ้งส่วนกลาง" } },
    { to: { id: "faq" }, anchor: { en: "questions about the rooftop spa tub", th: "คำถามเรื่องอ่างแช่ตัวบนดาดฟ้า" } },
    { to: { id: "contact" }, anchor: { en: "talk it through with the resort before you book", th: "พูดคุยกับรีสอร์ทเป็นการส่วนตัวก่อนจอง" } },
  ],
  dining: [
    { to: { id: "experiences" }, anchor: { en: "the gardens around the resort", th: "สวนรอบรีสอร์ท" } },
    { to: { id: "faq" }, anchor: { en: "whether breakfast is included", th: "อาหารเช้ารวมอยู่ในค่าห้องหรือไม่" } },
    { to: { id: "stay" }, anchor: { en: "rooms with a private rooftop", th: "ห้องพักที่มีดาดฟ้าส่วนตัว" } },
    { to: { id: "contact" }, anchor: { en: "ask the team about meals", th: "สอบถามทีมงานเรื่องอาหาร" } },
  ],
  experiences: [
    { to: { id: "room", room: "executive-pool-spa" }, anchor: { en: "a private rooftop with a spa tub", th: "ดาดฟ้าส่วนตัวที่มีอ่างแช่ตัว" } },
    { to: { id: "dining" }, anchor: { en: "the kitchen garden and the restaurant", th: "สวนครัวและร้านอาหาร" } },
    { to: { id: "location" }, anchor: { en: "places to visit around Khao Yai", th: "สถานที่น่าแวะรอบเขาใหญ่" } },
    { to: { id: "contact" }, anchor: { en: "ask what is running for your dates", th: "สอบถามว่าช่วงที่เข้าพักมีอะไรเปิดให้บริการบ้าง" } },
    { to: { id: "gallery" }, anchor: { en: "pictures of the gardens and the shared pool", th: "ภาพสวนและสระว่ายน้ำส่วนกลาง" } },
  ],
  gallery: [
    { to: { id: "stay" }, anchor: { en: "choose between the three room types", th: "เลือกห้องพักจากสามแบบ" } },
    { to: { id: "room", room: "deluxe-balcony" }, anchor: { en: "Deluxe Balcony and its rooftop", th: "ห้อง Deluxe Balcony และดาดฟ้า" } },
    { to: { id: "experiences" }, anchor: { en: "the grounds in more detail", th: "รายละเอียดของสวนและบริเวณรีสอร์ท" } },
    { to: { id: "dining" }, anchor: { en: "the resort’s restaurant", th: "ร้านอาหารของรีสอร์ท" } },
    { to: { id: "location" }, anchor: { en: "how to find the resort", th: "ที่ตั้งและการเดินทางมารีสอร์ท" } },
  ],
  location: [
    { to: { id: "contact" }, anchor: { en: "call the resort if you need help finding it", th: "โทรหารีสอร์ทหากหาทางไม่เจอ" } },
    { to: { id: "faq" }, anchor: { en: "check-in and check-out times", th: "เวลาเช็กอินและเช็กเอาต์" } },
    { to: { id: "stay" }, anchor: { en: "rooms at Phukumhom", th: "ห้องพักของภูคำหอม" } },
    { to: { id: "experiences" }, anchor: { en: "time around the resort", th: "การใช้เวลาในรีสอร์ท" } },
    { to: { id: "home" }, anchor: { en: "Phukumhom Resort Khao Yai", th: "ภูคำหอม รีสอร์ท เขาใหญ่" } },
  ],
  contact: [
    { to: { id: "faq" }, anchor: { en: "answers to common questions", th: "คำตอบของคำถามที่พบบ่อย" } },
    { to: { id: "location" }, anchor: { en: "the address and map", th: "ที่อยู่และแผนที่" } },
    { to: { id: "stay" }, anchor: { en: "the room you are asking about", th: "ห้องพักที่คุณสนใจ" } },
    { to: { id: "privacy" }, anchor: { en: "how the resort handles the details you send", th: "รีสอร์ทดูแลข้อมูลที่คุณส่งมาอย่างไร" } },
  ],
  faq: [
    { to: { id: "stay" }, anchor: { en: "the differences between the room types", th: "ความต่างของห้องพักแต่ละแบบ" } },
    { to: { id: "room", room: "executive-pool-spa" }, anchor: { en: "the Executive Pool Spa page", th: "หน้าห้อง Executive Pool Spa" } },
    { to: { id: "dining" }, anchor: { en: "more about breakfast and the restaurant", th: "เรื่องอาหารเช้าและร้านอาหาร" } },
    { to: { id: "location" }, anchor: { en: "getting to Wang Katha", th: "การเดินทางมาวังกะทะ" } },
    { to: { id: "contact" }, anchor: { en: "ask the resort directly", th: "ถามรีสอร์ทโดยตรง" } },
  ],
  privacy: [
    { to: { id: "contact" }, anchor: { en: "contact the resort about your data", th: "ติดต่อรีสอร์ทเรื่องข้อมูลของคุณ" } },
    { to: { id: "terms" }, anchor: { en: "the website terms", th: "ข้อกำหนดและเงื่อนไขการใช้เว็บไซต์" } },
    { to: { id: "faq" }, anchor: { en: "common questions before a stay", th: "คำถามที่ผู้เข้าพักถามบ่อย" } },
  ],
  terms: [
    { to: { id: "privacy" }, anchor: { en: "the privacy policy", th: "นโยบายความเป็นส่วนตัว" } },
    { to: { id: "faq" }, anchor: { en: "booking questions answered", th: "คำถามเรื่องการจอง" } },
    { to: { id: "contact" }, anchor: { en: "reach the resort", th: "ช่องทางติดต่อรีสอร์ท" } },
    { to: { id: "stay" }, anchor: { en: "room information on this site", th: "ข้อมูลห้องพักบนเว็บไซต์นี้" } },
  ],
  gatherings: [
    { to: { id: "contact" }, anchor: { en: "tell the team about your group", th: "เล่ารายละเอียดงานของคุณให้ทีมงานฟัง" } },
    { to: { id: "stay" }, anchor: { en: "rooms for your guests", th: "ห้องพักสำหรับแขกของคุณ" } },
    { to: { id: "dining" }, anchor: { en: "the restaurant on site", th: "ร้านอาหารในรีสอร์ท" } },
    { to: { id: "location" }, anchor: { en: "where to send your guests", th: "ที่ตั้งสำหรับส่งให้แขกที่มาร่วมงาน" } },
    { to: { id: "experiences" }, anchor: { en: "the garden setting", th: "บรรยากาศสวนของรีสอร์ท" } },
  ],
};
