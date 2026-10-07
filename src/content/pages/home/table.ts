import type { AssetId, L } from "@/content/schema";

/**
 * Homepage chapter 04, "Garden and table": the wording around the facts.
 *
 * The facts themselves are not here. The statement and the two notes are printed from
 * `dining.kitchenGarden.points` (src/content/dining.ts), which is the resort's own account of its
 * kitchen garden and is written as an account: what it describes, what varies by season, nothing a
 * stay can be promised. The pill and the restaurant's name come from src/i18n/ui.ts.
 *
 * Truth notes (BUILD-CONTRACT sections 2 and 8):
 * - No menu, no hours, no wine, no "organic", nothing that reads as farm to table.
 * - The photographs are captioned by the catalogue as the plate or the garden bed they show. None of
 *   them is a dish on a menu and none is "breakfast": the two breakfast-table frames are left out of
 *   this reel so that no picture suggests a breakfast format.
 * - No middle dots and no dashes in any string.
 */

export interface TableCopy {
  /** Rail kicker: glossary home.sections.garden.label. */
  kicker: string;
  /** Rail title: one word, set at chapter size. */
  title: string;
  /** Rail intro, two or three short lines. */
  intro: string;
  /**
   * The one word of the statement set in italics. It must occur in the first kitchen-garden point.
   * Empty in Thai, which is never italicised.
   */
  accent: string;
  /** Small labels over the two notes. */
  notes: { garden: string; season: string };
  /** Small heading over the reel. */
  reelKicker: string;
  /** Accessible name of the reel. */
  reelLabel: string;
  /** Shown only while the row can be dragged. */
  reelHint: string;
  /** Says what the reel is and is not. */
  reelNote: string;
}

export const copy = {
  en: {
    kicker: "Garden and table",
    title: "Table",
    intro: "What the resort says of its kitchen garden, and the dining pavilion on the lawn.",
    accent: "season",
    notes: { garden: "In the garden", season: "By the season" },
    reelKicker: "Plates and garden beds",
    reelLabel: "Photographs of plates and garden beds",
    reelHint: "Drag",
    reelNote: "The photographs show single plates, drinks and garden beds. They are not a menu.",
  },
  th: {
    kicker: "สวนครัวและร้านอาหาร",
    title: "ร้านอาหาร",
    intro: "สวนครัวตามคำบอกเล่าของรีสอร์ท และศาลาอาหารบนสนามหญ้า",
    accent: "",
    notes: { garden: "ในสวนครัว", season: "ตามฤดูกาล" },
    reelKicker: "จานอาหารและแปลงผัก",
    reelLabel: "ภาพจานอาหารและแปลงผัก",
    reelHint: "ลากเพื่อเลื่อนดู",
    reelNote: "ภาพเหล่านี้คือจานอาหาร เครื่องดื่ม และแปลงผักที่ถ่ายไว้ ไม่ใช่รายการอาหาร",
  },
} satisfies L<TableCopy>;

/** The dining pavilion at dusk: legacy 01_25, catalogued for "dining" and "band". */
export const PAVILION: AssetId = "open-dining-pavilion-lawn-dusk";

/**
 * The reel: garden beds and plates in turn, so no two frames of one kind sit side by side.
 *
 * Left out on purpose: 07_11 (gac fruit: it leads the kitchen garden tile in the next chapter), 07_10
 * (a second red lettuce, too close to 07_09), 05_18 and 05_20 (they read as a breakfast table), 05_17
 * (stemmed glasses) and 05_38 (not catalogued for the gallery).
 */
export const TABLE_REEL: Array<{ asset: AssetId; ratio: "3/2" | "4/3" | "1/1" | "4/5" }> = [
  { asset: "red-lettuce-leaves-water-droplets", ratio: "1/1" }, // 07_09
  { asset: "mixed-leaf-salad-fruit-green-dressing", ratio: "4/3" }, // 05_30
  { asset: "serrated-salad-greens-garden-bed", ratio: "4/5" }, // 07_07
  { asset: "dried-shrimp-dip-carved-vegetables", ratio: "4/3" }, // 05_22
  { asset: "gourds-hanging-from-garden-trellis", ratio: "3/2" }, // 07_12
  { asset: "dark-red-iced-drinks-wooden-table", ratio: "1/1" }, // 05_31
  { asset: "frilly-green-lettuce-garden-bed", ratio: "1/1" }, // 07_08
  { asset: "fried-whole-fish-pineapple-banana-leaf", ratio: "4/3" }, // 05_39
  { asset: "clear-mushroom-soup-coriander-cup", ratio: "1/1" }, // 05_27
];
