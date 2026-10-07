"use client";

import { useGSAP } from "@gsap/react";
import { isLoaderDone, onLoaderDone, useMotion } from "@/components/motion";
import { gsap } from "@/components/motion/gsap";
import { useServerPainted } from "@/components/motion/useServerPainted";

/**
 * The hero's entrance: one short timeline that starts as the loader lifts.
 *
 *   0.10s  the <h1> kicker fades in
 *   0.20s  the display line rises, its second line 0.12s later   (two <SplitReveal trigger="loader">,
 *          not this file: they listen for the same moment)
 *   0.55s  the supporting sentence
 *   0.66s  the pills, 0.08s apart
 *   0.70s  the planner dock rises from below the photograph's edge
 *   0.90s  the meta strip, then the scroll cue
 * The photograph settling and the slide control arriving belong to the slideshow island. Everything has
 * landed by 1.75s.
 *
 * It finds its targets by `data-hero-enter` (the hero is the only thing on a page that uses it) and
 * renders nothing.
 *
 * The rules are the motion system's: nothing is hidden without script, without the provider or under
 * reduced motion; a page the server already painted, with no loader over it, is left alone; start states
 * are written by script to things the visitor cannot see yet; every inline style is cleared at the end.
 */

const all = (name: string) => gsap.utils.toArray<HTMLElement>(`[data-hero-enter="${name}"]`);

export function HeroEntrance() {
  const { ready, reduced } = useMotion();
  const active = ready && !reduced;
  const serverPainted = useServerPainted();

  useGSAP(
    () => {
      if (!active) return;
      if (serverPainted.current && isLoaderDone()) return;

      const eyebrow = all("eyebrow");
      const sentence = all("copy");
      const pills = all("actions").flatMap((row) => Array.from(row.children));
      const meta = all("meta");
      const cue = all("cue");
      const dock = all("dock");
      const everything = [...eyebrow, ...sentence, ...pills, ...meta, ...cue, ...dock];
      if (everything.length === 0) return;

      gsap.set(eyebrow, { autoAlpha: 0, y: 12 });
      gsap.set(sentence, { autoAlpha: 0, y: 28 });
      gsap.set(pills, { autoAlpha: 0, y: 28 });
      gsap.set([...meta, ...cue], { autoAlpha: 0 });
      gsap.set(dock, { autoAlpha: 0, y: 44 });

      const timeline = gsap
        .timeline({
          paused: true,
          defaults: { ease: "power3.out" },
          onComplete: () => gsap.set(everything, { clearProps: "opacity,visibility,transform" }),
        })
        .to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.1)
        .to(sentence, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.55)
        .to(pills, { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.08 }, 0.66)
        .to(dock, { autoAlpha: 1, y: 0, duration: 1.05, ease: "expo.out" }, 0.7)
        .to(meta, { autoAlpha: 1, duration: 0.8, ease: "power2.out" }, 0.9)
        .to(cue, { autoAlpha: 1, duration: 0.6, ease: "power2.out" }, 1.05);

      return onLoaderDone(() => timeline.play());
    },
    { dependencies: [active], revertOnUpdate: true },
  );

  return null;
}
