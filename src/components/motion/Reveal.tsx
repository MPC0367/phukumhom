"use client";

import { useCallback, useRef, type ReactNode } from "react";
import { gsap } from "./gsap";
import { useEntrance, type EntranceControl, type EntranceTrigger } from "./useEntrance";

/**
 * Scroll-in for any block. Fires once and never hides anything again.
 *
 *   <Reveal>…</Reveal>                                 rises 40px and fades in
 *   <Reveal as="ul" stagger={0.09}>…</Reveal>          each direct child in turn
 *   <Reveal variant="clip" className={s.panel}>…</Reveal>
 *
 * variant
 *   "rise"   40px up and a fade, 1.0s power3.out (the default)
 *   "fade"   opacity only, 0.9s
 *   "clip"   wiped open from the top edge down with a clip-path, 1.2s expo.out, for panels and cards
 *   "scale"  from 94% with a fade, 1.2s expo.out, for tiles and figures
 *
 * `stagger` (seconds) animates the direct children instead of the element itself; the element stays the
 * trigger. `delay` is in seconds. `start` is a ScrollTrigger position, default "top 86%".
 *
 * It is a wrapper element: pick `as` to keep lists and figures valid, and pass layout classes through
 * `className`. With no JavaScript, under reduced motion, or when the block is already in view as the
 * page arrives, it is just that element. Only opacity, transform and clip-path are ever touched, and
 * they are cleared when the entrance ends.
 */

export type RevealVariant = "rise" | "fade" | "clip" | "scale";

export interface RevealProps {
  as?: "div" | "section" | "article" | "header" | "footer" | "figure" | "ul" | "ol" | "li" | "p" | "span" | "dl";
  variant?: RevealVariant;
  /** Seconds to wait after the block enters. */
  delay?: number;
  /** Seconds between direct children, or false to animate the element as one. */
  stagger?: number | false;
  /** ScrollTrigger start position. Default "top 86%". */
  start?: string;
  /** "scroll" (default), "load" or "loader". */
  trigger?: EntranceTrigger;
  className?: string;
  children: ReactNode;
}

const CLOSED = "inset(0% 0% 100% 0%)";
const OPEN = "inset(0% 0% 0% 0%)";

const VARIANTS: Record<RevealVariant, { from: gsap.TweenVars; to: gsap.TweenVars }> = {
  rise: {
    from: { y: 40, opacity: 0 },
    to: { y: 0, opacity: 1, duration: 1, ease: "power3.out", clearProps: "transform,opacity" },
  },
  fade: {
    from: { opacity: 0 },
    to: { opacity: 1, duration: 0.9, ease: "power2.out", clearProps: "opacity" },
  },
  clip: {
    from: { clipPath: CLOSED, y: 24 },
    to: { clipPath: OPEN, y: 0, duration: 1.2, ease: "expo.out", clearProps: "clipPath,transform" },
  },
  scale: {
    from: { scale: 0.94, opacity: 0, transformOrigin: "50% 60%" },
    to: { scale: 1, opacity: 1, duration: 1.2, ease: "expo.out", clearProps: "transform,transformOrigin,opacity" },
  },
};

export function Reveal({
  as = "div",
  variant = "rise",
  delay = 0,
  stagger = false,
  start,
  trigger = "scroll",
  className,
  children,
}: RevealProps) {
  // Typed as a <div> for JSX; at runtime it is whichever element `as` names. Only HTMLElement members are used.
  const Tag = as as "div";
  const ref = useRef<HTMLDivElement>(null);

  const build = useCallback(
    (el: HTMLElement): EntranceControl | null => {
      const targets: Element[] = stagger === false ? [el] : Array.from(el.children);
      if (targets.length === 0) return null;
      const { from, to } = VARIANTS[variant];
      const tween = gsap.fromTo(targets, from, { ...to, delay, stagger: stagger === false ? 0 : stagger, paused: true });
      return { play: () => tween.play(), finish: () => tween.progress(1) };
    },
    [variant, delay, stagger],
  );

  useEntrance(ref, { trigger, start, build });

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
