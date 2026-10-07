import type { L } from "@/content/schema";

/**
 * The few words the media components print for themselves. `{caption}` and `{room}` are filled from
 * the photograph catalogue and src/content/rooms.ts; nothing here is a fact.
 *
 *   open   the accessible name of a photograph that opens the viewer
 *   room   how a room photograph's caption is led by its room type. The three names are proper names
 *          in Latin script; Thai puts the classifier before them (docs/VOICE.md section 5).
 */
export interface MediaCopy {
  open: string;
  room: string;
}

export const mediaCopy = {
  en: {
    open: "Open photograph: {caption}",
    room: "{room}: {caption}",
  },
  th: {
    open: "เปิดดูภาพ {caption}",
    room: "ห้อง {room} {caption}",
  },
} satisfies L<MediaCopy>;
