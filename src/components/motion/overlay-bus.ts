/**
 * The overlay event bus (BUILD-CONTRACT section 9): any drawer, lightbox, menu or sheet that opens tells
 * the rest of the page, so smooth scrolling stops, the reel holds still and the phone action bar hides.
 *
 *   announceOverlay(true)    when it opens
 *   announceOverlay(false)   when it closes
 *
 * which is exactly
 *
 *   window.dispatchEvent(new CustomEvent("pkh:overlay", { detail: { open } }))
 *
 * so code that dispatches the raw event is counted too. Overlays can stack (a menu that opens the planner),
 * so the bus counts: "open" means at least one is. The count never goes below zero, and the motion
 * provider clears it on every route change, so a missed "closed" can never leave the page locked.
 *
 * A plain module: no React here. The hook is useOverlayOpen().
 */

export const OVERLAY_EVENT = "pkh:overlay";

type Listener = () => void;

const listeners = new Set<Listener>();
let count = 0;
let wired = false;

function notify() {
  listeners.forEach((listener) => listener());
}

function wire() {
  if (wired || typeof window === "undefined") return;
  wired = true;
  window.addEventListener(OVERLAY_EVENT, (event) => {
    const detail = (event as CustomEvent<{ open?: unknown } | null>).detail;
    const next = detail && detail.open ? count + 1 : Math.max(0, count - 1);
    if (next === count) return;
    const was = count > 0;
    count = next;
    if (was !== count > 0) notify();
  });
}

// Listen from the first moment the module exists in a browser, so no announcement is missed.
wire();

/** Tell the page an overlay has opened or closed. */
export function announceOverlay(open: boolean): void {
  if (typeof window === "undefined") return;
  wire();
  window.dispatchEvent(new CustomEvent(OVERLAY_EVENT, { detail: { open } }));
}

/** Is any overlay open right now? For imperative code (tickers, handlers). */
export function isOverlayOpen(): boolean {
  return count > 0;
}

/** Called when the open state flips (not on every nested open). Returns the unsubscribe function. */
export function subscribeOverlay(listener: Listener): () => void {
  wire();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Forget every open overlay. The provider calls this on route change: a new page starts unlocked. */
export function resetOverlays(): void {
  if (count === 0) return;
  count = 0;
  notify();
}
