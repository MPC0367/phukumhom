import type { RouteId } from "@/lib/routes";
import { POOL_SPA_CLARIFICATION } from "./rooms";
import { pub, type FaqItem, type L, type RouteRef } from "./schema";
import { propertyFacts, site } from "./site";

/**
 * Frequently asked questions (brief §18).
 *
 * Every answer opens with the answer. Where the resort's rule is unknown (children, extra beds, deposit,
 * cancellation, payment, access, pool hours, activities) the answer is a route — the booking page shows it
 * for the chosen dates, or the resort will say — never a guessed rule. Sentences that exist in
 * docs/glossary.json or docs/VOICE.md §4 are used word for word.
 *
 * Times come from `site.checkIn` / `site.checkOut` through `pub()`, so they are stored once and vanish
 * from the answer if their status is ever downgraded.
 *
 * Pets, parking and Wi-Fi are answered from `propertyFacts` (site.ts) through `pub()` in the same way.
 * Pets and parking are questions brief §18 calls essential, so when their fact is withheld the question
 * stays and the answer becomes a route to the resort. Wi-Fi is published only by the contract's
 * property-level ruling (§2); when that fact is withheld the whole item goes, word and all.
 *
 * `id` doubles as the fragment on /faq (for example /th/faq#pets). `link.route.id` is a RouteId.
 */

/** Keeps every onward link pointing at a route that exists. */
const to = (id: RouteId, extra: Omit<RouteRef, "id"> = {}): RouteRef => ({ id, ...extra });

const ASK_THE_RESORT: L = { en: "Ask the resort", th: "สอบถามรีสอร์ท" };
const CONTACT_THE_RESORT: L = { en: "Contact the resort", th: "ติดต่อรีสอร์ท" };

const checkIn = pub(site.checkIn);
const checkOut = pub(site.checkOut);

/** glossary.json → phrases.checkInOut, with the times interpolated from site settings. */
const checkInOutAnswer: L =
  checkIn && checkOut
    ? {
        en: `Check-in is from ${checkIn} and check-out is until ${checkOut}, as currently listed; your booking confirmation is the reference.`,
        th: `เช็กอินได้ตั้งแต่ ${checkIn} น. และเช็กเอาต์ภายใน ${checkOut} น. ตามข้อมูลปัจจุบัน โดยให้ยึดเวลาในใบยืนยันการจองเป็นหลัก`,
      }
    : {
        en: "Your booking confirmation gives the check-in and check-out times for your stay.",
        th: "เวลาเช็กอินและเช็กเอาต์ของการเข้าพักระบุไว้ในใบยืนยันการจอง",
      };

const petsAccepted = pub(propertyFacts.petsAccepted);
const freeParking = pub(propertyFacts.parking);
const freeWifi = pub(propertyFacts.wifi);

/**
 * glossary.json → phrases.pets (the contract's own wording) while the published fact is "not accepted".
 * If the fact is withheld, or ever changes, only the route remains: no rule is stated either way.
 */
const petsAnswer: L =
  petsAccepted === false
    ? {
        en: "Current listings say pets are not accepted — please ask the resort before travelling with an animal.",
        th: "ข้อมูลปัจจุบันระบุว่ารีสอร์ทไม่รับสัตว์เลี้ยง หากจะพาสัตว์เลี้ยงมาด้วย กรุณาสอบถามรีสอร์ทก่อนเดินทาง",
      }
    : {
        en: "Please ask the resort before travelling with an animal.",
        th: "หากจะพาสัตว์เลี้ยงมาด้วย กรุณาสอบถามรีสอร์ทก่อนเดินทาง",
      };

/** Contract §2: free on-site parking, property level, "as currently listed". A route when the fact is withheld. */
const parkingAnswer: L =
  freeParking === true
    ? {
        en: "Yes, the resort has free on-site parking, as currently listed.",
        th: "รีสอร์ทมีที่จอดรถภายในโดยไม่มีค่าใช้จ่าย ตามข้อมูลปัจจุบัน",
      }
    : {
        en: "Ask the resort about parking before you travel.",
        th: "เรื่องที่จอดรถ สอบถามรีสอร์ทก่อนเดินทางได้",
      };

/**
 * Contract §2: free Wi-Fi, property level, "as currently listed" — never a room amenity, a speed or a
 * coverage claim. Present only while `propertyFacts.wifi` is published; there is no fallback wording.
 */
const wifiItems: FaqItem[] =
  freeWifi === true
    ? [
        {
          id: "wifi",
          group: "property",
          question: { en: "Is there Wi-Fi?", th: "รีสอร์ทมี Wi-Fi หรือไม่?" },
          answer: {
            en: ["Yes, the resort has free Wi-Fi, as currently listed.", "If a steady connection matters for your stay, for work for example, ask the resort what to expect before you book."],
            th: ["รีสอร์ทมี Wi-Fi ให้ใช้โดยไม่มีค่าใช้จ่าย ตามข้อมูลปัจจุบัน", "หากต้องใช้อินเทอร์เน็ตเป็นหลักระหว่างเข้าพัก เช่น ต้องทำงาน สอบถามรีสอร์ทก่อนจองได้"],
          },
        },
      ]
    : [];

export const faq: FaqItem[] = [
  /* ───────────── Stay ───────────── */
  {
    id: "check-in-out",
    group: "stay",
    question: { en: "What time are check-in and check-out?", th: "เช็กอินและเช็กเอาต์ได้กี่โมง?" },
    answer: {
      en: [checkInOutAnswer.en, "If your travel plans do not fit those times, ask the resort before you set out."],
      th: [checkInOutAnswer.th, "หากเวลาเดินทางไม่ตรงกับช่วงนี้ สอบถามรีสอร์ทก่อนออกเดินทางได้"],
    },
    link: { route: to("contact"), label: ASK_THE_RESORT },
  },
  {
    id: "pets",
    group: "stay",
    question: { en: "Can I bring a pet?", th: "พาสัตว์เลี้ยงเข้าพักได้หรือไม่?" },
    answer: { en: [petsAnswer.en], th: [petsAnswer.th] },
    link: { route: to("contact"), label: ASK_THE_RESORT },
  },

  /* ───────────── Rooms ───────────── */
  {
    id: "bathtub-spa-tub-pool",
    group: "rooms",
    question: {
      en: "What is the difference between the bathtub, the spa tub and the shared pool?",
      th: "อ่างอาบน้ำ อ่างแช่ตัว และสระว่ายน้ำส่วนกลาง ต่างกันอย่างไร?",
    },
    answer: {
      en: [
        "They are three separate things: Deluxe Bathtub has a bathtub, Executive Pool Spa has a circular spa tub on its private rooftop, and the resort has a shared outdoor pool.",
        // glossary.json → phrases.poolSpaClarification, stored once in rooms.ts
        POOL_SPA_CLARIFICATION.en,
      ],
      th: [
        "เป็นสามอย่างที่แยกจากกัน ห้อง Deluxe Bathtub มีอ่างอาบน้ำ ห้อง Executive Pool Spa มีอ่างแช่ตัวทรงกลมบนดาดฟ้าส่วนตัว และรีสอร์ทมีสระว่ายน้ำกลางแจ้งส่วนกลาง",
        POOL_SPA_CLARIFICATION.th,
      ],
    },
    link: { route: to("stay", { hash: "compare" }), label: { en: "Compare rooms", th: "เปรียบเทียบห้องพัก" } },
  },
  {
    id: "rooftop-access",
    group: "rooms",
    question: {
      // "every room type", as in the Thai: the ledger lists a rooftop per category (RM-04 to RM-06), not per room.
      en: "Does every room type have a private rooftop, and how is it reached?",
      th: "ห้องพักทุกแบบมีดาดฟ้าส่วนตัวหรือไม่ และขึ้นไปอย่างไร?",
    },
    answer: {
      en: [
        // glossary.json → phrases.rooftopsAllRooms
        "All three room types have a private rooftop; the rooftop spa tub belongs to Executive Pool Spa.",
        // second sentence: glossary.json → phrases.accessConversation
        "Ask the resort how the rooftop of the room you have in mind is reached. If steps, distances or getting around matter for your stay, contact the resort to talk it through privately before you book.",
      ],
      th: [
        "ห้องพักทั้งสามแบบมีดาดฟ้าส่วนตัว ส่วนอ่างแช่ตัวบนดาดฟ้ามีเฉพาะห้อง Executive Pool Spa",
        "ทางขึ้นดาดฟ้าของห้องที่สนใจเป็นแบบใด สอบถามรีสอร์ทได้ หากมีข้อจำกัดเรื่องขั้นบันได ระยะทางเดิน หรือการเคลื่อนไหว ติดต่อรีสอร์ทเพื่อพูดคุยเป็นการส่วนตัวก่อนจองได้",
      ],
    },
    link: { route: to("contact", { query: { type: "stay" } }), label: ASK_THE_RESORT },
  },
  {
    id: "children-extra-beds",
    group: "rooms",
    question: { en: "Can children stay, and are extra beds available?", th: "เด็กเข้าพักได้หรือไม่ และมีเตียงเสริมหรือไม่?" },
    answer: {
      en: [
        // glossary.json → phrases.childrenOnBookingPage + phrases.occupancyOnBookingPage
        "Children are added on the booking page. The booking page shows how many guests each room takes for your dates.",
        "For extra beds, cots and how a family would be placed across rooms, ask the resort about your dates before you book.",
      ],
      th: [
        "เพิ่มจำนวนเด็กได้ในหน้าจอง หน้าจองจะแสดงจำนวนผู้เข้าพักของแต่ละห้องตามวันที่เลือก",
        "เรื่องเตียงเสริม เตียงเด็ก และการจัดห้องสำหรับครอบครัว สอบถามรีสอร์ทก่อนจองได้ โดยแจ้งวันที่ต้องการเข้าพักไปด้วย",
      ],
    },
    link: { route: to("contact", { query: { type: "stay" } }), label: ASK_THE_RESORT },
  },

  /* ───────────── Dining ───────────── */
  {
    id: "breakfast",
    group: "dining",
    question: { en: "Is breakfast included?", th: "ค่าห้องรวมอาหารเช้าหรือไม่?" },
    answer: {
      // glossary.json → phrases.breakfast (the contract's own wording)
      en: ["Whether breakfast is included depends on the rate you choose; each rate on the booking page says so."],
      th: ["อาหารเช้าจะรวมอยู่ในค่าห้องหรือไม่ ขึ้นอยู่กับราคาที่เลือก โดยหน้าจองระบุไว้ในแต่ละราคา"],
    },
    link: { route: to("dining"), label: { en: "Restaurant and kitchen garden", th: "ร้านอาหารและสวนครัว" } },
  },
  {
    id: "restaurant",
    group: "dining",
    question: { en: "Is there a restaurant at the resort?", th: "ในรีสอร์ทมีร้านอาหารหรือไม่?" },
    answer: {
      en: ["Yes, the resort has its own restaurant.", "For opening times and what is being served during your stay, ask the team."],
      th: ["รีสอร์ทมีร้านอาหารของตัวเอง", "เวลาเปิดและรายการอาหารในช่วงที่เข้าพัก สอบถามทีมงานได้"],
    },
    link: { route: to("contact", { query: { type: "dining" } }), label: ASK_THE_RESORT },
  },

  /* ───────────── Booking ───────────── */
  {
    id: "how-booking-works",
    group: "booking",
    question: { en: "How do I book a room?", th: "จองห้องพักอย่างไร?" },
    answer: {
      en: [
        // glossary.json → phrases.bookingPartnerNotice
        "Booking is completed on the page of the resort’s booking partner. Your browser’s back button brings you back here.",
        "Choose your dates and the number of adults first. You choose the room on the booking page, and children are added there. The booking page has its own language menu.",
        // glossary.json → phrases.enquiryNotReservation
        "An enquiry is a message to the resort, not a confirmed reservation.",
      ],
      th: [
        "การจองจะทำต่อในหน้าจองของผู้ให้บริการระบบจองของรีสอร์ท กดย้อนกลับเมื่อต้องการกลับมาหน้านี้",
        "เลือกวันที่และจำนวนผู้ใหญ่ก่อน จากนั้นเลือกประเภทห้องพักและเพิ่มจำนวนเด็กได้ในหน้าจอง หากหน้าจองแสดงเป็นภาษาอังกฤษ เปลี่ยนเป็นภาษาไทยได้จากเมนูภาษาในหน้านั้น",
        "ข้อความสอบถามเป็นการติดต่อรีสอร์ท ยังไม่ใช่การยืนยันการจอง",
      ],
    },
    link: { route: to("stay"), label: { en: "Explore rooms", th: "ดูห้องพัก" } },
  },
  {
    id: "cancellation-payment",
    group: "booking",
    question: { en: "What are the cancellation and payment terms?", th: "เงื่อนไขการยกเลิกและการชำระเงินเป็นอย่างไร?" },
    answer: {
      en: [
        // VOICE.md §4 → "Depends on the rate (deposit, cancellation)"
        "Deposit and cancellation terms come with the rate you choose. Read them on the booking page before you confirm, or ask the resort.",
        "For the payment methods accepted, ask the resort before you book.",
      ],
      th: [
        // Says "deposit" (เงินมัดจำ) like the English. VOICE.md §4 still has "payment" in this cell, which made
        // the two paragraphs disagree about where payment terms are found.
        "เงื่อนไขเงินมัดจำและการยกเลิกเป็นไปตามราคาที่เลือก อ่านรายละเอียดได้ในหน้าจองก่อนยืนยัน หรือสอบถามรีสอร์ท",
        "เรื่องช่องทางชำระเงินที่รับ สอบถามรีสอร์ทก่อนจองได้",
      ],
    },
    link: { route: to("terms"), label: { en: "Website terms", th: "ข้อกำหนดและเงื่อนไขการใช้เว็บไซต์" } },
  },
  {
    id: "groups",
    group: "booking",
    question: { en: "Can I arrange a group stay or a gathering?", th: "จัดเข้าพักเป็นหมู่คณะหรือจัดงานได้หรือไม่?" },
    answer: {
      en: [
        "Group stays and gatherings are arranged by enquiry with the resort.",
        "Tell the team your dates, how many people are coming and what you have in mind, and ask what the resort can host. To book several rooms yourself, add rooms on the booking page.",
      ],
      th: [
        "การเข้าพักเป็นหมู่คณะและการจัดงาน ติดต่อสอบถามกับรีสอร์ทโดยตรง",
        "แจ้งวันที่ จำนวนคน และลักษณะงานที่ต้องการกับทีมงาน แล้วสอบถามว่ารีสอร์ทรองรับได้แบบใดบ้าง หากต้องการจองหลายห้องเอง เพิ่มจำนวนห้องได้ในหน้าจอง",
      ],
    },
    link: { route: to("contact", { query: { type: "group" } }), label: CONTACT_THE_RESORT },
  },

  /* ───────────── Arrival ───────────── */
  {
    id: "getting-there",
    group: "arrival",
    question: { en: "How do I get to the resort?", th: "เดินทางไปรีสอร์ทอย่างไร?" },
    answer: {
      en: [
        "Open the resort’s listing in Google Maps to plan a route from where you are; the Location page links to it.",
        "The resort is in Wang Katha, Pak Chong, on the quieter side of the Khao Yai area. If you need help finding the way, call the resort.",
      ],
      th: [
        "เปิดหน้าของรีสอร์ทใน Google Maps เพื่อดูเส้นทางจากจุดที่คุณอยู่ ลิงก์อยู่ในหน้าที่ตั้งและการเดินทาง",
        "รีสอร์ทอยู่ที่ตำบลวังกะทะ อำเภอปากช่อง ฝั่งที่เงียบกว่าของย่านเขาใหญ่ หากหาทางไม่เจอ โทรหารีสอร์ทได้",
      ],
    },
    link: { route: to("location"), label: { en: "Location and getting here", th: "ที่ตั้งและการเดินทาง" } },
  },
  {
    id: "national-park",
    group: "arrival",
    question: { en: "Is the resort inside Khao Yai National Park?", th: "รีสอร์ทอยู่ในเขตอุทยานแห่งชาติเขาใหญ่หรือไม่?" },
    answer: {
      // first sentence: glossary.json → phrases.notInPark
      en: ["The resort is in the Khao Yai area, not inside the national park. Its address is in Wang Katha, Pak Chong, on the quieter side of the area."],
      th: ["รีสอร์ทอยู่ในย่านเขาใหญ่ ไม่ได้อยู่ในเขตอุทยานแห่งชาติเขาใหญ่ ที่อยู่ของรีสอร์ทคือตำบลวังกะทะ อำเภอปากช่อง ฝั่งที่เงียบกว่าของย่านเขาใหญ่"],
    },
  },
  {
    id: "parking",
    group: "arrival",
    question: { en: "Is there parking at the resort?", th: "รีสอร์ทมีที่จอดรถหรือไม่?" },
    answer: {
      en: [parkingAnswer.en, "If you are arriving in several cars or in a large vehicle, let the resort know before you travel."],
      th: [parkingAnswer.th, "หากเดินทางมาหลายคันหรือใช้รถขนาดใหญ่ แจ้งรีสอร์ทก่อนเดินทางได้"],
    },
    // A route to the resort only when the answer is itself a route.
    ...(freeParking === true ? {} : { link: { route: to("contact"), label: ASK_THE_RESORT } }),
  },

  /* ───────────── Property ───────────── */
  {
    id: "activities",
    group: "property",
    question: { en: "What is there to do at the resort?", th: "ในรีสอร์ทมีอะไรให้ทำบ้าง?" },
    answer: {
      en: [
        "Most of it is unhurried: gardens to walk in, a pond, a shared outdoor pool and a private rooftop with every room type.",
        // VOICE.md §4 → "Ask the team (activities)"
        "Before you plan around an activity, ask the team what is running for your dates.",
      ],
      th: [
        "ส่วนใหญ่เป็นการใช้เวลาแบบไม่ต้องรีบ เดินเล่นในสวน นั่งริมสระน้ำ ลงสระว่ายน้ำกลางแจ้งส่วนกลาง หรือขึ้นไปนั่งบนดาดฟ้าส่วนตัวที่มีในห้องพักทุกแบบ",
        "ก่อนวางแผนทำกิจกรรมใด สอบถามทีมงานก่อนว่าช่วงที่เข้าพักมีอะไรเปิดให้บริการบ้าง",
      ],
    },
    link: { route: to("experiences"), label: { en: "Around the resort", th: "รอบรีสอร์ท" } },
  },
  ...wifiItems,
  {
    id: "access-needs",
    group: "property",
    question: {
      en: "Who do I talk to about steps, distances or getting around?",
      th: "หากมีข้อจำกัดเรื่องขั้นบันไดหรือการเคลื่อนไหว ควรติดต่อใคร?",
    },
    answer: {
      en: [
        // glossary.json → phrases.accessConversation
        "If steps, distances or getting around matter for your stay, contact the resort to talk it through privately before you book.",
        "Describe the practical need, such as how many steps are manageable. There is no need to share medical details.",
      ],
      th: [
        "หากมีข้อจำกัดเรื่องขั้นบันได ระยะทางเดิน หรือการเคลื่อนไหว ติดต่อรีสอร์ทเพื่อพูดคุยเป็นการส่วนตัวก่อนจองได้",
        "เล่าให้ทีมงานฟังว่าต้องการอะไรในทางปฏิบัติ เช่น ขึ้นลงบันไดได้มากน้อยแค่ไหน โดยไม่จำเป็นต้องบอกข้อมูลสุขภาพ",
      ],
    },
    link: { route: to("contact"), label: CONTACT_THE_RESORT },
  },
];
