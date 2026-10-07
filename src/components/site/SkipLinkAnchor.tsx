"use client";

import type { ReactNode } from "react";

/**
 * The skip link's anchor, and the one thing about it that needs script.
 *
 * Without script it is a plain fragment link: the browser scrolls to the target and starts the next
 * Tab from there. With script the target is also given real focus, which older assistive technology
 * needs before it moves its own reading position — but only for this one move. The target is made
 * focusable (`tabindex="-1"`) at the moment the link is used and stops being focusable as soon as
 * focus leaves it.
 *
 * It must not be focusable all the time. A permanently focusable <main> takes focus whenever a guest
 * clicks any text in the page, and the next Tab then starts from the top of <main> instead of from
 * the place that was clicked.
 */
export function SkipLinkAnchor({ targetId, className, children }: { targetId: string; className?: string; children: ReactNode }) {
  function handleClick() {
    const target = document.getElementById(targetId);
    if (!target) return;
    target.setAttribute("tabindex", "-1");
    target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
    // The link's own navigation does the scrolling, so the header's scroll padding is respected.
    target.focus({ preventScroll: true });
  }

  return (
    <a href={`#${targetId}`} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
