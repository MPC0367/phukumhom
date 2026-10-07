import type { NextConfig } from "next";

/**
 * Two builds come out of this one codebase.
 *
 *   next dev / next build   the ordinary Next app, with the request proxy (locale routing, legacy redirects)
 *                           and the security headers below. For any Node host.
 *
 *   PAGES_EXPORT=1          a folder of static HTML for GitHub Pages (scripts/export-pages.mjs). There is no
 *                           server there: no proxy, no headers, no route handlers. BASE_PATH is the prefix a
 *                           project site is served under ("/phukumhom"); it is also published to the
 *                           browser so hand-written asset URLs can carry it (src/lib/base-path.ts).
 */
const isDev = process.env.NODE_ENV !== "production";
const isExport = process.env.PAGES_EXPORT === "1";
const basePath = (process.env.BASE_PATH ?? "").replace(/\/+$/, "");
/**
 * Only a deployment that sets SITE_ENV=production is the public site. Everything else — `next dev`, a
 * local `next start` on http://127.0.0.1, the Pages preview — is a preview: never indexed, and never told to
 * upgrade to HTTPS (which would break a plain-http preview in browsers that do not exempt loopback).
 */
const isPublicSite = process.env.SITE_ENV === "production";
const ga4 = process.env.NEXT_PUBLIC_GA4_ID ?? "";

/** The booking partner receives a plain GET form post; nothing else leaves the site by form. */
const BOOKING_ORIGIN = "https://letsbook.me";

const csp = [
  "default-src 'self'",
  // React's dev tooling needs eval; a production build never does. Analytics hosts are added only when configured.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${ga4 ? " https://www.googletagmanager.com" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}${ga4 ? " https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com" : ""}`,
  "media-src 'self'",
  // The optional click-to-load map is the only third-party frame, and only after the visitor asks for it.
  "frame-src 'self' https://www.google.com https://maps.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  `form-action 'self' ${BOOKING_ORIGIN}`,
  // Same-origin framing only.
  "frame-ancestors 'self'",
  ...(isPublicSite ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // Before enabling on the real domain, check the DNS zone for webmail or control-panel subdomains.
  ...(isPublicSite ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : []),
  // A preview must never reach a search index, whatever robots.txt says.
  ...(isPublicSite ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Keep the dev badge out of QA screenshots.
  devIndicators: false,
  // Always render metadata into <head> before the body streams, for every user agent: titles, canonicals and
  // hreflang must be where crawlers, link previews and our own checks expect them. Pages are static, so it costs nothing.
  htmlLimitedBots: /.*/,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  images: {
    // Derivatives are pre-encoded at fixed widths by scripts/process-images.mjs; no runtime optimizer.
    unoptimized: true,
  },

  ...(isExport
    ? {
        output: "export" as const,
        // Every route becomes a folder with an index.html, so links work on a host that does no rewriting.
        trailingSlash: true,
        basePath: basePath || undefined,
        assetPrefix: basePath || undefined,
      }
    : {
        async headers() {
          return [
            { source: "/:path*", headers: securityHeaders },
            // File names are descriptive, not content-hashed, so a re-encoded photograph keeps its URL: cache
            // for a week and revalidate, never `immutable`.
            {
              source: "/media/:file*",
              headers: [{ key: "Cache-Control", value: isDev ? "no-cache" : "public, max-age=604800, stale-while-revalidate=86400" }],
            },
          ];
        },
      }),
};

export default nextConfig;
