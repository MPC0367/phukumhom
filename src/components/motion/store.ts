/**
 * The motion system's one piece of shared state: is the provider up, and does the visitor want less motion.
 *
 * A plain module (no React, no GSAP) so anything may read it: components through useMotion(), and
 * imperative code through the *Now() functions. On the server everything answers "not ready, not reduced",
 * which is also what the first client render sees, so hydration never disagrees.
 */

type Listener = () => void;

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
const FINE_QUERY = "(pointer: fine)";

const isBrowser = typeof window !== "undefined";
const listeners = new Set<Listener>();
let ready = false;

export function subscribeReady(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** True once <MotionProvider> has booted in this document. */
export function motionReadyNow(): boolean {
  return ready;
}

export function setMotionReady(value: boolean): void {
  if (ready === value) return;
  ready = value;
  listeners.forEach((listener) => listener());
}

export function subscribeReduced(listener: Listener): () => void {
  if (!isBrowser) return () => {};
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", listener);
  return () => mq.removeEventListener("change", listener);
}

export function reducedMotionNow(): boolean {
  return isBrowser && window.matchMedia(REDUCED_QUERY).matches;
}

/** A mouse or trackpad is the main pointer. Smooth wheel scrolling and parallax are for these only. */
export function finePointerNow(): boolean {
  return isBrowser && window.matchMedia(FINE_QUERY).matches;
}

export function mediaQueries(): { reduced: MediaQueryList; fine: MediaQueryList } {
  return { reduced: window.matchMedia(REDUCED_QUERY), fine: window.matchMedia(FINE_QUERY) };
}

/** The provider is up and the visitor has not asked for reduced motion: animation may run. */
export function motionActiveNow(): boolean {
  return ready && !reducedMotionNow();
}
