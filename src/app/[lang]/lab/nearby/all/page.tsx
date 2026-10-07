import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { pageMetadata } from "@/lib/seo";
import { HomeArrive } from "@/components/home/arrive";
import { HomeClosing } from "@/components/home/closing";
import { HomeNearby } from "@/components/home/nearby";
import { LabFrame } from "../LabFrame";

/**
 * Lab: the tail of the homepage as it will be composed: chapter 06, chapter 07, the closing band, and
 * then the site footer. For judging the joins: the hairlines between chapters, one sticky rail handing
 * over to the next, paper meeting the forest band, the band meeting the footer. Internal and noindex.
 */

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? pageMetadata(lang, "home", { noindex: true }) : {};
}

export default async function TailLab({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <LabFrame lang={lang} name="nearby/all" tail={false}>
      <HomeNearby lang={lang} />
      <HomeArrive lang={lang} />
      <HomeClosing lang={lang} />
    </LabFrame>
  );
}
