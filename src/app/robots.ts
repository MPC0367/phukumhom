import type { MetadataRoute } from "next";
import { IS_PUBLIC_SITE, absoluteUrl } from "@/lib/seo";

/**
 * /robots.txt — follows the environment.
 *
 * Preview (anything without SITE_ENV=production): every crawler is turned away and no sitemap is
 * advertised. next.config.ts also sends `X-Robots-Tag: noindex, nofollow` and each page carries a
 * robots meta tag, so a preview stays out of search even if this file is ignored.
 *
 * Public site: everything is crawlable except the API and the QA harness, and the sitemap is named.
 */
export default function robots(): MetadataRoute.Robots {
  if (!IS_PUBLIC_SITE) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/_qa/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
