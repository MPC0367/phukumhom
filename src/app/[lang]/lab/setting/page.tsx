import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BandRooftopView } from "@/components/home/band";
import { HomeSetting } from "@/components/home/setting";
import { MotionProvider } from "@/components/motion";
import { isLocale } from "@/i18n/config";
import { pageMetadata } from "@/lib/seo";
import s from "./lab.module.css";

/**
 * Lab: homepage chapter 01 "The setting" and Band A, on their own, with room above and below to judge
 * how they arrive and leave. Internal: noindex, not in the route table, the navigation or the sitemap.
 *
 * The motion provider is mounted here so the section can be judged before the language layout carries
 * it; once it does, this inner one steps aside (it is nest-safe).
 */

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? pageMetadata(lang, "home", { noindex: true }) : {};
}

export default async function SettingLab({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <MotionProvider>
      <div className={s.spacer} aria-hidden="true">
        <span className={s.spacerMark} />
      </div>
      <HomeSetting lang={lang} />
      <BandRooftopView lang={lang} />
      <div className={s.spacer} aria-hidden="true">
        <span className={s.spacerMark} />
      </div>
    </MotionProvider>
  );
}
