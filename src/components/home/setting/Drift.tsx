"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/components/motion/gsap";
import { useMotion } from "@/components/motion/useMotion";

/**
 * A whole block that drifts a little as the page moves: the portrait photograph of chapter 01 rides a
 * few pixels against the wide frame it overlaps, so the two read as separate sheets.
 *
 *   <Drift distance={28} className={s.tall}>…</Drift>
 *
 * `distance` is how far it travels each way, in px, while it crosses the screen. Transform only.
 * Mouse and trackpad only (a scrubbed transform stutters against native touch scrolling); still under
 * reduced motion, without the motion provider and without JavaScript, where it is a plain <div>.
 *
 * It moves the block, not the picture: <Parallax> inside it moves the picture within its own frame, so
 * the two never write to the same element.
 */
export interface DriftProps {
  /** Pixels of travel each way. Default 28. */
  distance?: number;
  className?: string;
  children: ReactNode;
}

export function Drift({ distance = 28, className, children }: DriftProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useMotion();
  const active = ready && !reduced;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !active || distance === 0) return;
      if (!window.matchMedia("(pointer: fine)").matches) return;
      gsap.fromTo(
        el,
        { y: distance },
        {
          y: -distance,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 },
        },
      );
    },
    { dependencies: [active, distance], revertOnUpdate: true },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
