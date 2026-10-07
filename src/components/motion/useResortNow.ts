"use client";

import { useSyncExternalStore } from "react";

/**
 * The current instant, to the minute.
 *
 *   const now = useResortNow();          // Date | null
 *
 * `null` on the server and during hydration (a static page cannot know the time), then a Date that is
 * replaced at the top of every minute, and at once when a sleeping tab wakes. The Date is the instant
 * itself; read the resort's wall clock from it with bangkokClock() in src/lib/sky.ts.
 *
 * One timer serves every subscriber, and it stops when the last one unmounts.
 */

const MINUTE = 60_000;

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;
let cachedKey = -1;
let cached: Date | null = null;

function emit() {
  listeners.forEach((listener) => listener());
}

function schedule() {
  // Just past the next minute boundary.
  timer = setTimeout(() => {
    emit();
    schedule();
  }, MINUTE - (Date.now() % MINUTE) + 40);
}

function onVisible() {
  if (!document.hidden) emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) {
    schedule();
    document.addEventListener("visibilitychange", onVisible);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
      document.removeEventListener("visibilitychange", onVisible);
    }
  };
}

/** The same Date object for the whole of a minute, so React sees a stable snapshot. */
function snapshot(): Date | null {
  const key = Math.floor(Date.now() / MINUTE);
  if (key !== cachedKey || !cached) {
    cachedKey = key;
    cached = new Date(key * MINUTE);
  }
  return cached;
}

const serverSnapshot = (): Date | null => null;

export function useResortNow(): Date | null {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
