/**
 * "Is the page in view?" The one question entrances ask before they play.
 *
 * Since 22 Nov 2026 a short opening (components/site/Intro.tsx) can cover the page for about a second
 * when someone arrives from outside the site. It never holds the page: the page loads underneath at full
 * speed, and the opening lifts on a CSS timer whatever script is doing. Its script marks the document:
 *
 *   html[data-intro="on"]     the opening is showing: the page is not in view yet
 *   html[data-intro="lift"]   it is lifting away: the page is in view, entrances may play
 *   (no attribute)            no opening, or it is gone
 *
 * and fires `phk:intro-done` on window as it starts to lift. So:
 *
 *   loaderPending()    true only while the opening is showing
 *   isLoaderDone()     true in the browser once it is lifting, or when there is none
 *   onLoaderDone(cb)   calls back at once, or as the opening lifts (with a 2.5 s safety net)
 *
 * The consequence for entrances (see useEntrance.ts): content the server painted is left alone when no
 * opening covers it; when one does, the homepage hero's entrance plays as the panel rises. An entrance
 * still plays for content that arrives by client-side navigation or scrolls into view.
 *
 * A plain module: no React here.
 */

const DONE_EVENT = "phk:intro-done";
/** If the lift event were ever missed, nothing waits longer than this. */
const SAFETY_MS = 2500;

/** The opening is showing. */
export function loaderPending(): boolean {
  return typeof document !== "undefined" && document.documentElement.getAttribute("data-intro") === "on";
}

/** The page is in view: in the browser, and no opening is showing. */
export function isLoaderDone(): boolean {
  return typeof window !== "undefined" && !loaderPending();
}

/** Calls back once the page is in view: at once, or as the opening lifts. Returns a cancel function. */
export function onLoaderDone(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  if (!loaderPending()) {
    callback();
    return () => {};
  }
  let settled = false;
  const run = () => {
    if (settled) return;
    settled = true;
    window.removeEventListener(DONE_EVENT, run);
    window.clearTimeout(timer);
    callback();
  };
  const timer = window.setTimeout(run, SAFETY_MS);
  window.addEventListener(DONE_EVENT, run);
  return () => {
    settled = true;
    window.removeEventListener(DONE_EVENT, run);
    window.clearTimeout(timer);
  };
}
