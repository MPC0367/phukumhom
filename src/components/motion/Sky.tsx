"use client";

import type { ReactNode } from "react";
import type { Locale } from "@/content/schema";
import { copy } from "@/content/pages/sky";
import { bangkokClock, formatMinutes, MOON_PHASES, moonPhase, PAK_CHONG, sunsetAt, tonight, type MoonPhase } from "@/lib/sky";
import { useResortNow } from "./useResortNow";
import styles from "./Sky.module.css";

/**
 * The resort's own clock: the time there now, today's sunset, tonight's moon.
 *
 *   <Clock lang={lang} />                        18:42            (Thai: 18:42 น.)
 *   <Clock lang={lang} label="visible" />        18:42 local time (Thai: เวลาท้องถิ่น 18:42 น.)
 *   <SunsetTime lang={lang} />                   Sunset today about 18:00
 *   <SunsetTime lang={lang} format="figure" />   about 18:00      (print the label yourself: copy.sunsetLabel)
 *   <MoonTonight lang={lang} />                  a drawn moon and "Waning crescent"
 *   <SkyTonight lang={lang} />                   the three of them as a small panel, with the clear-evening line
 *
 * All of it is computed in the visitor's browser (src/lib/sky.ts) for Asia/Bangkok, whatever time zone
 * the visitor is in. A static page cannot know the time, so the server sends the frame with the figures
 * left out: every component reserves the room it will need (tabular figures, an invisible placeholder)
 * and is `visibility: hidden` until it has a value, so nothing moves when the value arrives and nothing
 * half-finished is read out. `data-live="true"` marks the moment, for parents that want to style on it.
 * Without JavaScript these stay empty; lay them out so that reads as an absence, not a hole.
 *
 * Truth (BUILD-CONTRACT section 2): the sunset is for Pak Chong town, not the resort's own position, and
 * is never printed without "about". The words live in src/content/pages/sky.ts.
 *
 * Parts carry data-part ("label", "time", "icon", "name") so a parent's stylesheet can size them apart.
 */

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

const PLACEHOLDER = "00:00";

/** A phrase with `{time}` in it, rendered with a real <time> element in that place. */
function TimePhrase({ pattern, lang, minutes }: { pattern: string; lang: Locale; minutes: number | null }) {
  const [lead, tail = ""] = pattern.split("{time}");
  const hhmm = minutes === null ? null : formatMinutes(minutes);
  return (
    <>
      {lead ? <span data-part="label">{lead}</span> : null}
      <time data-part="time" className={styles.figure} dateTime={hhmm ?? undefined}>
        {copy[lang].time.replace("{time}", hhmm ?? PLACEHOLDER)}
      </time>
      {tail ? <span data-part="label">{tail}</span> : null}
    </>
  );
}

/* ───────────── Clock ───────────── */

export interface ClockProps {
  lang: Locale;
  className?: string;
  /** "hidden" (default): the time alone, named for assistive technology. "visible": with "local time". */
  label?: "hidden" | "visible";
}

export function Clock({ lang, className, label = "hidden" }: ClockProps) {
  const now = useResortNow();
  const t = copy[lang];
  const minutes = now ? bangkokClock(now).minutes : null;
  return (
    <span className={cx(styles.sky, className)} data-live={now ? "true" : "false"}>
      {label === "visible" ? (
        <TimePhrase pattern={t.localTime} lang={lang} minutes={minutes} />
      ) : (
        <>
          <span className="vh">{t.localTimeLabel} </span>
          <TimePhrase pattern="{time}" lang={lang} minutes={minutes} />
        </>
      )}
    </span>
  );
}

/* ───────────── Sunset ───────────── */

export interface SunsetTimeProps {
  lang: Locale;
  className?: string;
  /** "phrase" (default): "Sunset today about 18:00". "figure": "about 18:00", for use under a label of your own. */
  format?: "phrase" | "figure";
}

export function SunsetTime({ lang, className, format = "phrase" }: SunsetTimeProps) {
  const now = useResortNow();
  const t = copy[lang];
  const minutes = now ? sunsetAt(now, PAK_CHONG.lat, PAK_CHONG.lon) : null;
  return (
    <span className={cx(styles.sky, className)} data-live={now ? "true" : "false"}>
      <TimePhrase pattern={format === "figure" ? t.sunsetAbout : t.sunsetToday} lang={lang} minutes={minutes} />
    </span>
  );
}

/* ───────────── Moon ───────────── */

/**
 * The moon as it looks from the northern hemisphere: lit from the right while waxing, from the left
 * while waning. The lit shape is the limb's half circle closed by the terminator, which is half an
 * ellipse whose width follows the lit fraction, so a 10% moon is drawn 10% lit.
 */
export function MoonIcon({ phase, className }: { phase: MoonPhase | null; className?: string }) {
  let lit: ReactNode = null;
  if (phase && phase.illumination > 0.005) {
    const k = Math.min(1, phase.illumination);
    const rx = Math.round(Math.abs(1 - 2 * k) * 1000) / 100;
    // Crescent: the terminator bows toward the lit limb. Gibbous: it bows away from it.
    const sweep = k > 0.5 ? 1 : 0;
    const waning = phase.fraction > 0.5;
    lit = (
      <path
        d={`M12 2A10 10 0 0 1 12 22A${rx} 10 0 0 ${sweep} 12 2Z`}
        fill="currentColor"
        transform={waning ? "matrix(-1 0 0 1 24 0)" : undefined}
      />
    );
  }
  return (
    <svg data-part="icon" className={cx(styles.moon, className)} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.14" />
      {lit}
      <circle cx="12" cy="12" r="9.6" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.38" />
    </svg>
  );
}

export interface MoonTonightProps {
  lang: Locale;
  className?: string;
  /** Draw the moon beside its name. Default true. */
  showIcon?: boolean;
  /** "hidden" (default): icon and phase name, labelled for assistive technology. "visible": "Moon tonight" first. */
  label?: "hidden" | "visible";
}

export function MoonTonight({ lang, className, showIcon = true, label = "hidden" }: MoonTonightProps) {
  const now = useResortNow();
  const t = copy[lang];
  const phase = now ? moonPhase(tonight(now)) : null;
  return (
    <span className={cx(styles.sky, styles.moonRow, className)} data-live={phase ? "true" : "false"}>
      <span data-part="label" className={label === "visible" ? undefined : "vh"}>
        {t.moonTonight}{" "}
      </span>
      {showIcon ? <MoonIcon phase={phase} /> : null}
      <span data-part="name" className={styles.name}>
        {phase ? (
          t.phases[phase.name]
        ) : (
          // Until the phase is known, every name is laid in the same place, unseen: the widest one holds the room.
          MOON_PHASES.map((name) => (
            <span key={name} className={styles.sizer} aria-hidden="true">
              {t.phases[name]}
            </span>
          ))
        )}
      </span>
    </span>
  );
}

/* ───────────── The three together ───────────── */

export interface SkyTonightProps {
  lang: Locale;
  className?: string;
}

/** Sunset, moon and the clear-evening line as one small definition list. Styled lightly; restyle from the parent. */
export function SkyTonight({ lang, className }: SkyTonightProps) {
  const t = copy[lang];
  return (
    <div className={cx(styles.panel, className)}>
      <dl className={styles.list}>
        <div className={styles.row}>
          <dt className="eyebrow">{t.sunsetLabel}</dt>
          <dd className={styles.value}>
            <SunsetTime lang={lang} format="figure" />
          </dd>
        </div>
        <div className={styles.row}>
          <dt className="eyebrow">{t.moonTonight}</dt>
          <dd className={styles.value}>
            <MoonTonight lang={lang} />
          </dd>
        </div>
      </dl>
      <p className={cx("small", styles.caveat)}>{t.clearEvening}</p>
      <p className={cx("small", "muted", styles.note)}>{t.skyNote}</p>
    </div>
  );
}
