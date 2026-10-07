/**
 * The visitor's measurement choice — a tiny external store over localStorage.
 *
 * Plain module (no React, no "use client"): the hooks in useConsent.ts read it through
 * useSyncExternalStore, and gtag.ts / AnalyticsRoot act on it. Nothing here runs on the server
 * except the two server snapshots.
 *
 * Stored value: "v1:granted:2026-10-07" or "v1:denied:2026-10-07" under the key below. It records a
 * choice and the day it was made, nothing about the visitor. A choice is honoured for twelve months
 * and then asked again; a value in any other shape counts as no choice.
 *
 * If the browser blocks storage (private modes, strict settings) the choice is kept in memory for
 * the current page view, so the banner still closes and the site stays usable.
 */

export const CONSENT_STORAGE_KEY = "pkh_consent";
const CONSENT_VERSION = 1;
const CONSENT_MAX_AGE_DAYS = 365;
const CHANGE_EVENT = "pkh:consent";

export type ConsentChoice = "granted" | "denied";
/** "unknown": not read yet (server render and hydration). "unset": read, and no valid choice is stored. */
export type ConsentState = ConsentChoice | "unset" | "unknown";

const STORED = /^v(\d+):(granted|denied):(\d{4})-(\d{2})-(\d{2})$/;

function dayNumber(year: number, month: number, day: number): number {
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Pure: what a stored string means on a given day. Exported for tests. */
export function parseConsent(raw: string | null | undefined, today: string): ConsentChoice | "unset" {
  if (!raw) return "unset";
  const stored = STORED.exec(raw);
  const now = /^(\d{4})-(\d{2})-(\d{2})$/.exec(today);
  if (!stored || !now || Number(stored[1]) !== CONSENT_VERSION) return "unset";
  const age = dayNumber(Number(now[1]), Number(now[2]), Number(now[3])) - dayNumber(Number(stored[3]), Number(stored[4]), Number(stored[5]));
  // One day of slack for clocks; anything further in the future is not a value this code wrote.
  if (!(age >= -1 && age <= CONSENT_MAX_AGE_DAYS)) return "unset";
  return stored[2] as ConsentChoice;
}

let memory: string | null = null;
let panelOpen = false;
let returnFocusTo: HTMLElement | null = null;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? memory;
  } catch {
    return memory;
  }
}

function emit(): void {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Subscribes to changes made in this tab (our own event) and in other tabs (the storage event). */
export function subscribeConsent(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === CONSENT_STORAGE_KEY) onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function getConsentSnapshot(): ConsentState {
  return parseConsent(readRaw(), todayIso());
}

export function getServerConsentSnapshot(): ConsentState {
  return "unknown";
}

export function getPanelOpenSnapshot(): boolean {
  return panelOpen;
}

export function getServerPanelOpenSnapshot(): boolean {
  return false;
}

function restoreFocus(): void {
  const target = returnFocusTo;
  returnFocusTo = null;
  if (target && target.isConnected) target.focus();
}

/** Records the choice, closes the panel and tells every subscriber. */
export function setConsent(choice: ConsentChoice): void {
  const value = `v${CONSENT_VERSION}:${choice}:${todayIso()}`;
  memory = value;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // Storage is blocked: the choice holds for this page view only.
  }
  panelOpen = false;
  emit();
  restoreFocus();
}

/** Re-opens the choice from a "Cookie settings" control. Focus returns to that control when the panel closes. */
export function openConsentPanel(trigger?: HTMLElement | null): void {
  returnFocusTo = trigger ?? null;
  panelOpen = true;
  emit();
}

/** Closes a re-opened panel without changing the stored choice. */
export function closeConsentPanel(): void {
  if (!panelOpen) return;
  panelOpen = false;
  emit();
  restoreFocus();
}
