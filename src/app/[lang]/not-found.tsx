import type { Metadata } from "next";
import { lang as rootLang } from "next/root-params";
import type { Locale } from "@/content/schema";
import { NotFoundView } from "@/components/site/NotFoundView";
import { notFoundPageMetadata } from "@/components/site/not-found-metadata";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";

/**
 * The localized 404 page. It renders inside the language layout, so an unknown address still gets
 * the header, the menu, the footer and a way back, and it answers with a real 404 status because
 * nothing above it streams (docs/NEXT16-NOTES.md section 1).
 *
 * A not-found file receives no props, so the language comes from `next/root-params` — the one file
 * allowed to use it (BUILD-CONTRACT section 8). Reached through src/app/[lang]/[...rest]/page.tsx for
 * unknown paths, and from any page that calls notFound() (an unknown room, a flagged-off route).
 *
 * The layout's fallback metadata is the homepage's; `notFoundPageMetadata` replaces the title and
 * clears the canonical address, the language alternates, the description and the social card.
 */

async function currentLocale(): Promise<Locale> {
  const value = await rootLang();
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function generateMetadata(): Promise<Metadata> {
  return notFoundPageMetadata(await currentLocale());
}

export default async function NotFound() {
  return <NotFoundView lang={await currentLocale()} />;
}
