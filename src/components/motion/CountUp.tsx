"use client";

import { useCallback, useRef } from "react";
import { gsap } from "./gsap";
import { useEntrance, type EntranceControl } from "./useEntrance";
import styles from "./CountUp.module.css";

/**
 * A figure that counts up to its value as it scrolls into view.
 *
 *   <CountUp value={3} className="figure" />
 *
 * The real number is always the element's text: it is what the server sends, what a screen reader
 * reads and what a search engine indexes, and script never changes it. While the count runs, that text
 * is faded out and the running figure is painted over it from a data attribute, so the box keeps the
 * width of the final value and nothing beside it moves.
 *
 * Reduced motion, no JavaScript, or already in view when the page arrives: the final value, still.
 */

export interface CountUpProps {
  /** A whole number. */
  value: number;
  className?: string;
}

export function CountUp({ value, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const target = Math.round(value);

  const build = useCallback(
    (el: HTMLElement): EntranceControl => {
      const state = { n: 0 };
      const paint = () => el.setAttribute("data-counting", String(Math.round(state.n)));
      const clear = () => el.removeAttribute("data-counting");
      paint();
      // A small count steps evenly so each number is seen; a large one eases to rest.
      const small = Math.abs(target) <= 12;
      const tween = gsap.to(state, {
        n: target,
        duration: small ? 0.9 + Math.abs(target) * 0.05 : Math.min(2.2, 1.1 + Math.log10(Math.abs(target)) * 0.4),
        ease: small ? "power1.out" : "power3.out",
        paused: true,
        onUpdate: paint,
        onComplete: clear,
      });
      return {
        play: () => tween.play(),
        finish: () => {
          tween.progress(1);
          clear();
        },
      };
    },
    [target],
  );

  useEntrance(ref, { trigger: "scroll", build });

  return (
    <span ref={ref} className={className ? `${styles.count} ${className}` : styles.count}>
      <span className={styles.value}>{target}</span>
    </span>
  );
}
