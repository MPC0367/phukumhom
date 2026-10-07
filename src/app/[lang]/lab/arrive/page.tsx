import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { pageMetadata } from "@/lib/seo";
import { HomeArrive } from "@/components/home/arrive";
import { LabFrame } from "../nearby/LabFrame";

/** Lab: homepage chapter 07, "Getting here", on its own. Internal and noindex. */

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? pageMetadata(lang, "home", { noindex: true }) : {};
}

export default async function ArriveLab({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <LabFrame lang={lang} name="arrive">
      <HomeArrive lang={lang} />
    </LabFrame>
  );
}
