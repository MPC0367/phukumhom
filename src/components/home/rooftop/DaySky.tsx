"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Locale } from "@/content/schema";
import { dayProgress } from "@/lib/sky";
import { onLoaderDone, useMotion, useResortNow } from "@/components/motion";
import { createDay, type Day, type DayFrame } from "./day-store";

/**
 * The root of the rooftop band, and the small island that turns its day.
 *
 * It renders the <section> and writes the day to it, straight to the DOM (no React state, so dragging
 * re-renders nothing):
 *
 *   --t            what the scene shows, 0 day to 1 dusk: photographs, colours, stars
 *   --v            where the control stands (the thumb and its sun-to-moon mark follow this one)
 *   --now          the present at the resort on the same scale, once it is known
 *   data-sky       "day" | "dusk": which ground the band is on (the hard switch, see day-store.ts)
 *   data-stop      "0" | "1" | "2": the named time nearest the control
 *   data-now       "true" once the present is known
 *   data-touched   "true" once the guest has moved the day themselves
 *
 * The server's HTML carries none of these. The stylesheet's defaults are the daytime, so the band is
 * a complete, light, readable chapter before hydration; without JavaScript the stylesheet lays the
 * three photographs out side by side instead (rooftop.module.css, "No JavaScript").
 *
 * THE OPENING. When the photograph first comes into view (and the loader, if any, has lifted), the day
 * travels from the first frame to the present at the resort over about 1.6s. If the present is the
 * daytime itself there is nowhere to go, so it looks a little way ahead and comes back, once. Under
 * reduced motion there is no travel: the band is simply at the present as soon as it is known.
 *
 * The opening is watched with an IntersectionObserver, not a ScrollTrigger: nothing is hidden waiting
 * for it, and it must also happen on a page whose layout has no motion provider.
 */

const DayContext = createContext<Day | null>(null);

/** The day store of the band this component is inside. */
export function useDay(): Day {
  const day = useContext(DayContext);
  if (!day) throw new Error("useDay() must be used inside <DaySky>.");
  return day;
}

export interface DaySkyProps {
  id: string;
  lang: Locale;
  /** id of the chapter's heading. */
  labelledBy: string;
  /** The chapter's name and number, for the chapter index at the edge of the screen. */
  chapter: string;
  chapterNumber: string;
  className?: string;
  children: ReactNode;
}

/** How long the opening takes to reach the present. */
const OPEN_SECONDS = 1.6;
/** How much of the photograph must be on screen before the opening starts. */
const OPEN_VISIBLE = 0.55;

export function DaySky({ id, lang, labelledBy, chapter, chapterNumber, className, children }: DaySkyProps) {
  const [day] = useState(createDay);
  const ref = useRef<HTMLElement>(null);
  const { reduced } = useMotion();
  const now = useResortNow();
  const present = now ? dayProgress(now) : null;
  const known = present !== null;

  // Every frame of the day, written to the section.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const paint = (frame: DayFrame) => {
      el.style.setProperty("--t", frame.shown.toFixed(4));
      el.style.setProperty("--v", frame.value.toFixed(4));
      const sky = frame.dusk ? "dusk" : "day";
      if (el.dataset.sky !== sky) el.dataset.sky = sky;
      const stop = String(frame.stop);
      if (el.dataset.stop !== stop) el.dataset.stop = stop;
      if (frame.touched && el.dataset.touched !== "true") el.dataset.touched = "true";
    };
    paint(day.snapshot());
    const stop = day.onFrame(paint);
    return () => {
      stop();
      day.destroy();
    };
  }, [day]);

  useEffect(() => {
    day.setReduced(reduced);
  }, [day, reduced]);

  // The present, each time the minute turns.
  useEffect(() => {
    const el = ref.current;
    if (!el || present === null) return;
    el.style.setProperty("--now", present.toFixed(4));
    el.dataset.now = "true";
    day.setNow(present);
  }, [day, present]);

  // The opening.
  useEffect(() => {
    const el = ref.current;
    if (!el || !known) return;
    if (reduced) {
      day.open(0);
      return;
    }
    let observer: IntersectionObserver | undefined;
    const cancel = onLoaderDone(() => {
      if (typeof IntersectionObserver === "undefined") {
        day.open(OPEN_SECONDS);
        return;
      }
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer?.disconnect();
          day.open(OPEN_SECONDS);
        },
        { threshold: OPEN_VISIBLE },
      );
      observer.observe(el.querySelector("[data-day-frame]") ?? el);
    });
    return () => {
      cancel();
      observer?.disconnect();
    };
  }, [day, reduced, known]);

  return (
    <DayContext.Provider value={day}>
      <section ref={ref} id={id} lang={lang} data-chapter={chapter} data-chapter-number={chapterNumber} aria-labelledby={labelledBy} className={className}>
        {children}
      </section>
    </DayContext.Provider>
  );
}
