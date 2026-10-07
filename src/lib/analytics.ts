import { BOOKING_PROVIDER, FACEBOOK_URL, FLAGS, GA4_MEASUREMENT_ID, MAPS_LISTING_URL } from "@/content/site-public";
import { ROOM_IDS, type Locale, type RoomId } from "@/content/schema";
import { isLocale } from "@/i18n/config";
import { ROUTES, isRoomId, type RouteId } from "@/lib/routes";

/**
 * The measurement adapter.
 *
 * It is INERT unless two things are true at build time: the `analytics` feature flag is on in
 * src/content/site.ts, and a GA4 measurement id is configured (NEXT_PUBLIC_GA4_ID). Without both,
 * `track()` returns false, nothing is loaded, no cookie is set and no consent banner is shown.
 * When both are true, nothing is sent until the visitor accepts in the consent banner
 * (src/components/analytics) — that component is the only caller of `connectAnalytics()`.
 *
 * What may be measured is a closed schema (below). `track()` rebuilds every payload from that schema:
 * an unknown event is dropped, an unknown key is dropped, and a value that is not on its allow-list
 * drops the whole event. There is no field that accepts free text, so a name, an email address, a
 * phone number, a message, the age of a child or a stay date cannot enter a payload — the only thing
 * recorded about dates is whether a search had any (`hasDates`).
 *
 * A `booking_click` is a click on a link that leaves for the booking partner. It is not a booking:
 * this site cannot see what happens on the partner page, so no purchase or conversion value is sent.
 *
 * This is a plain module (no "use client"): server components may import the types and constants,
 * and nothing here touches `window` at import time.
 */

/* ───────────── Configuration ───────────── */

const GA4_ID = /^G-[A-Z0-9]{4,20}$/;

function configuredMeasurementId(): string | null {
  if (!FLAGS.analytics) return null;
  const id = GA4_MEASUREMENT_ID?.trim() ?? "";
  return GA4_ID.test(id) ? id : null;
}

/** The GA4 measurement id, or `null` when analytics is not configured (the normal state of a preview). */
export const ANALYTICS_ID: string | null = configuredMeasurementId();
export const ANALYTICS_CONFIGURED: boolean = ANALYTICS_ID !== null;

function hostOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "unknown";
  }
}

/** Identifies the booking partner in `booking_click` — the host of the verified booking URL, nothing more. */
export const BOOKING_PROVIDER_ID: string = hostOf(BOOKING_PROVIDER.baseUrl);

/* ───────────── The schema ───────────── */

/** Where on the page a tracked control sits. Use these values in `data-placement`; anything else is recorded as "other". */
export const ANALYTICS_PLACEMENTS = [
  "header",
  "mobile-menu",
  "hero",
  "planner",
  "sticky-bar",
  "room-ledger",
  "room-panel",
  "room-alternatives",
  "compare",
  "rooftop",
  "dining",
  "experiences",
  "gallery",
  "journey",
  "location",
  "contact",
  "faq",
  "closing",
  "footer",
  "not-found",
  "inline",
  "other",
] as const;
export type AnalyticsPlacement = (typeof ANALYTICS_PLACEMENTS)[number];

export const ANALYTICS_NETWORKS = ["facebook", "instagram", "line", "whatsapp"] as const;
export type AnalyticsNetwork = (typeof ANALYTICS_NETWORKS)[number];

export const ANALYTICS_ENQUIRY_TYPES = ["stay", "dining", "group", "general"] as const;
export type AnalyticsEnquiryType = (typeof ANALYTICS_ENQUIRY_TYPES)[number];

/** A page is named by its route id, never by its URL, so no query string can ride along. */
export type AnalyticsPage = RouteId | "not-found";

export interface AnalyticsEventMap {
  room_view: { roomId: RoomId; locale: Locale; page: AnalyticsPage };
  room_compare: { roomIds: RoomId[] };
  /** `hasDates` says only whether both dates were chosen. The dates themselves are never recorded. */
  availability_search: { hasDates: boolean; adults: number };
  booking_click: { placement: AnalyticsPlacement; roomId?: RoomId; locale: Locale; provider: string };
  /** Fire only after the enquiry backend has accepted the message. */
  enquiry_submit_success: { type: AnalyticsEnquiryType; page: AnalyticsPage; locale: Locale };
  call_click: { placement?: AnalyticsPlacement; locale?: Locale };
  map_click: { placement?: AnalyticsPlacement; locale?: Locale };
  social_contact_click: { network: AnalyticsNetwork; placement?: AnalyticsPlacement; locale?: Locale };
}

export type AnalyticsEventName = keyof AnalyticsEventMap;
export type AnalyticsEvent = { [K in AnalyticsEventName]: { name: K; params: AnalyticsEventMap[K] } }[AnalyticsEventName];

export type AnalyticsValue = string | number | boolean;
/** What actually leaves the adapter: a known event name and flat, allow-listed values. */
export interface CleanEvent {
  name: AnalyticsEventName;
  params: Record<string, AnalyticsValue>;
}

/* ───────────── Runtime allow-list ───────────── */

/** Returns the value to send, or `undefined` when the input is not allowed. */
type Rule = (value: unknown) => AnalyticsValue | undefined;

function oneOf(allowed: readonly string[]): Rule {
  return (value) => (typeof value === "string" && allowed.includes(value) ? value : undefined);
}

const PAGE_IDS: readonly string[] = [...Object.keys(ROUTES), "not-found"];

const rules = {
  roomId: (value) => (typeof value === "string" && isRoomId(value) ? value : undefined),
  /** Sent as one comma-joined string in catalogue order: analytics parameters cannot be lists. */
  roomIds: (value) => {
    if (!Array.isArray(value) || value.length === 0 || value.length > ROOM_IDS.length) return undefined;
    if (!value.every((v): v is RoomId => typeof v === "string" && isRoomId(v))) return undefined;
    const chosen = new Set<string>(value);
    return ROOM_IDS.filter((id) => chosen.has(id)).join(",");
  },
  locale: (value) => (typeof value === "string" && isLocale(value) ? value : undefined),
  page: oneOf(PAGE_IDS),
  hasDates: (value) => (typeof value === "boolean" ? value : undefined),
  adults: (value) =>
    typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= BOOKING_PROVIDER.maxAdultsSelectable ? value : undefined,
  placement: oneOf(ANALYTICS_PLACEMENTS),
  provider: (value) => (value === BOOKING_PROVIDER_ID ? BOOKING_PROVIDER_ID : undefined),
  enquiryType: oneOf(ANALYTICS_ENQUIRY_TYPES),
  network: oneOf(ANALYTICS_NETWORKS),
} satisfies Record<string, Rule>;

interface Field {
  /** Key in the typed event. */
  key: string;
  /** Parameter name sent to the analytics service. */
  as: string;
  rule: Rule;
  required: boolean;
}

const field = (key: string, as: string, rule: Rule, required = true): Field => ({ key, as, rule, required });

const SCHEMA: Record<AnalyticsEventName, Field[]> = {
  room_view: [field("roomId", "room_id", rules.roomId), field("locale", "locale", rules.locale), field("page", "page", rules.page)],
  room_compare: [field("roomIds", "room_ids", rules.roomIds)],
  availability_search: [field("hasDates", "has_dates", rules.hasDates), field("adults", "adults", rules.adults)],
  booking_click: [
    field("placement", "placement", rules.placement),
    field("roomId", "room_id", rules.roomId, false),
    field("locale", "locale", rules.locale),
    field("provider", "provider", rules.provider),
  ],
  enquiry_submit_success: [field("type", "enquiry_type", rules.enquiryType), field("page", "page", rules.page), field("locale", "locale", rules.locale)],
  call_click: [field("placement", "placement", rules.placement, false), field("locale", "locale", rules.locale, false)],
  map_click: [field("placement", "placement", rules.placement, false), field("locale", "locale", rules.locale, false)],
  social_contact_click: [
    field("network", "network", rules.network),
    field("placement", "placement", rules.placement, false),
    field("locale", "locale", rules.locale, false),
  ],
};

export const ANALYTICS_EVENT_NAMES = Object.keys(SCHEMA) as AnalyticsEventName[];

export function isAnalyticsEventName(value: unknown): value is AnalyticsEventName {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(SCHEMA, value);
}

/**
 * Rebuilds an event from the schema. Accepts `unknown` on purpose: this is the runtime gate, and it
 * must hold even for a caller that bypassed the types.
 *   unknown event name                → null
 *   required field missing or invalid → null (the whole event is dropped)
 *   optional field invalid            → null (a wrong value is a bug to notice, not to half-send)
 *   key that is not in the schema     → ignored; it never reaches the payload
 */
export function sanitizeEvent(event: unknown): CleanEvent | null {
  if (typeof event !== "object" || event === null) return null;
  const { name, params } = event as { name?: unknown; params?: unknown };
  if (!isAnalyticsEventName(name)) return null;
  const source: Record<string, unknown> = typeof params === "object" && params !== null ? (params as Record<string, unknown>) : {};
  const clean: Record<string, AnalyticsValue> = {};
  for (const f of SCHEMA[name]) {
    const raw = Object.prototype.hasOwnProperty.call(source, f.key) ? source[f.key] : undefined;
    if (raw === undefined || raw === null) {
      if (f.required) return null;
      continue;
    }
    const value = f.rule(raw);
    if (value === undefined) return null;
    clean[f.as] = value;
  }
  return { name, params: clean };
}

/* ───────────── Transport ───────────── */

export type AnalyticsSink = (event: CleanEvent) => void;

let sink: AnalyticsSink | null = null;

/**
 * Connects (or, with `null`, disconnects) the destination for events. Called only by <AnalyticsRoot>
 * once the visitor has accepted measurement; until then every `track()` is dropped, not queued.
 */
export function connectAnalytics(next: AnalyticsSink | null): void {
  sink = ANALYTICS_CONFIGURED ? next : null;
}

export function isAnalyticsActive(): boolean {
  return sink !== null;
}

/**
 * Records one event. Returns true when it was handed to the analytics service, false when it was
 * dropped (not configured, no consent, or not in the schema). It never throws: measurement must not
 * be able to break a booking link or a form.
 */
export function track(event: AnalyticsEvent): boolean {
  if (!sink) return false;
  const clean = sanitizeEvent(event);
  if (!clean) return false;
  try {
    sink(clean);
    return true;
  } catch {
    return false;
  }
}

/* ───────────── Reading events from markup ───────────── */

/** The route id for a pathname ("/en/stay/deluxe-bathtub" → "room"), or "not-found". Query and hash are ignored. */
export function pageFromPath(pathname: string): AnalyticsPage {
  const rest = pathname
    .replace(/[?#].*$/, "")
    .replace(/^\/(th|en)(?=\/|$)/, "")
    .replace(/\/+$/, "");
  const segments = rest.split("/").filter(Boolean);
  if (segments.length === 0) return "home";
  if (segments[0] === "stay" && segments.length === 2) return isRoomId(segments[1]) ? "room" : "not-found";
  if (segments.length !== 1) return "not-found";
  for (const id of Object.keys(ROUTES) as RouteId[]) {
    if (id !== "room" && id !== "home" && ROUTES[id].path === `/${segments[0]}`) return id;
  }
  return "not-found";
}

/** The room a pathname is about, when it is a room page. */
export function roomFromPath(pathname: string): RoomId | null {
  const match = pathname.replace(/[?#].*$/, "").match(/^\/(?:th|en)\/stay\/([^/]+)\/?$/);
  return match && isRoomId(match[1]) ? match[1] : null;
}

function placementFrom(value: string | undefined): AnalyticsPlacement {
  return value !== undefined && (ANALYTICS_PLACEMENTS as readonly string[]).includes(value) ? (value as AnalyticsPlacement) : "other";
}

/**
 * Turns the `data-*` attributes of a clicked element into a typed event, so server-rendered links
 * need no handlers:
 *
 *   <a href={bookingHref()} data-analytics="booking_click" data-placement="hero" data-room="deluxe-bathtub">
 *   <a href={telHref(phone)} data-analytics="call_click" data-placement="footer">
 *   <a href={mapUrl} data-analytics="map_click" data-placement="location">
 *   <a href={facebookUrl} data-analytics="social_contact_click" data-network="facebook" data-placement="contact">
 *   <a href="#compare" data-analytics="room_compare" data-rooms="deluxe-balcony,deluxe-bathtub">
 *
 * Locale and provider come from the page itself, never from markup. `room_view`, `availability_search`
 * and `enquiry_submit_success` are not click events and are not read here.
 */
export function eventFromDataset(data: Readonly<Record<string, string | undefined>>, context: { locale: Locale }): AnalyticsEvent | null {
  const { locale } = context;
  switch (data.analytics) {
    case "booking_click": {
      const roomId = data.room !== undefined && isRoomId(data.room) ? data.room : undefined;
      return {
        name: "booking_click",
        params: { placement: placementFrom(data.placement), ...(roomId ? { roomId } : {}), locale, provider: BOOKING_PROVIDER_ID },
      };
    }
    case "call_click":
      return { name: "call_click", params: { placement: placementFrom(data.placement), locale } };
    case "map_click":
      return { name: "map_click", params: { placement: placementFrom(data.placement), locale } };
    case "social_contact_click": {
      const network = (ANALYTICS_NETWORKS as readonly string[]).includes(data.network ?? "") ? (data.network as AnalyticsNetwork) : null;
      return network ? { name: "social_contact_click", params: { network, placement: placementFrom(data.placement), locale } } : null;
    }
    case "room_compare": {
      const roomIds = (data.rooms ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(isRoomId);
      return roomIds.length > 0 ? { name: "room_compare", params: { roomIds } } : null;
    }
    default:
      return null;
  }
}

/**
 * Fallback for a plain link that carries no `data-analytics`: recognises the four destinations the
 * site links to by their verified URLs. Only the start of the href is compared — the query string of
 * a booking link (dates, guests) is never read.
 */
export function eventFromHref(url: string, context: { locale: Locale }): AnalyticsEvent | null {
  const { locale } = context;
  if (url.startsWith("tel:")) return { name: "call_click", params: { placement: "other", locale } };
  if (url.startsWith(BOOKING_PROVIDER.baseUrl)) {
    return { name: "booking_click", params: { placement: "other", locale, provider: BOOKING_PROVIDER_ID } };
  }
  const map = MAPS_LISTING_URL;
  if (map && url.startsWith(map)) return { name: "map_click", params: { placement: "other", locale } };
  const facebook = FACEBOOK_URL;
  if (facebook && url.startsWith(facebook)) {
    return { name: "social_contact_click", params: { network: "facebook", placement: "other", locale } };
  }
  return null;
}

/* ───────────── Page addresses ───────────── */

/** Campaign parameters an analytics service needs for attribution. Every other query parameter is removed. */
const CAMPAIGN_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id", "gclid"];

/**
 * The page address reported with a page view: origin and path, plus campaign parameters only. The
 * hash and every other query parameter (`type`, `room`, `filter`, anything unexpected) are removed.
 */
export function reportablePageUrl(location: { origin: string; pathname: string; search: string }): string {
  const incoming = new URLSearchParams(location.search);
  const kept = new URLSearchParams();
  for (const key of CAMPAIGN_PARAMS) {
    const value = incoming.get(key);
    if (value) kept.set(key, value.slice(0, 100));
  }
  const query = kept.toString();
  return `${location.origin}${location.pathname}${query ? `?${query}` : ""}`;
}
