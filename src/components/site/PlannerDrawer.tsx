import { pub, type Locale } from "@/content/schema";
import { site } from "@/content/site";
import { Clock, SunsetTime } from "@/components/motion";
import { Kicker } from "@/components/ui/Kicker";
import { TextLink } from "@/components/ui/TextLink";
import { cx } from "@/components/ui/cx";
import { fill, t } from "@/i18n/ui";
import { formatPhone, telHref } from "@/lib/format";
import { href } from "@/lib/routes";
import { PlannerDrawerHost } from "./PlannerDrawerHost";
import { StayPlanner } from "./StayPlanner";
import { PLANNER_TITLE_ID } from "./ids";
import styles from "./PlannerDrawer.module.css";

/**
 * What the planner drawer holds (ART-DIRECTION section 7, feature 1). Mounted once, in the language
 * layout; opened by any `data-open-planner` element through <PlannerDrawerHost>.
 *
 *   Check availability                       kicker
 *   Plan your stay                           the drawer's heading
 *   one sentence
 *   the stay planner (variant "drawer"), whose own help line is the reassurance: children and extra
 *     rooms for a larger party are added on the booking page, and the booking is completed with the
 *     resort's booking partner
 *   Questions before you book?               the one phone number, and "Contact the resort"
 *   the resort's clock and today's sunset    small, at the foot
 *
 * Everything in it is also reachable without the drawer: the link that opens it leads to the booking
 * page, and the phone number and the contact page are in the footer of every page.
 *
 * A Server Component: it reads the string table and the published facts, and hands the rendered
 * content to the client host as children. A withheld phone number leaves no row.
 */
export function PlannerDrawer({ lang }: { lang: Locale }) {
  const ui = t(lang);
  const phone = pub(site.phone);
  const tel = telHref(phone);
  const number = formatPhone(phone, lang);

  return (
    <PlannerDrawerHost titleId={PLANNER_TITLE_ID} closeLabel={ui.actions.close}>
      <header className={styles.head}>
        <Kicker>{ui.actions.checkAvailability}</Kicker>
        <h2 id={PLANNER_TITLE_ID} className={cx("h2", styles.title)}>
          {ui.planner.title}
        </h2>
        <p className={styles.lead}>{ui.planner.lead}</p>
      </header>

      <StayPlanner lang={lang} variant="drawer" className={styles.planner} />

      <div className={styles.talk}>
        <p className="eyebrow">{ui.planner.questions}</p>
        {tel && number ? (
          <a href={tel} className={cx("tabular", styles.phone)} aria-label={fill(ui.patterns.callOn, { phone: number })} data-analytics="call_click" data-placement="planner">
            {number}
          </a>
        ) : null}
        <TextLink href={href(lang, "contact")} variant="arrow">
          {ui.actions.contactResort}
        </TextLink>
      </div>

      <p className={cx("eyebrow", styles.sky)}>
        <Clock lang={lang} label="visible" />
        <span className={styles.skyRule} aria-hidden="true" />
        <SunsetTime lang={lang} />
      </p>
    </PlannerDrawerHost>
  );
}
