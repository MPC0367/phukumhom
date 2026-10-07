import { fact, unknown, type Fact, type L, type SourceId, type Status } from "./schema";

/**
 * Dining and the kitchen garden.
 *
 * Two things are publishable (docs/BUILD-CONTRACT.md §2, docs/RESEARCH.md §3.3):
 *   1. the breakfast line — it depends on the rate, and each rate on the booking page says so;
 *   2. the kitchen-garden narrative, written as what the resort describes and what varies by season.
 * A restaurant exists on site (DG-01) and is called "the resort's restaurant" / ร้านอาหารของรีสอร์ท.
 * Its name, hours, menu, dietary handling, service to non-residents and room service are all
 * `needs-confirmation`: the page designs around those holes and offers a route to ask the team.
 *
 * Never: a menu, a breakfast format or hours, wine, "organic", "pesticide-free", "farm-to-table".
 * Food photographs are captioned as the plate — not as a dish on the menu and not as breakfast.
 *
 * Keep this module on the server: `roomService` stores an unpublished candidate value, so it must never
 * be imported from a "use client" file.
 */
export interface DiningContent {
  restaurantName: Fact<L>;
  breakfast: Fact<L>;
  hours: Fact<L>;
  menu: Fact<L>;
  dietary: Fact<L>;
  nonResidents: Fact<L>;
  roomService: Fact<boolean>;
  kitchenGarden: {
    status: Status;
    sources: SourceId[];
    /** Short paragraphs in reading order. Render only when `status` is publishable. */
    points: L<string[]>;
  };
}

export const dining: DiningContent = {
  // DG-02
  restaurantName: unknown<L>(
    "Candidates conflict and no resort channel names it: our report S-27 gives 'Sala Thong' (ศาลาทอง) without a source; Trip.com shows 'Sala Thongkum'. Guest copy says 'the resort's restaurant'. Owner question Q-24.",
    ["S-27", "S-19"],
  ),

  // DG-11 — glossary.json → phrases.breakfast (the contract's own wording)
  breakfast: fact<L>(
    {
      en: "Whether breakfast is included depends on the rate you choose; each rate on the booking page says so.",
      th: "อาหารเช้าจะรวมอยู่ในค่าห้องหรือไม่ ขึ้นอยู่กับราคาที่เลือก โดยหน้าจองระบุไว้ในแต่ละราคา",
    },
    "source-listed",
    ["S-03", "S-02", "S-06"],
    "Every rate plan the engine showed on 7 Oct 2026 said 'Breakfast Included'; Google and the Sept 2026 posts call breakfast free. The conditional wording is the contract's. Format, menu and hours are unknown (DG-12): never described. Owner question Q-23.",
  ),

  // DG-03
  hours: unknown<L>("No source gives restaurant hours. Traveloka's breakfast window is a travel-site field, not a resort statement (DG-12). Owner question Q-24."),

  // DG-04, DG-05
  menu: unknown<L>(
    "No current menu exists in any source: only 2015 food photographs and dish names of unstated origin in S-27. No wine claim (legacy copy and 2015 photographs only). Owner question Q-24.",
    ["S-16", "S-27"],
  ),

  dietary: unknown<L>("No source. A dietary request is an enquiry to the team, never a guarantee of a specific diet or allergen-free preparation."),

  nonResidents: unknown<L>("No source says whether visitors who are not staying may eat at the restaurant. Owner question Q-24."),

  // DG-14
  roomService: fact<boolean>(true, "needs-confirmation", ["S-03"], "Candidate only: the booking engine's hotel-amenity list includes room service; no second source. Not rendered."),

  // DG-07 … DG-10
  kitchenGarden: {
    status: "source-listed",
    sources: ["S-09", "S-11"],
    points: {
      en: [
        // glossary.json → phrases.kitchenGardenSeasonal
        "The resort describes a small kitchen garden of its own. What it gives changes with the season, so no two stays find quite the same things.",
        "In its own account, purple winged beans, purple yardlong beans and salad leaves are among what grows there.",
        "The same account mentions homemade things to take home: dried tomatoes and mulberry jam.",
        "It also speaks of a welcome drink made from whatever fruit is in season, naming marian plum, star fruit, mulberry and gac.",
        "None of this is fixed for a particular stay. Ask the team what the garden is giving when you visit.",
      ],
      th: [
        // glossary.json → phrases.kitchenGardenSeasonal
        "รีสอร์ทเล่าว่ามีสวนครัวแปลงเล็กของตัวเอง ผลผลิตเปลี่ยนไปตามฤดูกาล แต่ละช่วงที่เข้าพักจึงไม่เหมือนกัน",
        "ผักที่รีสอร์ทเอ่ยถึงว่าปลูกในสวนครัว มีถั่วพูม่วง ถั่วฝักยาวสีม่วง และผักสลัด",
        "รีสอร์ทยังเล่าถึงของฝากทำเอง คือมะเขือเทศอบแห้งและแยมมัลเบอร์รี",
        "ส่วนเครื่องดื่มต้อนรับ รีสอร์ทเล่าว่าทำจากผลไม้ตามฤดูกาล ผลไม้ที่เอ่ยถึงมีมะปราง มะเฟือง มัลเบอร์รี และฟักข้าว",
        "ทั้งหมดนี้เปลี่ยนไปตามฤดูกาล ไม่ได้มีเหมือนกันทุกช่วง สอบถามทีมงานได้ว่าช่วงที่เข้าพักสวนครัวให้อะไรบ้าง",
      ],
    },
  },
};
