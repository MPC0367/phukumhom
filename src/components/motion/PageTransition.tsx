"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, requestRefresh } from "./gsap";
import { motionActiveNow } from "./store";
import { useServerPainted } from "./useServerPainted";

/**
 * The incoming page rises 16px and fades in over half a second.
 *
 * Used by src/app/[lang]/template.tsx, which Next mounts afresh for every navigation, so this runs once
 * per page visit:
 *
 *   first load        the page came from the server: nothing happens (the loader owns the first
 *                     impression, and the server's HTML is never hidden)
 *   later navigation  the page was created in the browser: it fades in
 *   reduced motion    nothing happens
 *
 * Opacity, not visibility, so Next can still move focus into the new page; and the transform is cleared
 * when it ends, because a transformed ancestor would capture every fixed and sticky element inside it.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const serverPainted = useServerPainted();

  useGSAP(() => {
    const el = ref.current;
    // A page the server sent is the hard load: never hidden, never animated here.
    if (!el || serverPainted.current !== false || !motionActiveNow()) return;
    gsap.fromTo(
      el,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
        clearProps: "opacity,transform",
        // The page was 16px low while its triggers were first measured.
        onComplete: () => requestRefresh(0),
      },
    );
  }, []);

  return (
    <div ref={ref} data-page-transition="">
      {children}
    </div>
  );
}
