import type { Locale, NearbyPlace } from "@/content/schema";
import { publishedNearby } from "@/content/nearby";
import { places as placesCopy } from "@/content/pages/home/nearby";
import { PlacesList, type NamePart, type PlaceRow } from "./PlacesList";

/**
 * Places to visit around Khao Yai: filter chips over the published places, one row a place.
 *
 *   <PlacesFilter lang={lang} />                     on the homepage, inside chapter 06
 *   <PlacesFilter lang={lang} headingLevel={4} />    under an <h3> on the Location page
 *
 * WHAT IT PRINTS. Only `publishedNearby` (src/content/nearby.ts): the rows the ledger has cleared, in
 * group order. A row is the place's name in the display face, its kind, the blurb as written, and a link
 * to the place's own page, which opens in a new tab and says so to assistive technology. Nothing here
 * adds a distance, a journey time, an opening hour or a price, and nothing says a place is close.
 * Under the list sits the glossary's sentence that the resort is not inside the national park.
 *
 * THE FILTER. A chip for "All" and one for each group that has a published place (a group with none is
 * never offered; with a single group there are no chips at all). Pressing a chip updates aria-pressed,
 * slides the rows that stay to their new places, fades the others out and in (GSAP Flip), eases the
 * list's height so nothing below jumps, rolls the count over and says it politely ("2 places"). Left
 * and Right arrows move between chips; Home and End jump to the ends.
 *
 * EACH ROW is one link: the whole row takes the press, a terracotta line draws across its top on hover
 * and on keyboard focus, and the round arrow fills. As the list scrolls in, each row's hairline draws
 * and its words rise, one row at a time.
 *
 * WITHOUT JAVASCRIPT every row is there and the chips are not shown: a filter that cannot filter is
 * worse than none. Under reduced motion the filter still works; the rows simply change.
 *
 * This file is the server half. It reads the content (which also holds rows that are not published, so
 * it must never reach a browser bundle) and hands plain strings to the client half, PlacesList.
 */

type Group = NearbyPlace["group"];

const GROUP_ORDER: Group[] = ["vineyards", "temples", "nature", "cafes"];

/** A Latin run inside a Thai name, with any brackets that hug it: "(Alcidini Winery)", "Tellus Cafe Khaoyai". */
const LATIN_RUN = /\(?[A-Za-z][A-Za-z0-9 .'’&-]*[A-Za-z0-9.)]|[A-Za-z]/g;

/**
 * Thai display type has no Latin letters of its own, so a name such as "ไร่องุ่นอัลซิดินี่ (Alcidini Winery)"
 * is handed over in pieces: the Latin part is marked lang="en" and set in the English display face.
 * An English name is one piece.
 */
function nameParts(name: string, lang: Locale): NamePart[] {
  if (lang !== "th") return [{ text: name, latin: false }];
  const parts: NamePart[] = [];
  let at = 0;
  for (const match of name.matchAll(LATIN_RUN)) {
    const start = match.index;
    if (start > at) parts.push({ text: name.slice(at, start), latin: false });
    parts.push({ text: match[0], latin: true });
    at = start + match[0].length;
  }
  if (at < name.length) parts.push({ text: name.slice(at), latin: false });
  return parts;
}

function isFacebook(url: string): boolean {
  try {
    return /(^|\.)facebook\.com$/.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

export interface PlacesFilterProps {
  lang: Locale;
  /** The level of each place's heading: 3 under an <h2> (the default), 4 under an <h3>. */
  headingLevel?: 3 | 4;
  className?: string;
}

export function PlacesFilter({ lang, headingLevel = 3, className }: PlacesFilterProps) {
  const c = placesCopy[lang];

  const ordered = [...publishedNearby].sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group));
  if (ordered.length === 0) return null;

  const rows: PlaceRow[] = ordered.map((place) => ({
    id: place.id,
    group: place.group,
    kind: c.kinds[place.group],
    name: nameParts(place.name[lang], lang),
    blurb: place.blurb[lang],
    url: place.url,
    linkLabel: isFacebook(place.url) ? c.link.facebook : c.link.website,
  }));

  const groups = GROUP_ORDER.filter((group) => ordered.some((place) => place.group === group)).map((group) => ({
    id: group,
    label: c.groups[group],
  }));

  return (
    <PlacesList
      lang={lang}
      rows={rows}
      groups={groups}
      headingLevel={headingLevel}
      className={className}
      labels={{ heading: c.heading, filterLabel: c.filterLabel, all: c.all, count: c.count, newTab: c.newTab, note: c.note }}
    />
  );
}
