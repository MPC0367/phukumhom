import { pub, type Locale } from "@/content/schema";
import { site } from "@/content/site";
import { Clock } from "@/components/motion";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/components/ui/cx";
import { fill, t } from "@/i18n/ui";
import { formatPhone, telHref } from "@/lib/format";
import { BookingLink } from "./BookingLink";
import { ExploreMenu } from "./ExploreMenu";
import { GiantWordmark } from "./GiantWordmark";
import { HeaderFrame } from "./HeaderFrame";
import { LangSwitch } from "./LangSwitch";
import { MobileMenu } from "./MobileMenu";
import { NavLink } from "./NavLink";
import { Wordmark } from "./Wordmark";
import { exploreNav, primaryNav } from "./nav";
import styles from "./Header.module.css";
import menu from "./MobileMenu.module.css";

/**
 * The site header, direction 2 (ART-DIRECTION section 5). Always visible; it never hides and its height
 * never changes. Over a hero it is transparent with paper-coloured words; everywhere else it is paper
 * with ink words and a hairline (see <HeaderFrame> and Header.module.css).
 *
 *   from 72rem   Stay  Dining  Experiences  Location  Explore      PHUKUMHOM      TH / EN  Check availability
 *   48 to 72rem  PHUKUMHOM                                TH / EN  Check availability  Menu
 *   below        PHUKUMHOM                                                   TH / EN  Menu
 *
 * The widths are the header's own, in rem that follow the guest's text size, so a booking action is in
 * reach at every size: in the bar from 48rem, in the phone action bar below it.
 *
 * "Check availability" is a real link to the booking page that also opens the planner drawer when
 * script is running (<BookingLink planner>, caught by <PlannerDrawerHost>).
 *
 * A Server Component: it works out every label and address once and hands plain data and rendered
 * elements to four small client islands: <HeaderFrame> (the photograph state), <NavLink> (which page is
 * current), <ExploreMenu> (the disclosure) and <MobileMenu> (the sheet), plus <LangSwitch>.
 *
 * The lists come from ./nav, so a flagged-off page (Gatherings, Offers) is absent here, in the mobile
 * menu and in the footer alike. The navigation comes first in the source so that, in the full bar, the
 * tab order runs as the eye does: pages, the name, language, booking.
 */
export function Header({ lang }: { lang: Locale }) {
  const ui = t(lang);
  const primary = primaryNav(lang);
  const explore = exploreNav(lang);
  const languageNames = { th: ui.labels.languageThai, en: ui.labels.languageEnglish };

  const phone = pub(site.phone);
  const tel = telHref(phone);
  const number = formatPhone(phone, lang);
  const map = pub(site.maps.listingUrl);

  const menuContact =
    tel || map ? (
      <div className={menu.contactRow}>
        {tel && number ? (
          <Button href={tel} external variant="ghost" aria-label={fill(ui.patterns.callOn, { phone: number })} data-analytics="call_click" data-placement="mobile-menu">
            <span className={menu.callInner}>
              <Icon name="phone" size={18} />
              <span>{ui.actions.call}</span>
            </span>
          </Button>
        ) : null}
        {map ? (
          <Button href={map} external variant="ghost" icon="arrow-up-right" data-analytics="map_click" data-placement="mobile-menu">
            {ui.actions.openInMaps}
          </Button>
        ) : null}
      </div>
    ) : null;

  return (
    <HeaderFrame className={styles.header}>
      <div className={cx("container", styles.bar)}>
        <nav className={styles.nav} aria-label={ui.a11y.mainNav}>
          <ul role="list" className={styles.navList}>
            {primary.map((item) => (
              <li key={item.id}>
                <NavLink href={item.href} path={item.path} className={styles.navLink}>
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li>
              <ExploreMenu label={ui.nav.explore} items={explore} />
            </li>
          </ul>
        </nav>

        <Wordmark lang={lang} className={styles.brand} />

        <div className={styles.tools}>
          <LangSwitch lang={lang} label={ui.a11y.languageSwitch} names={languageNames} className={styles.lang} />
          <BookingLink lang={lang} placement="header" planner icon={null} className={styles.book} />
          <MobileMenu
            labels={{ menu: ui.actions.menu, close: ui.actions.close, closeMenu: ui.actions.closeMenu, nav: ui.a11y.mainNav, more: ui.a11y.exploreNav }}
            primary={primary}
            more={explore}
            brand={<Wordmark lang={lang} />}
            booking={<BookingLink lang={lang} placement="mobile-menu" planner size="lg" fullWidth />}
            contact={menuContact}
            language={<LangSwitch lang={lang} label={ui.a11y.languageSwitch} names={languageNames} />}
            clock={<Clock lang={lang} label="visible" />}
            mark={<GiantWordmark text={ui.wordmark.name} className={menu.markSvg} />}
          />
        </div>
      </div>
    </HeaderFrame>
  );
}
