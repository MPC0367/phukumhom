import Link from "next/link";
import type { AssetId, Locale } from "@/content/schema";
import { notFoundSeo } from "@/content/seo";
import { Reveal, SplitReveal } from "@/components/motion";
import { Band } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Kicker } from "@/components/ui/Kicker";
import { Picture } from "@/components/ui/Picture";
import { TextLink } from "@/components/ui/TextLink";
import { cx } from "@/components/ui/cx";
import { t } from "@/i18n/ui";
import { href } from "@/lib/routes";
import { BookingLink } from "./BookingLink";
import { RoomName } from "./RoomName";
import { roomNav } from "./nav";
import styles from "./NotFoundView.module.css";

/**
 * The body of the localized 404 page, direction 2: a full-bleed band (the forecourt at blue hour) that
 * runs behind the header, with what happened in one large line, the glossary's sentence, the booking
 * pill and the way home; then the places a guest most likely wanted, as large numbered rows: the rooms
 * (and each room type), the location, the contact page.
 *
 * It sits inside the normal shell, so the header, the menu and the footer are all there too.
 *
 * The heading is the page's single <h1>; its wording is `notFoundSeo` in src/content/seo.ts (the same
 * words as the glossary's pageNames.notFound). The sentence is glossary messages.notFoundBody.
 * The photograph is legacy frame 01_12, catalogued for full-bleed use; it is described by its
 * catalogued alt text and makes no claim about the page.
 */

/** Legacy frame 01_12: the forecourt and rooftop pergolas at blue hour. */
const FRAME: AssetId = "topiary-forecourt-pergola-buildings-blue-hour";

export function NotFoundView({ lang }: { lang: Locale }) {
  const ui = t(lang);
  const rooms = roomNav(lang);
  const places = [
    { id: "stay", label: ui.pageNames.stay, to: href(lang, "stay") },
    { id: "location", label: ui.pageNames.location, to: href(lang, "location") },
    { id: "contact", label: ui.pageNames.contact, to: href(lang, "contact") },
  ];

  return (
    <>
      <Band overHeader height="tall" scrim="hero" grain media={<Picture asset={FRAME} lang={lang} fill priority />}>
        <div className={styles.text}>
          <Kicker number="404">{ui.names.resortFull}</Kicker>
          <SplitReveal as="h1" lang={lang} trigger="loader" className={cx("hero-line", styles.title)}>
            {notFoundSeo[lang].h1}
          </SplitReveal>
          <Reveal trigger="loader" delay={0.3} className={styles.after}>
            <p className={cx("lead", styles.body)}>{ui.messages.notFoundBody}</p>
            <div className={styles.actions}>
              <BookingLink lang={lang} placement="not-found" planner size="lg" />
              <Button href={href(lang, "home")} variant="ghost" size="lg">
                {ui.actions.backToHome}
              </Button>
            </div>
          </Reveal>
        </div>
      </Band>

      <div className={cx("container", styles.places)}>
        <Reveal as="ul" stagger={0.09} className={styles.list}>
          {places.map((place, index) => (
            <li key={place.id} className={styles.entry}>
              <Link href={place.to} className={styles.row}>
                <span className={cx("numeral", styles.number)} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={cx("h2", styles.label)}>{place.label}</span>
                <Icon name="arrow-right" size={24} className={styles.arrow} />
              </Link>
              {place.id === "stay" ? (
                <ul role="list" className={styles.rooms}>
                  {rooms.map((room) => (
                    <li key={room.id}>
                      <TextLink href={room.href} variant="arrow">
                        <RoomName lang={lang} name={room.label} />
                      </TextLink>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </Reveal>
      </div>
    </>
  );
}
