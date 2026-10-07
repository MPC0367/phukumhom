import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { AssetId } from "@/content/schema";
import { isLocale } from "@/i18n/config";
import { Picture } from "@/components/ui/Picture";
import { MediaReveal, Reveal, SplitReveal } from "@/components/motion";
import { copy } from "../copy";
import s from "../lab.module.css";

/**
 * A second, short page under the lab's provider. It exists to be navigated to and from: the incoming
 * page should rise and fade in, its first screen should make its entrance, what is below the fold
 * should wait for the scroll, and smooth scrolling should start from the top however far down the
 * previous page was left. Internal and noindex, like the lab itself.
 */

export const metadata: Metadata = {
  title: "Motion lab, second page | Phukumhom Resort",
  robots: { index: false, follow: false },
};

const SUNSET: AssetId = "clay-buildings-hedge-columns-sunset-wide"; // legacy 01_01
const FORECOURT: AssetId = "topiary-forecourt-pergola-buildings-blue-hour"; // 01_12

export default async function MotionLabSecond({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const c = copy[lang];
  const back = `/${lang}/lab/motion`;

  return (
    <>
      <section className={`container ${s.hero}`}>
        <div className={s.heroText}>
          <h1 className={`eyebrow ${s.heroEyebrow}`}>
            <span>{c.kicker}</span>
            <span className={s.heroResort}>{c.second.kicker}</span>
          </h1>
          <SplitReveal as="p" lang={lang} trigger="loader" className={`hero-line ${s.heroLine}`}>
            {c.second.lines[0]}
            <br />
            {c.second.lines[1]}
            {c.second.accent ? (
              <>
                {" "}
                <em>{c.second.accent}</em>
              </>
            ) : null}
          </SplitReveal>
          <Reveal as="p" trigger="loader" delay={0.35} className={`lead ${s.heroSupporting}`}>
            {c.second.supporting}
          </Reveal>
          <Reveal as="p" trigger="loader" delay={0.5} variant="fade" className={s.linkList}>
            <Link href={back}>{c.second.back}</Link>
          </Reveal>
        </div>
        <MediaReveal trigger="loader" delay={0.1} className={s.heroMedia}>
          <Picture asset={SUNSET} lang={lang} fill priority ratio="4/5" sizes="(min-width: 64rem) 36rem, 100vw" />
        </MediaReveal>
      </section>

      <section id="below" className={`container ${s.chapter}`}>
        <header className={s.rail}>
          <p className="numeral">01</p>
          <SplitReveal as="h2" lang={lang} className={`chapter-title ${s.railTitle}`}>
            {c.second.title}
          </SplitReveal>
          <Reveal as="p" delay={0.15} className={`lead ${s.railIntro}`}>
            {c.second.intro}
          </Reveal>
        </header>
        <div className={s.content}>
          <MediaReveal className={s.duoWide}>
            <Picture asset={FORECOURT} lang={lang} fill ratio="3/2" sizes="(min-width: 64rem) 55rem, 100vw" />
          </MediaReveal>
          <Reveal as="ul" stagger={0.09} className={s.linkList}>
            <li>
              <Link href={back}>{c.second.back}</Link>
            </li>
            <li>
              <Link href={`${back}#reel`}>{c.second.backToReel}</Link>
            </li>
          </Reveal>
        </div>
      </section>
    </>
  );
}
