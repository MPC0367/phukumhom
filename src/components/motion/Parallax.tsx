"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "./gsap";
import { loaderPending } from "./loader-bus";
import { finePointerNow } from "./store";
import { useMotionActive } from "./useMotion";
import { useServerPainted } from "./useServerPainted";
import styles from "./Parallax.module.css";

/**
 * A photograph that drifts inside its frame as the page moves.
 *
 *   <Parallax speed={0.12} className={s.frame}>
 *     <Picture asset={id} lang={lang} ratio="16/9" sizes="…" />
 *   </Parallax>
 *
 * `speed` is the share of the frame's height the picture travels while the frame crosses the screen,
 * from -0.2 to 0.2 (default 0.1). Positive: the picture lags behind the page, which reads as depth.
 * Negative: it runs ahead. The picture is enlarged by the same share first, so its edges never show.
 *
 * Mouse and trackpad only: on touch the scroll is native and a scrubbed transform would stutter, so the
 * photograph is still. Still, too, under reduced motion and without JavaScript, at its true size.
 *
 * The frame clips (overflow: hidden). Give it its shape through `className`; the inner layer fills it.
 */

export interface ParallaxProps {
  /** -0.2 … 0.2. Default 0.1. */
  speed?: number;
  className?: string;
  children: ReactNode;
}

const LIMIT = 0.3;

export function Parallax({ speed = 0.1, className, children }: ParallaxProps) {
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const active = useMotionActive();
  const serverPainted = useServerPainted();

  useGSAP(
    () => {
      const box = frame.current;
      const layer = inner.current;
      if (!box || !layer || !active || !finePointerNow()) return;

      const amount = Math.min(LIMIT, Math.abs(speed));
      if (amount === 0) return;
      const direction = speed < 0 ? -1 : 1;
      const travel = 50 * amount * direction;

      // Enlarging a picture the visitor is already looking at would be a visible jump: ease into it instead.
      const inView = box.getBoundingClientRect().top < window.innerHeight;
      if (serverPainted.current && inView && !loaderPending()) {
        gsap.fromTo(layer, { scale: 1 }, { scale: 1 + amount, duration: 0.9, ease: "power2.out" });
      } else {
        gsap.set(layer, { scale: 1 + amount });
      }

      gsap.fromTo(
        layer,
        { yPercent: -travel },
        {
          yPercent: travel,
          ease: "none",
          scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    },
    { dependencies: [active, speed], revertOnUpdate: true },
  );

  return (
    <div ref={frame} className={className ? `${styles.frame} ${className}` : styles.frame}>
      <div ref={inner} className={styles.inner}>
        {children}
      </div>
    </div>
  );
}
