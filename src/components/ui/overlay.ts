/**
 * Overlays announce themselves (BUILD-CONTRACT section 9): anything that covers the page dispatches
 *
 *   window.dispatchEvent(new CustomEvent("pkh:overlay", { detail: { open: true | false } }))
 *
 * so other parts can react: the motion provider stops and starts smooth scrolling, the photo reel
 * pauses, the phone action bar hides.
 *
 * `announceOverlay` keeps a count, because overlays nest (a lightbox opened from inside a drawer). The
 * event says `open: true` when the first one opens and `open: false` only when the last one has closed;
 * `detail.count` carries the number still open. Dialog, Drawer and Lightbox all go through it. An
 * overlay built outside this folder should call it too instead of dispatching by hand.
 *
 * Plain module, no "use client": it only touches `window` when called, and only client code calls it.
 */

export const OVERLAY_EVENT = "pkh:overlay";

export interface OverlayDetail {
  open: boolean;
  count: number;
}

let openCount = 0;

export function announceOverlay(open: boolean): void {
  if (typeof window === "undefined") return;
  const before = openCount;
  openCount = Math.max(0, openCount + (open ? 1 : -1));
  const wasOpen = before > 0;
  const isOpen = openCount > 0;
  if (wasOpen === isOpen) return;
  window.dispatchEvent(new CustomEvent<OverlayDetail>(OVERLAY_EVENT, { detail: { open: isOpen, count: openCount } }));
}

/** True while any overlay from this folder is open. */
export function isOverlayOpen(): boolean {
  return openCount > 0;
}
