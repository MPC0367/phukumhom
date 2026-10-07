import { useId } from "react";
import { pub, type Locale } from "@/content/schema";
import { flag } from "@/content/site";
import { reviews } from "@/content/reviews";
import { copy } from "@/content/pages/home/closing";
import { Reveal, SplitReveal } from "@/components/motion";
import { Phrases } from "@/components/places/Phrases";
import { BookingLink } from "@/components/site";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { TextLink } from "@/components/ui/TextLink";
import { cx } from "@/components/ui/cx";
import { formatDate, formatInteger, isoDateAttr } from "@/lib/format";
import { href } from "@/lib/routes";
import { ClosingRule, ClosingSun } from "./ClosingMotion";
import styles from "./HomeClosing.module.css";

/**
 * The homepage's closing band: forest, edge to edge, continuous with the footer beneath it.
 *
 *   PLAN YOUR STAY ─────────────────────────────────────────────────────────────
 *   Pick your dates.
 *   The garden will be here.
 *   [Check availability]  [Explore rooms]            4.6  out of 5 on Google from 308 reviews, …
 *   Booking is completed on the page of the resort's booking partner. …
 *
 * THE LINE is the glossary's closing line, set one step below the hero and revealed line by line. It is
 * a styled <p>; the band's heading is the small label above it, in plain words.
 *
 * CHECK AVAILABILITY is the site's <BookingLink planner>: a plain link to the verified booking page (it
 * works with JavaScript off, in the same tab) that carries data-open-planner, so with script the site
 * shell opens the stay planner for it instead. Nothing is added to the address, and nothing here knows
 * or says whether rooms are free.
 *
 * THE REVIEW LINE. One figure may be published, and only like this (BUILD-CONTRACT sections 2 and 8):
 * Google's score with its scale, the number of reviews and the date it was read, as a link to the
 * resort's own Google listing, and only while the `reviewRating` flag is on and that fact is
 * publishable. Every number and the date come from src/content/reviews.ts. With the flag off, or the
 * figure withheld, the link reads "Read guest reviews"; with no listing to link to there is no line at
 * all. There are no stars, no quotation, no reviewer and no other platform.
 *
 * THE DISC on the bottom edge is decoration: a low sun on the line where this band meets the footer.
 * It states nothing (it is not tonight's sunset or moon; those are computed elsewhere, with their caveats).
 */
export interface HomeClosingProps {
  lang: Locale;
  /**
   * The second pill. The homepage offers the rooms; a page that is already about the rooms (Stay, a
   * room) offers another next step instead. Internal destinations only, built with `href()`.
   */
  secondary?: { href: string; label: string };
}

export function HomeClosing({ lang, secondary }: HomeClosingProps) {
  const c = copy[lang];
  const headingId = useId();

  const google = reviews.find((review) => review.id === "google") ?? null;
  const rating = google && flag("reviewRating") ? pub(google.rating) : null;
  // The sentence is a pattern; the score is set as a figure and the date as a <time>, so it is cut at those two marks.
  const [reviewLead = "", reviewRest = ""] = c.review.figure.split("{rating}");
  const [tailBeforeDate = "", tailAfterDate = ""] = rating
    ? reviewRest.replace("{scale}", String(rating.scale)).replace("{count}", formatInteger(rating.count, lang)).split("{date}")
    : [];
  // The score stands apart as a large figure when the sentence opens with it (it does in both languages).
  // A wording that opened with other words would be set as one plain sentence instead.
  const figureFirst = reviewLead.trim() === "";

  return (
    <section lang={lang} aria-labelledby={headingId} className={cx("on-forest", styles.closing)}>
      <ClosingSun className={styles.sun} />

      <div className={cx("container", styles.inner)}>
        <div className={styles.head}>
          <h2 id={headingId} className={cx("eyebrow", styles.heading)}>
            {c.heading}
          </h2>
          <ClosingRule className={styles.rule} />
        </div>

        <SplitReveal as="p" lang={lang} className={cx("hero-line", styles.line)}>
          {c.line.first}
          <br />
          {c.line.second}
          {c.line.accent ? (
            <>
              {" "}
              <em>{c.line.accent}</em>
            </>
          ) : null}
        </SplitReveal>

        <div className={styles.foot}>
          <div className={styles.book}>
            <Reveal stagger={0.09} delay={0.15} className={styles.actions}>
              <BookingLink lang={lang} placement="closing" planner size="lg" className={styles.pill}>
                {c.availability}
              </BookingLink>
              <Button href={secondary?.href ?? href(lang, "stay")} variant="ghost" size="lg" icon="arrow-right" className={styles.pill}>
                {secondary?.label ?? c.rooms}
              </Button>
            </Reveal>
            <Reveal as="p" variant="fade" delay={0.35} className={styles.note}>
              <Phrases lang={lang} text={c.bookingNote} />
            </Reveal>
          </div>

          {google ? (
            <Reveal delay={0.3} className={styles.reviewSlot}>
              {rating ? (
                <a href={google.url} className={cx(styles.review, !figureFirst && styles.reviewPlain)}>
                  {figureFirst ? <span className={cx("figure", styles.score)}>{rating.score}</span> : null}
                  <span className={styles.reviewText}>
                    <span className={styles.reviewLine}>
                      {figureFirst ? null : `${reviewLead}${rating.score}`}
                      {tailBeforeDate}
                      <time dateTime={isoDateAttr(google.rating.verified)}>{formatDate(google.rating.verified, lang)}</time>
                      {tailAfterDate}
                    </span>
                    <Icon name="arrow-up-right" size={18} className={styles.reviewIcon} />
                  </span>
                  <span className="vh"> ({c.review.opensMaps})</span>
                </a>
              ) : (
                <TextLink href={google.url} external variant="arrow">
                  {c.review.read}
                  <span className="vh"> ({c.review.opensMaps})</span>
                </TextLink>
              )}
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
