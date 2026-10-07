"use client";

import Lenis from "lenis";
import { gsap, onRefresh, registerMotion, requestRefresh, ScrollTrigger } from "./gsap";
import { isOverlayOpen, resetOverlays, subscribeOverlay } from "./overlay-bus";
import { mediaQueries, setMotionReady } from "./store";

/**
 * Everything <MotionProvider> does once the page is in a browser. Kept out of the component so the
 * component stays a few lines of React and this stays plain script.
 *
 * "use client" although nothing here is a component: this module brings in Lenis and GSAP, and the
 * directive keeps it (and them) out of the server-component bundle when a Server Component imports
 * something else from the motion barrel. Only client code ever calls these functions.
 *
 * bootMotion()
 *   - registers GSAP's plugins (once per document)
 *   - marks <html> with the class "motion" while animation is allowed
 *   - starts Lenis for a mouse or trackpad when motion is allowed, driven by GSAP's ticker so the two
 *     share one frame loop, and tells ScrollTrigger about every scroll it makes
 *   - stops Lenis while an overlay is open and starts it when the last one closes
 *   - re-measures triggers when fonts arrive, when the window has loaded, and whenever the page changes
 *     height for any reason (a late image, an accordion, a filter)
 *
 * routeChanged()
 *   - a new page starts unlocked and with no leftover inertia, then is measured once it has laid out
 */

let lenis: Lenis | null = null;

/** The live Lenis instance, or null (touch devices, reduced motion, before boot). */
export function getLenis(): Lenis | null {
  return lenis;
}

function tick(time: number) {
  lenis?.raf(time * 1000);
}

/**
 * Lenis works out where an in-page link should land from the scroll position it last heard about. If the
 * page has just been moved by something else in the same frame (a keyboard focus bringing the link into
 * view, a script), that position is one frame stale and the glide stops short by exactly that much. So
 * before Lenis sees any click, it is told where the page really is.
 */
function syncBeforeClick() {
  if (!lenis || lenis.isStopped || lenis.isScrolling === "smooth") return;
  if (Math.abs(lenis.animatedScroll - lenis.actualScroll) > 1) lenis.resize();
}

function startLenis() {
  if (lenis) return;
  lenis = new Lenis({
    // Light smoothing: the wheel still feels attached to the page.
    lerp: 0.11,
    wheelMultiplier: 1,
    smoothWheel: true,
    // Touch scrolling stays native everywhere.
    syncTouch: false,
    // In-page links (#story) glide to their target and respect scroll-padding-top.
    anchors: true,
    // A drawer body, a textarea or the reel's native fallback scroll by themselves.
    allowNestedScroll: true,
    // Clicking through to another page drops any momentum left over from this one.
    stopInertiaOnNavigate: true,
    autoRaf: false,
  });
  lenis.on("scroll", ScrollTrigger.update);
  // Capture phase: this runs before the click handler Lenis keeps on the window.
  window.addEventListener("click", syncBeforeClick, true);
  gsap.ticker.add(tick);
  if (isOverlayOpen()) lenis.stop();
}

function stopLenis() {
  if (!lenis) return;
  gsap.ticker.remove(tick);
  window.removeEventListener("click", syncBeforeClick, true);
  lenis.destroy();
  lenis = null;
}

/** Drop any scroll animation in flight and adopt wherever the page really is. */
function settleLenis() {
  if (!lenis) return;
  // stop() + start() is the public way to reset Lenis's targets to the real scroll position.
  lenis.stop();
  if (!isOverlayOpen()) lenis.start();
}

/**
 * Scroll to a position, an element or a selector from script: a "Back to top" button, the chapter index.
 * (A plain in-page link needs none of this: `<a href="#story">` is picked up automatically.)
 *
 *   scrollToTarget(0)
 *   scrollToTarget("#story")
 *   scrollToTarget(element, { immediate: true })
 *
 * With smooth scrolling on it glides there through Lenis. Otherwise the browser does it, smoothly unless
 * the visitor asked for reduced motion. Either way the target stops below the sticky header, because
 * both honour scroll-padding-top.
 */
export function scrollToTarget(target: number | string | HTMLElement, options: { immediate?: boolean } = {}): void {
  if (typeof window === "undefined") return;
  if (lenis && !lenis.isStopped) {
    syncBeforeClick();
    lenis.scrollTo(target, { immediate: options.immediate });
    return;
  }
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
  const { reduced, fine } = mediaQueries();

  const sync = () => {
    const allowed = !reduced.matches;
    html.classList.toggle("motion", allowed);
    if (allowed && fine.matches) startLenis();
    else stopLenis();
  };
  sync();
  reduced.addEventListener("change", sync);
  fine.addEventListener("change", sync);

  const offOverlay = subscribeOverlay(() => {
    if (!lenis) return;
    if (isOverlayOpen()) lenis.stop();
    else lenis.start();
  });

  const offRefresh = onRefresh(() => lenis?.resize());

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
    fine.removeEventListener("change", sync);
    window.removeEventListener("load", refreshIfAlive);
    offOverlay();
    offRefresh();
    resize?.disconnect();
    stopLenis();
    html.classList.remove("motion");
  };
}

/** Called in the layout phase of the commit that shows a new page, after Next has placed the scroll. */
export function routeChanged(): void {
  resetOverlays();
  settleLenis();
  // Two frames: the new page has laid out and its entrances have armed.
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => requestRefresh(60)));
}
