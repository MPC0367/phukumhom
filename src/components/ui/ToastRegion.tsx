"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cx } from "./cx";
import { Icon } from "./Icon";
import { TOAST_EVENT, type ToastDetail } from "./toast";
import styles from "./Toast.module.css";

/**
 * The one place toasts appear: a pill at the bottom centre that rises, holds for a few seconds and fades.
 *
 *   <ToastRegion />            once, in the layout (it takes no functions, so a Server Component can render it)
 *   toast("Address copied.")   from any client code (see toast.ts)
 *
 * - One polite live region (role="status") that is always in the page, so a screen reader announces each
 *   message; the pill itself is decoration for sighted guests.
 * - The pill is shown in the top layer (the popover API) where the browser has it, so a confirmation
 *   raised from inside a drawer or the lightbox is not buried under that dialog. Elsewhere it is a fixed
 *   element above the dialog layer.
 * - A new message replaces the one on screen. On phones the pill clears the action bar.
 * - Rendering it twice is harmless: only the first region mounted speaks and shows.
 */

/* ── Which mounted region owns the toasts ── */

const regions: object[] = [];
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function notify() {
  for (const listener of listeners) listener();
}

/** Time the pill takes to leave; matches the CSS exit. */
const LEAVE_MS = 320;

interface Shown {
  id: number;
  message: string;
  leaving: boolean;
}

export interface ToastRegionProps {
  /** How long a message stays, in milliseconds. */
  duration?: number;
}

export function ToastRegion({ duration = 3200 }: ToastRegionProps) {
  const [token] = useState(() => ({}));
  const owner = useSyncExternalStore(
    subscribe,
    () => regions[0] === token,
    () => false,
  );
  const [shown, setShown] = useState<Shown | null>(null);
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    regions.push(token);
    notify();
    return () => {
      const at = regions.indexOf(token);
      if (at >= 0) regions.splice(at, 1);
      notify();
    };
  }, [token]);

  useEffect(() => {
    if (!owner) return;
    let hide: ReturnType<typeof setTimeout> | undefined;
    let clear: ReturnType<typeof setTimeout> | undefined;
    let id = 0;

    const onToast = (event: Event) => {
      const message = (event as CustomEvent<ToastDetail>).detail?.message;
      if (!message) return;
      clearTimeout(hide);
      clearTimeout(clear);
      id += 1;
      setShown({ id, message, leaving: false });
      hide = setTimeout(() => {
        setShown((current) => (current ? { ...current, leaving: true } : current));
        clear = setTimeout(() => setShown(null), LEAVE_MS);
      }, duration);
    };

    window.addEventListener(TOAST_EVENT, onToast);
    return () => {
      window.removeEventListener(TOAST_EVENT, onToast);
      clearTimeout(hide);
      clearTimeout(clear);
    };
  }, [owner, duration]);

  // Lift the pill into the top layer while a message is up. Re-opened for every message, so it is also
  // above a dialog that opened after the previous toast.
  const shownId = shown?.id;
  useEffect(() => {
    const el = layer.current;
    if (!el || typeof el.showPopover !== "function") return;
    try {
      if (el.matches(":popover-open")) el.hidePopover();
      if (shownId !== undefined) el.showPopover();
    } catch {
      // Not connected, or the browser refused: the fixed-position fallback is already in place.
    }
  }, [shownId]);

  if (!owner) return null;

  return (
    <>
      <div className="vh" role="status" aria-live="polite" aria-atomic="true">
        {shown && !shown.leaving ? shown.message : ""}
      </div>
      <div ref={layer} popover="manual" aria-hidden="true" className={cx(styles.layer, "no-print")}>
        {shown ? (
          <div key={shown.id} className={cx(styles.toast, shown.leaving && styles.leaving)}>
            <span className={styles.mark}>
              <Icon name="check" size={14} />
            </span>
            <span className={styles.message}>{shown.message}</span>
          </div>
        ) : null}
      </div>
    </>
  );
}
