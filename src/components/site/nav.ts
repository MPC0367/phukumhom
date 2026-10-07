import type { Locale, RoomId } from "@/content/schema";
import { rooms } from "@/content/rooms";
import { site } from "@/content/site";
import { t } from "@/i18n/ui";
import { href, isRouteEnabled, type RouteId } from "@/lib/routes";

/**
 * The site's navigation, built once from the route table, the feature flags and the glossary
 * strings. The header, the mobile menu, the footer and the not-found page all read these lists, so
 * a page can never be in one and missing from another, and a flagged-off page is absent everywhere.
 *
 * Server-side only: it reads the string tables and the room list. Client islands receive the
 * resulting items as plain data.
 */

export interface NavItem {
  id: string;
  label: string;
  href: string;
  /** The page this item stands for, used to mark it current; `null` for an anchor inside another page. */
  path: string | null;
}

export interface RoomNavItem extends NavItem {
  room: RoomId;
}

type PageId = Exclude<RouteId, "home" | "room">;

function page(lang: Locale, id: PageId): NavItem {
  const to = href(lang, id);
  return { id, label: t(lang).nav[id], href: to, path: to };
}

function enabled(ids: PageId[]): PageId[] {
  return ids.filter((id) => isRouteEnabled(id, site.flags));
}

/** The four decisions the header shows outright (brief section 7). */
export function primaryNav(lang: Locale): NavItem[] {
  return enabled(["stay", "dining", "experiences", "location"]).map((id) => page(lang, id));
}

/** "Our story": not a page of its own but the #story section of the homepage, so it is never "current". */
function story(lang: Locale): NavItem {
  return { id: "story", label: t(lang).nav.story, href: href(lang, "home", { hash: "story" }), path: null };
}

/** Everything under "Explore". Gatherings and Offers exist only while their flags are on. */
export function exploreNav(lang: Locale): NavItem[] {
  return [
    ...enabled(["gallery"]).map((id) => page(lang, id)),
    story(lang),
    ...enabled(["gatherings", "offers", "faq", "contact"]).map((id) => page(lang, id)),
  ];
}

/** The three room types in catalogue order. `label` is the proper name: Latin script in both languages. */
export function roomNav(lang: Locale): RoomNavItem[] {
  return rooms
    .filter((room) => room.active)
    .map((room) => {
      const to = href(lang, "room", { room: room.id });
      return { id: room.id, room: room.id, label: room.name, href: to, path: to };
    });
}

/**
 * The footer's lists: where to stay, the rest of the resort, the practical pages, and the two legal
 * pages that sit in its last row.
 *
 * Between them they hold every destination of the header and of "Explore" ("Our story" included),
 * because the footer is the navigation of last resort: it is where the Menu link leads when the page
 * has no script, and where the Explore list's pages can still be found.
 */
export function footerNav(lang: Locale): { stay: NavItem; rooms: RoomNavItem[]; resort: NavItem[]; practical: NavItem[]; legal: NavItem[] } {
  return {
    stay: page(lang, "stay"),
    rooms: roomNav(lang),
    resort: [...enabled(["dining", "experiences", "gallery", "location", "gatherings", "offers"]).map((id) => page(lang, id)), story(lang)],
    practical: enabled(["contact", "faq"]).map((id) => page(lang, id)),
    legal: enabled(["privacy", "terms"]).map((id) => page(lang, id)),
  };
}
