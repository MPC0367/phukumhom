/**
 * "Is the page in view?" Always yes.
 *
 * The site used to open behind a full-screen loading screen that held the page for a fixed minimum
 * time; entrances waited for it to lift. That screen was removed (revision of 8 October 2026: content
 * shows as soon as it can render, and nothing is gated on a timer). These three functions remain so the
 * entrance code keeps asking one question in one place, and each now answers at once:
 *
 *   loaderPending()    false: nothing ever covers the page
 *   isLoaderDone()     true in the browser
 *   onLoaderDone(cb)   calls back immediately
 *
 * The consequence for entrances (see useEntrance.ts): content the server has already painted is simply
 * there on a hard load and is never hidden in order to be revealed; an entrance still plays for content
 * that arrives by client-side navigation or scrolls into view.
 *
 * A plain module: no React here.
 */

/** Nothing covers the page. */
export function loaderPending(): boolean {
  return false;
}

/** The page is in view whenever there is a page. */
export function isLoaderDone(): boolean {
  return typeof window !== "undefined";
}

/** Calls back at once in the browser. Returns the (empty) cancel function callers expect. */
export function onLoaderDone(callback: () => void): () => void {
  if (typeof window !== "undefined") callback();
  return () => {};
}
