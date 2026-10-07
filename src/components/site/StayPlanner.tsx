import { useId } from "react";
import type { Locale } from "@/content/schema";
import { Button } from "@/components/ui/Button";
import { Field, SelectField } from "@/components/ui/Field";
import { cx } from "@/components/ui/cx";
import { t } from "@/i18n/ui";
import { BOOKING, BOOKING_FORM } from "@/lib/booking";
import { StayPlannerEnhancer } from "./StayPlannerEnhancer";
import styles from "./StayPlanner.module.css";

/**
 * The stay planner (ART-DIRECTION section 5, BUILD-CONTRACT section 3): arrival, departure, adults,
 * and one terracotta pill that hands the search to the resort's booking partner.
 *
 *   <StayPlanner lang={lang} />                     "dock": the wide white rounded bar for the hero's bottom
 *                                                   edge, with the one float shadow and the help line beneath
 *   <StayPlanner lang={lang} variant="drawer" />    inside the planner drawer: no panel of its own
 *   <StayPlanner lang={lang} variant="compact" />   a narrow column (a room's booking panel): a hairline card
 *
 * It is a real <form method="get"> whose action is the verified booking page and whose fields carry
 * the provider's own parameter names (checkin, checkout, adults: the three proven on the receiving
 * page). So it works with JavaScript off: the browser asks for both dates itself and submits.
 *
 * With script, <StayPlannerEnhancer> adds what the server cannot know: today's date at the resort
 * (Asia/Bangkok) as the earliest arrival, departure kept after arrival, the glossary's two messages
 * when a range is not possible and, in the drawer, three stay-length chips with a line that restates
 * the chosen stay in words. It never blocks a search without dates: that simply opens
 * the booking page, as the plain link does. It never writes to a field a guest is typing in.
 *
 * Children are not asked for: the provider would assume an age, so they are added on the booking
 * page. The Adults list stops at three; the help line says that a larger party adds rooms on the
 * booking page. No prices, no availability, no "searching" state: a link to another site cannot
 * know any of them.
 *
 * The fields are ui/Field and ui/SelectField (a label that is always visible, 56px wells, 16px text so
 * iOS does not zoom). The dock is a size container: from 46rem of its own width the four parts stand in
 * one row; narrower than that (a phone, enlarged text) it is the same white panel with the parts
 * stacked. So give the dock a width of its own (a block, a grid cell).
 *
 * Accessibility: the form is deliberately not a named landmark (two planners on one page would be two
 * identical landmarks); instead the help line describes the button, so it is read out with "Check
 * availability", including that the booking is completed with the booking partner. A refused range
 * marks the field `aria-invalid`, describes it with the message and moves focus to it; the message
 * line is also a live region (role="alert"), so it is announced when focus was already there.
 *
 * Analytics: the form is marked `data-analytics="availability_search"`; the analytics root records
 * only whether dates were chosen and the number of adults. The button is not a `booking_click`.
 */
export interface StayPlannerProps {
  lang: Locale;
  /** "bar" is the first build's name for "dock" and still works. */
  variant?: "dock" | "drawer" | "compact" | "bar";
  className?: string;
}

const DEFAULT_ADULTS = 2;

export function StayPlanner({ lang, variant = "dock", className }: StayPlannerProps) {
  const ui = t(lang);
  const id = useId();
  const ids = { help: `${id}help`, error: `${id}error` };
  const fields = BOOKING_FORM.fields;
  const adults = Array.from({ length: BOOKING.maxAdultsSelectable }, (_, index) => index + 1);
  const look = variant === "bar" ? "dock" : variant;

  return (
    <div className={cx(styles.planner, styles[look], className)}>
      <form
        method={BOOKING_FORM.method}
        action={BOOKING_FORM.action}
        className={styles.form}
        data-ground="light"
        data-analytics="availability_search"
        data-placement="planner"
      >
        <div className={styles.fields}>
          <Field className={cx(styles.cell, styles.arrival)} label={ui.terms.arrival} name={fields.checkin} type="date" required autoComplete="off" />
          <Field className={cx(styles.cell, styles.departure)} label={ui.terms.departure} name={fields.checkout} type="date" required autoComplete="off" />
          {/* Script's part, straight after the dates: the stay-length chips and the summary (drawer only) and the message line. */}
          <StayPlannerEnhancer
            errorId={ids.error}
            className={styles.error}
            fields={{ checkin: fields.checkin, checkout: fields.checkout }}
            messages={{ arrivalNotPast: ui.messages.arrivalNotPast, departureAfterArrival: ui.messages.departureAfterArrival }}
            nights={
              look === "drawer"
                ? {
                    lang,
                    label: ui.planner.nights,
                    one: ui.planner.nightOne,
                    many: ui.planner.nightMany,
                    stayOne: ui.planner.stayOne,
                    stayMany: ui.planner.stayMany,
                    chipsClassName: styles.lengths,
                    summaryClassName: styles.summary,
                  }
                : undefined
            }
          />
          <SelectField className={cx(styles.cell, styles.guests)} label={ui.terms.adults} name={fields.adults} defaultValue={String(DEFAULT_ADULTS)}>
            {adults.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </SelectField>
          <Button type="submit" size="lg" icon="arrow-up-right" className={styles.submit} aria-describedby={ids.help}>
            {ui.actions.checkAvailability}
          </Button>
        </div>
      </form>
      <p id={ids.help} className={styles.help}>
        {ui.planner.help}
      </p>
    </div>
  );
}
