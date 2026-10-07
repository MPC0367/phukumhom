"use client";

import { useSyncExternalStore } from "react";
import { isOverlayOpen, subscribeOverlay } from "./overlay-bus";

const closed = () => false;

/**
 * True while any drawer, lightbox, menu or sheet is open (see overlay-bus.ts).
 *
 *   const overlayOpen = useOverlayOpen();
 *   <nav hidden={overlayOpen}>…</nav>
 */
export function useOverlayOpen(): boolean {
  return useSyncExternalStore(subscribeOverlay, isOverlayOpen, closed);
}
