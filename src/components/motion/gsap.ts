import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { Flip } from "gsap/Flip";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/**
 * GSAP, with every plugin the site uses registered exactly once.
 *
 * Client modules that need their own timeline import from here rather than from "gsap", so the plugins
 * are certain to be registered whatever order the chunks load in:
 *
 *   import { gsap, ScrollTrigger, Flip } from "@/components/motion/gsap";
 *
 * Registration happens when this module is first evaluated in a browser. On the server the imports are
 * inert: nothing here touches the DOM until it is called.
 *
 * Also here, because they must be shared by every component:
 *   requestRefresh()      one debounced ScrollTrigger.refresh() for all callers
 *   watchPending()        the safety net that guarantees nothing armed for a reveal stays hidden
 */

let registered = false;

export function registerMotion(): void {
  if (registered || typeof window === "undefined") return;
  registered = true;
  gsap.registerPlugin(ScrollTrigger, SplitText, Draggable, InertiaPlugin, Flip);
  // A phone's address bar sliding away is not a layout change worth re-measuring every trigger for.
  ScrollTrigger.config({ ignoreMobileResize: true });
  // Development only: lets a QA script slow every animation down to look at it (gsap.globalTimeline.timeScale).
  if (process.env.NODE_ENV !== "production") (window as unknown as { __pkhGsap?: typeof gsap }).__pkhGsap = gsap;
}

registerMotion();

/* ───────────── One refresh for everyone ───────────── */

let refreshTimer: ReturnType<typeof setTimeout> | undefined;

/** Called after every ScrollTrigger refresh (the provider uses it to keep Lenis in step). */
export function onRefresh(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  ScrollTrigger.addEventListener("refresh", callback);
  return () => ScrollTrigger.removeEventListener("refresh", callback);
}

/**
 * Ask for trigger positions to be measured again: after a route change, when fonts or images settle,
 * when a panel opens. Calls made close together collapse into one refresh.
 *
 * It is always the SAFE refresh. A refresh moves the page to the top and back while it measures, and a
 * forced one does that at once, which cuts short any scroll that is under way: the browser gliding back
 * to where the visitor was after the Back button, a glide to an in-page link, a hand on the wheel. The
 * safe refresh waits until scrolling has stopped.
 */
export function requestRefresh(delay = 120): void {
  if (typeof window === "undefined") return;
  if (refreshTimer !== undefined) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    refreshTimer = undefined;
    ScrollTrigger.refresh(true);
  }, delay);
}

/* ───────────── Nothing stays hidden ─────────────
 *
 * A block armed for a scroll reveal is invisible until its trigger fires. ScrollTrigger fires when the
 * block's top crosses a line a little way up the screen, and three things can stop that from happening:
 * the block sits at the very foot of the page and can never reach the line, a keyboard brings focus into
 * it without scrolling far enough, or the page is printed. watchPending() covers all three:
 *
 *   - any part of the block has been on screen for a moment and it is still hidden  → reveal it
 *   - focus lands inside it                                                          → show it at once
 *   - the page is about to print                                                     → show everything at once
 */

type Reveal = (instant?: boolean) => void;

interface Pending {
  reveal: Reveal;
  timer: ReturnType<typeof setTimeout> | undefined;
  onFocus: () => void;
}

/** How long a hidden block may sit on screen before the safety net shows it. */
const DWELL_MS = 420;

const pending = new Map<Element, Pending>();
let observer: IntersectionObserver | undefined;
let printWired = false;

function ensureObserver(): IntersectionObserver | undefined {
  if (observer || typeof IntersectionObserver === "undefined") return observer;
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const item = pending.get(entry.target);
      if (!item) continue;
      if (entry.isIntersecting) {
        if (item.timer === undefined) {
          item.timer = setTimeout(() => {
            item.timer = undefined;
            if (pending.has(entry.target)) item.reveal();
          }, DWELL_MS);
        }
      } else if (item.timer !== undefined) {
        clearTimeout(item.timer);
        item.timer = undefined;
      }
    }
  });
  return observer;
}

/** Watch an armed element. `reveal` must be safe to call more than once. Returns the function that stops watching. */
export function watchPending(el: Element, reveal: Reveal): () => void {
  if (typeof window === "undefined") return () => {};
  if (!printWired) {
    printWired = true;
    window.addEventListener("beforeprint", () => {
      for (const item of [...pending.values()]) item.reveal(true);
    });
  }
  const onFocus = () => reveal(true);
  const item: Pending = { reveal, timer: undefined, onFocus };
  pending.set(el, item);
  el.addEventListener("focusin", onFocus);
  ensureObserver()?.observe(el);
  return () => {
    if (pending.get(el) !== item) return;
    pending.delete(el);
    if (item.timer !== undefined) clearTimeout(item.timer);
    el.removeEventListener("focusin", onFocus);
    observer?.unobserve(el);
  };
}

export { gsap, Draggable, Flip, InertiaPlugin, ScrollTrigger, SplitText };
