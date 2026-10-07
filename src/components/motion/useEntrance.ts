"use client";

import { useRef, type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger, watchPending } from "./gsap";
import { loaderPending, onLoaderDone } from "./loader-bus";
import { useMotionActive } from "./useMotion";
import { useServerPainted } from "./useServerPainted";

/**
 * The rules every entrance on the site obeys, in one place. SplitReveal, Reveal, MediaReveal and CountUp
 * are this hook plus a `build` function that says what "hidden" and "arriving" look like.
 *
 * WHEN
 *   "scroll"  once, when the block's top crosses `start` (a ScrollTrigger position, default "top 86%")
 *   "load"    as soon as the component mounts
 *   "loader"  when the loader lifts (window "pkh:loader-done"); at once if no loader is in play
 *
 * WHAT NEVER HAPPENS
 *   - Nothing is hidden by CSS, on the server, before hydration, without the provider, or under
 *     reduced motion. The start state is written by script, to a block the visitor cannot see yet.
 *   - A block that is on screen or already scrolled past when it mounts is left exactly as it is:
 *     hiding something in view in order to reveal it again is a flash, not an entrance.
 *   - A "load" or "loader" entrance does not run on content the server already painted unless a loader
 *     is covering the page at that moment, for the same reason. It runs on every later navigation.
 *   - Nothing armed stays hidden: see watchPending() in gsap.ts (dwell on screen, keyboard focus, print).
 *   - Nothing is hidden twice. Once revealed, a block is plain HTML again (inline styles are cleared).
 *
 * WHERE THE PAGE IS
 * "On screen" is judged against the scroll position the page will actually have. A page that arrives by
 * client-side navigation is mounted while the window is still scrolled to wherever the previous page
 * was left; Next moves it to the top (or to the hash) a moment later in the same commit. So for such a
 * page the decision waits one animation frame: after Next has placed the scroll, and still before the
 * first paint. Without the wait, a visitor who followed a footer link would get a page with every
 * entrance skipped, because all of it would look "already scrolled past".
 *
 * Everything created inside `build` belongs to a GSAP context and is reverted on unmount.
 */

export type EntranceTrigger = "scroll" | "load" | "loader";

/** What `build` hands back: how to start the entrance, and how to jump straight to its end. */
export interface EntranceControl {
  play: () => void;
  finish: () => void;
}

export interface EntranceOptions {
  trigger?: EntranceTrigger;
  /** ScrollTrigger start for "scroll". */
  start?: string;
  /** Applies the hidden start state to `el` and returns the controls. Return null to leave the block alone. */
  build: (el: HTMLElement) => EntranceControl | null;
}

export const DEFAULT_START = "top 86%";

export function useEntrance(ref: RefObject<HTMLElement | null>, { trigger = "scroll", start = DEFAULT_START, build }: EntranceOptions): void {
  const active = useMotionActive();
  /** Was this element painted by the server before any script ran? */
  const serverPainted = useServerPainted();
  /** Always the latest `build`, without making it a dependency: the entrance is set up once per activation. */
  const builder = useRef(build);

  useGSAP(
    () => {
      builder.current = build;
    },
    { dependencies: [build] },
  );

  useGSAP(
    (_context, contextSafe) => {
      const el = ref.current;
      if (!el || !active || !contextSafe) return;

      const undo: Array<() => void> = [];

      // contextSafe: whatever this creates later (tweens, triggers, splits) still belongs to the context.
      const arm = contextSafe(() => {
        if (trigger === "scroll") {
          if (el.getBoundingClientRect().top < window.innerHeight) return;
        } else if (serverPainted.current && !loaderPending()) {
          return;
        }

        const control = builder.current(el);
        if (!control) return;

        let revealed = false;
        let stopWatching = () => {};
        const reveal = (instant = false) => {
          if (revealed) return;
          revealed = true;
          stopWatching();
          if (instant) control.finish();
          else control.play();
        };

        if (trigger === "scroll") {
          ScrollTrigger.create({ trigger: el, start, once: true, onEnter: () => reveal() });
          stopWatching = watchPending(el, reveal);
          undo.push(() => stopWatching());
        } else if (trigger === "load") {
          reveal();
        } else {
          undo.push(onLoaderDone(() => reveal()));
        }
      });

      if (serverPainted.current) {
        arm();
      } else {
        const frame = window.requestAnimationFrame(arm);
        undo.push(() => window.cancelAnimationFrame(frame));
      }

      return () => undo.forEach((fn) => fn());
    },
    { dependencies: [active, trigger, start], revertOnUpdate: true },
  );
}
