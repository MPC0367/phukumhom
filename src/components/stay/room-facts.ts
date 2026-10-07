import type { AmenityId, AssetId, Locale, Room, RoomId } from "@/content/schema";
import { pub } from "@/content/schema";
import { getAsset, isUsable } from "@/content/assets";
import { amenities, rooms } from "@/content/rooms";

/**
 * What the room stage and the comparison read from src/content/rooms.ts, in one place, so the two can
 * never state a room differently. SERVER ONLY: it reads the room ledger (with its developer notes) and
 * the photograph catalogue. Client islands receive the strings and rendered nodes built from it.
 *
 * Nothing here adds a fact. Every function either passes a value from the ledger through `pub()` or
 * arranges values the ledger marks as always publishable (`outdoors`, `bathing`, `amenities`, `goodToKnow`).
 */

/** The room types on sale, in their fixed order. */
export function activeRooms(): Room[] {
  return rooms.filter((room) => room.active).sort((a, b) => a.order - b.order);
}

/** 1 → "01". */
export function roomNumeral(room: Room): string {
  return String(room.order).padStart(2, "0");
}

/** "Balcony and private rooftop", only while both features are publishable facts for this room type. */
export function outdoorsFact(room: Room, lang: Locale): string | null {
  return pub(room.features.balcony) === true && pub(room.features.privateRooftop) === true ? room.outdoors[lang] : null;
}

/** The bathing fact is a restatement of published features and always printable (rooms.ts). */
export function bathingFact(room: Room, lang: Locale): string {
  return room.bathing[lang];
}

/**
 * Whether the bathing fact is what sets this room type apart: a bathtub, or the rooftop spa tub, listed
 * as a publishable fact. Deluxe Balcony is the plain case and carries no mark. The mark says "this is the
 * difference", never "only here": no source says where else a bathtub may or may not be found.
 */
export function bathingSetsApart(room: Room): boolean {
  return pub(room.features.bathtub) === true || pub(room.features.rooftopSpaTub) === true;
}

/** A list in running text: commas in English (the first item keeps its capital), spaces in Thai. */
export function joinList(items: string[], lang: Locale): string {
  if (lang === "th") return items.join(" ");
  return items.map((item, index) => (index === 0 ? item : item.charAt(0).toLowerCase() + item.slice(1))).join(", ");
}

export function amenityLabels(ids: AmenityId[], lang: Locale): string[] {
  return ids.map((id) => amenities[id].label[lang]);
}

/**
 * The four amenities named on a stage chip, where there is room for one line. All of them are in the
 * room's own list; the comparison and the room page print the whole list. The private bathroom is left
 * out here because the Bathing chip beside it already says how each room type is equipped.
 */
const STAGE_AMENITIES: AmenityId[] = ["air-conditioning", "refrigerator", "television", "coffee-tea"];

export function amenitySummary(room: Room, lang: Locale): string | null {
  const ids = STAGE_AMENITIES.filter((id) => room.amenities.includes(id));
  return ids.length > 0 ? joinList(amenityLabels(ids, lang), lang) : null;
}

/** Notes every listed room type carries, in the first room's order: said once, under the comparison. */
export function sharedNotes(list: Room[], lang: Locale): string[] {
  if (list.length === 0) return [];
  const [first, ...rest] = list;
  return first.goodToKnow[lang].filter((note) => rest.every((room) => room.goodToKnow[lang].includes(note)));
}

/** A room type's notes without the ones every room type shares. */
export function ownNotes(room: Room, list: Room[], lang: Locale): string[] {
  const shared = new Set(sharedNotes(list, lang));
  return room.goodToKnow[lang].filter((note) => !shared.has(note));
}

/**
 * The photograph that stands for a room type. The default is the room's catalogued lead. A page may
 * name another frame for a room (the homepage does, because Band A directly above the stage already
 * shows Deluxe Balcony's lead), but only a frame catalogued against that same room and cleared for use:
 * anything else throws, so a room can never be illustrated with another room's photograph.
 */
export function leadFor(room: Room, overrides?: Partial<Record<RoomId, AssetId>>): AssetId {
  const id = overrides?.[room.id];
  if (!id) return room.media.lead;
  const asset = getAsset(id);
  if (!asset.rooms.includes(room.id) || !isUsable(asset)) {
    throw new Error(`leadFor: "${id}" is not a usable photograph of ${room.id} (check its "rooms" and "uses" in the manifest).`);
  }
  return id;
}
