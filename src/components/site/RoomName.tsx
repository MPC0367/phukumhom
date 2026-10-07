import type { Locale } from "@/content/schema";

/**
 * A room type's name where it stands alone — a link, a label, a list entry.
 *
 * The three names are proper names in Latin script in both languages (docs/VOICE.md section 5). In Thai
 * they follow the classifier, "ห้อง Deluxe Balcony", and the Latin part is marked `lang="en"` so it is
 * pronounced, hyphenated and typeset as English. In English the name is printed as it is.
 *
 *   <RoomName lang={lang} name={room.name} />
 *
 * It is always one element, so the space after the classifier survives inside a flex container
 * (a link that is `inline-flex` would otherwise turn "ห้อง " and the name into two items and drop it).
 */
export function RoomName({ lang, name }: { lang: Locale; name: string }) {
  if (lang !== "th") return <span>{name}</span>;
  return (
    <span>
      ห้อง <span lang="en">{name}</span>
    </span>
  );
}
