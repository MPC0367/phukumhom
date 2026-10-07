import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeHero } from "@/components/home/hero";
import { isLocale } from "@/i18n/config";
import { pageMetadata } from "@/lib/seo";
import s from "./lab.module.css";

/**
 * Lab: the homepage hero on its own, followed by a stand-in for the first chapter so the planner dock,
 * the scroll fade and the header's change can be judged the way they will meet the real page.
 * Internal: noindex, not in the route table, the navigation or the sitemap.
 *
 * Nothing sits above the hero: it is the first thing in <main>, behind the header, as on the homepage.
 */

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? pageMetadata(lang, "home", { noindex: true }) : {};
}

export default async function HeroLab({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <>
      <HomeHero lang={lang} />
      {/* A stand-in for chapter 01: only its rhythm matters here. */}
      <div className={s.next} aria-hidden="true">
        <div className={`container ${s.nextInner}`}>
          <span className={s.rail}>
            <span className={s.block} />
            <span className={s.blockWide} />
          </span>
          <span className={s.column}>
            <span className={s.blockTall} />
            <span className={s.blockPhoto} />
          </span>
        </div>
      </div>
    </>
  );
}
