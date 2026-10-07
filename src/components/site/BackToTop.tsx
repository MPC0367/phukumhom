"use client";

import { useRef, useSyncExternalStore } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/components/motion/gsap";
import { scrollToTarget } from "@/components/motion/runtime";
import { useMotion } from "@/components/motion/useMotion";
import { useOverlayOpen } from "@/components/motion/useOverlayOpen";
import { Icon } from "@/components/ui/Icon";
import { useFieldFocused, useFooterInView } from "./shell-signals";
import styles from "./BackToTop.module.css";

/**
 * Back to top (ART-DIRECTION section 7, feature 10): a small round button in the lower right corner
 * that appears once the page has been scrolled two screens down. Mount once, in the language layout.
 *
 *   - It appears when a marker two screens tall has left the viewport (an IntersectionObserver, no
 *     scroll listener), and steps aside while the footer is on screen (the footer has its own "Back to
 *     top" link), while an overlay is open and while a form field has focus.
 *   - The ring round it fills with the page: the same reading as the hairline at the top of the window.
 *     It follows the scroll position directly, so it is feedback, not animation.
 *   - Pressing it glides to the top through the motion system (an instant jump under reduced motion).
 *     It is a real <button> with an accessible name; without script it is never shown.
 *   - On phones it stands just above the action bar. Below 80rem it shows only while the page is being scrolled back
 *     up: there the disc lies over the right-hand end of the content column, and a guest reading down the
 *     page should not have a button sitting on the words. Scrolling up is the moment it is wanted. The
 *     scroll direction is written straight onto the button (`data-dir`), and the stylesheet decides
 *     what a narrow screen does with it; from 80rem, where the disc is in the margin, it is ignored.
 *
 * `label` is its accessible name: ui.actions.backToTop.
 */

const MARKER_ID = "back-to-top-marker";

type Listener = () => void;

const listeners = new Set<Listener>();
let past = false;
let observer: IntersectionObserver | null = null;

function subscribe(listener: Listener) {
  listeners.add(listener);
  if (listeners.size === 1 && typeof IntersectionObserver !== "undefined") {
    const marker = document.getElementById(MARKER_ID);
    if (marker) {
      observer = new IntersectionObserver(([entry]) => {
        const next = !entry.isIntersecting;
        if (next === past) return;
        past = next;
        listeners.forEach((l) => l());
      });
      observer.observe(marker);
    }
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size > 0) return;
    observer?.disconnect();
    observer = null;
    past = false;
  };
}

const isPast = () => past;
const notPast = () => false;

export function BackToTop({ label }: { label: string }) {
  const ring = useRef<SVGCircleElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const { ready } = useMotion();
  const pastTwoScreens = useSyncExternalStore(subscribe, isPast, notPast);
  const footerInView = useFooterInView();
  const fieldFocused = useFieldFocused();
  const overlayOpen = useOverlayOpen();

  useGSAP(
    () => {
      const el = ring.current;
      if (!el || !ready) return;
      const setOffset = gsap.quickSetter(el, "strokeDashoffset");
      const update = (self: ScrollTrigger) => setOffset(1 - self.progress);
      const follow = (self: ScrollTrigger) => {
        update(self);
        const dir = self.direction < 0 ? "up" : "down";
        if (button.current && button.current.dataset.dir !== dir) button.current.dataset.dir = dir;
      };
      ScrollTrigger.create({ start: 0, end: "max", onUpdate: follow, onRefresh: update });
    },
    { dependencies: [ready], revertOnUpdate: true },
  );

  const show = pastTwoScreens && !footerInView && !fieldFocused && !overlayOpen;

  return (
    <>
      <div id={MARKER_ID} className={styles.marker} aria-hidden="true" />
      <button ref={button} type="button" className={`${styles.button} no-print`} aria-label={label} data-state={show ? "shown" : "hidden"} inert={!show} onClick={() => scrollToTarget(0)}>
        <svg className={styles.ring} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <circle className={styles.track} cx="24" cy="24" r="23" />
          <circle ref={ring} className={styles.progress} cx="24" cy="24" r="23" pathLength={1} />
        </svg>
        <Icon name="arrow-right" size={18} className={styles.arrow} />
      </button>
    </>
  );
}
