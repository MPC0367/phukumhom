import type { Locale } from "@/content/schema";
import { copy } from "@/content/pages/home/nearby";
import { Reveal, SplitReveal } from "@/components/motion";
import { PlacesFilter } from "@/components/places";
import { Phrases } from "@/components/places/Phrases";
import { Chapter } from "@/components/ui/Chapter";
import { TextLink } from "@/components/ui/TextLink";
import { href } from "@/lib/routes";
import styles from "./HomeNearby.module.css";

/**
 * Homepage chapter 06: places to visit around Khao Yai.
 *
 *   rail      06, "Places to visit", the title "Around Khao Yai" (Thai: รอบเขาใหญ่), a two-sentence intro
 *             and the onward link to the Location page
 *   content   <PlacesFilter>: the chips, the count and one row a published place
 *
 * The heading says "around Khao Yai" and never "nearby": two of the places are in another sub-district
 * and no closeness is claimed for any of them (BUILD-CONTRACT section 8). In English the first word of
 * the title is the chapter's one italic accent; the Thai title is one phrase and is never italic.
 *
 * The title is two words, so it is set a step below the single-word chapter titles: "Khao Yai" then
 * holds on one line at every rail width (HomeNearby.module.css).
 *
 * In the rail the title's lines rise out of their masks and the intro fades in after them, as in
 * chapter 01. The Thai intro wraps between its phrases (<Phrases>).
 */
export function HomeNearby({ lang }: { lang: Locale }) {
  const c = copy[lang];

  return (
    <Chapter
      lang={lang}
      id="around"
      number={6}
      kicker={c.kicker}
      className={styles.chapter}
      title={
        <SplitReveal as="span" lang={lang} className={styles.railTitle}>
          {c.title.accent ? (
            <>
              <em>{c.title.accent}</em> <span className={styles.keep}>{c.title.rest}</span>
            </>
          ) : (
            c.title.rest
          )}
        </SplitReveal>
      }
      intro={
        <Reveal as="span" variant="fade" delay={0.2} className={styles.railIntro}>
          <Phrases lang={lang} text={c.intro} />
        </Reveal>
      }
      actions={
        <TextLink variant="arrow" href={href(lang, "location")}>
          {c.locationLink}
        </TextLink>
      }
    >
      <PlacesFilter lang={lang} />
    </Chapter>
  );
}
