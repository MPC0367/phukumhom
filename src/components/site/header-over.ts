import { HEADER_ID } from "./ids";

/**
 * Is a photograph behind the site header right now?
 *
 * A page opts in by rendering an element with `data-header-over` at its top (ui/Band with `overHeader`,
 * ui/PageHero, the home hero). While any such element crosses the header's lower edge the header is
 * transparent with paper-coloured words; once the element's bottom has passed that edge the header takes
 * its paper ground again (BUILD-CONTRACT section 9).
 *
 * How it is known: an IntersectionObserver whose root is shrunk to a one-pixel strip along the header's
 * lower edge, so "intersecting" means "this element is behind that line". No scroll listener. The strip
 * is rebuilt when the window is resized, and the elements are looked for again after every navigation
 * (`rescanHeaderOver`, called by <HeaderFrame> when the pathname changes).
 *
 * A plain module: the hook is in useHeaderOver.ts. Read it through useSyncExternalStore:
 *
 *   subscribeHeaderOver   starts watching with the first subscriber, stops with the last
 *   headerOverNow         the current answer (measured directly the first time it is asked)
 *   headerOverOnServer    null: a static page cannot know, and the stylesheet covers that moment
 */

const SELECTOR = "[data-header-over]";
/** The header's height when it cannot be measured (4.75rem at the default text size). */
const FALLBACK_HEIGHT = 76;

type Listener = () => void;

const listeners = new Set<Listener>();
const behind = new Set<Element>();
let observer: IntersectionObserver | null = null;
let known = false;
let over = false;
let frame = 0;

/** The y of the header's lower edge, in CSS px from the top of the viewport. */
function headerLine(): number {
  const height = document.getElementById(HEADER_ID)?.getBoundingClientRect().height ?? 0;
  return Math.max(1, Math.round(height > 0 ? height : FALLBACK_HEIGHT));
}

/** The direct answer, for the moments an observer has not reported yet. */
function measure(): boolean {
  const y = headerLine() - 1;
  for (const el of document.querySelectorAll(SELECTOR)) {
    const rect = el.getBoundingClientRect();
    if (rect.height > 0 && rect.top <= y && rect.bottom > y) return true;
  }
  return false;
}

function publish(next: boolean): void {
  known = true;
  if (next === over) return;
  over = next;
  listeners.forEach((listener) => listener());
}

function watch(): void {
  observer?.disconnect();
  observer = null;
  behind.clear();
  if (typeof IntersectionObserver === "undefined") {
    publish(measure());
    return;
  }
  const y = headerLine();
  const below = Math.max(0, window.innerHeight - y);
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) behind.add(entry.target);
        else behind.delete(entry.target);
      }
      publish(behind.size > 0);
    },
    { rootMargin: `-${y - 1}px 0px -${below}px 0px` },
  );
  for (const el of document.querySelectorAll(SELECTOR)) observer.observe(el);
  // The observer answers a frame from now; the measurement answers at once.
  publish(measure());
}

function onResize(): void {
  window.cancelAnimationFrame(frame);
  frame = window.requestAnimationFrame(watch);
}

export function subscribeHeaderOver(listener: Listener): () => void {
  listeners.add(listener);
  if (listeners.size === 1) {
    watch();
    window.addEventListener("resize", onResize);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size > 0) return;
    window.removeEventListener("resize", onResize);
    window.cancelAnimationFrame(frame);
    observer?.disconnect();
    observer = null;
    behind.clear();
    known = false;
  };
}

export function headerOverNow(): boolean {
  if (!known) {
    over = measure();
    known = true;
  }
  return over;
}

export function headerOverOnServer(): null {
  return null;
}

/** Look for the page's `data-header-over` elements again: call after a navigation has put a new page in place. */
export function rescanHeaderOver(): void {
  if (listeners.size > 0) watch();
}
