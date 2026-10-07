"use client";

import { useEffect, useRef, type MouseEvent, type PointerEvent, type RefObject, type SyntheticEvent } from "react";
import { announceOverlay } from "./overlay";

/**
 * What <Dialog>, <Drawer> and the lightbox share: a native <dialog> opened with showModal().
 *
 * The platform does the hard parts: everything behind is inert, Tab stays inside, Escape asks to close.
 * This hook adds what the platform leaves out:
 *   - a click on the backdrop closes (a press and a release that both landed on it, so dragging a text
 *     selection out of the panel does not);
 *   - the page behind stops scrolling, and keeps its width when the scrollbar goes. The scrollbar's
 *     width is also published as --scroll-lock-pad on <html>, for fixed elements (the header) that want
 *     to hold still too: padding-inline-end: var(--scroll-lock-pad, 0px);
 *   - focus goes back to whatever opened it, or to `restoreTo` when given (WebKit does not focus a
 *     button on click, so the lightbox names its trigger);
 *   - window "pkh:overlay" is dispatched on open and on close (see overlay.ts).
 *
 * Spread `dialogProps` on the <dialog> and attach `ref`. Scrollable regions inside should carry
 * data-lenis-prevent so the wheel still reaches them while smooth scrolling is paused.
 */

function lockScroll(): () => void {
  const root = document.documentElement;
  const previous = {
    overflow: root.style.overflow,
    paddingInlineEnd: root.style.paddingInlineEnd,
    pad: root.style.getPropertyValue("--scroll-lock-pad"),
  };
  const scrollbar = window.innerWidth - root.clientWidth;
  root.style.overflow = "hidden";
  if (scrollbar > 0) {
    root.style.paddingInlineEnd = `${scrollbar}px`;
    root.style.setProperty("--scroll-lock-pad", `${scrollbar}px`);
  }
  return () => {
    root.style.overflow = previous.overflow;
    root.style.paddingInlineEnd = previous.paddingInlineEnd;
    if (previous.pad) root.style.setProperty("--scroll-lock-pad", previous.pad);
    else root.style.removeProperty("--scroll-lock-pad");
  };
}

/**
 * The control most recently pressed with a pointer. WebKit does not move focus to a button when it is
 * clicked or tapped, so "whatever had focus when the dialog opened" is <body> there; this is the fallback
 * that lets focus return to the trigger all the same.
 */
let lastPressed: HTMLElement | null = null;
let tracking = false;

function trackPresses() {
  if (tracking) return;
  tracking = true;
  document.addEventListener(
    "pointerdown",
    (event) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("button, a[href], summary, [tabindex]") : null;
      // A press inside an open dialog is not what opened it.
      if (!target?.closest("dialog[open]")) lastPressed = target;
    },
    { capture: true, passive: true },
  );
}

export function useModal(open: boolean, onClose: () => void, restoreTo?: RefObject<HTMLElement | null>) {
  const ref = useRef<HTMLDialogElement>(null);
  /** True only while a press that began on the backdrop is in progress. */
  const pressedBackdrop = useRef(false);

  // Listening starts when the first dialog on the page mounts (closed), so the press that opens it is seen.
  useEffect(trackPresses, []);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;

    const focused = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
    const opener = focused ?? lastPressed;
    // A named trigger is set before the dialog is asked to open, so it is read here, once.
    const named = restoreTo?.current ?? null;
    if (!dialog.open) dialog.showModal();
    const unlock = lockScroll();
    announceOverlay(true);

    return () => {
      announceOverlay(false);
      unlock();
      if (dialog.open) dialog.close();
      // Browsers restore focus themselves; this covers a named trigger and the ones that leave it on <body>.
      const target = named ?? opener;
      const active = document.activeElement;
      // "Lost" is anywhere a guest cannot see focus: nowhere, the page itself, or still inside the closed dialog.
      const lost = !active || active === document.body || active === document.documentElement || dialog.contains(active);
      if (target?.isConnected && (named || lost)) target.focus({ preventScroll: true });
    };
  }, [open, restoreTo]);

  const dialogProps = {
    /** Escape: keep the element open until the parent agrees, so state and DOM never disagree. */
    onCancel(event: SyntheticEvent<HTMLDialogElement>) {
      event.preventDefault();
      onClose();
    },
    /** The element closed by some other route (a second Escape, form[method=dialog]): tell the parent. */
    onClose(event: SyntheticEvent<HTMLDialogElement>) {
      if (open && !event.currentTarget.open) onClose();
    },
    onPointerDown(event: PointerEvent<HTMLDialogElement>) {
      pressedBackdrop.current = event.target === event.currentTarget;
    },
    /** A click whose press and release both landed on the backdrop. */
    onClick(event: MouseEvent<HTMLDialogElement>) {
      if (event.target === event.currentTarget && pressedBackdrop.current) onClose();
      pressedBackdrop.current = false;
    },
  };

  return { ref, dialogProps };
}
