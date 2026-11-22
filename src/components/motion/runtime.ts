"use client";

import { registerMotion, requestRefresh } from "./gsap";
import { resetOverlays } from "./overlay-bus";
import { mediaQueries, setMotionReady } from "./store";

/**
 * Everything <MotionProvider> does once the page is in a browser. Kept out of the component so the
 * component stays a few lines of React and this stays plain script.
 *
 * "use client" although nothing here is a component: this module brings in GSAP, and the directive keeps
 * it out of the server-component bundle when a Server Component imports something else from the motion
 * barrel. Only client code ever calls these functions.
 *
 * SCROLLING IS THE BROWSER'S. The wheel, the trackpad, touch, the keyboard and in-page links all scroll
 * natively (revision of 8 October 2026: the smooth-scrolling library was removed). In-page links glide
 * because `html` has `scroll-behavior: smooth` when motion is allowed, and stop below the fixed header
 * because of `scroll-padding-top` (src/styles/base.css). An open dialog locks the page behind it by
 * itself (components/ui/useModal.ts).
 *
 * bootMotion()
 *   - registers GSAP's plugins (once per document)
 *   - marks <html> with the class "motion" while animation is allowed
 *   - re-measures scroll triggers when fonts arrive, when the window has loaded, and whenever the page
 *     changes height for any reason (a late image, an accordion, a filter)
 *
 * routeChanged()
 *   - a new page starts with no overlay recorded as open, then is measured once it has laid out
 */

/**
 * Scroll to a position, an element or a selector from script: a "Back to top" button, the chapter index.
 * (A plain in-page link needs none of this: `<a href="#story">` is the browser's own.)
 *
 *   scrollToTarget(0)
 *   scrollToTarget("#story")
 *   scrollToTarget(element, { immediate: true })
 *
 * The browser does the scrolling, smoothly unless the visitor asked for reduced motion. An element stops
 * below the fixed header, because scrollIntoView honours scroll-padding-top.
 */
export function scrollToTarget(target: number | string | HTMLElement, options: { immediate?: boolean } = {}): void {
  if (typeof window === "undefined") return;
  const behavior: ScrollBehavior = options.immediate || mediaQueries().reduced.matches ? "instant" : "smooth";
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior });
    return;
  }
  const el = typeof target === "string" ? document.querySelector(target) : target;
  el?.scrollIntoView({ behavior, block: "start" });
}

export function bootMotion(): () => void {
  registerMotion();
  const html = document.documentElement;
  const { reduced } = mediaQueries();

  const sync = () => html.classList.toggle("motion", !reduced.matches);
  sync();
  reduced.addEventListener("change", sync);

  // Fonts change line breaks, the load event means every eager image has its size.
  let alive = true;
  const refreshIfAlive = () => {
    if (alive) requestRefresh();
  };
  document.fonts?.ready.then(refreshIfAlive).catch(() => {});
  if (document.readyState !== "complete") window.addEventListener("load", refreshIfAlive, { once: true });

  // Any change in the page's height moves every trigger below it.
  let lastHeight = document.body.offsetHeight;
  const resize =
    typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(() => {
          const height = document.body.offsetHeight;
          if (Math.abs(height - lastHeight) < 2) return;
          lastHeight = height;
          requestRefresh(220);
        });
  resize?.observe(document.body);

  setMotionReady(true);

  return () => {
    alive = false;
    setMotionReady(false);
    reduced.removeEventListener("change", sync);
    window.removeEventListener("load", refreshIfAlive);
    resize?.disconnect();
    html.classList.remove("motion");
  };
}

/** Called in the layout phase of the commit that shows a new page, after Next has placed the scroll. */
export function routeChanged(): void {
  resetOverlays();
  // Two frames: the new page has laid out and its entrances have armed.
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => requestRefresh(60)));
}
