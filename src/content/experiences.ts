import { fact, unknown, type Experience, type L } from "./schema";

/**
 * Time around the resort — editorial entries only.
 *
 * Nothing here is a bookable activity. The legacy activity list (cycling, kayaking, archery, pedal boats,
 * pétanque, campfire, BBQ, pony rides) is `needs-confirmation` (RESEARCH FA-09) and is not represented:
 * no entry names an activity, a timetable, a charge or a supervision arrangement. The four entries
 * describe places a guest can see in the photographs — gardens and pond, the private rooftop, the shared
 * pool, the kitchen garden — and every operational field is `unknown()` unless the ledger publishes it.
 *
 * Assets: manifest frames whose `uses` include "experiences" or "story". Never a switched-off frame, and
 * never the bicycle, kayak or archery frames (their subject is an unconfirmed activity).
 */

const noTimetable = (what: string): Experience["availability"] =>
  unknown<L>(`Editorial entry: ${what} No hours, season or timetable is published by any source.`);

export const experiences: Experience[] = [
  {
    id: "gardens-and-pond",
    theme: "gardens",
    name: { en: "The gardens and the pond", th: "สวนและสระน้ำ" },
    // FA-04 (landscaped gardens, mature trees), FA-08 (a pond on the grounds); the clay buildings and
    // clipped hedges are what the photographs show.
    description: {
      en: "Clipped hedges, lawns and mature trees run between the clay-coloured buildings, and there is a pond on the grounds. The gardens are for walking slowly and sitting down often.",
      th: "แนวพุ่มไม้ตัดแต่ง สนามหญ้า และต้นไม้ใหญ่แทรกอยู่ระหว่างอาคารสีดินเผา ในบริเวณรีสอร์ทมีสระน้ำด้วย สวนของที่นี่เหมาะกับการเดินช้าๆ แล้วหาที่นั่งพักเป็นระยะ",
    },
    asset: "garden-lawn-glazed-jars-clay-buildings", // 01_21 (never with 01_19, 01_20 or 01_23 on one page)
    where: "resort",
    availability: noTimetable("the grounds are part of the resort."),
    bookingRequired: unknown<boolean>("Not an activity; nothing to book."),
    charge: unknown<"included" | "additional" | "varies">("Not an activity; no charge information applies or is published."),
    notes: unknown<L>("What happens on the pond (pedal boats, kayaks) is legacy-only and unconfirmed (FA-09): never mentioned.", ["S-09", "S-10", "S-17"]),
    editorial: true,
  },
  {
    id: "private-rooftop",
    theme: "rooftop-evenings",
    name: { en: "Mornings and evenings on the rooftop", th: "เช้าและเย็นบนดาดฟ้าส่วนตัว" },
    // RM-04 … RM-06, RM-10; first sentence is glossary.json → phrases.rooftopsAllRooms, last is phrases.stargazing.
    description: {
      en: "All three room types have a private rooftop; the rooftop spa tub belongs to Executive Pool Spa. It is the room’s own piece of open sky, for a first coffee or the last light of the day. On clear evenings, the rooftop is a good place to watch the stars come out.",
      th: "ห้องพักทั้งสามแบบมีดาดฟ้าส่วนตัว ส่วนอ่างแช่ตัวบนดาดฟ้ามีเฉพาะห้อง Executive Pool Spa ดาดฟ้าเป็นพื้นที่กลางแจ้งของห้องเอง จะนั่งจิบกาแฟยามเช้าหรือรอดูแสงสุดท้ายของวันก็ได้ ในคืนที่ฟ้าเปิด ดาดฟ้าเป็นมุมที่เหมาะกับการนั่งดูดาว",
    },
    asset: "rooftop-lounger-cushions-hill-view", // 02_11, a Deluxe Balcony rooftop by day
    where: "resort",
    availability: noTimetable("the rooftop belongs to the room."),
    bookingRequired: unknown<boolean>("Not an activity; the rooftop comes with the room."),
    charge: unknown<"included" | "additional" | "varies">("Not an activity; no separate charge information is published."),
    // FA-12: the only publishable weather wording. Never guaranteed, never 'dark-sky', no Milky Way season.
    notes: fact<L>(
      { en: "On clear evenings", th: "ในคืนที่ฟ้าเปิด" },
      "source-listed",
      ["S-06", "S-10", "S-08"],
      "Posts of 8–9 Sep 2026 promote stars from the private rooftop; the legacy copy does the same. How a rooftop is reached is not stated anywhere (RM-20).",
    ),
    editorial: true,
  },
  {
    id: "shared-pool",
    theme: "shared-facilities",
    name: { en: "The shared pool", th: "สระว่ายน้ำส่วนกลาง" },
    // FA-01; first sentence is glossary.json → phrases.sharedPoolNote.
    description: {
      en: "The resort has a shared outdoor pool, set apart from the rooms. It is a different thing from the spa tub on the Executive Pool Spa rooftop, which is a tub for soaking.",
      th: "รีสอร์ทมีสระว่ายน้ำกลางแจ้งส่วนกลาง อยู่แยกจากห้องพัก เป็นคนละส่วนกับอ่างแช่ตัวบนดาดฟ้าของห้อง Executive Pool Spa ซึ่งเป็นอ่างสำหรับนอนแช่",
    },
    asset: "poolside-loungers-parasol-wooded-hills", // 05_45
    where: "resort",
    availability: unknown<L>("Pool hours are not published by any source (FA-03). Owner question Q-26.", ["S-03", "S-02", "S-19"]),
    bookingRequired: unknown<boolean>("No source."),
    charge: unknown<"included" | "additional" | "varies">("The booking engine lists the pool as a hotel-level amenity; no source states a charge either way."),
    notes: unknown<L>(
      "Distance from the rooms, cart transport, lifeguard and a children's pool are all unconfirmed (FA-02, FA-03): no cart-shuttle promise, no lifeguard language.",
      ["S-27", "S-22"],
    ),
    editorial: true,
  },
  {
    id: "kitchen-garden",
    theme: "gardens",
    name: { en: "The kitchen garden", th: "สวนครัว" },
    // DG-07, DG-08; first two sentences are glossary.json → phrases.kitchenGardenSeasonal.
    description: {
      en: "The resort describes a small kitchen garden of its own. What it gives changes with the season, so no two stays find quite the same things. Purple winged beans, salad leaves and fruit in season are among the things it names.",
      th: "รีสอร์ทเล่าว่ามีสวนครัวแปลงเล็กของตัวเอง ผลผลิตเปลี่ยนไปตามฤดูกาล แต่ละช่วงที่เข้าพักจึงไม่เหมือนกัน ถั่วพูม่วง ผักสลัด และผลไม้ตามฤดูกาล เป็นส่วนหนึ่งของสิ่งที่รีสอร์ทเอ่ยถึง",
    },
    asset: "gac-fruit-hanging-on-vine", // 07_11
    where: "resort",
    availability: unknown<L>("Whether the garden is still tended, and whether guests may walk through it, is unconfirmed. Owner question Q-25.", ["S-09"]),
    bookingRequired: unknown<boolean>("No garden visit or tour is offered by any source; none is implied."),
    charge: unknown<"included" | "additional" | "varies">("Not an activity; no charge information applies or is published."),
    notes: unknown<L>("One undated legacy page is the only source. Never 'organic', 'pesticide-free' or 'farm-to-table' (DG-06).", ["S-09"]),
    editorial: true,
  },
];
