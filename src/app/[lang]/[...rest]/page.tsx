import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { notFoundPageMetadata } from "@/components/site/not-found-metadata";
import { isLocale } from "@/i18n/config";

/**
 * Every address under /th or /en that no other route claims. The top-level [lang] segment matches
 * any first path segment, so Next never reaches a global not-found on its own: this catch-all sends
 * unknown paths to ../not-found.tsx, which answers 404 inside the site shell.
 *
 * It declares the not-found metadata itself as well. The browser builds the page from this route's
 * data after the 404 arrives, so without it the document would end up titled as the homepage (the
 * layout's fallback) — see src/components/site/not-found-metadata.ts.
 */

type Props = { params: Promise<{ lang: string; rest: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? notFoundPageMetadata(lang) : {};
}

export default function CatchAll(): never {
  notFound();
}
