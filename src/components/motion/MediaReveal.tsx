"use client";

import { useCallback, useRef, type ReactNode } from "react";
import { gsap } from "./gsap";
import { useEntrance, type EntranceControl, type EntranceTrigger } from "./useEntrance";
import styles from "./MediaReveal.module.css";

/**
 * A photograph unveils.
 *
 *   <MediaReveal className={s.frame}>
 *     <Picture asset={id} lang={lang} ratio="3/2" sizes="…" />
 *   </MediaReveal>
 *
 * The wrapper's mask opens from its bottom edge upward (clip-path, 1.2s, expo.out) while the first child
 * settles from 118% to its true size, a little slower, so the picture is still coming to rest as the
 * mask finishes. The wrapper clips its content (give it the radius you want through `className`; the
 * moving edge of the mask takes the same radius).
 *
 * Fires once on scroll (or `trigger="load" | "loader"`). Already in view when the page arrives, no
 * JavaScript, or reduced motion: the photograph is simply there.
 */

export interface MediaRevealProps {
  className?: string;
  /** Seconds to wait after the frame enters. */
  delay?: number;
  /** "scroll" (default), "load" or "loader". */
  trigger?: EntranceTrigger;
  /** ScrollTrigger start position. Default "top 86%". */
  start?: string;
  children: ReactNode;
}

export function MediaReveal({ className, delay = 0, trigger = "scroll", start, children }: MediaRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  const build = useCallback(
    (el: HTMLElement): EntranceControl => {
      const media = el.firstElementChild;
      // The mask's travelling edge is rounded like the frame it belongs to.
      const radius = window.getComputedStyle(el).borderTopLeftRadius || "0px";
      const timeline = gsap.timeline({ paused: true, delay });
      timeline.fromTo(
        el,
        { clipPath: `inset(100% 0% 0% 0% round ${radius})` },
        { clipPath: `inset(0% 0% 0% 0% round ${radius})`, duration: 1.2, ease: "expo.out", clearProps: "clipPath" },
        0,
      );
      if (media) {
        timeline.fromTo(
          media,
          { scale: 1.18, transformOrigin: "50% 50%" },
          { scale: 1, duration: 1.6, ease: "expo.out", clearProps: "transform,transformOrigin" },
          0,
        );
      }
      return { play: () => timeline.play(), finish: () => timeline.progress(1) };
    },
    [delay],
  );

  useEntrance(ref, { trigger, start, build });

  return (
    <div ref={ref} className={className ? `${styles.media} ${className}` : styles.media}>
      {children}
    </div>
  );
}
