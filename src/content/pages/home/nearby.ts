import type { L, NearbyPlace } from "@/content/schema";

/**
 * Homepage chapter 06, "Around Khao Yai", and the words of the places list it holds.
 *
 * Two exports:
 *   copy     the chapter's own rail (kicker, title, intro, the onward link)
 *   places   everything <PlacesFilter> prints, on whichever page it is used (home, Location)
 *
 * Sources: the heading wording is BUILD-CONTRACT section 8 ("Places to visit around Khao Yai", never
 * "nearby"); the note is glossary phrases.notInPark, word for word; the link label is glossary
 * pageNames.location. The places themselves, their names, blurbs and links, are facts and live in
 * src/content/nearby.ts. Nothing here counts them or names a kind of place as a fact: the list is free
 * to change without a sentence going stale.
 *
 * Rules these strings follow: no distance, journey time, opening hour or price; no closeness claim of
 * any kind; the vineyards are estates to visit. No middle dots and no dashes. Third person.
 */

type Group = NearbyPlace["group"];

interface NearbyCopy {
  /** The small label above the title. Also what the chapter index calls this chapter. */
  kicker: string;
  /**
   * The chapter title. English sets its first word as the one italic accent; Thai is one phrase and
   * `accent` is empty (Thai is never italic).
   */
  title: { accent: string; rest: string };
  intro: string;
  /** Names its destination: the Location page. */
  locationLink: string;
}

export const copy = {
  en: {
    kicker: "Places to visit",
    title: { accent: "Around", rest: "Khao Yai" },
    intro: "A short list for a day out from the garden. Each place has its own page, and that page is where to check before setting out.",
    locationLink: "Location and getting here",
  },
  th: {
    kicker: "สถานที่น่าแวะ",
    title: { accent: "", rest: "รอบเขาใหญ่" },
    intro: "สำหรับวันที่อยากออกไปเที่ยวนอกรีสอร์ท แต่ละแห่งมีหน้าเว็บของตัวเอง ควรเปิดดูก่อนออกเดินทาง",
    locationLink: "ที่ตั้งและการเดินทาง",
  },
} satisfies L<NearbyCopy>;

interface PlacesCopy {
  /** Names the list for assistive technology. The contract's own heading. */
  heading: string;
  /** Names the row of filter chips. */
  filterLabel: string;
  all: string;
  /** Chip labels: the groups, in the plural. */
  groups: Record<Group, string>;
  /** The kind printed on each row: the same groups, in the singular. */
  kinds: Record<Group, string>;
  /** How many places are showing. `{count}` marks the figure. Announced politely when the filter changes. */
  count: { one: string; other: string };
  /** What the link on a row leads to, by the kind of page it is. */
  link: { website: string; facebook: string };
  /** Said to assistive technology after each place link. */
  newTab: string;
  /** Glossary phrases.notInPark: printed under the list, because the national park is on it. */
  note: string;
}

export const places = {
  en: {
    heading: "Places to visit around Khao Yai",
    filterLabel: "Show places by kind",
    all: "All",
    groups: { vineyards: "Vineyards", temples: "Temples", nature: "Nature", cafes: "Cafés" },
    kinds: { vineyards: "Vineyard", temples: "Temple", nature: "Nature", cafes: "Café" },
    count: { one: "{count} place", other: "{count} places" },
    link: { website: "Website", facebook: "Facebook page" },
    newTab: "opens in a new tab",
    note: "The resort is in the Khao Yai area, not inside the national park.",
  },
  th: {
    heading: "สถานที่น่าแวะรอบเขาใหญ่",
    filterLabel: "เลือกดูตามประเภทสถานที่",
    all: "ทั้งหมด",
    groups: { vineyards: "ไร่องุ่น", temples: "วัด", nature: "ธรรมชาติ", cafes: "คาเฟ่" },
    kinds: { vineyards: "ไร่องุ่น", temples: "วัด", nature: "ธรรมชาติ", cafes: "คาเฟ่" },
    count: { one: "{count} แห่ง", other: "{count} แห่ง" },
    link: { website: "เว็บไซต์", facebook: "เพจ Facebook" },
    newTab: "เปิดในแท็บใหม่",
    note: "รีสอร์ทอยู่ในย่านเขาใหญ่ ไม่ได้อยู่ในเขตอุทยานแห่งชาติเขาใหญ่",
  },
} satisfies L<PlacesCopy>;

export type { PlacesCopy };
