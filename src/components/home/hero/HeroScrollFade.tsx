"use client";

import { useGSAP } from "@gsap/react";
import { useMotion } from "@/components/motion";
import { gsap } from "@/components/motion/gsap";

/**
 * As the page starts to scroll, the hero's words let go of the photograph: everything marked
 * `data-hero-fade` (the text block and the meta strip) fades and drifts up 40px over the first 40% of
 * the hero. The photograph, the slide control and the dock stay exactly where they are.
 *
 * Scrubbed, so it follows the scroll both ways and never plays by itself. Once fully faded the words are
 * also taken out of the tab order (autoAlpha), so focus cannot land on something that cannot be seen;
 * scrolling back brings them straight back.
 *
 * Renders nothing. No effect without script, without the motion provider or under reduced motion.
 */
export function HeroScrollFade({ rootId }: { rootId: string }) {
  const { ready, reduced } = useMotion();
  const active = ready && !reduced;

  useGSAP(
    () => {
      if (!active) return;
      const root = document.getElementById(rootId);
      if (!root) return;
      const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-hero-fade]"));
      if (targets.length === 0) return;
      gsap.fromTo(
        targets,
        { autoAlpha: 1, y: 0 },
        {
          autoAlpha: 0,
          y: -40,
          ease: "none",
          immediateRender: false,
          scrollTrigger: { trigger: root, start: "top top", end: "40% top", scrub: true },
        },
      );
    },
    { dependencies: [active, rootId], revertOnUpdate: true },
  );

  return null;
}
