"use client";

import type { MouseEvent, ReactNode } from "react";
import { scrollToTarget } from "@/components/motion/runtime";
import { TOP_ID } from "./ids";

/**
 * The footer's "Back to top" link.
 *
 * `href="#top"` points at the zero-size mark the layout puts at the very top of the document (and is the
 * fragment every browser takes for the top in any case), so the link works with no script at all. With script a plain click is taken over: the page glides up through the motion
 * system (or jumps, under reduced motion) and the address bar is left as it was.
 */
export function BackToTopLink({ className, children }: { className?: string; children: ReactNode }) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    scrollToTarget(0);
  }

  return (
    <a href={`#${TOP_ID}`} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
