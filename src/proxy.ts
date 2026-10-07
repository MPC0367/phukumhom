import { NextResponse, type NextRequest } from "next/server";
import legacyTable from "@/content/legacy-redirects.json";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "@/i18n/config";
import type { Locale } from "@/content/schema";

/**
 * Request routing that has to happen before a page renders:
 *
 * 1. Known legacy URLs from the 2012 PHP site (/th/rate.php?page=rate …) → the closest new page, in one
 *    hop, keeping the language. The table is generated from the reviewed manifest in docs/redirects.json
 *    (`node scripts/sync-redirects.mjs`). The old `page` / `galleryshow` parameters are dropped; campaign
 *    parameters (utm_*, fbclid, gclid …) are kept. An unknown `.php` path is NOT sent to the homepage — it
 *    falls through to the 404 like any other unknown URL.
 * 2. "/" and bare page names (/stay, /contact …) → the visitor's language tree. The choice is a saved
 *    explicit preference, else the browser's first language, else Thai. No geolocation, and a visitor who
 *    has chosen a language is never redirected against it. These are temporary redirects because the
 *    answer depends on the visitor.
 * 3. Anything else outside /th and /en is rewritten into the visitor's tree so the localized not-found
 *    page answers with a real 404 inside the site chrome.
 *
 * API routes, Next internals and static files pass through untouched (see `config.matcher`).
 */

const LEGACY = legacyTable as Record<string, { to: string; status: number }>;

/** Parameters that only drove menu highlighting on the old site. */
const LEGACY_PARAMS = ["page", "galleryshow"];

/** Bare first segments that exist as pages inside each language tree. */
const BARE = new Set(["stay", "dining", "experiences", "gallery", "location", "contact", "faq", "privacy", "terms", "gatherings", "offers"]);

function preferredLocale(req: NextRequest): Locale {
  const saved = req.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;
  const first = (req.headers.get("accept-language") ?? "").split(",")[0]?.trim().toLowerCase() ?? "";
  if (first.startsWith("en")) return "en";
  return DEFAULT_LOCALE;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

  // 1. Known legacy URLs.
  const legacy = LEGACY[clean];
  if (legacy) {
    const target = new URL(legacy.to, req.url);
    for (const [key, value] of req.nextUrl.searchParams) {
      if (!LEGACY_PARAMS.includes(key) && !target.searchParams.has(key)) target.searchParams.append(key, value);
    }
    return NextResponse.redirect(target, legacy.status);
  }

  const first = clean.split("/")[1] ?? "";
  if (isLocale(first)) return NextResponse.next();

  const lang = preferredLocale(req);

  // 2. Root and bare page names.
  if (clean === "/" || BARE.has(first)) {
    const url = req.nextUrl.clone();
    url.pathname = clean === "/" ? `/${lang}` : `/${lang}${clean}`;
    return NextResponse.redirect(url, 307);
  }

  // 3. Unknown path: keep the URL, answer from the language tree's not-found page (status 404).
  const url = req.nextUrl.clone();
  url.pathname = `/${lang}${clean}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    // Everything except API routes, Next internals, the media folders, the QA harness and plain static files.
    // `.php` and `.html` are deliberately NOT excluded: legacy URLs must reach the table above.
    "/((?!api/|_next/|media/|og/|_qa/|favicon\\.ico|icon\\.|apple-icon\\.|robots\\.txt|sitemap\\.xml|.*\\.(?:png|jpe?g|webp|avif|gif|svg|ico|txt|xml|json|webmanifest|woff2?|map)$).*)",
  ],
};
