import type { Locale } from "@/content/schema";
import { getAsset } from "@/content/assets";
import { RECEPTION_ASSET, copy } from "@/content/pages/home/arrive";
import { MediaReveal, Parallax, Reveal, SplitReveal } from "@/components/motion";
import { Phrases } from "@/components/places/Phrases";
import { Chapter } from "@/components/ui/Chapter";
import { Icon } from "@/components/ui/Icon";
import { Panel } from "@/components/ui/Panel";
import { Picture } from "@/components/ui/Picture";
import { cx } from "@/components/ui/cx";
import { ArrivePanels } from "./ArrivePanels";
import styles from "./HomeArrive.module.css";

/**
 * Homepage chapter 07: getting here.
 *
 *   rail      07, "Getting here", the title "Arrive" (Thai: การเดินทาง), a two-sentence intro; the title
 *             rises out of its mask and the intro fades in after it, as in chapter 01
 *   content   two rounded panels, then the reception building at dusk with the locality sentence on a
 *             card that floats over its corner
 *
 *   ADDRESS (white)              the ruled address in the display face, inside <address>;
 *                                Copy address (turns into a tick, with a toast) and Share location;
 *                                Open in Google Maps, with one line saying what that link is
 *   TALK TO THE RESORT (forest)  the one phone number as a large figure that dials; the time at the
 *                                resort right now, so a caller knows; Contact on Facebook; Send an enquiry
 *
 * FACTS. Every one is read through pub() from src/content/site.ts, and a withheld fact leaves no trace:
 * no address means no address panel, no number means no figure, and so on. The map link is the resort's
 * own Google Maps listing and is labelled as that. It is never called the entrance, no coordinates are
 * printed, and nothing here states a distance or a journey time. There is one phone number and no
 * email. The photograph's caption and alt text are the catalogue's.
 *
 * NO MAP. The `mapEmbed` flag is off, and a disabled feature leaves no trace: there is no frame, no
 * placeholder and no empty box. The link to the listing is the map.
 *
 * WITHOUT JAVASCRIPT the two buttons that need it (copy, share) are not shown; the address, the map
 * link, the phone link and the two contact links are plain HTML and all work.
 */
export function HomeArrive({ lang }: { lang: Locale }) {
  const c = copy[lang];

  const photo = getAsset(RECEPTION_ASSET);

  return (
    <Chapter
      lang={lang}
      id="arrive"
      number={7}
      kicker={c.kicker}
      title={
        <SplitReveal as="span" lang={lang} className={styles.railTitle}>
          {c.title}
        </SplitReveal>
      }
      intro={
        <Reveal as="span" variant="fade" delay={0.2} className={styles.railIntro}>
          <Phrases lang={lang} text={c.intro} />
        </Reveal>
      }
    >
      <div className={styles.arrive}>
        <ArrivePanels lang={lang} />

        <div className={styles.stage}>
          <figure className={styles.photo}>
            <MediaReveal className={styles.frame}>
              <Parallax speed={0.08} className={styles.parallax}>
                <Picture asset={RECEPTION_ASSET} lang={lang} fill ratio="3/2" sizes="(min-width: 64rem) min(54rem, 62vw), 100vw" />
              </Parallax>
            </MediaReveal>
            <figcaption className={styles.caption}>
              <Reveal as="span" variant="fade" delay={0.6} className={styles.captionChip}>
                {photo.caption[lang]}
              </Reveal>
            </figcaption>
          </figure>

          <Reveal delay={0.25} className={styles.cardSlot}>
            <Panel tone="white" float className={styles.card}>
              <span aria-hidden="true" className={styles.cardMark}>
                <Icon name="pin" size={18} />
              </span>
              <SplitReveal as="p" lang={lang} delay={0.35} className={cx("h3", styles.locality)}>
                <Phrases lang={lang} text={c.locality} />
              </SplitReveal>
            </Panel>
          </Reveal>
        </div>
      </div>
    </Chapter>
  );
}
