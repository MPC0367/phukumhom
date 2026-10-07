"use client";

import { createContext, useContext, useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { bootMotion, routeChanged } from "./runtime";

/**
 * Mounted once, in the language layout, around everything that moves:
 *
 *   <body>
 *     <Loader … />
 *     <MotionProvider>
 *       <ScrollProgress /> <Header /> <main>{children}</main> <Footer /> …
 *     </MotionProvider>
 *   </body>
 *
 * It renders nothing of its own. In the browser it registers GSAP's plugins, starts smooth wheel
 * scrolling for a mouse or trackpad (never for touch, never under reduced motion), keeps ScrollTrigger
 * measured, and stops scrolling while an overlay is open: see runtime.ts.
 *
 * It reads only the pathname, so every page below stays static. Nesting is harmless: an inner provider
 * (a lab page that wraps itself) steps aside for the outer one.
 *
 * Boot happens in the layout phase so that entrances can set their start states before the first
 * painted frame after hydration.
 */

const MotionContext = createContext(false);

export function MotionProvider({ children }: { children: ReactNode }) {
  const nested = useContext(MotionContext);
  if (nested) return <>{children}</>;
  return <MotionRoot>{children}</MotionRoot>;
}

function MotionRoot({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const seen = useRef<string | null>(null);

  useLayoutEffect(() => bootMotion(), []);

  useLayoutEffect(() => {
    // Not on the first commit: that is the hard load, which the loader and the boot above own.
    if (seen.current !== null && seen.current !== pathname) routeChanged();
    seen.current = pathname;
  }, [pathname]);

  return <MotionContext.Provider value={true}>{children}</MotionContext.Provider>;
}
