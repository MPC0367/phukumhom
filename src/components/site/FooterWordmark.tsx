"use client";

import { useCallback, useRef } from "react";
import { gsap } from "@/components/motion/gsap";
import { useEntrance, type EntranceControl } from "@/components/motion/useEntrance";
import { GiantWordmark } from "./GiantWordmark";
import styles from "./Footer.module.css";

/**
 * The giant wordmark at the head of the footer (ART-DIRECTION sections 1 and 6), and its arrival.
 *
 * The word itself is <GiantWordmark>: one SVG <text> fitted to the container with `textLength`, so it
 * spans the footer at every width with no measuring script. It is decoration (`aria-hidden`); the
 * resort's name is in the footer as real text (a visually hidden heading and the copyright line).
 *
 * MOTION. When it scrolls into view the word rises slowly out of a mask (1.8s). The start state is
 * written by script, only if the word is still below the screen, and never under reduced motion: the
 * rules are the motion system's own (useEntrance). Without script it is simply there. The mask clips
 * top and bottom only, so the letters' side strokes can stand on the container's edges.
 */
export function FooterWordmark({ text }: { text: string }) {
  const mask = useRef<HTMLDivElement>(null);

  const build = useCallback((el: HTMLElement): EntranceControl | null => {
    const word = el.firstElementChild;
    if (!word) return null;
    const tween = gsap.fromTo(word, { yPercent: 104 }, { yPercent: 0, duration: 1.8, ease: "expo.out", paused: true, clearProps: "transform" });
    return { play: () => tween.play(), finish: () => tween.progress(1) };
  }, []);

  useEntrance(mask, { trigger: "scroll", start: "top 94%", build });

  return (
    <div ref={mask} className={styles.wordmark} aria-hidden="true">
      <GiantWordmark text={text} className={styles.wordmarkSvg} />
    </div>
  );
}
