import { fact, unknown, type Amenity, type AmenityId, type AssetId, type Fact, type L, type Room, type RoomId, type SourceId } from "./schema";

/**
 * The three room categories (RESEARCH RM-01) and the six in-room amenities that may be listed (RM-21).
 *
 * Rules this file obeys — docs/BUILD-CONTRACT.md §2 and §8, docs/RESEARCH.md §3.2:
 * - Size, bed type, occupancy, connecting rooms and how a rooftop is reached are `needs-confirmation`
 *   with `value: null`. What each source says is kept in `note` for the owner's answer; `pub()` never
 *   returns it and no guest page prints it.
 * - A private rooftop and a balcony are source-listed for all three categories.
 * - Deluxe Balcony's bathing fact is "a private bathroom" and nothing more: no source names a shower
 *   or a tub for it (contract §2). Deluxe Bathtub has a bathtub. Executive Pool Spa has a circular
 *   spa tub on its private rooftop — a tub for soaking, never a pool.
 * - `media.gallery` is the full ordered photo set for the room and INCLUDES the lead frame at its place
 *   in the sequence (sleeping area, bathing, outdoor space, rooftop). Every id is a manifest frame
 *   catalogued against that room with a non-empty `uses`; no room borrows another room's frames.
 * - Provider display names are for a future integration only and never reach guest copy.
 */

/* ───────────── Amenities ───────────── */

export const amenities: Record<AmenityId, Amenity> = {
  "air-conditioning": { id: "air-conditioning", label: { en: "Air conditioning", th: "เครื่องปรับอากาศ" } },
  "private-bathroom": { id: "private-bathroom", label: { en: "Private bathroom", th: "ห้องน้ำในตัว" } },
  refrigerator: { id: "refrigerator", label: { en: "Refrigerator", th: "ตู้เย็น" } },
  television: { id: "television", label: { en: "Television", th: "โทรทัศน์" } },
  hairdryer: { id: "hairdryer", label: { en: "Hairdryer", th: "ไดร์เป่าผม" } },
  "coffee-tea": { id: "coffee-tea", label: { en: "In-room coffee and tea", th: "กาแฟและชาในห้องพัก" } },
};

/** RM-21: each is listed by the resort's room page or its booking engine and contradicted by nothing. */
const SIX_AMENITIES: AmenityId[] = ["air-conditioning", "private-bathroom", "refrigerator", "television", "hairdryer", "coffee-tea"];

/* ───────────── Shared wording ───────────── */

/** glossary.json → rooms.*.outdoors */
const OUTDOORS: L = { en: "Balcony and private rooftop", th: "ระเบียงและดาดฟ้าส่วนตัว" };

/** glossary.json → phrases.sharedPoolNote */
const POOL_NOTE: L = {
  en: "The resort has a shared outdoor pool, set apart from the rooms.",
  th: "รีสอร์ทมีสระว่ายน้ำกลางแจ้งส่วนกลาง อยู่แยกจากห้องพัก",
};

/**
 * glossary.json → phrases.poolSpaClarification. Contract §2 ("always distinguish the shared pool from the
 * Executive rooftop spa tub") and VOICE.md §5 rule 2: it appears wherever the room's name could mislead —
 * the room page, the comparison and the FAQ. Stored once here; faq.ts imports it. Its last sentence is the
 * shared-pool line, so Executive Pool Spa's `goodToKnow` opens with this instead of POOL_NOTE.
 */
export const POOL_SPA_CLARIFICATION: L = {
  en: "The room is called Executive Pool Spa. What is on its rooftop is a circular spa tub for soaking, not a swimming pool. The resort’s pool is a shared outdoor pool, set apart from the rooms.",
  th: "ห้องนี้ชื่อ Executive Pool Spa แต่สิ่งที่อยู่บนดาดฟ้าคืออ่างแช่ตัวทรงกลม ไม่ใช่สระว่ายน้ำ ส่วนสระว่ายน้ำของรีสอร์ทเป็นสระกลางแจ้งส่วนกลาง อยู่แยกจากห้องพัก",
};

/** The Executive rooftop tub's details (volume, heating, jets) are withheld (RM-11, RM-12): a route to ask. */
const SPA_TUB_ASK_NOTE: L = {
  en: "If the details of the spa tub matter to you, ask the resort about them before you book.",
  th: "หากอยากทราบรายละเอียดของอ่างแช่ตัว สอบถามรีสอร์ทก่อนจองได้",
};

/** glossary.json → phrases.breakfast (the contract's own wording) */
const BREAKFAST_NOTE: L = {
  en: "Whether breakfast is included depends on the rate you choose; each rate on the booking page says so.",
  th: "อาหารเช้าจะรวมอยู่ในค่าห้องหรือไม่ ขึ้นอยู่กับราคาที่เลือก โดยหน้าจองระบุไว้ในแต่ละราคา",
};

/** VOICE.md §4 → "Ask the resort (beds, occupancy, connecting rooms)" */
const ASK_BEDS_NOTE: L = {
  en: "If beds, occupancy or connecting rooms matter for your stay, ask the resort about your dates before you book.",
  th: "เรื่องเตียง จำนวนผู้เข้าพัก และห้องที่เชื่อมถึงกัน สอบถามรีสอร์ทก่อนจองได้ โดยแจ้งวันที่ต้องการเข้าพักไปด้วย",
};

/** glossary.json → phrases.accessConversation */
const ACCESS_NOTE: L = {
  en: "If steps, distances or getting around matter for your stay, contact the resort to talk it through privately before you book.",
  th: "หากมีข้อจำกัดเรื่องขั้นบันได ระยะทางเดิน หรือการเคลื่อนไหว ติดต่อรีสอร์ทเพื่อพูดคุยเป็นการส่วนตัวก่อนจองได้",
};

/**
 * Contract §8, "Stairs": only for the two categories whose photo sets show steps to a rooftop terrace
 * (02_07 and 02_14 for Deluxe Balcony; 04_17 and 04_23 for Executive Pool Spa). It describes the
 * photographs, not the building as it is today, and each gallery below carries one of those frames.
 * The two wordings follow what the frames show: steps leading to the terrace (02_07, 02_14) and steps
 * on the terrace itself (04_17).
 */
const STEPS_TO_ROOFTOP_NOTE: L = {
  en: "The photographs of this room show steps up to the rooftop terrace. If steps matter for your stay, contact the resort to talk it through privately before you book.",
  th: "ในภาพถ่ายของห้องนี้จะเห็นบันไดขึ้นไปยังดาดฟ้า หากมีข้อจำกัดเรื่องขั้นบันไดหรือการเคลื่อนไหว ติดต่อรีสอร์ทเพื่อพูดคุยเป็นการส่วนตัวก่อนจองได้",
};
const STEPS_ON_ROOFTOP_NOTE: L = {
  en: "The photographs of this room show steps on the rooftop terrace. If steps matter for your stay, contact the resort to talk it through privately before you book.",
  th: "ในภาพถ่ายของห้องนี้จะเห็นขั้นบันไดบนดาดฟ้า หากมีข้อจำกัดเรื่องขั้นบันไดหรือการเคลื่อนไหว ติดต่อรีสอร์ทเพื่อพูดคุยเป็นการส่วนตัวก่อนจองได้",
};

/* ───────────── Facts shared by all three categories ───────────── */

// RM-07
const balcony = (): Fact<boolean> =>
  fact(
    true,
    "source-listed",
    ["S-11", "S-02", "S-06", "S-16"],
    "Listed under each category on the resort's room page; Google's description and the Sept 2026 Deluxe Balcony post agree. Thai support is S-09 and S-06 (the /th/ room page is the same English text).",
  );

// RM-29
const sharedPoolAccess = (): Fact<boolean> =>
  fact(
    true,
    "source-listed",
    ["S-03"],
    "The booking engine lists the outdoor pool as a hotel-level amenity on every room; nothing limits it by category. Hours, distance and any cart transport are unknown (FA-02, FA-03).",
  );

// RM-19
const connectingRooms = (): Fact<boolean> =>
  unknown<boolean>("No source. Two rooms per building (Thai About, layout map) is not evidence of a connecting door. Owner question Q-21.", ["S-09", "S-17"]);

// RM-28
const view = (): Fact<L> =>
  fact<L>(
    { en: "Gardens, trees and hills", th: "สวน ต้นไม้ และเนินเขา" },
    "source-listed",
    ["S-06", "S-02", "S-16"],
    "General wording only: the Sept 2026 Deluxe Balcony post describes a garden-and-forest view and Google's text gives balconies forest views. Which room sees what is unknown. Never 'panoramic', 'unobstructed' or a promise for one room.",
  );

// RM-18
const occupancy = (): Room["occupancy"] => ({
  maxAdults: unknown<number>(
    "Candidate: 3. The booking engine shows 'Max Adults: 3' for all three categories (7 Oct 2026); no second source. '2 Adults' is only its default search. Owner question Q-16.",
    ["S-03"],
  ),
  maxChildren: unknown<number>("Candidate: 1. The booking engine shows 'Max Child: 1' for all three categories (7 Oct 2026); no second source. Owner question Q-16.", ["S-03"]),
  maxTotal: unknown<number>("No source states a combined maximum. Owner questions Q-12, Q-16.", ["S-03"]),
  childRule: unknown<L>(
    "Sources disagree and none is the resort's own statement. Trip.com: all ages welcome, cots on request, a charged extra bed (ledger PO-07, PO-08). Booking engine: one child per room. Our report S-27: 12 and over charged as adults. Owner question Q-12.",
    ["S-19", "S-03", "S-27"],
  ),
});

const SIZE_SOURCES: SourceId[] = ["S-11", "S-09", "S-03", "S-19"];

// RM-20
const access = (stepsNote: string): Room["access"] => ({
  rooftop: unknown<L>(`How the rooftop is reached has no current source. ${stepsNote} Owner question Q-18.`, ["S-16"]),
  steps: unknown<L>(`No assessed information about steps, gradients or step-free routes. ${stepsNote} Owner question Q-21.`, ["S-16"]),
  bathroom: unknown<L>("No source describes bathroom access (thresholds, door widths, grab rails). Owner question Q-21.", []),
});

/* ───────────── Rooms ───────────── */

export const rooms: Room[] = [
  {
    id: "deluxe-balcony",
    order: 1,
    name: "Deluxe Balcony",
    gloss: { en: "room with a balcony and a private rooftop", th: "ห้องพักพร้อมระเบียงและดาดฟ้าส่วนตัว" },
    // The glossary sentence with its last clause brought into line with contract §2 (a private bathroom, nothing more),
    // and "every room type", as the Thai says: the ledger lists a private rooftop per category (RM-04 to RM-06),
    // not for every individual room (owner question Q-18 is open).
    distinction: {
      en: "The balcony and private rooftop that every room type here has, with a private bathroom.",
      th: "มีระเบียงและดาดฟ้าส่วนตัวเหมือนห้องพักทุกแบบของที่นี่ พร้อมห้องน้ำในตัว",
    },
    summary: {
      en: "Deluxe Balcony has a balcony and a private rooftop of its own. It is the simplest of the three room types: the same two outdoor spaces as the others, with a private bathroom. On clear evenings, the rooftop is a good place to watch the stars come out.",
      th: "ห้อง Deluxe Balcony มีระเบียงและดาดฟ้าส่วนตัวเป็นของห้องเอง เป็นแบบที่เรียบง่ายกว่าอีกสองแบบ มีพื้นที่กลางแจ้งสองส่วนเหมือนกัน พร้อมห้องน้ำในตัว ในคืนที่ฟ้าเปิด ดาดฟ้าเป็นมุมที่เหมาะกับการนั่งดูดาว",
    },
    outdoors: OUTDOORS,
    bathing: { en: "Private bathroom", th: "ห้องน้ำในตัว" },
    provider: { roomTypeId: "4937900000000000001", providerName: "Deluxe Balcony" },
    active: true,
    lastVerified: "2026-10-07",

    area: {
      indoorSqm: unknown<number>(
        "Sources conflict (RESEARCH §4.3). Legacy room page: 30 m² ground floor. Thai About: about 50 m² 'usable area'. Booking engine and Trip.com: 40 m², no basis stated. Owner question Q-17.",
        SIZE_SOURCES,
      ),
      terraceSqm: unknown<number>("No source gives a figure for the balcony. Owner question Q-17.", SIZE_SOURCES),
      rooftopSqm: unknown<number>("Candidate: 25 m² (legacy room page, '30 m² + 25 m²', ground floor + rooftop). No second source. Owner question Q-17.", SIZE_SOURCES),
      totalSqm: unknown<number>("Never summed for the guest. 30 + 25 = 55 against the Thai About's 'about 50' and the engine's 40; the bases differ. Owner question Q-17.", SIZE_SOURCES),
    },
    occupancy: occupancy(),
    beds: unknown<L>(
      "Sources conflict (RESEARCH §4.4). Legacy room page: '7 ft. King-bed'. Trip.com: 1 king or 2 singles. 2015 photographs: one large bed (02_01–02_03) and a two-bed layout (02_04, switched off). Owner question Q-16.",
      ["S-11", "S-19", "S-16"],
    ),
    features: {
      balcony: balcony(),
      // RM-04
      privateRooftop: fact(
        true,
        "source-listed",
        ["S-11", "S-06", "S-16"],
        "Listed on the room page; a 2 Sep 2026 post about this category describes going up to the roof at night; 2015 photographs 02_10–02_14.",
      ),
      // RM-08
      bathtub: fact(
        false,
        "source-listed",
        ["S-11", "S-03"],
        "False on the strength of the category distinction alone: the room page lists no tub and the next category is defined by its bathtub. Guest copy says 'a private bathroom' and nothing more; no source uses the word 'shower' for this category. Owner question Q-20.",
      ),
      rooftopSpaTub: fact(false, "source-listed", ["S-11"], "The rooftop spa tub is listed for Executive Pool Spa only (RM-10)."),
      sharedPoolAccess: sharedPoolAccess(),
      connectingRooms: connectingRooms(),
    },
    access: access("2015 photographs 02_07 and 02_14 show steps between the balcony level and the rooftop terrace; usable only as a line about the photographs (contract §8)."),
    view: view(),
    amenities: SIX_AMENITIES,
    goodToKnow: {
      en: [POOL_NOTE.en, BREAKFAST_NOTE.en, ASK_BEDS_NOTE.en, STEPS_TO_ROOFTOP_NOTE.en],
      th: [POOL_NOTE.th, BREAKFAST_NOTE.th, ASK_BEDS_NOTE.th, STEPS_TO_ROOFTOP_NOTE.th],
    },
    media: {
      lead: "rooftop-round-table-lounger-field-view", // 02_13
      gallery: [
        "blue-room-bed-facing-balcony-door", // 02_01  sleeping area
        "olive-room-bed-open-balcony-door", // 02_03  sleeping area, balcony door open
        "striped-headboard-painting-bedside-lamp", // 02_06  detail (portrait)
        "balcony-woven-table-chair-steps", // 02_07  balcony (portrait; shows steps)
        "rooftop-terrace-table-screen-steps-down", // 02_14  rooftop terrace (shows steps)
        "rooftop-round-table-lounger-field-view", // 02_13  rooftop terrace — the lead
        "rooftop-lounger-cushions-hill-view", // 02_11  rooftop, looking out
      ],
    },
    alternatives: ["deluxe-bathtub", "executive-pool-spa"],
  },

  {
    id: "deluxe-bathtub",
    order: 2,
    name: "Deluxe Bathtub",
    gloss: { en: "room with a bathtub", th: "ห้องพักพร้อมอ่างอาบน้ำ" },
    distinction: {
      en: "The room to choose for a bath: a bathtub, along with the balcony and private rooftop.",
      th: "เลือกห้องนี้หากอยากมีอ่างอาบน้ำ พร้อมระเบียงและดาดฟ้าส่วนตัวเช่นเดียวกับห้องอื่น",
    },
    summary: {
      en: "Deluxe Bathtub is the room to choose if a bath matters to you. It has a bathtub, along with the balcony and private rooftop that every room type here has. In the photographs, the tub sits beside a window that looks onto trees.",
      th: "ห้อง Deluxe Bathtub เหมาะกับคนที่อยากนอนแช่น้ำในอ่าง ห้องนี้มีอ่างอาบน้ำ พร้อมระเบียงและดาดฟ้าส่วนตัวเช่นเดียวกับห้องพักทุกแบบของที่นี่ ในภาพถ่าย อ่างตั้งอยู่ริมช่องหน้าต่างที่มองออกไปเห็นต้นไม้",
    },
    outdoors: OUTDOORS,
    bathing: { en: "Bathtub", th: "อ่างอาบน้ำ" },
    provider: { roomTypeId: "4937900000000000002", providerName: "Deluxe with Bathtub" },
    active: true,
    lastVerified: "2026-10-07",

    area: {
      indoorSqm: unknown<number>(
        "Sources conflict (RESEARCH §4.3). Legacy room page: 30 m² ground floor. Thai About: about 50 m² 'usable area'. Booking engine: 40 m², no basis stated. Trip.com shows a 30 m² 'Balcony And Bathtub' product with no counterpart on a resort channel. Owner question Q-17.",
        SIZE_SOURCES,
      ),
      terraceSqm: unknown<number>("No source gives a figure for the balcony. Owner question Q-17.", SIZE_SOURCES),
      rooftopSqm: unknown<number>("Candidate: 25 m² (legacy room page, '30 m² + 25 m²', ground floor + rooftop). No second source. Owner question Q-17.", SIZE_SOURCES),
      totalSqm: unknown<number>("Never summed for the guest. 30 + 25 = 55 against the Thai About's 'about 50' and the engine's 40; the bases differ. Owner question Q-17.", SIZE_SOURCES),
    },
    occupancy: occupancy(),
    beds: unknown<L>(
      "Sources conflict (RESEARCH §4.4). Legacy room page: '6 ft. King-bed'. Trip.com: 1 queen, and 1 double for its 'Balcony And Bathtub' product. 2015 photographs: one four-poster bed (03_01–03_03). Owner question Q-16.",
      ["S-11", "S-19", "S-16"],
    ),
    features: {
      balcony: balcony(),
      // RM-05
      privateRooftop: fact(
        true,
        "source-listed",
        ["S-11"],
        "Listed on the room page. The thinnest of the three: no rooftop picture exists in this category's photo set and no current post is about this category. Owner question Q-18.",
      ),
      // RM-09
      bathtub: fact(true, "source-listed", ["S-11", "S-03", "S-16"], "The category name on both official sources. Photograph 03_11 shows a built-in white tub beside a window."),
      rooftopSpaTub: fact(false, "source-listed", ["S-11"], "The rooftop spa tub is listed for Executive Pool Spa only (RM-10)."),
      sharedPoolAccess: sharedPoolAccess(),
      connectingRooms: connectingRooms(),
    },
    access: access("No photograph in this category's set shows a rooftop or steps: say nothing about stairs here beyond the invitation to talk (contract §8)."),
    view: view(),
    amenities: SIX_AMENITIES,
    goodToKnow: {
      en: [POOL_NOTE.en, BREAKFAST_NOTE.en, ASK_BEDS_NOTE.en, ACCESS_NOTE.en],
      th: [POOL_NOTE.th, BREAKFAST_NOTE.th, ASK_BEDS_NOTE.th, ACCESS_NOTE.th],
    },
    media: {
      lead: "bathtub-wooden-surround-trees-hill-view", // 03_11
      // Only four usable frames are catalogued against this room; all four are used and none is borrowed.
      gallery: [
        "four-poster-bed-balcony-green-hillside", // 03_03  sleeping area, balcony beyond
        "four-poster-bed-desk-window-alcove", // 03_01  sleeping area, desk and alcove
        "bathtub-wooden-surround-trees-hill-view", // 03_11  the bathtub — the lead
        "four-poster-bed-balcony-door-roses", // 03_02  towards the balcony door
      ],
    },
    alternatives: ["executive-pool-spa", "deluxe-balcony"],
  },

  {
    id: "executive-pool-spa",
    order: 3,
    name: "Executive Pool Spa",
    gloss: { en: "room with a circular spa tub on its private rooftop", th: "ห้องพักพร้อมอ่างแช่ตัวทรงกลมบนดาดฟ้าส่วนตัว" },
    distinction: {
      en: "A circular spa tub on its private rooftop, for a soak in the open air; it is a tub, not a swimming pool.",
      th: "มีอ่างแช่ตัวทรงกลมบนดาดฟ้าส่วนตัว ไว้นอนแช่กลางแจ้ง เป็นอ่างแช่ตัว ไม่ใช่สระว่ายน้ำ",
    },
    summary: {
      en: "Executive Pool Spa has a circular spa tub on its private rooftop; in the photographs it sits under a timber pergola. It is a tub for soaking in the open air, not a swimming pool. The room also has a balcony, as every room type here does.",
      th: "ห้อง Executive Pool Spa มีอ่างแช่ตัวทรงกลมบนดาดฟ้าส่วนตัว ในภาพถ่าย อ่างตั้งอยู่ใต้ซุ้มไม้ เป็นอ่างสำหรับนอนแช่กลางแจ้ง ไม่ใช่สระว่ายน้ำ ห้องนี้มีระเบียงเช่นเดียวกับห้องพักทุกแบบของที่นี่",
    },
    outdoors: OUTDOORS,
    bathing: { en: "Circular spa tub on the rooftop", th: "อ่างแช่ตัวทรงกลมบนดาดฟ้า" },
    provider: { roomTypeId: "4937900000000000003", providerName: "Executive Pool Spa" },
    active: true,
    lastVerified: "2026-10-07",

    area: {
      indoorSqm: unknown<number>(
        "Sources conflict (RESEARCH §4.3). Legacy room page: 50 m² ground floor. Thai About: 60 m² plus a 30 m² 'mid-sized hall'. Booking engine: 50 m², no basis stated. Owner question Q-17.",
        SIZE_SOURCES,
      ),
      terraceSqm: unknown<number>("No source gives a figure for the balcony. Owner question Q-17.", SIZE_SOURCES),
      rooftopSqm: unknown<number>("Candidate: 50 m² (legacy room page, '50 m² + 50 m²', ground floor + rooftop). No second source. Owner question Q-17.", SIZE_SOURCES),
      totalSqm: unknown<number>("Never summed for the guest. 50 + 50 = 100 against the Thai About's 60 + 30 = 90 and the engine's 50; the bases differ. Owner question Q-17.", SIZE_SOURCES),
    },
    occupancy: occupancy(),
    beds: unknown<L>(
      "Sources conflict (RESEARCH §4.4). Legacy room page: '7 ft. King-bed'. Trip.com: 1 king or 2 singles. 2015 photographs: one large bed (04_01–04_06). Owner question Q-16.",
      ["S-11", "S-19", "S-16"],
    ),
    features: {
      balcony: balcony(),
      // RM-06
      privateRooftop: fact(
        true,
        "source-listed",
        ["S-11", "S-09", "S-16"],
        "Room page; the Thai About places the large tub on a private rooftop; photographs 04_24–04_34.",
      ),
      bathtub: unknown<boolean>("No source says whether this room also has an indoor bathtub. Nothing is said about bathing here beyond the rooftop spa tub.", ["S-11", "S-03"]),
      // RM-10 … RM-13
      rooftopSpaTub: fact(
        true,
        "source-listed",
        ["S-11", "S-09", "S-16", "S-02"],
        "A circular tub set into the roof terrace (photographs 04_24, 04_28, 04_30, 04_34). A tub for soaking, not a swimming pool. Never claimed: volume (the legacy page says 1,000 litres), heating, jets, temperature, 'Jacuzzi', 'private pool'. Owner question Q-19.",
      ),
      sharedPoolAccess: sharedPoolAccess(),
      connectingRooms: connectingRooms(),
    },
    access: access("2015 photographs 04_17 and 04_23 show steps on the rooftop terrace; usable only as a line about the photographs (contract §8)."),
    view: view(),
    amenities: SIX_AMENITIES,
    // Opens with the pool / spa-tub clarification, which carries the shared-pool sentence the other two rooms open with.
    goodToKnow: {
      en: [POOL_SPA_CLARIFICATION.en, SPA_TUB_ASK_NOTE.en, BREAKFAST_NOTE.en, ASK_BEDS_NOTE.en, STEPS_ON_ROOFTOP_NOTE.en],
      th: [POOL_SPA_CLARIFICATION.th, SPA_TUB_ASK_NOTE.th, BREAKFAST_NOTE.th, ASK_BEDS_NOTE.th, STEPS_ON_ROOFTOP_NOTE.th],
    },
    media: {
      lead: "rooftop-spa-tub-pergola-hill-view", // 04_24
      gallery: [
        "bedroom-dusk-taupe-curtains-balcony-doors", // 04_03  sleeping area
        "desk-brass-lamp-balcony-chairs-dusk", // 04_07  desk, balcony beyond
        "bathroom-glass-door-timber-shower-area", // 04_12  bathroom (portrait)
        "balcony-wooden-swing-seat-dusk", // 04_18  balcony (portrait)
        "rooftop-terrace-pergola-steps-golden-hour", // 04_17  rooftop terrace (shows steps)
        "rooftop-spa-tub-pergola-hill-view", // 04_24  the spa tub by day — the lead
        "brass-elephant-spout-spa-tub-low-sun", // 04_30  detail at the tub
        "rooftop-terrace-green-parasol-field-view", // 04_34  rooftop seating by day
        "rooftop-terrace-dusk-wall-lamps-spa-tub", // 04_27  rooftop at dusk (never with 04_25 on one page)
      ],
    },
    alternatives: ["deluxe-bathtub", "deluxe-balcony"],
  },
];

const byId = new Map<RoomId, Room>(rooms.map((r) => [r.id, r]));

export function getRoom(id: RoomId): Room {
  const room = byId.get(id);
  if (!room) throw new Error(`Unknown room "${id}".`);
  return room;
}

/**
 * The room's photographs other than the lead, in sequence — for a layout that already shows the lead on
 * its own. (`room.media.gallery` itself is the complete set for "View all photos" and includes the lead.)
 */
export function galleryWithoutLead(room: Room): AssetId[] {
  return room.media.gallery.filter((id) => id !== room.media.lead);
}
