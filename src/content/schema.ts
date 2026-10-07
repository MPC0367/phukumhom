/**
 * Shared content types. One factual source feeds both languages: facts are stored once,
 * wrapped with their source and a publication status, and only localized *wording* differs.
 * See docs/BUILD-CONTRACT.md §2 for the rules these types enforce.
 */

/* ───────────── Locale ───────────── */

export const LOCALES = ["th", "en"] as const;
export type Locale = (typeof LOCALES)[number];
/** A value that exists in every locale. `satisfies L<Shape>` on page copy enforces TH/EN parity. */
export type L<T = string> = Record<Locale, T>;

/* ───────────── Facts and publication ───────────── */

export type Status = "confirmed" | "source-listed" | "needs-confirmation" | "retired";
/** Ids defined in docs/sources.json and mirrored in src/content/sources.ts. */
export type SourceId = `S-${string}`;

export interface Fact<T> {
  /** `null` means unknown. Never 0, never a guess. */
  value: T | null;
  status: Status;
  sources: SourceId[];
  /** ISO date the value was last checked against its sources. */
  verified: string;
  /** Developer note: the conflict, the caveat, what the owner must confirm. Never rendered. */
  note?: string;
}

export const isPublishable = (status: Status): boolean => status === "confirmed" || status === "source-listed";

/** The only way guest-facing code reads a fact: the value when it may be shown, otherwise `null`. */
export function pub<T>(f: Fact<T>): T | null {
  return isPublishable(f.status) ? f.value : null;
}

export function fact<T>(value: T | null, status: Status, sources: SourceId[], note?: string, verified = "2026-10-07"): Fact<T> {
  return { value, status, sources, verified, ...(note ? { note } : {}) };
}

/** Shorthand for something we know we do not know. */
export function unknown<T>(note: string, sources: SourceId[] = []): Fact<T> {
  return { value: null, status: "needs-confirmation", sources, verified: "2026-10-07", note };
}

/* ───────────── Site settings ───────────── */

export type FlagId =
  | "offers"
  | "gatherings"
  | "line"
  | "whatsapp"
  | "instagram"
  | "reviewRating"
  | "enquiryDelivery"
  | "analytics"
  | "mapEmbed";
export type Flags = Record<FlagId, boolean>;

export interface Phone {
  /** As printed on Thai pages: national format. */
  national: string;
  /** As printed on English pages: international format. The same single number. */
  international: string;
  /** For `tel:` links. */
  e164: string;
}

export interface BookingProvider {
  name: string;
  /** The verified destination. Every booking CTA resolves to this. */
  baseUrl: string;
  /** The older official entry point that redirects to `baseUrl`. Kept for the record. */
  legacyUrl: string;
  /** Query parameters proven on the receiving page. Nothing else is ever sent. */
  params: { checkin: string; checkout: string; adults: string };
  /** Parameters the provider strips; documented so nobody re-adds them. */
  unsupported: string[];
  maxAdultsSelectable: number;
  verified: string;
}

export interface SiteSettings {
  name: L;
  shortName: L;
  /** Sentence-safe locality phrase, e.g. "Wang Katha, Khao Yai". */
  locality: L;
  defaultLocale: Locale;
  /** Absolute origins without a trailing slash. `production` is the canonical host for metadata. */
  origin: { production: string; preview: string };
  /** ISO date shown as "Last updated" and used as dateModified. Bump only when content really changes. */
  lastUpdated: string;
  address: Fact<L>;
  addressParts: {
    streetAddress: L;
    subdistrict: L;
    district: L;
    province: L;
    postalCode: string;
    countryCode: "TH";
  };
  /** The one phone number printed anywhere on the site. */
  phone: Fact<Phone>;
  email: Fact<string>;
  social: {
    facebook: Fact<string>;
    instagram: Fact<string>;
    line: Fact<string>;
    whatsapp: Fact<string>;
  };
  maps: {
    /** The resort's own Google Maps listing. Not an arrival-gate pin. */
    listingUrl: Fact<string>;
    coordinates: Fact<{ lat: number; lng: number }>;
  };
  booking: BookingProvider;
  checkIn: Fact<string>;
  checkOut: Fact<string>;
  flags: Flags;
  /** Analytics stays inactive unless an id is configured through the environment. */
  analytics: { ga4MeasurementId: string | null };
}

/* ───────────── Rooms ───────────── */

export const ROOM_IDS = ["deluxe-balcony", "deluxe-bathtub", "executive-pool-spa"] as const;
export type RoomId = (typeof ROOM_IDS)[number];

export type AmenityId = "air-conditioning" | "private-bathroom" | "refrigerator" | "television" | "hairdryer" | "coffee-tea";

export interface Amenity {
  id: AmenityId;
  label: L;
}

export interface Room {
  /** Stable internal id; also the URL slug. */
  id: RoomId;
  order: 1 | 2 | 3;
  /** Canonical proper name, kept in English in both languages. */
  name: string;
  /** Short descriptive phrase used on first mention, per locale. */
  gloss: L;
  /** One sentence that separates this room from the other two. */
  distinction: L;
  /** Two or three sentences for the room page. */
  summary: L;
  /** Ledger facts — short phrases, always publishable (they restate published feature facts). */
  outdoors: L;
  bathing: L;
  /** Booking-provider mapping. Display names here are never shown to guests. */
  provider: { roomTypeId: string; providerName: string };
  active: boolean;
  lastVerified: string;

  /** Areas are stored separately and never summed for the guest. */
  area: {
    indoorSqm: Fact<number>;
    terraceSqm: Fact<number>;
    rooftopSqm: Fact<number>;
    totalSqm: Fact<number>;
  };
  occupancy: {
    maxAdults: Fact<number>;
    maxChildren: Fact<number>;
    maxTotal: Fact<number>;
    childRule: Fact<L>;
  };
  beds: Fact<L>;
  features: {
    balcony: Fact<boolean>;
    privateRooftop: Fact<boolean>;
    bathtub: Fact<boolean>;
    /** A soaking tub on the private rooftop. Not a swimming pool. */
    rooftopSpaTub: Fact<boolean>;
    sharedPoolAccess: Fact<boolean>;
    connectingRooms: Fact<boolean>;
  };
  access: {
    rooftop: Fact<L>;
    steps: Fact<L>;
    bathroom: Fact<L>;
  };
  view: Fact<L>;
  amenities: AmenityId[];
  /** Plain practical notes shown on the room page; each must be traceable to a published fact. */
  goodToKnow: L<string[]>;
  media: { lead: AssetId; gallery: AssetId[] };
  /** The two other categories, in the order they should be offered as alternatives. */
  alternatives: [RoomId, RoomId];
}

/* ───────────── Media ───────────── */

/** Asset ids are descriptive slugs; they are also the public filename stem. */
export type AssetId = string;

export type AssetCategory =
  | "grounds"
  | "architecture"
  | "room-interior"
  | "bathroom"
  | "balcony"
  | "rooftop"
  | "spa-tub"
  | "restaurant"
  | "food"
  | "pool"
  | "reception"
  | "activity"
  | "detail"
  | "people"
  | "other";

/** "band" marks a frame cleared for full-bleed use (hero slides, bands); it gets the large derivatives. */
export type AssetUse = "hero" | "band" | "room-lead" | "room-gallery" | "dining" | "experiences" | "gallery" | "location" | "story";

/** "rooftops" covers rooftop terraces and the Executive spa tub; it is never labelled "spa" for guests. */
export type GalleryFilter = "rooms" | "rooftops" | "gardens" | "dining" | "experiences";

/** `preview-only`: an official-channel image used for private design evaluation, not cleared for publication. */
export type RightsStatus = "preview-only" | "cleared" | "blocked";

export interface Asset {
  id: AssetId;
  legacyId: string;
  /** File name inside `_src/legacy/`. */
  source: string;
  sourceUrl: string;
  rights: RightsStatus;
  /** Capture date if known. Legacy files were uploaded in May 2015; true capture dates are unknown. */
  captured: string | null;
  /** Whether the frame still reflects the property today. Unknown for every legacy image. */
  currentCondition: "unverified" | "confirmed";
  subject: string;
  /** What is in the frame, in plain words. Developer reference; never rendered. */
  description: string;
  category: AssetCategory;
  rooms: RoomId[];
  timeOfDay: "day" | "golden-hour" | "dusk" | "night" | "indoor";
  people: "none" | "incidental" | "identifiable";
  quality: 1 | 2 | 3 | 4 | 5;
  hdr: "natural" | "moderate" | "heavy";
  grade: "none" | "calm";
  showsSteps: boolean;
  /**
   * Sensor-dust spots (source pixels) that the image pipeline clones out from adjacent sky.
   * A content-neutral clean-up only: nothing in the scene is added, moved or removed.
   */
  heal?: { x: number; y: number; r: number }[];
  width: number;
  height: number;
  orientation: "landscape" | "portrait" | "square";
  focal: { x: number; y: number };
  mobileCrop: "4:3" | "3:2" | "1:1" | "4:5" | "3:4";
  alt: L;
  caption: L;
  uses: AssetUse[];
  gallery: GalleryFilter[];
  /** Why the frame is switched off, when `uses` is empty. Developer reference; never rendered. */
  excluded: string;
  /** Anything that visibly dates the photograph. Developer reference; never rendered. */
  dated: string;
}

export interface DerivativeVariant {
  /** True when this variant is wider than its source: enlarged, so slightly soft. Full-bleed frames only. */
  enlarged?: boolean;
  width: number;
  height: number;
  webp: string;
  /** Empty for the large full-bleed variants, which ship as WebP only. */
  jpg: string;
  bytesWebp: number;
  bytesJpg: number;
}

export interface Derivative {
  /** Where the pixels came from: the 2015 web original, or a 4K master made from it with the studio's upscaler. */
  master: "original" | "upscaled";
  width: number;
  height: number;
  /** Average colour, used as the reserved-space background while the image loads. */
  dominant: string;
  variants: DerivativeVariant[];
}

/* ───────────── Other collections ───────────── */

export interface Experience {
  id: string;
  theme: "gardens" | "outdoors" | "shared-facilities" | "rooftop-evenings";
  name: L;
  description: L;
  asset: AssetId | null;
  /** Where it happens. */
  where: "resort" | "nearby";
  availability: Fact<L>;
  bookingRequired: Fact<boolean>;
  charge: Fact<"included" | "additional" | "varies">;
  /** Weather, age, access or supervision notes supplied by the operator. */
  notes: Fact<L>;
  /** True when the copy is editorial context rather than a bookable activity. */
  editorial: boolean;
}

export interface NearbyPlace {
  id: string;
  name: L;
  group: "vineyards" | "temples" | "nature" | "cafes";
  blurb: L;
  url: string;
  status: Status;
  sources: SourceId[];
}

export interface FaqItem {
  id: string;
  group: "stay" | "rooms" | "dining" | "arrival" | "booking" | "property";
  question: L;
  /** Plain text paragraphs. The first sentence answers the question outright. */
  answer: L<string[]>;
  /** Optional onward link rendered after the answer. */
  link?: { route: RouteRef; label: L };
}

/** A reference to an internal route, resolved with `href()` from lib/routes. */
export interface RouteRef {
  id: string;
  room?: RoomId;
  hash?: string;
  query?: Record<string, string>;
}

export interface ReviewReference {
  id: "google" | "booking" | "tripcom" | "tripadvisor" | "agoda";
  platform: string;
  url: string;
  /** A rating figure is rendered only when present, verified, and the `reviewRating` flag is on. */
  rating: Fact<{ score: number; scale: number; count: number }>;
}

export interface Offer {
  slug: string;
  title: L;
  summary: L;
  terms: L<string[]>;
  inclusions: L<string[]>;
  rooms: RoomId[];
  validFrom: string;
  validUntil: string;
  bookingUrl: string | null;
}

export interface SourceRecord {
  id: SourceId;
  label: string;
  url: string;
  kind: "official-current" | "official-legacy" | "provider" | "third-party-current" | "third-party-old" | "own-research";
  read: string;
}

export interface PageSeo {
  /** Plain-words page topic; rendered as the single <h1>. */
  h1: string;
  title: string;
  description: string;
}
