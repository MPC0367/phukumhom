"use client";

import { useMemo, useSyncExternalStore } from "react";
import { motionReadyNow, reducedMotionNow, subscribeReady, subscribeReduced } from "./store";

/**
 * What a component needs to know before it animates.
 *
 *   const { reduced, ready } = useMotion();
 *
 *   ready    <MotionProvider> has booted: GSAP's plugins are registered and scroll is being driven.
 *   reduced  the visitor asked for reduced motion.
 *
 * Animate only when `ready && !reduced`. On the server, and on the first client render, both are false:
 * the page is plain, complete HTML, and nothing is hidden waiting for script.
 */
export interface MotionState {
  reduced: boolean;
  ready: boolean;
}

const never = () => false;

export function useMotion(): MotionState {
  const ready = useSyncExternalStore(subscribeReady, motionReadyNow, never);
  const reduced = useSyncExternalStore(subscribeReduced, reducedMotionNow, never);
  return useMemo(() => ({ reduced, ready }), [reduced, ready]);
}

/** `ready && !reduced` as one boolean, for dependency arrays. */
export function useMotionActive(): boolean {
  const { reduced, ready } = useMotion();
  return ready && !reduced;
}
