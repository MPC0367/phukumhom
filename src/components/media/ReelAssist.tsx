"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * A thin client shell round a reel of photographs. It draws nothing; it does two small jobs that the
 * reel and the lightbox cannot do for each other.
 *
 * 1. LOADS THE ROW BEFORE IT IS SEEN. Photographs are lazy, and a browser only fetches a lazy image
 *    once it is about to be visible. In a drifting reel that moment is the instant a frame slides in
 *    from the edge, so each one would arrive as a flat colour and pop into place a beat later, and the
 *    seam where the row repeats would show. So when the reel comes within a screen of the viewport,
 *    every photograph in it (the copies the reel makes of itself included) is switched to load at once.
 *    Nothing is fetched for a reel the visitor never scrolls near.
 *
 * 2. LETS A COPY ANSWER THE POINTER. The reel repeats its items to be endless, and the copies are inert:
 *    a click on one is handed to the original, but :hover never matches it, so part of the row would
 *    sit dead under the mouse. This marks the copy under the pointer with data-hover, and the
 *    stylesheet treats that exactly like :hover. Mouse only; nothing happens for touch.
 *
 * With JavaScript off this is a plain <div> round a native scroller.
 */

export interface ReelAssistProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

const COPY = "[data-reel-clone]";

export function ReelAssist({ className, style, children }: ReelAssistProps) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    /* ── 1. Load the row ── */
    let near = false;
    const loadAll = () => {
      el.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => {
        img.loading = "eager";
      });
    };
    const watcher =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            (entries) => {
              if (!entries.some((entry) => entry.isIntersecting)) return;
              near = true;
              loadAll();
              watcher?.disconnect();
            },
            { rootMargin: "100% 0px" },
          );
    if (watcher) watcher.observe(el);
    else {
      near = true;
      loadAll();
    }
    // The reel rebuilds its copies when it is resized: the new ones are lazy again.
    const rebuilt = typeof MutationObserver === "undefined" ? null : new MutationObserver(() => near && loadAll());
    rebuilt?.observe(el, { childList: true, subtree: true });

    /* ── 2. Hover for the copies ── */
    let hovered: Element | null = null;
    let frame = 0;
    let point: { x: number; y: number } | null = null;
    const mark = (next: Element | null) => {
      if (next === hovered) return;
      hovered?.removeAttribute("data-hover");
      next?.setAttribute("data-hover", "");
      hovered = next;
    };
    const find = () => {
      frame = 0;
      if (!point) return mark(null);
      const { x, y } = point;
      for (const copy of el.querySelectorAll(COPY)) {
        const box = copy.getBoundingClientRect();
        if (x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) return mark(copy);
      }
      mark(null);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(find);
    };
    // The row can move under a still pointer (a throw that is still running): while a mouse is over the
    // reel, look again a few times a second. No timer runs otherwise.
    let recheck = 0;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      point = { x: event.clientX, y: event.clientY };
      schedule();
      if (!recheck) recheck = window.setInterval(schedule, 180);
    };
    const onLeave = () => {
      point = null;
      window.clearInterval(recheck);
      recheck = 0;
      schedule();
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      watcher?.disconnect();
      rebuilt?.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      window.clearInterval(recheck);
      if (frame) window.cancelAnimationFrame(frame);
      hovered?.removeAttribute("data-hover");
    };
  }, []);

  return (
    <div ref={root} className={className} style={style}>
      {children}
    </div>
  );
}
