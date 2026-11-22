import type { BookingProvider, Flags } from "./schema";

/**
 * The parts of the site settings that browser code needs — and nothing else.
 *
 * src/content/site.ts carries every fact with its developer note (owner questions, source conflicts,
 * unchecked candidates). Those notes must never reach a visitor's browser, so anything that runs on the
 * client (the booking adapter, analytics, drawers, the planner) imports from THIS file, and site.ts
 * re-uses these same objects so there is still one source of truth.
 *
 * Only plain, publishable values live here. No Fact wrappers, no notes.
 */

/** Verified on the provider's receiving page, 7 Oct 2026 (BUILD-CONTRACT §3). */
export const BOOKING_PROVIDER: BookingProvider = {
  name: "LetsBook (eZee)",
  baseUrl: "https://letsbook.me/booking/phukumhomresort",
  legacyUrl: "https://live.ipms247.com/booking/book-rooms-phukumhomresort",
  params: { checkin: "checkin", checkout: "checkout", adults: "adults" },
  unsupported: ["lang", "roomTypeId", "currency", "children"],
  maxAdultsSelectable: 3,
  verified: "2026-10-07",
};

export const FLAGS: Flags = {
  offers: false,
  gatherings: false,
  // On since the resort supplied its LINE Official account (S-40, 22 Nov 2026).
  line: true,
  whatsapp: false,
  instagram: false,
  reviewRating: true,
  enquiryDelivery: false,
  analytics: false,
  // Off until the owner confirms the Google listing's pin is the entrance (RESEARCH Q-14).
  // "Open in Google Maps" stays as a plain link.
  mapEmbed: false,
};

/** Analytics stays inert unless a measurement id is configured through the environment. */
export const GA4_MEASUREMENT_ID: string | null = process.env.NEXT_PUBLIC_GA4_ID || null;

/** Published links (both "confirmed" in the ledger). */
export const FACEBOOK_URL = "https://www.facebook.com/PhukumhomResort";
export const MAPS_LISTING_URL = "https://www.google.com/maps?cid=18118211451784483914";

/**
 * WHOSE SITE THIS IS, RIGHT NOW.
 *
 * "preview": an unofficial concept preview made and published by O2 Design Studio. The resort has not
 * reviewed or approved it and does not operate it. The footer says so, the privacy policy and the terms
 * are worded for it, and every page is kept out of search indexes.
 * "production": the resort's own website on its own domain. Only the one deployment that sets
 * SITE_ENV=production is this (next.config.ts publishes the mode as NEXT_PUBLIC_SITE_MODE).
 *
 * Going to production is a deliberate switch with prerequisites (docs/HANDOFF.md): the owner's approval
 * of the content, the photographs and the policies, and an authorised domain in site.origin.production.
 */
export const SITE_MODE: "preview" | "production" = process.env.NEXT_PUBLIC_SITE_MODE === "production" ? "production" : "preview";
export const IS_PREVIEW: boolean = SITE_MODE === "preview";

/** Who makes and publishes the preview. The studio's own website is its only published contact route. */
export const PREVIEW_OPERATOR = { name: "O2 Design Studio", url: "https://o2-designstudio.com/" } as const;

/** Where a preview is hosted, when the build knows: the static export is made for GitHub Pages. */
export const PREVIEW_HOST: "github-pages" | "unspecified" = process.env.NEXT_PUBLIC_PREVIEW_HOST === "github-pages" ? "github-pages" : "unspecified";

/** The resort's time zone. Stay dates and the clock are always computed in it. */
export const RESORT_TIME_ZONE = "Asia/Bangkok";
