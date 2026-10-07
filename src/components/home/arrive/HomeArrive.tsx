import { useId } from "react";
import { pub, type Locale } from "@/content/schema";
import { site } from "@/content/site";
import { getAsset } from "@/content/assets";
import { RECEPTION_ASSET, copy } from "@/content/pages/home/arrive";
import { Clock, MediaReveal, Parallax, Reveal, SplitReveal } from "@/components/motion";
import { Phrases } from "@/components/places/Phrases";
import { AddressText } from "@/components/site";
import { Button } from "@/components/ui/Button";
import { Chapter } from "@/components/ui/Chapter";
import { Icon } from "@/components/ui/Icon";
import { Panel } from "@/components/ui/Panel";
import { Picture } from "@/components/ui/Picture";
import { TextLink } from "@/components/ui/TextLink";
import { cx } from "@/components/ui/cx";
import { formatPhone, telHref } from "@/lib/format";
import { href } from "@/lib/routes";
import { AddressActions } from "./AddressActions";
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
  const addressHeadingId = useId();
  const addressTextId = useId();
  const talkHeadingId = useId();

  const address = pub(site.address);
  const map = pub(site.maps.listingUrl);
  const phone = pub(site.phone);
  const tel = telHref(phone);
  const number = formatPhone(phone, lang);
  const facebook = pub(site.social.facebook);
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
        <Reveal stagger={0.12} className={styles.panels}>
          {address ? (
            <Panel as="section" tone="white" labelledBy={addressHeadingId} className={styles.panel}>
              <div className={styles.head}>
                <h3 id={addressHeadingId} className="eyebrow">
                  {c.address.label}
                </h3>
                <span aria-hidden="true" className={styles.mark}>
                  <Icon name="pin" size={20} />
                </span>
              </div>

              <address id={addressTextId} className={cx("h3", styles.address)}>
                <AddressText lang={lang} />
              </address>

              <div className={styles.foot}>
                <AddressActions
                  address={address[lang]}
                  addressId={addressTextId}
                  mapUrl={map}
                  shareTitle={site.name[lang]}
                  labels={{
                    copy: c.address.copy,
                    copied: c.address.copied,
                    copiedToast: c.address.copiedToast,
                    share: c.address.share,
                    linkCopiedToast: c.address.linkCopiedToast,
                  }}
                />
                {/* Copy and share need script. Without it they are not shown; the address and the map link remain. */}
                <noscript>
                  <style dangerouslySetInnerHTML={{ __html: `[class~="${styles.actions}"]{display:none}` }} />
                </noscript>

                {map ? (
                  <div className={styles.mapRow}>
                    <TextLink href={map} external variant="arrow" data-analytics="map_click" data-placement="journey">
                      {c.address.openInMaps}
                      <span className="vh"> ({c.address.opensMaps})</span>
                    </TextLink>
                    <p className={styles.note}>
                      <Phrases lang={lang} text={c.address.mapsNote} />
                    </p>
                  </div>
                ) : null}
              </div>
            </Panel>
          ) : null}

          <Panel as="section" tone="outline" labelledBy={talkHeadingId} className={cx("on-forest", styles.panel, styles.talk)}>
            <div className={styles.head}>
              <h3 id={talkHeadingId} className="eyebrow">
                {c.talk.label}
              </h3>
              <span aria-hidden="true" className={styles.mark}>
                <Icon name="phone" size={20} />
              </span>
            </div>

            {tel && number ? (
              <p className={styles.phoneLine}>
                <a href={tel} className={cx("figure", styles.phone)} data-analytics="call_click" data-placement="journey">
                  <span className="vh">{c.talk.call} </span>
                  <span className={styles.phoneDigits}>{number}</span>
                </a>
              </p>
            ) : null}
            <p className={styles.now}>
              <Icon name="clock" size={16} className={styles.nowIcon} />
              <Clock lang={lang} label="visible" className={styles.clock} />
            </p>

            <div className={styles.foot}>
              <div className={styles.contact}>
                {facebook ? (
                  <Button href={facebook} external variant="ghost" icon="arrow-up-right" data-analytics="social_contact_click" data-network="facebook" data-placement="journey">
                    {c.talk.facebook}
                    <span className="vh"> ({c.talk.opensFacebook})</span>
                  </Button>
                ) : null}
                <Button href={href(lang, "contact")} variant="ghost" icon="arrow-right">
                  {c.talk.enquiry}
                </Button>
              </div>
              <p className={styles.note}>
                <Phrases lang={lang} text={c.talk.enquiryNote} />
              </p>
            </div>
          </Panel>
        </Reveal>

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
