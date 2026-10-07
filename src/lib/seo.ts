import type { Metadata } from "next";
import { site } from "@/content/site";
import { getSeo, noindex as NOINDEX_KEYS, notFoundSeo, seoKey } from "@/content/seo";
import { getRoom } from "@/content/rooms";
import { getAsset, getDerivative, hasAsset, largest } from "@/content/assets";
import { pub, type AssetId, type FaqItem, type Locale, type RoomId } from "@/content/schema";
import { DEFAULT_LOCALE, LOCALES, LOCALE_TAG, OG_LOCALE, otherLocale } from "@/i18n/config";
import { ROUTES, href, isRouteEnabled, publishedPaths, relativePath, type RouteId } from "@/lib/routes";

/**
 * Search and sharing metadata, and structured data.
 *
 * One helper builds the complete metadata object for a page, because Next replaces nested objects
 * (`alternates`, `openGraph`) rather than merging them — a page that set half of one would drop the
 * other half. Titles are complete strings from src/content/seo.ts; there is no title template.
 *
 * Every absolute URL — canonicals, hreflang, Open Graph, the sitemap, JSON-LD — is built from
 * SITE_ORIGIN and nowhere else, so an environment can never canonicalise to a made-up host.
 *
 * Structured data states only what the site publishes: values pass through `pub()`, and anything
 * the ledger has not cleared (coordinates, ratings, prices, room sizes, beds, occupancy) has no key
 * here at all. Server use only (`process.env.SITE_ENV` is not exposed to the browser).
 */

/* ───────────── Environment and origin ───────────── */

/** Only a deployment that sets SITE_ENV=production is the public site. Everything else is a private preview. */
export const IS_PUBLIC_SITE: boolean = process.env.SITE_ENV === "production";

function originOf(value: string | undefined | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.origin : null;
  } catch {
    return null;
  }
}

/**
 * The canonical origin, without a trailing slash.
 *   public site → `site.origin.production`
 *   preview     → NEXT_PUBLIC_SITE_ORIGIN when it is a valid http(s) origin, else `site.origin.preview`
 */
export const SITE_ORIGIN: string = IS_PUBLIC_SITE
  ? (originOf(site.origin.production) ?? site.origin.production)
  : (originOf(process.env.NEXT_PUBLIC_SITE_ORIGIN) ?? originOf(site.origin.preview) ?? site.origin.preview);

/** An absolute URL on the canonical origin for a root-relative path. */
export function absoluteUrl(path: string): string {
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

export interface PageRef {
  room?: RoomId;
}

/** The one canonical address of a page: absolute, no query string, no fragment, no trailing slash. */
export function canonicalUrl(lang: Locale, id: RouteId, opts: PageRef = {}): string {
  return absoluteUrl(href(lang, id, { room: opts.room }));
}

/** Every language version of a page plus `x-default` (the Thai page), for hreflang and the sitemap. */
export function languageUrls(id: RouteId, opts: PageRef = {}): Record<Locale | "x-default", string> {
  return {
    th: canonicalUrl("th", id, opts),
    en: canonicalUrl("en", id, opts),
    "x-default": canonicalUrl(DEFAULT_LOCALE, id, opts),
  };
}

/* ───────────── Social cards ───────────── */

/** The home hero (legacy frame 01_24). */
export const DEFAULT_OG_ASSET: AssetId = "clay-buildings-rooftop-pergolas-hazy-lane";
export const OG_SIZE = { width: 1200, height: 630 } as const;

/**
 * Whether public/og/<id>.jpg exists. The image pipeline (scripts/process-images.mjs) cuts a 1200×630
 * card for exactly the frames catalogued with the "hero" use, so the catalogue answers the question
 * without touching the file system.
 */
export function hasOgCard(id: AssetId): boolean {
  return hasAsset(id) && getAsset(id).uses.includes("hero");
}

interface OgImage {
  url: string;
  width: number;
  height: number;
  alt: string;
  type: string;
}

function ogImage(lang: Locale, requested?: AssetId): OgImage {
  const id = requested && hasOgCard(requested) ? requested : DEFAULT_OG_ASSET;
  return {
    url: absoluteUrl(`/og/${id}.jpg`),
    width: OG_SIZE.width,
    height: OG_SIZE.height,
    alt: hasAsset(id) ? getAsset(id).alt[lang] : site.name[lang],
    type: "image/jpeg",
  };
}

/** The largest JPEG derivative of a photograph as an absolute URL, or `null` when it is not in the catalogue. */
function photoUrl(id: AssetId): string | null {
  if (!hasAsset(id)) return null;
  try {
    return absoluteUrl(largest(getDerivative(id)).jpg);
  } catch {
    return null;
  }
}

/* ───────────── Page metadata ───────────── */

export interface PageMetadataOptions extends PageRef {
  /** Keep this page out of search indexes even on the public site. */
  noindex?: boolean;
  /** Photograph for the social card. Used only when a 1200×630 card exists for it; otherwise the default card. */
  ogAsset?: AssetId;
}

/** Whether the content team has marked a page "never index" in src/content/seo.ts (the gatherings template). */
export function isMarkedNoindex(id: RouteId, room?: RoomId): boolean {
  if (id === "room" && !room) return false;
  return NOINDEX_KEYS.includes(seoKey(id, room));
}

/** Whether a page may be indexed: the public site only, a published route, and not opted out anywhere. */
export function isIndexable(id: RouteId, opts: { noindex?: boolean; room?: RoomId } = {}): boolean {
  return IS_PUBLIC_SITE && !opts.noindex && ROUTES[id].indexable && isRouteEnabled(id, site.flags) && !isMarkedNoindex(id, opts.room);
}

/**
 * The paths (relative to the locale root) that belong in the sitemap: published and indexable routes,
 * minus any page marked "never index". A flagged-off route and the internal style guide are absent.
 */
export function sitemapPaths(): string[] {
  const excluded = new Set(
    NOINDEX_KEYS.map((key) => (key.startsWith("room:") ? relativePath("room", { room: key.slice(5) as RoomId }) : relativePath(key as RouteId))),
  );
  return publishedPaths(site.flags).filter((path) => !excluded.has(path));
}

function robotsFor(indexable: boolean): NonNullable<Metadata["robots"]> {
  if (indexable) return { index: true, follow: true };
  // A preview is closed to crawlers entirely; an opted-out page on the public site still lets links be followed.
  return IS_PUBLIC_SITE ? { index: false, follow: true } : { index: false, follow: false };
}

/**
 * The complete metadata for one page in one language. Use it as the whole return value of
 * `generateMetadata`:
 *
 *   export async function generateMetadata({ params }: Props): Promise<Metadata> {
 *     const { lang } = await params;
 *     return isLocale(lang) ? pageMetadata(lang, "stay") : {};
 *   }
 *
 * Room pages pass `{ room }` (and may pass `ogAsset: room.media.lead`).
 */
export function pageMetadata(lang: Locale, id: RouteId, opts: PageMetadataOptions = {}): Metadata {
  const seo = getSeo(id, lang, opts.room);
  const canonical = canonicalUrl(lang, id, opts);
  const image = ogImage(lang, opts.ogAsset);

  return {
    metadataBase: new URL(SITE_ORIGIN),
    // `absolute` ignores any title template a parent segment might ever declare.
    title: { absolute: seo.title },
    description: seo.description,
    alternates: {
      canonical,
      languages: languageUrls(id, opts),
    },
    openGraph: {
      type: "website",
      title: seo.title,
      description: seo.description,
      url: canonical,
      siteName: site.name[lang],
      locale: OG_LOCALE[lang],
      alternateLocale: [OG_LOCALE[otherLocale(lang)]],
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [{ url: image.url, alt: image.alt, width: image.width, height: image.height }],
    },
    robots: robotsFor(isIndexable(id, opts)),
    // The phone number is always a real tel: link; stop iOS turning the postcode or a date into one.
    formatDetection: { telephone: false, address: false, email: false },
  };
}

/** Metadata for the localized not-found page. Never indexed, no canonical, no alternates. */
export function notFoundMetadata(lang: Locale): Metadata {
  const seo = notFoundSeo[lang];
  return {
    metadataBase: new URL(SITE_ORIGIN),
    title: { absolute: seo.title },
    robots: { index: false, follow: IS_PUBLIC_SITE },
    formatDetection: { telephone: false, address: false, email: false },
  };
}

/* ───────────── Structured data ───────────── */

export type JsonLdNode = { [key: string]: unknown };

const SCHEMA_ORG = "https://schema.org";
const RESORT_TYPE = ["Resort", "LodgingBusiness"] as const;

/** Stable node ids so the resort, the website and each page refer to one another instead of repeating facts. */
export const RESORT_ID = `${SITE_ORIGIN}/#resort`;
export const WEBSITE_ID = `${SITE_ORIGIN}/#website`;

/** "14:00" → "14:00:00+07:00" (schema.org Time, in the resort's own zone). Anything else → `null`. */
function schemaTime(clock: string | null): string | null {
  return clock && /^([01]\d|2[0-3]):[0-5]\d$/.test(clock) ? `${clock}:00+07:00` : null;
}

function postalAddress(lang: Locale): JsonLdNode | null {
  // The structured parts are published only while the address itself is.
  if (!pub(site.address)) return null;
  const p = site.addressParts;
  return {
    "@type": "PostalAddress",
    streetAddress: lang === "th" ? `${p.streetAddress.th} ${p.subdistrict.th}` : `${p.streetAddress.en}, ${p.subdistrict.en}`,
    addressLocality: p.district[lang],
    addressRegion: p.province[lang],
    postalCode: p.postalCode,
    addressCountry: p.countryCode,
  };
}

/** A compact reference to the resort for use inside other nodes. */
function resortRef(lang: Locale): JsonLdNode {
  return { "@type": [...RESORT_TYPE], "@id": RESORT_ID, name: site.name[lang], url: canonicalUrl(lang, "home") };
}

/**
 * The resort as a lodging business. Deliberately absent, because nothing publishable backs them:
 * geo, starRating, aggregateRating, review, priceRange, amenityFeature, numberOfRooms, email.
 */
export function lodgingJsonLd(lang: Locale): JsonLdNode {
  const phone = pub(site.phone);
  const facebook = pub(site.social.facebook);
  const map = pub(site.maps.listingUrl);
  const address = postalAddress(lang);
  const checkin = schemaTime(pub(site.checkIn));
  const checkout = schemaTime(pub(site.checkOut));
  const images = [absoluteUrl(`/og/${DEFAULT_OG_ASSET}.jpg`), photoUrl(DEFAULT_OG_ASSET)].filter((u): u is string => u !== null);

  return {
    "@context": SCHEMA_ORG,
    "@type": [...RESORT_TYPE],
    "@id": RESORT_ID,
    name: site.name[lang],
    alternateName: site.name[otherLocale(lang)],
    url: canonicalUrl(lang, "home"),
    description: getSeo("home", lang).description,
    image: images,
    ...(address ? { address } : {}),
    ...(phone ? { telephone: phone.international } : {}),
    ...(facebook ? { sameAs: [facebook] } : {}),
    ...(checkin ? { checkinTime: checkin } : {}),
    ...(checkout ? { checkoutTime: checkout } : {}),
    ...(map ? { hasMap: map } : {}),
  };
}

export type WebPageType = "WebPage" | "ContactPage" | "CollectionPage" | "AboutPage";

const PAGE_TYPE: Partial<Record<RouteId, WebPageType>> = {
  contact: "ContactPage",
  gallery: "CollectionPage",
};

export interface WebPageOptions extends PageRef {
  type?: WebPageType;
  ogAsset?: AssetId;
}

/** The page itself: its address, language, title and description as published, and when the content last changed. */
export function webPageJsonLd(lang: Locale, id: RouteId, opts: WebPageOptions = {}): JsonLdNode {
  const seo = getSeo(id, lang, opts.room);
  const url = canonicalUrl(lang, id, opts);
  const image = ogImage(lang, opts.ogAsset);
  return {
    "@context": SCHEMA_ORG,
    "@type": opts.type ?? PAGE_TYPE[id] ?? "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: seo.title,
    description: seo.description,
    inLanguage: LOCALE_TAG[lang],
    isPartOf: { "@type": "WebSite", "@id": WEBSITE_ID, name: site.name[lang], url: canonicalUrl(lang, "home") },
    about: { "@id": RESORT_ID },
    primaryImageOfPage: { "@type": "ImageObject", url: image.url, width: image.width, height: image.height },
    dateModified: site.lastUpdated,
  };
}

/** One step of a breadcrumb trail: a visible name and either a route or a root-relative path. */
export interface BreadcrumbStep {
  name: string;
  route?: RouteId;
  room?: RoomId;
  /** A root-relative path ("/en/stay"), for callers that already hold one. Query and fragment are dropped. */
  href?: string;
}

function stepUrl(lang: Locale, step: BreadcrumbStep): string | null {
  if (step.route) return canonicalUrl(lang, step.route, { room: step.room });
  if (step.href) return absoluteUrl(step.href.replace(/[?#].*$/, ""));
  return null;
}

/** The same trail the visible breadcrumb shows, home first, the current page last. */
export function breadcrumbJsonLd(lang: Locale, trail: BreadcrumbStep[]): JsonLdNode {
  return {
    "@context": SCHEMA_ORG,
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => {
      const item = stepUrl(lang, step);
      return { "@type": "ListItem", position: index + 1, name: step.name, ...(item ? { item } : {}) };
    }),
  };
}

/** Questions and answers exactly as they appear on the page. This does not promise any search feature. */
export function faqJsonLd(lang: Locale, items: FaqItem[]): JsonLdNode {
  const url = canonicalUrl(lang, "faq");
  return {
    "@context": SCHEMA_ORG,
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    url,
    inLanguage: LOCALE_TAG[lang],
    dateModified: site.lastUpdated,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question[lang],
      acceptedAnswer: { "@type": "Answer", text: item.answer[lang].join("\n\n") },
    })),
  };
}

/**
 * One room type. Name, description, address and photograph only — occupancy, bed, floorSize and
 * amenityFeature stay out until the resort confirms them (BUILD-CONTRACT §2).
 */
export function roomJsonLd(lang: Locale, roomId: RoomId): JsonLdNode {
  const room = getRoom(roomId);
  const url = canonicalUrl(lang, "room", { room: roomId });
  const image = photoUrl(room.media.lead);
  return {
    "@context": SCHEMA_ORG,
    "@type": ["HotelRoom"],
    "@id": `${url}#room`,
    name: room.name,
    description: room.summary[lang],
    url,
    ...(image ? { image } : {}),
    containedInPlace: resortRef(lang),
  };
}

/** Languages the site is published in, as BCP 47 tags — for callers that list them. */
export const SITE_LANGUAGES: string[] = LOCALES.map((l) => LOCALE_TAG[l]);
