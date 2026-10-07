"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { useDay } from "./DaySky";

/**
 * The frame that holds the three photographs. Dragging across it turns the day, the same way the
 * control beneath it does: to the right is later.
 *
 * A drag only begins once the pointer has moved a little, and further sideways than up or down. Until
 * then nothing is captured, and the stylesheet gives the frame `touch-action: pan-y`, so a thumb that
 * lands on the photograph and moves up or down scrolls the page exactly as it would anywhere else
 * (the browser then cancels the pointer, which ends the gesture here).
 *
 * The frame is not a control of its own: it has no role and takes no focus. The range input under it
 * is the control, for the keyboard and for assistive technology.
 */

export interface DayFrameProps {
  /** Accessible name of the group of photographs. */
  label: string;
  className?: string;
  children: ReactNode;
}

/** Pixels the pointer must travel before the gesture is read as a drag or as a scroll. */
const SLOP = 8;
/**
 * Frame widths of dragging that make one whole day. Each photograph arrives as a soft edge crossing the
 * frame; at 1.25 that edge moves about twice as fast as the hand, so one stroke brings the next frame in.
 */
const TRAVEL = 1.25;

interface Gesture {
  pointer: number;
  x: number;
  y: number;
  from: number;
  width: number;
  dragging: boolean;
}

export function DayFrame({ label, className, children }: DayFrameProps) {
  const day = useDay();
  const gesture = useRef<Gesture | null>(null);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    gesture.current = {
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      from: day.snapshot().value,
      width: Math.max(1, event.currentTarget.getBoundingClientRect().width),
      dragging: false,
    };
  };

  const end = (event: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.pointer !== event.pointerId) return;
    gesture.current = null;
    delete event.currentTarget.dataset.dragging;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.pointer !== event.pointerId) return;
    // A mouse button let go outside the frame, before the drag was captured, never reported its release.
    if (event.pointerType === "mouse" && (event.buttons & 1) === 0) {
      end(event);
      return;
    }
    if (!g.dragging) {
      const dx = Math.abs(event.clientX - g.x);
      const dy = Math.abs(event.clientY - g.y);
      // Up or down first: this is a scroll, and it is the page's.
      if (dy > SLOP && dy >= dx) {
        gesture.current = null;
        return;
      }
      if (dx < SLOP) return;
      g.dragging = true;
      // Measure from here, so the day does not jump by the distance it took to decide.
      g.x = event.clientX;
      g.from = day.snapshot().value;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.dataset.dragging = "true";
    }
    day.move(g.from + (event.clientX - g.x) / (g.width * TRAVEL), "frame");
  };

  return (
    <div
      role="group"
      aria-label={label}
      data-day-frame=""
      className={className}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={(event) => {
        // Only when the frame itself loses the pointer. A touch is first captured by whatever it landed
        // on, and that element reports losing it at the moment the frame takes the capture over.
        if (event.target === event.currentTarget) end(event);
      }}
      onDragStart={(event) => event.preventDefault()}
    >
      {children}
    </div>
  );
}
