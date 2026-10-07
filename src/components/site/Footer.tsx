import { pub, type Locale } from "@/content/schema";
import { copy as skyCopy } from "@/content/pages/sky";
import { site } from "@/content/site";
import { ConsentSettingsLink } from "@/components/analytics";
import { Clock, MoonTonight, Reveal, SunsetTime } from "@/components/motion";
import { Icon } from "@/components/ui/Icon";
import { TextLink } from "@/components/ui/TextLink";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import { cx } from "@/components/ui/cx";
import { fill, t } from "@/i18n/ui";
import { ANALYTICS_CONFIGURED } from "@/lib/analytics";
import { formatPhone, telHref, yearInBangkok } from "@/lib/format";
import { AddressText } from "./AddressText";
import { BackToTopLink } from "./BackToTopLink";
import { FooterWordmark } from "./FooterWordmark";
import { FOOTER_ID } from "./ids";
import { LangSwitch } from "./LangSwitch";
import { NavLink } from "./NavLink";
import { O2Credit } from "./O2Credit";
import { PreviewNotice } from "./PreviewNotice";
import { RoomName } from "./RoomName";
import { footerNav } from "./nav";
import styles from "./Footer.module.css";

/**
 * The site footer, direction 2 (ART-DIRECTION section 6): a forest ground, continuous with the closing
 * band of the homepage.
 *
 *   the GIANT wordmark, fitted to the container (<FooterWordmark>; decoration, it rises when it scrolls in)
 *   address and the map listing          every page, in three columns:
 *   the one phone number, Facebook         the rooms · the rest of the resort · before you travel
 *                                        language, and the resort's sky: the live local time, today's
 *                                        approximate sunset in Pak Chong, tonight's moon
 *   © year, the legal pages, "Cookie settings" (only when measurement is configured), Back to top
 *
 * Every contact line is a published fact read through `pub()`; a withheld one leaves no row. There
 * is no email (not published) and no icon for a network the resort has not given an address for.
 * The year is Gregorian in both languages and is computed on the server, in the resort's timezone.
 * The clock, the sunset and the moon are worked out in the visitor's browser for Asia/Bangkok and Pak
 * Chong (components/motion); the sunset is never printed without "about". Until they are live, and
 * without script, each block is left out of sight rather than shown as a label with nothing under it.
 *
 * Motion: the wordmark rises out of a mask when it scrolls in and the two blocks beneath follow it
 * (the motion system's <Reveal>); without script, or under reduced motion, everything is simply there.
 *
 * The link columns are as wide as their longest link and no link is ever broken, so Thai is never
 * squeezed into syllables at any width (Footer.module.css).
 */
export function Footer({ lang }: { lang: Locale }) {
  const ui = t(lang);
  const sky = skyCopy[lang];
  const nav = footerNav(lang);
  const address = pub(site.address);
  const map = pub(site.maps.listingUrl);
  const phone = pub(site.phone);
  const tel = telHref(phone);
  const facebook = pub(site.social.facebook);
  const number = formatPhone(phone, lang);
  const ids = { resort: "footer-resort", practical: "footer-practical" };

  return (
    <footer id={FOOTER_ID} className={cx("on-forest", styles.footer)}>
      <div className={cx("container", styles.inner)}>
        <h2 className="vh">{ui.names.resortFull}</h2>
        <FooterWordmark text={ui.wordmark.name} />

        <Reveal className={styles.grid} stagger={0.12} start="top 92%">
          <address className={styles.contact}>
            {address ? (
              <div className={styles.block}>
                <p className="eyebrow">{ui.labels.address}</p>
                <p className={styles.address}>
                  <AddressText lang={lang} />
                </p>
                {map ? (
                  <TextLink href={map} external variant="arrow" className={styles.textLink} data-analytics="map_click" data-placement="footer">
                    {ui.actions.openInMaps}
                  </TextLink>
                ) : null}
              </div>
            ) : null}

            {tel || facebook ? (
              <div className={styles.block}>
                <p className="eyebrow">{ui.footer.talk}</p>
                {tel && number ? (
                  <a
                    href={tel}
                    className={cx("tabular", styles.phone)}
                    aria-label={fill(ui.patterns.callOn, { phone: number })}
                    data-analytics="call_click"
                    data-placement="footer"
                  >
                    {number}
                  </a>
                ) : null}
                {facebook ? (
                  <a href={facebook} className={styles.channel} data-analytics="social_contact_click" data-network="facebook" data-placement="footer">
                    <Icon name="facebook" size={18} className={styles.channelIcon} />
                    <span className={styles.channelText}>{ui.labels.facebook}</span>
                    <VisuallyHidden> ({ui.a11y.opensFacebook})</VisuallyHidden>
                  </a>
                ) : null}
              </div>
            ) : null}
          </address>

          <div className={styles.pages}>
            <nav className={styles.nav} aria-label={ui.a11y.footerNav}>
              <ul role="list" className={styles.column}>
                <li>
                  <NavLink href={nav.stay.href} path={nav.stay.path} className={cx("eyebrow", styles.head, styles.headLink)}>
                    {nav.stay.label}
                  </NavLink>
                  <ul role="list" className={styles.list}>
                    {nav.rooms.map((room) => (
                      <li key={room.id}>
                        <NavLink href={room.href} path={room.path} className={styles.link}>
                          <RoomName lang={lang} name={room.label} />
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
              <div className={styles.column}>
                <p id={ids.resort} className={cx("eyebrow", styles.head)}>
                  {ui.footer.resort}
                </p>
                <ul role="list" className={styles.list} aria-labelledby={ids.resort}>
                  {nav.resort.map((item) => (
                    <li key={item.id}>
                      <NavLink href={item.href} path={item.path} className={styles.link}>
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.column}>
                <p id={ids.practical} className={cx("eyebrow", styles.head)}>
                  {ui.footer.practical}
                </p>
                <ul role="list" className={styles.list} aria-labelledby={ids.practical}>
                  {nav.practical.map((item) => (
                    <li key={item.id}>
                      <NavLink href={item.href} path={item.path} className={styles.link}>
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            <div className={styles.aside}>
              <div className={styles.block}>
                <p className="eyebrow">{ui.labels.language}</p>
                <LangSwitch
                  lang={lang}
                  label={ui.a11y.languageSwitch}
                  names={{ th: ui.labels.languageThai, en: ui.labels.languageEnglish }}
                  className={styles.lang}
                />
              </div>
              <div className={cx(styles.block, styles.live)}>
                {/* The clock and the moon name themselves for assistive technology; their visible labels would say it twice. */}
                <p className="eyebrow" aria-hidden="true">
                  {sky.localTimeLabel}
                </p>
                <p className={styles.figure}>
                  <Clock lang={lang} />
                </p>
              </div>
              <div className={cx(styles.block, styles.live, styles.wide)}>
                <p className="eyebrow">{sky.sunsetLabel}</p>
                <p className={styles.figure}>
                  <SunsetTime lang={lang} format="figure" />
                </p>
              </div>
              <div className={cx(styles.block, styles.live, styles.wide)}>
                <p className="eyebrow" aria-hidden="true">
                  {sky.moonTonight}
                </p>
                <p className={styles.figure}>
                  <MoonTonight lang={lang} />
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <div className={styles.base}>
          <p className={cx("tabular", styles.copyright)}>{fill(ui.patterns.copyright, { year: yearInBangkok() })}</p>
          <nav aria-label={ui.a11y.legalNav} className={styles.legalNav}>
            <ul role="list" className={styles.legal}>
              {nav.legal.map((item) => (
                <li key={item.id}>
                  <NavLink href={item.href} path={item.path} className={styles.legalLink}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
              {ANALYTICS_CONFIGURED ? (
                <li>
                  <ConsentSettingsLink lang={lang} className={styles.cookie} />
                </li>
              ) : null}
            </ul>
          </nav>
          <BackToTopLink className={styles.top}>
            <span>{ui.actions.backToTop}</span>
            <Icon name="arrow-right" size={16} className={styles.topIcon} />
          </BackToTopLink>
        </div>

        {/* Only on the public concept preview: whose work this is, and that it is not the resort's own site. */}
        <PreviewNotice lang={lang} />

        {/* The studio credit is the last line of every page the studio builds. */}
        <O2Credit lang={lang} />
      </div>
    </footer>
  );
}
