"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import type { Locale } from "@/content/schema";
import { copy } from "@/content/pages/sky";
import { INTL_LOCALE } from "@/i18n/config";
import { addDays, bookingHref } from "@/lib/booking";
import { formatDate } from "@/lib/format";
import { formatMinutes, nightsAhead, type NightSky } from "@/lib/sky";
import { MoonIcon, Stars, useResortNow } from "@/components/motion";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/components/ui/cx";
import s from "./StarNights.module.css";

/**
 * The stargazing planner: the next thirty evenings at the resort, night by night.
 *
 *   <StarNights lang={lang} />
 *
 * A row of evenings (weekday, day, the moon as it will look, a star where there is little moonlight) and,
 * for the chosen one, a large moon with its phase, sunset, when the sky is fully dark, how much of the
 * moon is lit, and a link that opens the booking partner with that night as a one-night stay.
 *
 * Everything is worked out in the visitor's browser for Pak Chong town (src/lib/sky.ts): a static page
 * cannot know the date. The server sends the frame with a reserved height and nothing in it, hidden until
 * the date is known; without JavaScript the block is not shown at all (the chapter's words stand alone).
 *
 * Truth (src/content/pages/sky.ts): the moonlight is read from the phase alone, the times are "about",
 * and the note says the clouds decide. Nothing promises a clear night.
 *
 * The row is one radio group: arrow keys, Home and End move the choice, and only the chosen evening is in
 * the tab order. The details below are a polite live region, so a change of night is read out once.
 */

const NIGHTS = 30;

/** Thai day abbreviations as Thai calendars print them. Browsers disagree on Intl's short Thai form (some give the whole name), and a whole name does not fit a chip. */
const THAI_SHORT_DAYS = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

function weekday(date: string, lang: Locale, style: "short" | "long"): string {
  const [y, m, d] = date.split("-").map(Number);
  const instant = new Date(Date.UTC(y, m - 1, d, 12));
  if (lang === "th" && style === "short") return THAI_SHORT_DAYS[instant.getUTCDay()];
  return new Intl.DateTimeFormat(INTL_LOCALE[lang], { weekday: style, timeZone: "UTC" }).format(instant);
}

/**
 * A phrase with one figure in it ("about {time}", "ประมาณ {time} น.", "{pct}% lit"): the words are set small
 * in the text face and the figure large in the display face, so Thai and English read the same way.
 */
function Figure({ pattern, value }: { pattern: string; value: string }) {
  const [lead, tail = ""] = pattern.split("{v}");
  return (
    <>
      {lead.trim() ? <span className={s.words}>{lead}</span> : null}
      <span className={cx("tabular", s.figure)}>{value}</span>
      {tail.trim() ? <span className={s.words}>{tail}</span> : null}
    </>
  );
}

function dayOfMonth(date: string): string {
  return String(Number(date.slice(8, 10)));
}

export interface StarNightsProps {
  lang: Locale;
  className?: string;
}

export function StarNights({ lang, className }: StarNightsProps) {
  const now = useResortNow();
  const t = copy[lang];
  const n = t.nights;
  // Thirty evenings of plain arithmetic: cheap enough to redo on each minute's render.
  const nights: NightSky[] = now ? nightsAhead(now, NIGHTS) : [];
  const [chosen, setChosen] = useState(0);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);

  const live = nights.length > 0;
  const night = live ? nights[Math.min(chosen, nights.length - 1)] : null;

  function choose(index: number, focus: boolean) {
    const next = Math.max(0, Math.min(nights.length - 1, index));
    setChosen(next);
    if (focus) {
      const el = buttons.current[next];
      el?.focus();
      el?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const moves: Record<string, number> = { ArrowRight: chosen + 1, ArrowDown: chosen + 1, ArrowLeft: chosen - 1, ArrowUp: chosen - 1, Home: 0, End: nights.length - 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    choose(moves[event.key], true);
  }

  const label = (x: NightSky) =>
    `${x.offset === 0 ? `${n.tonight}, ` : ""}${weekday(x.date, lang, "long")} ${formatDate(x.date, lang)}, ${t.phases[x.moon.name]}, ${n.moonlight[x.moonlight]}`;

  return (
    <div className={cx(s.planner, className)} data-live={live ? "true" : "false"}>
      <Stars className={s.stars} density={0.8} />

      <div role="radiogroup" aria-label={n.listLabel} className={s.row} onKeyDown={onKeyDown}>
        {nights.map((x, index) => {
          const selected = index === chosen;
          return (
            <button
              key={x.date}
              ref={(el) => {
                buttons.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={label(x)}
              tabIndex={selected ? 0 : -1}
              className={cx(s.night, selected && s.chosen, x.moonlight === "little" && s.dark)}
              onClick={() => choose(index, false)}
            >
              <span className={s.weekday} aria-hidden="true">
                {x.offset === 0 ? n.tonight : weekday(x.date, lang, "short")}
              </span>
              <span className={cx("tabular", s.day)} aria-hidden="true">
                {dayOfMonth(x.date)}
              </span>
              <MoonIcon phase={x.moon} className={s.chipMoon} />
              <span className={s.mark} aria-hidden="true">
                {x.moonlight === "little" ? <Icon name="star" size={12} /> : null}
              </span>
            </button>
          );
        })}
      </div>

      <div className={s.detail} aria-live="polite">
        {night ? (
          <>
            <div className={s.moonBig} key={night.date}>
              <MoonIcon phase={night.moon} />
            </div>
            <div className={s.facts}>
              <p className="eyebrow">{night.offset === 0 ? n.tonight : weekday(night.date, lang, "long")}</p>
              <p className={cx("h3", s.date)}>{formatDate(night.date, lang)}</p>
              <p className={s.phase}>
                {t.phases[night.moon.name]}
                <span className={cx(s.light, night.moonlight === "little" && s.lightDark)}>
                  {night.moonlight === "little" ? <Icon name="star" size={14} /> : null}
                  {n.moonlight[night.moonlight]}
                </span>
              </p>
              <dl className={s.list}>
                <div className={s.item}>
                  <dt className="eyebrow">{n.sunset}</dt>
                  <dd>
                    <Figure pattern={t.sunsetAbout.replace("{time}", t.time.replace("{time}", "{v}"))} value={formatMinutes(night.sunset)} />
                  </dd>
                </div>
                <div className={s.item}>
                  <dt className="eyebrow">{n.darkFrom}</dt>
                  <dd>
                    <Figure pattern={t.sunsetAbout.replace("{time}", t.time.replace("{time}", "{v}"))} value={formatMinutes(night.darkFrom)} />
                  </dd>
                </div>
                <div className={s.item}>
                  <dt className="eyebrow">{n.moon}</dt>
                  <dd>
                    <Figure pattern={n.lit.replace("{pct}%", "{v}")} value={`${Math.round(night.moon.illumination * 100)}%`} />
                  </dd>
                </div>
              </dl>
              <div className={s.actions}>
                <Button
                  href={bookingHref({ checkin: night.date, checkout: addDays(night.date, 1) })}
                  external
                  variant="primary"
                  icon="arrow-up-right"
                  data-analytics="booking_click"
                  data-placement="experiences"
                >
                  {night.offset === 0 ? n.bookTonight : n.book.replace("{date}", formatDate(night.date, lang, "short"))}
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <div className={s.notes}>
        <p className="small">
          <Icon name="star" size={12} className={s.legendStar} /> {n.legend}
        </p>
        <p className={cx("small", "muted")}>{n.note}</p>
      </div>
    </div>
  );
}
