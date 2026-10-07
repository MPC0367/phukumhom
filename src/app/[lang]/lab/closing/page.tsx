import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { pageMetadata } from "@/lib/seo";
import { HomeClosing } from "@/components/home/closing";
import { LabFrame } from "../nearby/LabFrame";

/**
 * Lab: the homepage's closing band on its own. Internal and noindex.
 * Nothing follows it here but the site footer, exactly as on the homepage.
 */

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? pageMetadata(lang, "home", { noindex: true }) : {};
}

export default async function ClosingLab({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <LabFrame lang={lang} name="closing" tail={false}>
      <HomeClosing lang={lang} />
    </LabFrame>
  );
}
