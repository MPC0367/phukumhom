import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BandRooftopView } from "@/components/home/band";
import { MotionProvider } from "@/components/motion";
import { CompareTable, HomeStay } from "@/components/stay";
import { copy } from "@/content/pages/home/stay";
import { isLocale } from "@/i18n/config";
import { t } from "@/i18n/ui";
import { pageMetadata } from "@/lib/seo";
import s from "./lab.module.css";

/**
 * Lab: Band A, then homepage chapter 02 "Stay" (the room stage with its comparison drawer), then the comparison
 * table on its own in the page, the way the stay page will carry it under "#compare". Internal: noindex,
 * not in the route table, the navigation or the sitemap.
 *
 * The motion provider is mounted here so the section can be judged before the language layout carries
 * it; once it does, this inner one steps aside (it is nest-safe).
 */

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? pageMetadata(lang, "home", { noindex: true }) : {};
}

export default async function StayLab({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const ui = t(lang);
  const c = copy[lang];

  return (
    <MotionProvider>
      <div className={s.spacer} aria-hidden="true">
        <span className={s.spacerMark} />
      </div>

      {/* Band A is this chapter's neighbour on the homepage: the join between them is judged here. */}
      <BandRooftopView lang={lang} />

      <HomeStay lang={lang} />

      <section id="compare" className={`container ${s.inline}`} aria-labelledby="lab-compare-title">
        <h2 id="lab-compare-title" className="h2">
          {ui.actions.compareRooms}
        </h2>
        <p className={`lead ${s.inlineIntro}`}>{c.compare.intro}</p>
        <CompareTable lang={lang} />
      </section>

      <div className={s.spacer} aria-hidden="true">
        <span className={s.spacerMark} />
      </div>
    </MotionProvider>
  );
}
