import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { DEFAULT_LOCALE, LOCALES } from "@/i18n/config";
import { absoluteUrl, sitemapPaths } from "@/lib/seo";

/**
 * /sitemap.xml — one entry per language version of every published, indexable page, each listing
 * all of its language versions (itself included) plus x-default → the Thai page.
 *
 * The list comes from the route table (`publishedPaths`, via `sitemapPaths`), so a route behind a
 * switched-off feature flag is absent, a page marked "never index" in src/content/seo.ts is absent,
 * and the internal /styleguide page is never listed. URLs use the canonical origin of the
 * environment; robots.ts only advertises this file on the public site.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const path of sitemapPaths()) {
    const languages = {
      ...Object.fromEntries(LOCALES.map((lang) => [lang, absoluteUrl(`/${lang}${path}`)])),
      "x-default": absoluteUrl(`/${DEFAULT_LOCALE}${path}`),
    };
    for (const lang of LOCALES) {
      entries.push({
        url: absoluteUrl(`/${lang}${path}`),
        lastModified: site.lastUpdated,
        alternates: { languages },
      });
    }
  }
  return entries;
}
