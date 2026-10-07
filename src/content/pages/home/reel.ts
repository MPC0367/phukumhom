import type { AssetId, L } from "@/content/schema";

/**
 * Homepage Band B, "the reel": a sand band with twelve photographs drifting past.
 *
 * Truth notes (BUILD-CONTRACT sections 4 and 8):
 * - Every frame is from the resort's own published set and is shown with the catalogue's caption, which
 *   says what that frame shows and nothing about how things are today.
 * - A room photograph is labelled with its own room type, read from the frame's catalogue entry.
 * - No middle dots and no dashes in any string.
 */

export interface ReelCopy {
  /** The band's heading, set as a kicker: glossary nav.gallery. */
  kicker: string;
  /** The display line. */
  line: string;
  /** The one word of the line set in italics; it must occur in `line`. Empty in Thai. */
  accent: string;
  /** One supporting sentence. */
  lead: string;
  /** Accessible name of the reel. */
  label: string;
  /** Shown only while the row can be dragged. */
  hint: string;
  /** The pill to the gallery page. */
  open: string;
}

export const copy = {
  en: {
    kicker: "Gallery",
    line: "The garden, the rooftops and the rooms, one frame at a time.",
    accent: "frame",
    lead: "The resort’s own photographs. Move along the row, or open any frame to see it whole.",
    label: "Photographs of the resort",
    hint: "Drag",
    open: "Open the gallery",
  },
  th: {
    kicker: "ภาพบรรยากาศ",
    line: "สวน ดาดฟ้า และห้องพัก ค่อยๆ ดูไปทีละภาพ",
    accent: "",
    lead: "ภาพถ่ายของรีสอร์ทเอง เลื่อนดูไปตามแถว หรือกดที่ภาพเพื่อดูเต็มจอ",
    label: "ภาพบรรยากาศของรีสอร์ท",
    hint: "ลากเพื่อเลื่อนดู",
    open: "ดูภาพทั้งหมด",
  },
} satisfies L<ReelCopy>;

/**
 * Twelve frames, in drifting order: day and dusk in turn, a wide frame beside a narrow one, and the
 * last beside the first without a seam (the row is endless).
 *
 *   gardens and grounds  01_01, 01_07, 01_12, 07_27, 05_41 (the shared pool)
 *   rooftops             04_20, 04_30, 04_17
 *   rooms                04_22 (Executive Pool Spa), 03_03 (Deluxe Bathtub), 02_01 (Deluxe Balcony)
 *   dining               01_27
 *
 * Left out on purpose, because the homepage already shows them or a near twin: the hero and rooftop
 * frames 01_24, 02_08, 04_24, 04_25, 04_27; the room leads 02_13 and 03_11; 01_25 and the plates of
 * chapter 04; the four tile frames of chapter 05 (01_21, 02_11, 05_45, 07_11) and with 01_21 the whole
 * set {01_19, 01_20, 01_23}; 01_05 (twin of 01_01); the reception frames 05_01 to 05_04, which belong
 * to "Getting here".
 */
export const HOME_REEL: Array<{ asset: AssetId; ratio: "3/2" | "4/3" | "1/1" | "3/4" | "16/9" }> = [
  { asset: "clay-buildings-hedge-columns-sunset-wide", ratio: "3/2" }, // 01_01
  { asset: "balcony-hanging-swing-daybed-garden-view", ratio: "3/4" }, // 04_22
  { asset: "shared-pool-open-pavilion-blue-sky", ratio: "3/2" }, // 05_41
  { asset: "four-poster-bed-balcony-green-hillside", ratio: "4/3" }, // 03_03
  { asset: "dining-pavilion-interior-woven-lamp-dusk", ratio: "3/4" }, // 01_27
  { asset: "rooftop-terrace-parasol-table-hill-view", ratio: "16/9" }, // 04_20
  { asset: "brass-elephant-spout-spa-tub-low-sun", ratio: "4/3" }, // 04_30
  { asset: "building-entrance-teal-curtains-clipped-hedges", ratio: "1/1" }, // 01_07
  { asset: "topiary-forecourt-pergola-buildings-blue-hour", ratio: "3/2" }, // 01_12
  { asset: "blue-room-bed-facing-balcony-door", ratio: "4/3" }, // 02_01
  { asset: "pond-islet-yellow-leaved-tree", ratio: "3/2" }, // 07_27
  { asset: "rooftop-terrace-pergola-steps-golden-hour", ratio: "4/3" }, // 04_17
];
