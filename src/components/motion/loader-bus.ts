/**
 * "The page has been revealed": the one signal the hero waits for before it starts its entrance.
 *
 *   useEffect(() => onLoaderDone(() => timeline.play()), []);
 *
 * onLoaderDone(cb) calls back when the loader lifts. If there is no loader in play (reduced motion, a
 * page reached by client-side navigation, a loader that already finished) it calls back at once, so a
 * caller never has to ask which case it is in. It returns the function that cancels the wait.
 *
 * The raw event is window "pkh:loader-done". It fires once per document, as the blind starts to lift,
 * so entrances overlap the reveal instead of starting after it. When the loader is skipped it still
 * fires, just after mount.
 *
 * State lives on window.__pkhLoader because the loader's boot script runs before any module does.
 * A plain module: no React here.
 */

export const LOADER_DONE_EVENT = "pkh:loader-done";

export interface LoaderState {
  /** The page has been revealed (or was never covered). */
  done: boolean;
  /** Called by <Loader> once the page has hydrated: the blind may lift as soon as its minimum time is up. */
  ready?: () => void;
}

declare global {
  interface Window {
    __pkhLoader?: LoaderState;
  }
}

/** A loader is covering the page right now. */
export function loaderPending(): boolean {
  if (typeof window === "undefined") return false;
  const state = window.__pkhLoader;
  return Boolean(state && !state.done);
}

/** The page is in view: the loader has lifted, or there was none. */
export function isLoaderDone(): boolean {
  return typeof window !== "undefined" && !loaderPending();
}

export function onLoaderDone(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  if (!loaderPending()) {
    callback();
    return () => {};
  }
  const handler = () => callback();
  window.addEventListener(LOADER_DONE_EVENT, handler, { once: true });
  return () => window.removeEventListener(LOADER_DONE_EVENT, handler);
}

let skipAnnounced = false;

/**
 * For <Loader> when it never showed: records that the page is in view and still fires the event, one
 * frame later so that every component mounting in the same commit has had the chance to listen.
 */
export function announceLoaderSkipped(): void {
  if (typeof window === "undefined" || skipAnnounced) return;
  skipAnnounced = true;
  if (!window.__pkhLoader) window.__pkhLoader = { done: true };
  window.requestAnimationFrame(() => window.dispatchEvent(new CustomEvent(LOADER_DONE_EVENT)));
}
