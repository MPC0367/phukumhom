import Link from "next/link";
import { pub, type Locale } from "@/content/schema";
import { site } from "@/content/site";
import { Icon } from "@/components/ui/Icon";
import { fill, t } from "@/i18n/ui";
import { bookingHref } from "@/lib/booking";
import { formatPhone, telHref } from "@/lib/format";
import { href } from "@/lib/routes";
import { StickyBar } from "./StickyBar";
import styles from "./StickyActions.module.css";

/**
 * The phone action bar (ART-DIRECTION section 7, feature 8): a white rounded dock that floats above the
 * bottom edge with three actions.
 *
 *   Call                  tel: link to the one published number (left out while the number is withheld)
 *   Rooms                 the Stay page
 *   Check availability    terracotta; a link to the booking page that opens the planner drawer when
 *                         script is running (`data-open-planner`)
 *
 * Mount once, in the language layout, after the footer. It is displayed only below 48rem, the width
 * from which the header carries the booking pill, and only while <StickyBar> says the screen has room
 * for it (see that file for the rules). It keeps clear of the bottom safe-area inset and never covers
 * focused content.
 */
export function StickyActions({ lang }: { lang: Locale }) {
  const ui = t(lang);
  const phone = pub(site.phone);
  const tel = telHref(phone);
  const number = formatPhone(phone, lang);

  return (
    <StickyBar label={ui.a11y.stickyActions}>
      {tel && number ? (
        <a href={tel} className={styles.action} aria-label={fill(ui.patterns.callOn, { phone: number })} data-analytics="call_click" data-placement="sticky-bar">
          <Icon name="phone" size={18} className={styles.icon} />
          <span className={styles.callWord}>{ui.actions.call}</span>
        </a>
      ) : null}
      <Link href={href(lang, "stay")} className={styles.action}>
        {ui.actions.rooms}
      </Link>
      <a href={bookingHref()} className={styles.book} data-open-planner="" data-placement="sticky-bar">
        {ui.actions.checkAvailability}
      </a>
    </StickyBar>
  );
}
