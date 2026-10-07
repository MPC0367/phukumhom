import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { pageMetadata } from "@/lib/seo";
import { MotionProvider } from "@/components/motion";
import { HomeReel } from "@/components/home/reel";
import s from "./lab.module.css";

/**
 * Lab: Band B, the reel, on its own.
 *
 * Internal. Not in the route table, the navigation or the sitemap, and noindex. The section is rendered
 * exactly as the homepage will render it, between two blank screens so its arrival and its leaving can
 * be judged while scrolling. MotionProvider is mounted here because a lab must move even before the
 * language layout carries the provider; once it does, this one steps aside (it is nest-safe).
 */

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? pageMetadata(lang, "home", { noindex: true }) : {};
}

export default async function Lab({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <MotionProvider>
      <h1 className="vh" lang="en">
        Lab: Band B, the reel
      </h1>
      <div className={s.before} aria-hidden="true" />
      <HomeReel lang={lang} />
      <div className={s.after} aria-hidden="true" />
    </MotionProvider>
  );
}
