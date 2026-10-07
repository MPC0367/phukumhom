"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useOverlayOpen } from "@/components/motion/useOverlayOpen";
import { useFieldFocused, useFooterInView, useHeaderOver } from "./shell-signals";
import styles from "./StickyActions.module.css";

/**
 * The client half of <StickyActions>: decides when the phone action bar may be on screen.
 *
 * The bar is shown only when ALL of these hold:
 *   - the stylesheet is displaying it at all: the bar is narrower than 48rem (from there the header
 *     carries the booking pill) and wide enough for its three actions to fit on one line. Both are
 *     measured in the bar's own width in rem, so they follow the guest's text size; this file asks
 *     the element whether it is displayed rather than repeating the numbers;
 *   - no hero is behind the header: near the top of a page that opens with a photograph the hero's
 *     own buttons are on screen, and the bar arrives as the header takes its paper ground;
 *   - the footer is not in view (the footer carries the same links; the bar never covers it);
 *   - no overlay is open: the menu, the planner drawer, the photo viewer, any sheet ("pkh:overlay");
 *   - no form field inside <main> has focus (an on-screen keyboard needs the room).
 *
 * Each condition is observed, not polled, and read through useSyncExternalStore (shell-signals.ts,
 * the motion system's overlay bus): no scroll listener, and no state set from an effect.
 *
 * While the bar is shown, <html> gets a matching `scroll-padding-bottom`, so an element scrolled
 * into view (a focused link, an anchor target) never ends up underneath it.
 *
 * Without script the bar stays hidden; the header menu, the page's own buttons and the footer still
 * lead to the same three places.
 */

/** Height of the bar, the gap beneath it, its safe-area inset and a little air. */
const SCROLL_PADDING = "calc(var(--sticky-actions-h) + env(safe-area-inset-bottom, 0px) + var(--s-6))";

function subscribeResize(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

/** The row is asked by id, so the answer never depends on a ref read while rendering. */
const ROW_ID = "sticky-actions-row";

/** Whether the stylesheet is displaying the bar's contents at this width and text size (it has boxes even while it is slid away). */
const isDisplayed = () => (document.getElementById(ROW_ID)?.getClientRects().length ?? 0) > 0;
const notDisplayed = () => false;

export interface StickyBarProps {
  /** Accessible name of the bar: glossary a11y.stickyActions. */
  label: string;
  children: ReactNode;
}

export function StickyBar({ label, children }: StickyBarProps) {
  const heroBehindHeader = useHeaderOver();
  const footerInView = useFooterInView();
  const fieldFocused = useFieldFocused();
  const overlayOpen = useOverlayOpen();
  const displayed = useSyncExternalStore(subscribeResize, isDisplayed, notDisplayed);

  const show = displayed && heroBehindHeader === false && !footerInView && !fieldFocused && !overlayOpen;

  useEffect(() => {
    if (!show) return;
    const root = document.documentElement;
    root.style.setProperty("scroll-padding-bottom", SCROLL_PADDING);
    return () => {
      root.style.removeProperty("scroll-padding-bottom");
    };
  }, [show]);

  return (
    <nav className={`${styles.bar} no-print`} aria-label={label} data-state={show ? "shown" : "hidden"} inert={!show}>
      <div id={ROW_ID} className={styles.row}>
        {children}
      </div>
    </nav>
  );
}
