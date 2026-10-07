import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeRooftop } from "@/components/home/rooftop";
import { MotionProvider } from "@/components/motion";
import { isLocale } from "@/i18n/config";
import { pageMetadata } from "@/lib/seo";
import s from "./lab.module.css";

/**
 * Lab: homepage chapter 03 "The rooftop" on its own, with room above and below to judge how it arrives
 * and leaves. Internal: noindex, not in the route table, the navigation or the sitemap.
 *
 * The motion provider is mounted here so the band can be judged before the language layout carries
 * it; once it does, this inner one steps aside (it is nest-safe).
 */

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? pageMetadata(lang, "home", { noindex: true }) : {};
}

export default async function RooftopLab({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <MotionProvider>
      {/* No rule under the first stretch: the band draws its own top hairline. */}
      <div className={s.spacer} aria-hidden="true" />
      <HomeRooftop lang={lang} />
      <div className={`${s.spacer} ${s.spacerAfter}`} aria-hidden="true">
        <span className={s.spacerMark} />
      </div>
    </MotionProvider>
  );
}
