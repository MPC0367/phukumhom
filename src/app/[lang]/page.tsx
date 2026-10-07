import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeArrive } from "@/components/home/arrive";
import { BandRooftopView } from "@/components/home/band";
import { HomeClosing } from "@/components/home/closing";
import { HomeGrounds } from "@/components/home/grounds";
import { HomeHero } from "@/components/home/hero";
import { HomeNearby } from "@/components/home/nearby";
import { HomeReel } from "@/components/home/reel";
import { HomeRooftop } from "@/components/home/rooftop";
import { HomeSetting } from "@/components/home/setting";
import { HomeTable } from "@/components/home/table";
import { JsonLd } from "@/components/seo/JsonLd";
import { HomeStay } from "@/components/stay";
import { isLocale } from "@/i18n/config";
import { pageMetadata, webPageJsonLd } from "@/lib/seo";

/**
 * The homepage (ART-DIRECTION sections 5 and 6), assembled from its sections in reading order.
 *
 *   hero            the four photographs, the page's only <h1>, and from 64rem the planner dock
 *   01  story       The setting              (id="story": legacy redirects land here)
 *   band A          the rooftop view, full width
 *   02  stay        the room stage, and the comparison drawer (mounted once, inside HomeStay)
 *   03  rooftop     drag the day
 *   04  table       garden and table
 *   05  grounds     around the resort
 *   band B          the gallery reel
 *   06  around      places to visit around Khao Yai
 *   07  arrive      getting here
 *   closing band    continuous with the footer; nothing may sit between the two
 *
 * Every section is a Server Component that draws its own ground, padding and hairline, so this file
 * adds no wrappers: the chapter rails and the room stage are sticky, and a wrapper with
 * `overflow: hidden` would stop them. Only the hero carries `data-header-over` (on a mark inside it).
 *
 * The page reads no request data (no searchParams, cookies or headers) and stays static.
 * The resort's own structured data comes from the layout; this page adds its WebPage node only.
 */

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? pageMetadata(lang, "home") : {};
}

export default async function HomePage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <>
      <JsonLd data={webPageJsonLd(lang, "home")} />
      <HomeHero lang={lang} />
      <HomeSetting lang={lang} />
      <BandRooftopView lang={lang} />
      <HomeStay lang={lang} />
      <HomeRooftop lang={lang} />
      <HomeTable lang={lang} />
      <HomeGrounds lang={lang} />
      <HomeReel lang={lang} />
      <HomeNearby lang={lang} />
      <HomeArrive lang={lang} />
      <HomeClosing lang={lang} />
    </>
  );
}
