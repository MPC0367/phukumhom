"use client";

import { useState, type MouseEvent, type ReactNode } from "react";
import { dayProgress } from "@/lib/sky";
import { announceOverlay, scrollToTarget, useMotion, useOverlayOpen, useResortNow } from "@/components/motion";
import s from "./lab.module.css";

/**
 * The lab's instruments: small client islands that report what the motion components are doing, so a
 * behaviour can be checked by eye (and by a script) instead of taken on trust.
 */

/** Wraps the reel and reports which item a click reached. A click that ends a drag must not show up here. */
export function ReelProbe({ last, none, photo, children }: { last: string; none: string; photo: string; children: ReactNode }) {
  const [hit, setHit] = useState<{ item: string; count: number } | null>(null);

  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    const item = (event.target as Element).closest<HTMLElement>("[data-reel-item]");
    if (!item || item.closest("[data-reel-clone]")) return;
    const id = item.dataset.reelItem ?? "";
    setHit((previous) => ({ item: id, count: (previous?.count ?? 0) + 1 }));
  };

  return (
    <div onClick={onClick}>
      {children}
      <p className={`container small ${s.probe}`} aria-live="polite">
        <span className="muted">{last}</span>{" "}
        <strong data-probe="reel" data-count={hit?.count ?? 0}>
          {hit ? `${photo} ${hit.item}` : none}
        </strong>
      </p>
    </div>
  );
}

/** Announces an overlay opening and closing on the shared bus: the reel should hold and the page should stop scrolling. */
export function OverlayToggle({ off, on }: { off: string; on: string }) {
  const open = useOverlayOpen();
  return (
    <button type="button" className={s.toggle} aria-pressed={open} data-probe="overlay" onClick={() => announceOverlay(!open)}>
      {open ? on : off}
    </button>
  );
}

/** dayProgress() for the present minute, as a figure and a bar. */
export function DayReadout({ label }: { label: string }) {
  const now = useResortNow();
  const value = now ? dayProgress(now) : null;
  return (
    <div className={s.readout} data-live={value === null ? "false" : "true"}>
      <p className="eyebrow">{label}</p>
      <p className={`figure ${s.readoutValue}`} data-probe="day">
        {value === null ? "0.00" : value.toFixed(2)}
      </p>
      <div className={s.readoutTrack} aria-hidden="true">
        <span className={s.readoutFill} style={{ transform: `scaleX(${value ?? 0})` }} />
      </div>
    </div>
  );
}

/** The provider's state, for scripts: data-ready and data-reduced. */
export function MotionState() {
  const { ready, reduced } = useMotion();
  return <span hidden data-probe="motion" data-ready={ready ? "true" : "false"} data-reduced={reduced ? "true" : "false"} />;
}

/** A button, not a link: scrollToTarget() is how script asks for a scroll. */
export function TopButton({ label }: { label: string }) {
  return (
    <button type="button" className={s.toggle} data-probe="top" onClick={() => scrollToTarget(0)}>
      {label}
    </button>
  );
}
