import { LOCALES, ROOM_IDS, type FlagId, type Flags, type Locale, type RoomId } from "@/content/schema";
import builtRoutes from "./built-routes.generated.json";

/**
 * The one route table. Every internal link is built with `href()`; the sitemap, the language
 * switch, the nav and the legacy redirects all read from here, so a path is written exactly once.
 */
export const ROUTES = {
  home: { path: "", flag: null, indexable: true },
  stay: { path: "/stay", flag: null, indexable: true },
  room: { path: "/stay/[room]", flag: null, indexable: true },
  dining: { path: "/dining", flag: null, indexable: true },
  experiences: { path: "/experiences", flag: null, indexable: true },
  gallery: { path: "/gallery", flag: null, indexable: true },
  location: { path: "/location", flag: null, indexable: true },
  contact: { path: "/contact", flag: null, indexable: true },
  faq: { path: "/faq", flag: null, indexable: true },
  privacy: { path: "/privacy", flag: null, indexable: true },
  terms: { path: "/terms", flag: null, indexable: true },
  gatherings: { path: "/gatherings", flag: "gatherings", indexable: true },
  offers: { path: "/offers", flag: "offers", indexable: true },
} as const satisfies Record<string, { path: string; flag: FlagId | null; indexable: boolean }>;

export type RouteId = keyof typeof ROUTES;

export interface HrefOptions {
  /** Required for the `room` route. */
  room?: RoomId;
  /** Fragment without the leading `#`. */
  hash?: string;
  query?: Record<string, string | undefined>;
}

/**
 * Which pages exist as files under src/app/[lang] right now. Written by `node scripts/detect-routes.mjs`
 * (the Pages export runs it; run it by hand after adding or removing a page).
 *
 * A link to a page that is not built yet must never be a dead end. While a page is missing:
 *   - if the homepage has a chapter on the same subject, `href()` points at that chapter instead;
 *   - otherwise the route counts as disabled, so navigation simply leaves it out.
 * The moment the page file exists (and the script has run) the real URL is used again — nothing else changes.
 */
const BUILT = new Set<string>(builtRoutes as string[]);

/** The homepage chapter that stands in for a page until that page exists. */
const HOME_STAND_IN: Partial<Record<RouteId, string>> = {
  stay: "stay",
  room: "stay",
  dining: "table",
  experiences: "grounds",
  gallery: "reel",
  location: "arrive",
  contact: "arrive",
};

export function isRouteBuilt(id: RouteId): boolean {
  return BUILT.has(id);
}

/** The route's own path in a locale, whether or not the page is built yet. No trailing slash, ever. */
function ownPath(lang: Locale, id: RouteId, opts: HrefOptions): string {
  let path: string = ROUTES[id].path;
  if (id === "room") {
    if (!opts.room) throw new Error("href(lang, 'room') needs opts.room");
    path = path.replace("[room]", opts.room);
  }
  const qs = opts.query
    ? Object.entries(opts.query)
        .filter((e): e is [string, string] => typeof e[1] === "string" && e[1] !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&")
    : "";
  return `/${lang}${path}${qs ? `?${qs}` : ""}${opts.hash ? `#${opts.hash}` : ""}`;
}

/** Locale-prefixed internal link. Falls back to the homepage chapter while the page itself is not built. */
export function href(lang: Locale, id: RouteId, opts: HrefOptions = {}): string {
  if (!isRouteBuilt(id)) {
    const chapter = HOME_STAND_IN[id];
    if (chapter) return `/${lang}#${chapter}`;
  }
  return ownPath(lang, id, opts);
}

/** Same page in the other language: swaps the leading locale segment and keeps the rest (path, query, hash). */
export function switchLocale(pathWithQuery: string, to: Locale): string {
  const match = pathWithQuery.match(/^\/(th|en)(?=\/|$|\?|#)(.*)$/);
  return match ? `/${to}${match[2]}` : `/${to}`;
}

/** Path relative to the locale root ("" for home, "/stay/deluxe-balcony", …). Always the route's own path. */
export function relativePath(id: RouteId, opts: HrefOptions = {}): string {
  return ownPath("th", id, opts).slice(3).replace(/[?#].*$/, "");
}

/**
 * Whether navigation should offer a route: its feature flag is on, and there is somewhere real to send the
 * visitor — the built page, or the homepage chapter standing in for it.
 */
export function isRouteEnabled(id: RouteId, flags: Flags): boolean {
  const flag = ROUTES[id].flag;
  if (flag !== null && !flags[flag]) return false;
  return isRouteBuilt(id) || id in HOME_STAND_IN;
}

/**
 * Every published, indexable path relative to the locale root — the source for the sitemap,
 * static params and the QA matrix. Flagged-off and not-yet-built routes are absent, not empty.
 */
export function publishedPaths(flags: Flags): string[] {
  const out: string[] = [];
  for (const id of Object.keys(ROUTES) as RouteId[]) {
    const flag = ROUTES[id].flag;
    if (!ROUTES[id].indexable || (flag !== null && !flags[flag]) || !isRouteBuilt(id)) continue;
    if (id === "room") for (const room of ROOM_IDS) out.push(relativePath("room", { room }));
    else if (id === "offers") continue; // offer pages are listed from content when the flag is on
    else out.push(relativePath(id));
  }
  return out;
}

export function isRoomId(value: string): value is RoomId {
  return (ROOM_IDS as readonly string[]).includes(value);
}

export { LOCALES };
