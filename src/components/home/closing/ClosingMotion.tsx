"use client";

import { useCallback, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/components/motion/gsap";
import { finePointerNow } from "@/components/motion/store";
import { useEntrance, type EntranceControl } from "@/components/motion/useEntrance";
import { useMotionActive } from "@/components/motion/useMotion";

/**
 * The two pieces of the closing band that move on their own terms. Both are decoration (aria-hidden),
 * both are complete and still in the server's HTML, without JavaScript and under reduced motion.
 *
 * <ClosingRule>  the hairline beside the band's label draws from the left, once, as the band scrolls in.
 *                It goes through useEntrance, so it is never hidden while a visitor can see it.
 *
 * <ClosingSun>   the disc on the band's bottom edge rises a little way over that edge as the band comes
 *                up the screen, tied to the scroll (transform only). Mouse and trackpad only, like
 *                <Parallax>: on touch a scrubbed transform stutters against native scrolling, so the
 *                disc simply sits where it ends. The position always follows the scroll, so a page that
 *                arrives with the band already on screen shows the disc where it belongs for that spot.
 */

export function ClosingRule({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  const build = useCallback((el: HTMLElement): EntranceControl => {
    const tween = gsap.fromTo(
      el,
      { scaleX: 0, transformOrigin: "0% 50%" },
      { scaleX: 1, duration: 1.4, ease: "expo.out", paused: true, clearProps: "transform,transformOrigin" },
    );
    return { play: () => tween.play(), finish: () => tween.progress(1) };
  }, []);

  useEntrance(ref, { trigger: "scroll", build });

  return <span ref={ref} aria-hidden="true" className={className} />;
}

/** How far below its resting place the disc starts, as a share of its own height. */
const RISE = 30;

export function ClosingSun({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const active = useMotionActive();

  useGSAP(
    () => {
      const el = ref.current;
      const band = el?.parentElement;
      if (!el || !band || !active || !finePointerNow()) return;
      gsap.fromTo(
        el,
        { yPercent: RISE },
        { yPercent: 0, ease: "none", scrollTrigger: { trigger: band, start: "top bottom", end: "bottom bottom", scrub: true } },
      );
    },
    { dependencies: [active], revertOnUpdate: true },
  );

  return <span ref={ref} aria-hidden="true" className={className} />;
}
