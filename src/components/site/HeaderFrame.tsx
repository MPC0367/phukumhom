"use client";

import { useCallback, useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "@/components/motion/gsap";
import { useEntrance, type EntranceControl } from "@/components/motion/useEntrance";
import { rescanHeaderOver } from "./header-over";
import { HEADER_ID } from "./ids";
import { useHeaderOver } from "./shell-signals";

/**
 * The <header> element and the two things about it that need script.
 *
 * WHETHER A PHOTOGRAPH IS BEHIND IT
 *   data-over="true"    a `data-header-over` element (a hero, a page hero) is behind the bar:
 *                       transparent ground, paper-coloured words
 *   data-over="false"   paper ground, ink words, a hairline beneath
 *   no attribute        the server's HTML, before script: the stylesheet decides from the page itself
 *                       (`:has([data-header-over])`), and the bar is not fixed yet, so a page read without
 *                       JavaScript never has a transparent header over its text
 * The answer comes from an IntersectionObserver read through useSyncExternalStore (header-over.ts): no
 * scroll listener and no state set from an effect. After every navigation the new page's hero is looked
 * for again, in the layout phase, so the bar is already right in the first frame of the new page.
 * The bar's height never changes.
 *
 * ITS ARRIVAL
 * On a hard load, as the loader lifts, the bar's three parts (the pages, the name, the tools) come down
 * into place one after another, in step with the hero's own entrance. The motion system's rules apply
 * (useEntrance, trigger "loader"): it runs only while the loader is covering the page, never under
 * reduced motion, and never on a later navigation, because the header stays mounted.
 */
export function HeaderFrame({ className, children }: { className: string; children: ReactNode }) {
  const header = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const over = useHeaderOver();

  useLayoutEffect(() => {
    rescanHeaderOver();
    // Next places the scroll of a new page in the same commit; look once more when it has.
    const frame = window.requestAnimationFrame(rescanHeaderOver);
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  const build = useCallback((el: HTMLElement): EntranceControl | null => {
    const parts = el.firstElementChild ? Array.from(el.firstElementChild.children) : [];
    if (parts.length === 0) return null;
    const tween = gsap.fromTo(
      parts,
      { y: -14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.08, delay: 0.1, paused: true, clearProps: "transform,opacity" },
    );
    return { play: () => tween.play(), finish: () => tween.progress(1) };
  }, []);

  useEntrance(header, { trigger: "loader", build });

  return (
    <header ref={header} id={HEADER_ID} className={className} data-over={over === null ? undefined : String(over)}>
      {children}
    </header>
  );
}
