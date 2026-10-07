"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { Locale } from "@/content/schema";
import { Clock } from "@/components/motion";
import { Chip } from "@/components/ui/Chip";
import { useDay } from "./DaySky";
import type { StopIndex } from "./day-store";
import { keepWhole } from "./keep";
import s from "./rooftop.module.css";

/**
 * The control under the photograph: a line that says what time it is at the resort, a real range input
 * drawn as a wide track, and the three named times as chips.
 *
 *   range input   0 to 100, one step per arrow key (Home, End and Page keys work as the browser gives
 *                 them). It is the whole track: 44px tall, transparent, lying over a drawn groove and a
 *                 drawn thumb that follow --v. `aria-valuetext` is the named time nearest the value.
 *   the thumb     a terracotta disc whose mark turns from a sun to a crescent as it crosses the evening.
 *   "Now"         a small mark on the track at the present time. It is a button: it brings the day back.
 *   chips         Day, Low sun, Dusk. Each glides the day to that time; the one nearest the
 *                 control is filled (aria-pressed).
 *
 * The input is uncontrolled. The store owns the number; when something other than the input moves the
 * day (a drag on the photograph, a chip, the opening) the input's value is set to match, so the keyboard
 * always continues from where the thumb is.
 */

export interface DayControlLabels {
  /** Accessible name of the range input. */
  slider: string;
  /** Day, low sun, dusk. */
  stops: readonly [string, string, string];
  /** "It is {time} at the resort now." */
  now: string;
  invite: string;
  nowMark: string;
  backToNow: string;
}

export interface DayControlProps {
  lang: Locale;
  labels: DayControlLabels;
  /** Words a line may not be broken inside (see keep.tsx). */
  keep: readonly string[];
}

const STOPS: readonly StopIndex[] = [0, 1, 2];
const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];
const serverStop = (): StopIndex => 0;

export function DayControl({ lang, labels, keep }: DayControlProps) {
  const day = useDay();
  const stop = useSyncExternalStore(day.subscribeStop, day.getStop, serverStop);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sync = (value: number) => {
      const el = input.current;
      if (!el) return;
      const next = String(Math.round(value * 100));
      if (el.value !== next) el.value = next;
    };
    // A browser may bring back the value the input had before a reload; the store starts at the day frame.
    sync(day.snapshot().value);
    return day.onFrame((frame) => {
      if (frame.source !== "input") sync(frame.value);
    });
  }, [day]);

  const [before, after = ""] = labels.now.split("{time}");

  return (
    <div className={s.control}>
      <p className={s.now}>
        <span className={s.nowTime}>
          {keepWhole(before, keep)}
          <Clock lang={lang} className={s.clock} />
          {keepWhole(after, keep)}
        </span>{" "}
        <span className={s.invite}>{keepWhole(labels.invite, keep)}</span>
      </p>

      <div className={s.track}>
        <span className={s.groove} aria-hidden="true" />
        <input
          ref={input}
          className={s.range}
          type="range"
          min={0}
          max={100}
          step={1}
          defaultValue={0}
          autoComplete="off"
          aria-label={labels.slider}
          aria-valuetext={labels.stops[stop]}
          onChange={(event) => day.move(Number(event.currentTarget.value) / 100, "input")}
        />
        <span className={s.thumb} aria-hidden="true">
          <span className={s.glyph}>
            <svg className={s.rays} viewBox="0 0 24 24" focusable="false">
              {RAYS.map((angle) => (
                <path key={angle} d="M12 1.25v2.5" transform={`rotate(${angle} 12 12)`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              ))}
            </svg>
            <span className={s.core} />
            <span className={s.bite} />
          </span>
        </span>
        <button type="button" className={s.nowMark} aria-label={labels.backToNow} onClick={() => day.toNow()}>
          <span className={s.nowMarkLabel}>{labels.nowMark}</span>
        </button>
      </div>

      <div className={s.stops}>
        {STOPS.map((index) => (
          <Chip as="button" key={index} selected={stop === index} className={s.stop} onClick={() => day.toStop(index)}>
            {labels.stops[index]}
          </Chip>
        ))}
      </div>
    </div>
  );
}
