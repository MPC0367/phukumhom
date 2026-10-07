import type { ReactNode } from "react";
import { pub, type Locale } from "@/content/schema";
import { site } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import { cx } from "@/components/ui/cx";
import { fill, t } from "@/i18n/ui";
import type { AnalyticsPlacement } from "@/lib/analytics";
import { formatPhone, telHref } from "@/lib/format";
import { href } from "@/lib/routes";
import styles from "./ContactActions.module.css";

/**
 * The ways to reach the resort, as actions:
 *
 *   <ContactActions lang={lang} include={["directions", "contact"]} placement="journey" />
 *   <ContactActions lang={lang} variant="stack" include={["call", "directions"]} placement="mobile-menu" />
 *
 *   call        tel: link to the one published number            "Call +66 65 542 9451" / "โทร 065 542 9451"
 *   directions  the resort's own Google Maps listing              "Open in Google Maps"
 *   facebook    the resort's Facebook page                        "Contact on Facebook"
 *   contact     the contact page of this site                     "Contact the resort"
 *
 * Every action is built from a published fact, read through `pub()`: one that is withheld (or a
 * network whose flag is off) is simply absent, and with nothing to show the component renders
 * nothing. There is no email action because no address is published, and no Instagram / LINE /
 * WhatsApp action until a real one exists.
 *
 * "directions" is the map listing, labelled as the contract rules: "Open in Google Maps". It is
 * never called the arrival gate and no coordinates are printed.
 *
 *   row    actions side by side, wrapping; the first is outlined, the rest are quiet text actions
 *   stack  one full-width outlined action per line (the mobile menu, a narrow column). The call
 *          action then reads "Call the resort" with the number set beside it.
 *
 * `placement` names where the block sits for analytics (a value from ANALYTICS_PLACEMENTS).
 */
export type ContactAction = "call" | "facebook" | "directions" | "contact";

export interface ContactActionsProps {
  lang: Locale;
  variant?: "row" | "stack";
  /** Which actions, in this order. Defaults to all four. */
  include?: ContactAction[];
  placement?: AnalyticsPlacement;
  className?: string;
}

const ALL: ContactAction[] = ["call", "directions", "facebook", "contact"];

export function ContactActions({ lang, variant = "row", include = ALL, placement = "inline", className }: ContactActionsProps) {
  const ui = t(lang);
  const stack = variant === "stack";
  const phone = pub(site.phone);
  const tel = telHref(phone);
  const map = pub(site.maps.listingUrl);
  const facebook = pub(site.social.facebook);

  const items: { id: ContactAction; node: (emphasis: "secondary" | "quiet") => ReactNode }[] = [];

  for (const id of include) {
    if (items.some((item) => item.id === id)) continue;

    if (id === "call" && phone && tel) {
      const number = formatPhone(phone, lang);
      items.push({
        id,
        node: (emphasis) => (
          <Button href={tel} external variant={emphasis} fullWidth={stack} data-analytics="call_click" data-placement={placement}>
            {stack ? (
              <>
                {ui.actions.callResort} <span className={cx("tabular", styles.number)}>{number}</span>
              </>
            ) : (
              <span className="tabular">{fill(ui.patterns.callOn, { phone: number })}</span>
            )}
          </Button>
        ),
      });
    }

    if (id === "directions" && map) {
      items.push({
        id,
        node: (emphasis) => (
          <Button href={map} external variant={emphasis} icon="arrow-up-right" fullWidth={stack} data-analytics="map_click" data-placement={placement}>
            {ui.actions.openInMaps}
          </Button>
        ),
      });
    }

    if (id === "facebook" && facebook) {
      items.push({
        id,
        node: (emphasis) => (
          <Button
            href={facebook}
            external
            variant={emphasis}
            icon="arrow-up-right"
            fullWidth={stack}
            data-analytics="social_contact_click"
            data-network="facebook"
            data-placement={placement}
          >
            {ui.actions.contactOnFacebook}
            <VisuallyHidden> ({ui.a11y.opensFacebook})</VisuallyHidden>
          </Button>
        ),
      });
    }

    if (id === "contact") {
      items.push({
        id,
        node: (emphasis) => (
          <Button href={href(lang, "contact")} variant={emphasis} fullWidth={stack}>
            {ui.actions.contactResort}
          </Button>
        ),
      });
    }
  }

  if (items.length === 0) return null;

  return (
    <ul role="list" className={cx(styles.actions, stack ? styles.stack : styles.row, className)}>
      {items.map((item, index) => (
        <li key={item.id} className={styles.item}>
          {item.node(stack || index === 0 ? "secondary" : "quiet")}
        </li>
      ))}
    </ul>
  );
}
