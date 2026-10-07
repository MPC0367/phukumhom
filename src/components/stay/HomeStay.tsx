import type { AssetId, Locale, RoomId } from "@/content/schema";
import { copy } from "@/content/pages/home/stay";
import { Reveal, SplitReveal } from "@/components/motion";
import { Button, Chapter, TextLink } from "@/components/ui";
import { t } from "@/i18n/ui";
import { href } from "@/lib/routes";
import { CompareDrawerHost } from "./CompareDrawerHost";
import { CompareTable } from "./CompareTable";
import { RoomStage } from "./RoomStage";
import s from "./HomeStay.module.css";

/**
 * Homepage chapter 02, "Stay": the room stage, and the comparison drawer it opens.
 *
 *   rail      02, the kicker, the chapter title, a two-sentence intro, the Compare rooms pill and a
 *             link to the stay page
 *   content   <RoomStage>: the three room types as a list beside a sticky photograph
 *
 * Compare rooms is a real link to the comparison on the stay page (#compare). <CompareDrawerHost>,
 * mounted here once, upgrades it: with script running it opens a drawer holding the same <CompareTable>.
 *
 * The stage's photographs. Each room type is shown by its catalogued lead, with two exceptions made for
 * this page, so that no photograph is seen twice on the way down it:
 *
 *   Deluxe Balcony      its lead (legacy 02_13) is Band A, directly above this chapter, at full width;
 *                       its other lounger frame (02_11) is a tile in chapter 05. The stage shows the
 *                       same room type's rooftop terrace from the other side (02_14).
 *   Executive Pool Spa  its lead (04_24) is a hero slide and the day frame of chapter 03, directly
 *                       below. The stage shows the spa tub in low sun (04_28).
 *
 * Both are catalogued for their own room type (leadFor() throws otherwise). Pass `leads={{}}` to get
 * the catalogued leads back on a page where those neighbours do not exist.
 */

const HOME_LEADS: Partial<Record<RoomId, AssetId>> = {
  "deluxe-balcony": "rooftop-terrace-table-screen-steps-down", // legacy 02_14
  "executive-pool-spa": "spa-tub-wooden-blinds-low-sun", // legacy 04_28
};

export interface HomeStayProps {
  lang: Locale;
  /** The section id the chapter index and in-page links use. */
  id?: string;
  /** Per-room replacements for the lead photograph. Defaults to the homepage's own (see above). */
  leads?: Partial<Record<RoomId, AssetId>>;
  /** The hairline above the chapter. Off by default: on the homepage this chapter follows Band A. */
  divider?: boolean;
}

export function HomeStay({ lang, id = "stay", leads = HOME_LEADS, divider = false }: HomeStayProps) {
  const c = copy[lang];
  const ui = t(lang);

  return (
    <>
      <Chapter
        id={id}
        number={2}
        lang={lang}
        divider={divider}
        kicker={c.kicker}
        title={
          <SplitReveal as="span" lang={lang} className={s.railTitle}>
            {c.title}
          </SplitReveal>
        }
        intro={
          <Reveal as="span" variant="fade" delay={0.2} className={s.railIntro}>
            {c.intro}
          </Reveal>
        }
        actions={
          <>
            <Button variant="secondary" icon="plus" href={href(lang, "stay", { hash: "compare" })} data-open-compare="">
              {ui.actions.compareRooms}
            </Button>
            <TextLink variant="arrow" href={href(lang, "stay")}>
              {ui.actions.allRooms}
            </TextLink>
          </>
        }
      >
        <RoomStage lang={lang} leads={leads} />
      </Chapter>

      <CompareDrawerHost title={ui.actions.compareRooms} intro={c.compare.intro} closeLabel={ui.actions.close}>
        <CompareTable lang={lang} />
      </CompareDrawerHost>
    </>
  );
}
