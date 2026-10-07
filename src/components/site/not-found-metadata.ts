import type { Metadata } from "next";
import type { Locale } from "@/content/schema";
import { notFoundMetadata } from "@/lib/seo";

/**
 * The complete metadata for an address that does not exist, in one language.
 *
 * `notFoundMetadata()` from lib/seo sets the title and keeps the page out of search indexes. That is
 * not enough on its own, because the language layout's fallback metadata is the homepage's, and Next
 * merges by key: without the four `null`s below a missing page would still carry the homepage's
 * description, canonical address, language alternates and social card.
 *
 * Return it from `generateMetadata` wherever the page itself will call `notFound()`:
 *
 *   export async function generateMetadata({ params }: Props): Promise<Metadata> {
 *     const { lang, room } = await params;
 *     if (!isLocale(lang)) return {};
 *     if (!isRoomId(room)) return notFoundPageMetadata(lang);
 *     return pageMetadata(lang, "room", { room });
 *   }
 *
 * Why the page has to say so too, and not only src/app/[lang]/not-found.tsx: when `notFound()` is
 * thrown, the server answers 404 with the not-found file's metadata in <head>, but the browser then
 * renders the page from the route's own data, and the route's own `generateMetadata` is what ends up
 * in the document. If that still describes a real page, the tab shows the wrong title.
 *
 * Server only (lib/seo reads the environment).
 */
export function notFoundPageMetadata(lang: Locale): Metadata {
  return {
    ...notFoundMetadata(lang),
    description: null,
    alternates: null,
    openGraph: null,
    twitter: null,
  };
}
