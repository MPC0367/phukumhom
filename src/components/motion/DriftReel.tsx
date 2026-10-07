"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { Draggable, gsap } from "./gsap";
import { isOverlayOpen } from "./overlay-bus";
import { useMotionActive } from "./useMotion";
import styles from "./DriftReel.module.css";

/**
 * An endless, slowly drifting row you can grab and throw.
 *
 *   <DriftReel label={t.galleryReel} gap="1rem">
 *     <button className={s.item} …><Picture … /></button>
 *     <button className={s.item} …><Picture … /></button>
 *   </DriftReel>
 *
 * Each direct child is one item; give the items their size (they never shrink). `speed` is pixels per
 * second (default 32, negative drifts the other way). `gap` is any CSS length. Set `--reel-inset` on the
 * reel (through `className`) to start the first item in from the edge, for example at the page gutter.
 *
 * WITH MOTION
 *   - The items are copied on both sides (copies are aria-hidden, inert and unfocusable) and the row
 *     moves on GSAP's ticker, wrapping without a seam in either direction.
 *   - Drag or fling it: Draggable and Inertia run on a detached proxy and only their deltas are applied,
 *     so a throw can never reach an end. Horizontal trackpad swipes move it too.
 *   - It holds still under a mouse (never for a touch), while it is pressed or being thrown, while
 *     keyboard focus is inside it, while any overlay is open, and when it is off screen. It eases to a
 *     stop and eases back into its drift.
 *   - A click that ends a drag, or that catches a moving reel, does not activate an item. A click on a
 *     copy is handed to the item it copies.
 *   - Tabbing to an item that is off screen brings it into view.
 *
 * WITHOUT (no JavaScript, reduced motion, before hydration)
 *   A native horizontal scroller with scroll snapping, and no copies.
 */

export interface DriftReelProps {
  /** Accessible name of the group. */
  label: string;
  /** Pixels per second. Default 32. */
  speed?: number;
  /** Space between items: any CSS length. Default var(--s-4). */
  gap?: string;
  className?: string;
  children: ReactNode;
}

/** Milliseconds over which the drift eases to a stop and back. */
const EASE_MS = 260;
/**
 * How long a click on a copy waits before it is handed to the original. Draggable treats a second click
 * within 100ms of the first as a duplicate and swallows it, so the hand-over has to fall outside that.
 */
const FORWARD_MS = 120;
const FOCUSABLE = "a[href], button, input, select, textarea, [tabindex]";
const ACTIONABLE = "a[href], button, [role='button']";

function cloneItem(item: Element): HTMLElement {
  const clone = item.cloneNode(true) as HTMLElement;
  clone.setAttribute("data-reel-clone", "");
  clone.setAttribute("tabindex", "-1");
  clone.removeAttribute("id");
  clone.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
  clone.querySelectorAll(FOCUSABLE).forEach((node) => node.setAttribute("tabindex", "-1"));
  return clone;
}

export function DriftReel({ label, speed = 32, gap, className, children }: DriftReelProps) {
  const root = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const before = useRef<HTMLDivElement>(null);
  const set = useRef<HTMLDivElement>(null);
  const after = useRef<HTMLDivElement>(null);
  const active = useMotionActive();

  useGSAP(
    () => {
      const rootEl = root.current;
      const viewEl = viewport.current;
      const trackEl = track.current;
      const beforeEl = before.current;
      const setEl = set.current;
      const afterEl = after.current;
      if (!active || !rootEl || !viewEl || !trackEl || !beforeEl || !setEl || !afterEl) return;

      const state = { hover: false, focus: false, pressed: false, dragged: false, caught: false, visible: true, wheelUntil: 0 };
      const originals = () => Array.from(setEl.children) as HTMLElement[];
      const setX = gsap.quickSetter(trackEl, "x", "px");

      /** Width of one full set including the gap after it, in pixels. 0 until it can be measured. */
      let setWidth = 0;
      /** The track's offset. At rest the first original sits at the inset: x = -setWidth. */
      let x = 0;
      /** Present drift velocity, px per second: eased toward its target every frame. */
      let velocity = 0;
      let placed = false;
      let focusTween: gsap.core.Tween | null = null;
      let forwardTimer: ReturnType<typeof setTimeout> | undefined;
      /** Where the pointer last went down: a script-made click (Draggable sends one on touch) carries no position. */
      let pressedAt = { x: 0, y: 0 };

      const wrap = (value: number) => (setWidth ? gsap.utils.wrap(-2 * setWidth, -setWidth, value) : value);

      rootEl.setAttribute("data-drift", "on");
      viewEl.scrollLeft = 0;

      /** (Re)build the copies and measure. Safe to call at any time. */
      const build = () => {
        const items = originals();
        beforeEl.replaceChildren();
        afterEl.replaceChildren();
        const gapPx = parseFloat(window.getComputedStyle(trackEl).columnGap) || 0;
        const width = items.length ? setEl.offsetWidth + gapPx : 0;
        if (width <= gapPx) {
          setWidth = 0;
          return;
        }
        // Enough copies after the set to fill the widest view the reel can show while it wraps.
        const copies = Math.max(1, Math.ceil(viewEl.clientWidth / width));
        beforeEl.append(...items.map(cloneItem));
        for (let i = 0; i < copies; i++) afterEl.append(...items.map(cloneItem));
        // How far the row has drifted from rest, carried across a rebuild.
        const drifted = placed && setWidth ? (x + setWidth) / setWidth : 0;
        setWidth = width;
        x = wrap(-setWidth + drifted * setWidth);
        placed = true;
        setX(x);
      };
      build();

      let buildTimer: ReturnType<typeof setTimeout> | undefined;
      const scheduleBuild = () => {
        if (buildTimer !== undefined) clearTimeout(buildTimer);
        buildTimer = setTimeout(() => {
          buildTimer = undefined;
          build();
        }, 120);
      };
      let lastView = viewEl.clientWidth;
      let lastSet = setEl.offsetWidth;
      const resize =
        typeof ResizeObserver === "undefined"
          ? null
          : new ResizeObserver(() => {
              const view = viewEl.clientWidth;
              const one = setEl.offsetWidth;
              if (view === lastView && one === lastSet) return;
              lastView = view;
              lastSet = one;
              scheduleBuild();
            });
      resize?.observe(viewEl);
      resize?.observe(setEl);
      const mutation = typeof MutationObserver === "undefined" ? null : new MutationObserver(scheduleBuild);
      mutation?.observe(setEl, { childList: true });

      const visibility =
        typeof IntersectionObserver === "undefined"
          ? null
          : new IntersectionObserver(
              ([entry]) => {
                state.visible = entry.isIntersecting;
              },
              { rootMargin: "25% 0px" },
            );
      visibility?.observe(rootEl);

      /* ── The drift ── */
      const tick = (_time: number, deltaMs: number) => {
        if (!setWidth || !state.visible) return;
        const dt = Math.min(deltaMs, 100);
        const held =
          state.hover || state.focus || state.pressed || isOverlayOpen() || document.hidden || performance.now() < state.wheelUntil;
        const target = held ? 0 : -speed;
        velocity += (target - velocity) * (1 - Math.exp(-dt / EASE_MS));
        if (!state.pressed && Math.abs(velocity) > 0.02) x = wrap(x + (velocity * dt) / 1000);
        setX(x);
      };
      gsap.ticker.add(tick);

      /* ── Hover and focus ── */
      const onEnter = (event: PointerEvent) => {
        if (event.pointerType === "mouse") state.hover = true;
      };
      const onLeave = (event: PointerEvent) => {
        if (event.pointerType === "mouse") state.hover = false;
      };
      const isKeyboardFocus = (el: Element) => {
        try {
          return el.matches(":focus-visible");
        } catch {
          return true;
        }
      };
      const onFocusIn = (event: FocusEvent) => {
        const target = event.target as Element;
        const keyboard = isKeyboardFocus(target);
        state.focus = keyboard;
        if (!keyboard || !setWidth) return;
        const item = originals().find((candidate) => candidate.contains(target));
        if (!item) return;
        const box = item.getBoundingClientRect();
        const view = viewEl.getBoundingClientRect();
        if (box.left >= view.left && box.right <= view.right) return;
        // Bring it to the resting position by the shorter way round.
        const rest = -setWidth - item.offsetLeft;
        const goal = [rest - setWidth, rest, rest + setWidth].reduce((best, c) => (Math.abs(c - x) < Math.abs(best - x) ? c : best));
        const proxy = { value: x };
        focusTween?.kill();
        focusTween = gsap.to(proxy, {
          value: goal,
          duration: 0.6,
          ease: "power3.out",
          onUpdate: () => {
            x = wrap(proxy.value);
          },
        });
      };
      const onFocusOut = () => {
        state.focus = false;
      };

      /* ── Drag and fling ── */
      const dragProxy = document.createElement("div");
      const [draggable] = Draggable.create(dragProxy, {
        type: "x",
        trigger: viewEl,
        inertia: true,
        dragClickables: true,
        minimumMovement: 6,
        maxDuration: 2.2,
        zIndexBoost: false,
        cursor: "grab",
        activeCursor: "grabbing",
        // A press that catches a reel in flight should stop it, not open what is under the pointer.
        onPressInit(this: Draggable) {
          state.caught = this.isThrowing;
        },
        onPress() {
          state.pressed = true;
          focusTween?.kill();
        },
        onDragStart() {
          state.dragged = true;
        },
        onDrag(this: Draggable) {
          x = wrap(x + this.deltaX);
        },
        onThrowUpdate(this: Draggable) {
          x = wrap(x + this.deltaX);
        },
        onRelease(this: Draggable) {
          gsap.delayedCall(0.06, () => {
            if (!this.isThrowing) state.pressed = false;
            state.caught = false;
          });
        },
        onThrowComplete() {
          state.pressed = false;
        },
        onDragEnd() {
          gsap.delayedCall(0.08, () => {
            state.dragged = false;
          });
        },
      });

      /* ── Clicks ── */
      const onClickCapture = (event: MouseEvent) => {
        if (state.dragged || state.caught) {
          event.preventDefault();
          event.stopPropagation();
        }
      };
      const onClick = (event: MouseEvent) => {
        if (event.defaultPrevented) return;
        const target = event.target as Element;
        if (setEl.contains(target)) return;
        // The pointer was over a copy. Copies are inert, so the click landed on the track: find the copy
        // by position and hand the click to the item it stands for.
        const items = originals();
        if (!items.length) return;
        const clones = [...Array.from(beforeEl.children), ...Array.from(afterEl.children)];
        const px = event.clientX || pressedAt.x;
        const py = event.clientY || pressedAt.y;
        const hit = clones.findIndex((clone) => {
          const r = clone.getBoundingClientRect();
          return px >= r.left && px <= r.right && py >= r.top && py <= r.bottom;
        });
        if (hit < 0) return;
        const original = items[hit % items.length];
        const actionable = original.matches(ACTIONABLE) ? original : original.querySelector<HTMLElement>(ACTIONABLE);
        if (forwardTimer !== undefined) clearTimeout(forwardTimer);
        forwardTimer = setTimeout(() => {
          forwardTimer = undefined;
          if (!state.dragged) (actionable ?? original).click();
        }, FORWARD_MS);
      };
      const onPointerDown = (event: PointerEvent) => {
        pressedAt = { x: event.clientX, y: event.clientY };
      };

      /* ── Trackpads: a sideways swipe moves the row instead of going back a page ── */
      const onWheel = (event: WheelEvent) => {
        if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) || !setWidth) return;
        event.preventDefault();
        x = wrap(x - event.deltaX);
        state.wheelUntil = performance.now() + 700;
      };
      const onNativeDrag = (event: DragEvent) => event.preventDefault();
      const onScroll = () => {
        if (viewEl.scrollLeft !== 0) viewEl.scrollLeft = 0;
      };

      rootEl.addEventListener("pointerenter", onEnter);
      rootEl.addEventListener("pointerleave", onLeave);
      rootEl.addEventListener("focusin", onFocusIn);
      rootEl.addEventListener("focusout", onFocusOut);
      rootEl.addEventListener("click", onClickCapture, true);
      rootEl.addEventListener("click", onClick);
      rootEl.addEventListener("dragstart", onNativeDrag);
      rootEl.addEventListener("pointerdown", onPointerDown, true);
      viewEl.addEventListener("wheel", onWheel, { passive: false });
      viewEl.addEventListener("scroll", onScroll, { passive: true });

      return () => {
        gsap.ticker.remove(tick);
        if (buildTimer !== undefined) clearTimeout(buildTimer);
        resize?.disconnect();
        mutation?.disconnect();
        visibility?.disconnect();
        focusTween?.kill();
        draggable.kill();
        rootEl.removeEventListener("pointerenter", onEnter);
        rootEl.removeEventListener("pointerleave", onLeave);
        rootEl.removeEventListener("focusin", onFocusIn);
        rootEl.removeEventListener("focusout", onFocusOut);
        rootEl.removeEventListener("click", onClickCapture, true);
        rootEl.removeEventListener("click", onClick);
        rootEl.removeEventListener("dragstart", onNativeDrag);
        rootEl.removeEventListener("pointerdown", onPointerDown, true);
        if (forwardTimer !== undefined) clearTimeout(forwardTimer);
        viewEl.removeEventListener("wheel", onWheel);
        viewEl.removeEventListener("scroll", onScroll);
        beforeEl.replaceChildren();
        afterEl.replaceChildren();
        rootEl.removeAttribute("data-drift");
        gsap.set(trackEl, { clearProps: "transform" });
        gsap.set(viewEl, { clearProps: "cursor,touchAction,userSelect" });
      };
    },
    { dependencies: [active, speed], revertOnUpdate: true },
  );

  const style = gap ? ({ "--reel-gap": gap } as CSSProperties) : undefined;
  return (
    <div ref={root} role="group" aria-label={label} className={className ? `${styles.reel} ${className}` : styles.reel} style={style}>
      <div ref={viewport} className={styles.viewport}>
        <div ref={track} className={styles.track}>
          <div ref={before} className={styles.clones} aria-hidden="true" inert />
          <div ref={set} className={styles.set}>
            {children}
          </div>
          <div ref={after} className={styles.clones} aria-hidden="true" inert />
        </div>
      </div>
    </div>
  );
}
