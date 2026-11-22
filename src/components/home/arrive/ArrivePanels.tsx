import { useId } from "react";
import { pub, type Locale } from "@/content/schema";
import { flag, site } from "@/content/site";
import { copy } from "@/content/pages/home/arrive";
import { Clock, Reveal } from "@/components/motion";
import { Phrases } from "@/components/places/Phrases";
import { AddressText } from "@/components/site/AddressText";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Panel } from "@/components/ui/Panel";
import { TextLink } from "@/components/ui/TextLink";
import { cx } from "@/components/ui/cx";
import { fill, t } from "@/i18n/ui";
import type { AnalyticsPlacement } from "@/lib/analytics";
import { formatPhone, telHref } from "@/lib/format";
import { href } from "@/lib/routes";
import { AddressActions } from "./AddressActions";
import styles from "./HomeArrive.module.css";

/**
 * The two panels of "Getting here": the address, and the ways to talk to the resort. Used by the
 * homepage's chapter 07 and, through <ContactPanels>, by the Location and Contact pages.
 *
 *   ADDRESS (white)              the ruled address in the display face, inside <address>;
 *                                Copy address (turns into a tick, with a toast) and Share location;
 *                                Open in Google Maps, with one line saying what that link is
 *   TALK TO THE RESORT (forest)  the main phone number as a large figure that dials, the second number
 *                                small beneath it; the time at the resort right now, so a caller knows;
 *                                LINE and the account id; Contact on Facebook; Prepare an enquiry
 *                                (it reads "Send an enquiry" only once a delivery service is configured)
 *
 * FACTS. Every one is read through pub() from src/content/site.ts, and a withheld fact leaves no trace:
 * no address means no address panel, no number means no figure. The map link is the resort's own Google
 * Maps listing and is labelled as that: never the entrance, no coordinates, no distance. The main number
 * dials; the second is printed (and dials too) but never gets a button of its own. No email.
 *
 *   placement     the analytics placement written on the links (default "journey")
 *   headingLevel  3 (default, under a chapter's <h2>) or 2
 *   enquiryHref   where the enquiry link leads; the contact page by default. The Contact page passes
 *                 its own form's fragment.
 *
 * <ArrivePanels> is the bare pair and must sit inside an element wearing the block's size container
 * (the homepage chapter supplies it). <ContactPanels> brings that container with it.
 */

export interface ArrivePanelsProps {
  lang: Locale;
  placement?: AnalyticsPlacement;
  headingLevel?: 2 | 3;
  enquiryHref?: string;
}

export function ArrivePanels({ lang, placement = "journey", headingLevel = 3, enquiryHref }: ArrivePanelsProps) {
  const c = copy[lang];
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const addressHeadingId = useId();
  const addressTextId = useId();
  const talkHeadingId = useId();

  const address = pub(site.address);
  const map = pub(site.maps.listingUrl);
  const phone = pub(site.phone);
  const tel = telHref(phone);
  const number = formatPhone(phone, lang);
  const facebook = pub(site.social.facebook);
  const alt = pub(site.phoneAlt);
  const altTel = telHref(alt);
  const altNumber = formatPhone(alt, lang);
  const line = flag("line") ? pub(site.social.line) : null;
  const ui = t(lang);

  return (
    <Reveal stagger={0.12} className={styles.panels}>
      {address ? (
        <Panel as="section" tone="white" labelledBy={addressHeadingId} className={styles.panel}>
          <div className={styles.head}>
            <Heading id={addressHeadingId} className="eyebrow">
              {c.address.label}
            </Heading>
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
                <TextLink href={map} external variant="arrow" data-analytics="map_click" data-placement={placement}>
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
          <Heading id={talkHeadingId} className="eyebrow">
            {c.talk.label}
          </Heading>
          <span aria-hidden="true" className={styles.mark}>
            <Icon name="phone" size={20} />
          </span>
        </div>

        {tel && number ? (
          <p className={styles.phoneLine}>
            <a href={tel} className={cx("figure", styles.phone)} data-analytics="call_click" data-placement={placement}>
              <span className="vh">{c.talk.call} </span>
              <span className={styles.phoneDigits}>{number}</span>
            </a>
          </p>
        ) : null}
        {altTel && altNumber && altNumber !== number ? (
          <p className={styles.altPhone}>
            <a href={altTel} className="tabular" data-analytics="call_click" data-placement={placement}>
              {fill(ui.patterns.secondNumber, { phone: altNumber })}
            </a>
          </p>
        ) : null}
        <p className={styles.now}>
          <Icon name="clock" size={16} className={styles.nowIcon} />
          <Clock lang={lang} label="visible" className={styles.clock} />
        </p>

        <div className={styles.foot}>
          <div className={styles.contact}>
            {line ? (
              <Button href={line.url} external variant="ghost" icon="arrow-up-right" data-analytics="social_contact_click" data-network="line" data-placement={placement}>
                {ui.labels.line} <span className={cx("tabular", styles.lineId)}>{line.id}</span>
                <span className="vh"> ({ui.actions.chatOnLine}, {ui.a11y.opensLine})</span>
              </Button>
            ) : null}
            {facebook ? (
              <Button href={facebook} external variant="ghost" icon="arrow-up-right" data-analytics="social_contact_click" data-network="facebook" data-placement={placement}>
                {c.talk.facebook}
                <span className="vh"> ({c.talk.opensFacebook})</span>
              </Button>
            ) : null}
            <Button href={enquiryHref ?? href(lang, "contact")} variant="ghost" icon="arrow-right">
              {flag("enquiryDelivery") ? c.talk.enquirySend : c.talk.enquiry}
            </Button>
          </div>
          <p className={styles.note}>
            <Phrases lang={lang} text={c.talk.enquiryNote} />
          </p>
        </div>
      </Panel>
    </Reveal>
  );
}

/** The pair with its own size container: for any page other than the homepage chapter. */
export function ContactPanels(props: ArrivePanelsProps & { className?: string }) {
  const { className, ...rest } = props;
  return (
    <div className={cx(styles.arrive, className)}>
      <ArrivePanels {...rest} />
    </div>
  );
}
