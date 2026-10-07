"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "./gsap";
import { useMotion } from "./useMotion";
import styles from "./ScrollProgress.module.css";

/**
 * The hairline across the very top of the window that fills as the page is read.
 *
 *   <ScrollProgress />      once, in the layout, inside <MotionProvider>
 *
 * 2px, the action colour, above the header (z-index --z-progress), never in the way of a click.
 * It follows the scroll position directly, so it is feedback rather than animation and stays on under
 * reduced motion. Without JavaScript it is an empty, invisible bar.
 */

export interface ScrollProgressProps {
  className?: string;
}

export function ScrollProgress({ className }: ScrollProgressProps) {
  const bar = useRef<HTMLDivElement>(null);
  const { ready } = useMotion();

  useGSAP(
    () => {
      const el = bar.current;
      if (!el || !ready) return;
      const setScale = gsap.quickSetter(el, "scaleX");
      const update = (self: ScrollTrigger) => setScale(self.progress);
      ScrollTrigger.create({ start: 0, end: "max", onUpdate: update, onRefresh: update });
    },
    { dependencies: [ready], revertOnUpdate: true },
  );

  return (
    <div className={className ? `${styles.progress} ${className}` : styles.progress} aria-hidden="true">
      <div ref={bar} className={styles.bar} />
    </div>
  );
}
