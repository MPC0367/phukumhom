"use client";

import { useSyncExternalStore } from "react";
import {
  getConsentSnapshot,
  getPanelOpenSnapshot,
  getServerConsentSnapshot,
  getServerPanelOpenSnapshot,
  subscribeConsent,
  type ConsentState,
} from "./consent";

/**
 * The stored measurement choice. "unknown" on the server and during hydration, so server HTML and
 * the first client render always agree; the real value arrives straight after.
 */
export function useConsent(): ConsentState {
  return useSyncExternalStore(subscribeConsent, getConsentSnapshot, getServerConsentSnapshot);
}

/** Whether the visitor has re-opened the choice from a "Cookie settings" control. */
export function useConsentPanelOpen(): boolean {
  return useSyncExternalStore(subscribeConsent, getPanelOpenSnapshot, getServerPanelOpenSnapshot);
}
