import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { pageMetadata } from "@/lib/seo";
import { HomeNearby } from "@/components/home/nearby";
import { LabFrame } from "./LabFrame";

/** Lab: homepage chapter 06, "Around Khao Yai", on its own. Internal and noindex. */

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? pageMetadata(lang, "home", { noindex: true }) : {};
}

export default async function NearbyLab({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <LabFrame lang={lang} name="nearby">
      <HomeNearby lang={lang} />
    </LabFrame>
  );
}
