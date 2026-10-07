"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { isLoaderDone, isOverlayOpen, onLoaderDone, OVERLAY_EVENT, useMotion } from "@/components/motion";
import { gsap } from "@/components/motion/gsap";
import { useServerPainted } from "@/components/motion/useServerPainted";
import { Icon } from "@/components/ui/Icon";
import { Rule } from "@/components/ui/Rule";
import { HERO_FADE, HERO_HOLD } from "./frames";
import styles from "./HeroSlideControl.module.css";

/**
 * The hero's slideshow: the control a guest sees (counter, caption, four progress bars, previous, next,
 * pause) and the engine that moves the photographs.
 *
 * The photographs themselves are the Server Component's markup. This island finds them through the
 * hero's id: `[data-hero-slide]` (one per photograph, the later ones `hidden`), `[data-hero-mover]`
 * (what the slow zoom turns) and `[data-hero-stage]` (what must be on screen for the sequence to run).
 *
 * WHEN IT RUNS
 * Only when the motion system is up and the visitor has not asked for reduced motion. Otherwise, and in
 * the server's HTML, this is one line: the first photograph's caption. The other photographs are then
 * never shown and never fetched.
 *
 * THE SEQUENCE
 *   - each photograph is held 7s while its bar fills, then the next fades in over 1.6s ON TOP of it;
 *     the outgoing one stays opaque underneath until the fade ends, so nothing shows through
 *   - each drifts from 1.12 to 1.02 about its focal point, with a small pan toward that point
 *   - the first one settles from 1.2 as the loader lifts
 *   - a photograph is only ever shown once it has loaded and decoded; the one after the current one is
 *     fetched while the current one is on screen, never before the page's first paint
 * It stands still while the hero is off screen, the tab is hidden, an overlay is open, or the guest has
 * pressed pause. Pause stops the zoom as well as the sequence.
 *
 * TOUCH
 * A sideways swipe anywhere on the hero turns the photograph, as the bars do when tapped.
 *
 * KEYBOARD AND ASSISTIVE TECHNOLOGY
 * Every control is a real button with a name. Previous, Next and Pause are tab stops; the four bars can
 * be clicked and tapped but are out of the tab order, because those buttons and the arrow keys do the
 * same. Left and right arrows change the photograph while focus is anywhere in the control. A change
 * made by hand is announced politely (count and caption); the sequence turning by itself is not announced.
 */

export interface HeroFrameInfo {
  /** The catalogue's caption for the frame, in the page's language. */
  caption: string;
  /** The room type the frame belongs to, already rendered (a <RoomName>), or null for the grounds. */
  room: ReactNode | null;
}

export interface HeroSlideLabels {
  /** Accessible name of the control. */
  label: string;
  previous: string;
  next: string;
  pause: string;
  play: string;
  /** "Photograph {current} of {total}". */
  count: string;
}

export interface HeroSlideControlProps {
  /** id of the hero <section>. */
  rootId: string;
  frames: HeroFrameInfo[];
  labels: HeroSlideLabels;
  className?: string;
}

/** The zoom: where a photograph starts, where it comes to rest, and where the first one starts under the loader. */
const ZOOM_FROM = 1.12;
const ZOOM_TO = 1.02;
const ZOOM_ENTER = 1.2;
/** Seconds the first photograph takes to settle from ZOOM_ENTER to ZOOM_FROM. */
const SETTLE = 1.6;
/** The pan toward the focal point, in percent of the frame. Small enough that no edge can show at any zoom. */
const PAN_X = 1.5;
const PAN_Y = 1;
/** A touch swipe: at least this far sideways, within this long. */
const SWIPE_PX = 56;
const SWIPE_MS = 700;

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");
const two = (n: number) => String(n).padStart(2, "0");

export function HeroSlideControl({ rootId, frames, labels, className }: HeroSlideControlProps) {
  const { ready, reduced } = useMotion();
  // Asked here, not in <Live>: only a component that was part of hydration can know.
  const serverPainted = useServerPainted();

  if (!ready || reduced || frames.length < 2) {
    return (
      <div className={cx(styles.control, styles.still, className)}>
        <p className={styles.caption}>{frames[0]?.caption}</p>
      </div>
    );
  }
  return <Live rootId={rootId} frames={frames} labels={labels} className={className} serverPainted={serverPainted} />;
}

interface Engine {
  step: (delta: number) => void;
  jump: (index: number) => void;
  setUserPaused: (value: boolean) => void;
}

function Live({ rootId, frames, labels, className, serverPainted }: HeroSlideControlProps & { serverPainted: RefObject<boolean | null> }) {
  const total = frames.length;
  /** `moves` counts changes: the first caption is simply there, later ones arrive. */
  const [view, setView] = useState({ index: 0, moves: 0 });
  const [paused, setPaused] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const group = useRef<HTMLDivElement>(null);
  const fills = useRef<Array<HTMLSpanElement | null>>([]);
  const engine = useRef<Engine | null>(null);

  const countText = (index: number) => labels.count.replace("{current}", String(index + 1)).replace("{total}", String(total));

  useGSAP(
    (_context, contextSafe) => {
      const root = document.getElementById(rootId);
      const control = group.current;
      if (!root || !control || !contextSafe) return;

      const slides = Array.from(root.querySelectorAll<HTMLElement>("[data-hero-slide]")).slice(0, total);
      if (slides.length < 2) return;
      const count = slides.length;
      const movers = slides.map((slide) => slide.querySelector<HTMLElement>("[data-hero-mover]") ?? slide);
      const images = slides.map((slide) => slide.querySelector("img"));
      const stage = root.querySelector<HTMLElement>("[data-hero-stage]") ?? root;

      let current = 0;
      /** Each wait for a photograph takes a ticket; a newer wait makes the older ones void. */
      let ticket = 0;
      let fade: gsap.core.Tween | null = null;
      let hold: gsap.core.Tween | null = null;
      const burns: Array<gsap.core.Animation | null> = slides.map(() => null);
      /** Every reason the sequence may be standing still. It runs only when none holds. */
      const stop = { user: false, waiting: true, offscreen: false, hidden: document.hidden, overlay: isOverlayOpen() };

      const playing = () => !(stop.user || stop.waiting || stop.offscreen || stop.hidden || stop.overlay);
      const sync = () => {
        const halt = !playing();
        hold?.paused(halt);
        for (const burn of burns) burn?.paused(halt);
      };

      /** Where a photograph's pan starts: a little away from its focal point, so that it travels toward it. */
      const pan = (index: number) => {
        const fx = Number(movers[index].dataset.fx ?? 0.5);
        const fy = Number(movers[index].dataset.fy ?? 0.5);
        const side = (focal: number, fallback: number) => (Math.abs(focal - 0.5) < 0.04 ? fallback : Math.sign(focal - 0.5));
        return { x: side(fx, index % 2 ? 1 : -1) * PAN_X, y: side(fy, 1) * PAN_Y };
      };

      const burn = contextSafe((index: number) => {
        burns[index]?.kill();
        const from = pan(index);
        burns[index] = gsap.fromTo(
          movers[index],
          { scale: ZOOM_FROM, xPercent: from.x, yPercent: from.y },
          { scale: ZOOM_TO, xPercent: 0, yPercent: 0, duration: HERO_HOLD + HERO_FADE, ease: "none", paused: !playing() },
        );
      });

      /** Put a later photograph in the page (unseen) and ask the browser for its file. */
      const fetchFrame = contextSafe((index: number) => {
        const slide = slides[index];
        if (slide.hidden) {
          gsap.set(slide, { autoAlpha: 0, zIndex: 0 });
          slide.hidden = false;
        }
        const img = images[index];
        if (img && img.loading !== "eager") img.loading = "eager";
      });

      const whenLoaded = (index: number, then: () => void) => {
        const mine = ++ticket;
        fetchFrame(index);
        const img = images[index];
        const done = contextSafe(() => {
          if (mine === ticket) then();
        });
        if (!img) {
          done();
          return;
        }
        // Decoded before it is shown, so the fade never starts on a blank frame or stutters half way.
        const decoded = () => {
          if (typeof img.decode === "function") img.decode().then(done, done);
          else done();
        };
        if (img.complete) decoded();
        else {
          img.addEventListener("load", decoded, { once: true });
          img.addEventListener("error", done, { once: true });
        }
      };

      const startHold = contextSafe(() => {
        hold?.kill();
        hold = gsap.fromTo(
          fills.current[current] ?? {},
          { scaleX: 0 },
          { scaleX: 1, duration: HERO_HOLD, ease: "none", paused: !playing(), onComplete: advance },
        );
      });

      const show = contextSafe((next: number, manual: boolean) => {
        if (next === current) return;
        // A crossfade still under way ends at once: there are never three photographs in play.
        fade?.progress(1);
        const from = current;
        current = next;
        hold?.kill();
        hold = null;
        gsap.set(
          fills.current.filter((fill) => fill !== null),
          { scaleX: 0 },
        );

        const incoming = slides[next];
        const outgoing = slides[from];
        fetchFrame(next);
        gsap.set(outgoing, { zIndex: 1 });
        gsap.set(incoming, { autoAlpha: 0, zIndex: 2 });
        burn(next);
        fade = gsap.to(incoming, {
          autoAlpha: 1,
          duration: HERO_FADE,
          ease: "sine.inOut",
          onComplete: () => {
            fade = null;
            gsap.set(outgoing, { autoAlpha: 0, zIndex: 0 });
            burns[from]?.kill();
            burns[from] = null;
            gsap.set(movers[from], { clearProps: "transform" });
            gsap.set(incoming, { zIndex: 1 });
          },
        });
        startHold();

        setView((was) => ({ index: next, moves: was.moves + 1 }));
        if (manual) setAnnouncement(`${countText(next)}. ${frames[next]?.caption ?? ""}`);
        // The one after this is fetched while this one is on screen.
        fetchFrame((next + 1) % count);
      });

      function advance() {
        const next = (current + 1) % count;
        whenLoaded(next, () => show(next, false));
      }

      // The entrance belongs to a page the visitor has not seen yet: under the loader, or freshly made by
      // a navigation. A page the server painted and no loader covers is left exactly as it is.
      const entrance = !(serverPainted.current && isLoaderDone());
      gsap.set(slides[0], { zIndex: 1 });
      if (entrance) {
        gsap.set(movers[0], { scale: ZOOM_ENTER });
        gsap.set(control, { autoAlpha: 0 });
      }

      const begin = contextSafe(() => {
        if (entrance) {
          burns[0] = gsap
            .timeline()
            .to(movers[0], { scale: ZOOM_FROM, duration: SETTLE, ease: "power3.out" })
            .to(movers[0], { scale: ZOOM_TO, duration: HERO_HOLD + HERO_FADE - SETTLE, ease: "none" });
          gsap.to(control, { autoAlpha: 1, duration: 0.7, delay: 0.85, ease: "power2.out", clearProps: "opacity,visibility" });
        } else {
          // Already in view at its resting size: it only breathes in, so nothing jumps.
          burns[0] = gsap.to(movers[0], { scale: 1.06, duration: HERO_HOLD + HERO_FADE, ease: "none" });
        }
        stop.waiting = false;
        startHold();
        sync();
        fetchFrame(1);
      });
      const offLoader = onLoaderDone(begin);

      const observer =
        typeof IntersectionObserver === "undefined"
          ? null
          : new IntersectionObserver(([entry]) => {
              stop.offscreen = !entry.isIntersecting;
              sync();
            });
      observer?.observe(stage);

      const onVisibility = () => {
        stop.hidden = document.hidden;
        sync();
      };
      const onOverlay = () => {
        stop.overlay = isOverlayOpen();
        sync();
      };
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener(OVERLAY_EVENT, onOverlay);

      // Touch: a sideways swipe across the photograph turns it. The page keeps its own vertical scroll
      // (the hero declares touch-action: pan-y), and a swipe that is mostly up or down is not one.
      let swipe: { id: number; x: number; y: number; at: number } | null = null;
      const onPointerDown = (event: PointerEvent) => {
        swipe = event.pointerType === "touch" && event.isPrimary ? { id: event.pointerId, x: event.clientX, y: event.clientY, at: event.timeStamp } : null;
      };
      const onPointerUp = (event: PointerEvent) => {
        const from = swipe;
        swipe = null;
        if (!from || from.id !== event.pointerId || event.timeStamp - from.at > SWIPE_MS) return;
        const dx = event.clientX - from.x;
        const dy = event.clientY - from.y;
        if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy) * 1.8) return;
        const next = (current + (dx < 0 ? 1 : -1) + count) % count;
        whenLoaded(next, () => show(next, true));
      };
      const onPointerCancel = () => {
        swipe = null;
      };
      root.addEventListener("pointerdown", onPointerDown);
      root.addEventListener("pointerup", onPointerUp);
      root.addEventListener("pointercancel", onPointerCancel);

      engine.current = {
        step: (delta) => {
          const next = (current + delta + count) % count;
          whenLoaded(next, () => show(next, true));
        },
        jump: (index) => {
          if (index !== current) whenLoaded(index, () => show(index, true));
        },
        setUserPaused: (value) => {
          stop.user = value;
          sync();
        },
      };

      return () => {
        engine.current = null;
        ticket += 1;
        offLoader();
        observer?.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener(OVERLAY_EVENT, onOverlay);
        root.removeEventListener("pointerdown", onPointerDown);
        root.removeEventListener("pointerup", onPointerUp);
        root.removeEventListener("pointercancel", onPointerCancel);
        // Back to the server's markup: the first photograph, still, and the others out of the page.
        slides.forEach((slide, index) => {
          gsap.set(slide, { clearProps: "opacity,visibility,zIndex" });
          slide.hidden = index > 0;
        });
        gsap.set(movers, { clearProps: "transform" });
      };
    },
    { dependencies: [rootId, total] },
  );

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      engine.current?.step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      engine.current?.step(-1);
    }
  };

  const togglePause = () => {
    const next = !paused;
    setPaused(next);
    engine.current?.setUserPaused(next);
  };

  const frame = frames[view.index] ?? frames[0];
  const arriving = view.moves > 0 && styles.swap;

  return (
    <div ref={group} className={cx(styles.control, styles.live, className)} role="group" aria-label={labels.label} onKeyDown={onKeyDown}>
      <p className={styles.count}>
        <span className="vh">{countText(view.index)}</span>
        <span className={styles.figures} aria-hidden="true">
          <span key={view.index} className={cx(styles.now, arriving)}>
            {two(view.index + 1)}
          </span>
          <span className={styles.of}>/</span>
          <span className={styles.total}>{two(total)}</span>
        </span>
        {frame.room ? (
          <span key={`room-${view.index}`} className={cx("eyebrow", styles.room, arriving)}>
            <Rule />
            {frame.room}
          </span>
        ) : null}
      </p>

      <p key={`caption-${view.index}`} className={cx(styles.caption, arriving)}>
        {frame.caption}
      </p>

      <div className={styles.transport}>
        <div className={styles.bars}>
          {frames.map((item, index) => (
            <button
              key={index}
              type="button"
              // Out of the tab order: Previous, Next and the arrow keys do the same from the keyboard.
              tabIndex={-1}
              className={styles.bar}
              aria-label={countText(index)}
              aria-current={index === view.index ? "true" : undefined}
              title={item.caption}
              onClick={() => engine.current?.jump(index)}
            >
              <span className={styles.track}>
                <span
                  ref={(el) => {
                    fills.current[index] = el;
                  }}
                  className={styles.fill}
                />
              </span>
            </button>
          ))}
        </div>
        <div className={styles.buttons}>
          <button type="button" className={cx(styles.round, styles.turn)} aria-label={labels.previous} onClick={() => engine.current?.step(-1)}>
            <Icon name="arrow-left" size={18} />
          </button>
          <button type="button" className={cx(styles.round, styles.turn)} aria-label={labels.next} onClick={() => engine.current?.step(1)}>
            <Icon name="arrow-right" size={18} />
          </button>
          <button type="button" className={styles.round} aria-label={paused ? labels.play : labels.pause} onClick={togglePause}>
            <Icon name={paused ? "play" : "pause"} size={18} />
          </button>
        </div>
      </div>

      <p className="vh" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </div>
  );
}
