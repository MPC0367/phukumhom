"use client";

import { useSyncExternalStore } from "react";
import { headerOverNow, headerOverOnServer, subscribeHeaderOver } from "./header-over";
import { FOOTER_ID, MAIN_ID } from "./ids";

/**
 * The few things the fixed parts of the shell (the header, the phone action bar, the chapter index, the
 * back-to-top button) need to know about the page, each observed once and read through
 * useSyncExternalStore: no scroll listeners, no state set from effects.
 *
 *   useHeaderOver()     true while a `data-header-over` element is behind the header; null before script
 *   useFooterInView()   true while any part of the site footer is on screen
 *   useFieldFocused()   true while a text field, select or textarea inside <main> has focus
 *
 * On the server and while hydrating every hook answers "unknown" (null or false), so the fixed parts
 * start hidden or in their plain state and nothing in the server's HTML depends on a measurement.
 */

type Listener = () => void;

/** A boolean that something outside React keeps up to date, with observers that run only while it is read. */
function createSignal(start: (set: (value: boolean) => void) => () => void) {
  const listeners = new Set<Listener>();
  let value = false;
  let stop: (() => void) | null = null;
  const set = (next: boolean) => {
    if (next === value) return;
    value = next;
    listeners.forEach((listener) => listener());
  };
  return {
    subscribe(listener: Listener) {
      listeners.add(listener);
      if (listeners.size === 1) stop = start(set);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          stop?.();
          stop = null;
          value = false;
        }
      };
    },
    get: () => value,
  };
}

const never = () => false;

/* ── The header over a photograph ── */

export function useHeaderOver(): boolean | null {
  return useSyncExternalStore(subscribeHeaderOver, headerOverNow, headerOverOnServer);
}

/* ── The footer on screen ── */

const footerSignal = createSignal((set) => {
  const footer = document.getElementById(FOOTER_ID);
  if (!footer || typeof IntersectionObserver === "undefined") return () => {};
  const observer = new IntersectionObserver(([entry]) => set(entry.isIntersecting));
  observer.observe(footer);
  return () => observer.disconnect();
});

export function useFooterInView(): boolean {
  return useSyncExternalStore(footerSignal.subscribe, footerSignal.get, never);
}

/* ── A form field in the page has focus (an on-screen keyboard needs the room) ── */

const FIELD =
  "input:not([type='checkbox']):not([type='radio']):not([type='button']):not([type='submit']):not([type='reset']):not([type='range']), select, textarea, [contenteditable='true']";

function isFieldInMain(node: EventTarget | null): boolean {
  return node instanceof HTMLElement && node.matches(FIELD) && node.closest(`#${MAIN_ID}`) !== null;
}

const fieldSignal = createSignal((set) => {
  const onFocusIn = (event: FocusEvent) => set(isFieldInMain(event.target));
  // `relatedTarget` is where focus is going, so moving from one field to the next never flickers.
  const onFocusOut = (event: FocusEvent) => set(isFieldInMain(event.relatedTarget));
  document.addEventListener("focusin", onFocusIn);
  document.addEventListener("focusout", onFocusOut);
  set(isFieldInMain(document.activeElement));
  return () => {
    document.removeEventListener("focusin", onFocusIn);
    document.removeEventListener("focusout", onFocusOut);
  };
});

export function useFieldFocused(): boolean {
  return useSyncExternalStore(fieldSignal.subscribe, fieldSignal.get, never);
}
