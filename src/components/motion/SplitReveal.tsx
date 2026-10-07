"use client";

import { useCallback, useRef, type ReactNode } from "react";
import type { Locale } from "@/content/schema";
import { gsap, SplitText } from "./gsap";
import { useEntrance, type EntranceControl, type EntranceTrigger } from "./useEntrance";
import styles from "./SplitReveal.module.css";

/**
 * The headline reveal.
 *
 *   <SplitReveal as="p" lang={lang} className="hero-line" trigger="loader">
 *     A little closer<br />to <em>nature.</em>
 *   </SplitReveal>
 *
 * English: the text is split into its rendered lines and each line rises out of its own mask, 0.09s
 * apart, 1.0s, power3.out. The split follows the real layout: it is redone when the block is resized
 * and when the display font arrives, and an <em> stays one element. When the last line has landed the
 * split is undone, so the heading is ordinary text again (it wraps, balances and selects normally).
 *
 * Thai: never split. Thai has no spaces between words and stacks marks above and below the line, so
 * cutting it into pieces or clipping it with a mask damages the script. The whole block rises 28px and
 * fades in as one.
 *
 * `lang` is the language of the text: it chooses between those two behaviours and is written to the
 * element, so a line in the other language (an English specimen on a Thai page) is also set in the right type.
 * `trigger`: "scroll" (default), "load", or "loader" (wait for the loader to lift). See useEntrance.ts
 * for when an entrance is skipped; the short version is that text the visitor can already see is never
 * hidden in order to be shown again.
 *
 * Children must be text and inline markup (em, span, br). Do not put components with handlers inside:
 * the split rewrites the element's children. For the same reason the text must not change while the
 * component stays mounted; if it can (a title that follows a selection), give the SplitReveal a `key`
 * that changes with it, so React makes a fresh one.
 */

export interface SplitRevealProps {
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "div" | "span" | "blockquote";
  lang: Locale;
  className?: string;
  /** Seconds to wait after the trigger. */
  delay?: number;
  trigger?: EntranceTrigger;
  /** ScrollTrigger start for trigger="scroll". Default "top 86%". */
  start?: string;
  children: ReactNode;
}

const LINE_CLASS = "pkh-line";
/**
 * How far below its mask a line starts, as a share of its own height. More than 100 because the masks
 * clip a little outside their box, to leave room for descenders and italic overhang
 * (SplitReveal.module.css), and a display line set at 0.9 leading has glyphs taller than its box: at
 * 100% their tops would still show.
 */
const LINE_START = 150;

export function SplitReveal({ as = "p", lang, className, delay = 0, trigger = "scroll", start, children }: SplitRevealProps) {
  // Typed as a <div> for JSX; at runtime it is whichever element `as` names. Only HTMLElement members are used.
  const Tag = as as "div";
  const ref = useRef<HTMLDivElement>(null);

  const build = useCallback(
    (el: HTMLElement): EntranceControl => {
      if (lang === "th") {
        const tween = gsap.fromTo(
          el,
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay, paused: true, clearProps: "transform,opacity" },
        );
        return { play: () => tween.play(), finish: () => tween.progress(1) };
      }

      let started = false;
      let instant = false;
      let finished = false;
      let current: gsap.core.Tween | null = null;

      const split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
        linesClass: LINE_CLASS,
        autoSplit: true,
        // Lines are whole runs of text: leave them to be read as they are.
        aria: "none",
        onSplit(self: SplitText) {
          if (finished) return;
          // SplitText clips each mask at its own box. The stylesheet clips a little outside it instead
          // (see SplitReveal.module.css), so the mask's own clipping is switched off.
          for (const mask of self.masks) (mask as HTMLElement).style.overflow = "visible";
          current = gsap.fromTo(
            self.lines,
            { yPercent: LINE_START },
            {
              yPercent: 0,
              duration: 1,
              ease: "power3.out",
              stagger: 0.09,
              delay,
              paused: !started,
              onComplete: () => {
                finished = true;
                // Back to plain text. Deferred a tick: the tween finishing must not be reverted from inside itself.
                gsap.delayedCall(0, () => split.revert());
              },
            },
          );
          if (instant) current.progress(1);
          // Handing the tween back lets SplitText carry its progress across a re-split.
          return current;
        },
      });

      return {
        play: () => {
          started = true;
          current?.play();
        },
        finish: () => {
          started = true;
          instant = true;
          current?.progress(1);
        },
      };
    },
    [lang, delay],
  );

  useEntrance(ref, { trigger, start, build });

  return (
    <Tag ref={ref} lang={lang} className={className ? `${styles.split} ${className}` : styles.split}>
      {children}
    </Tag>
  );
}
