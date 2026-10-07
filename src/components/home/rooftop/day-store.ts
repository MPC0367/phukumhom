import { gsap } from "@/components/motion/gsap";

/**
 * The day, as the rooftop band keeps it: one number from 0 (day) through 0.5 (low sun) to 1 (dusk).
 *
 * Two readings of that number are kept apart on purpose:
 *
 *   value   where the control stands. It answers the hand at once: the thumb never lags a finger.
 *   shown   what the scene shows (photographs, colours, stars). It follows `value` with a short ease,
 *           so a click on the far end of the track is a sweep through the evening and not a cut.
 *
 * A glide (a named stop, the opening, "back to now") moves both together. Under reduced motion there
 * is no ease of any kind: both numbers change in the same instant.
 *
 * Nothing here is React state. The band's root writes each frame straight to CSS custom properties,
 * and the few things React does need to render (which named stop the control is at) are exposed for
 * useSyncExternalStore. A plain module: it is only ever imported by the "use client" files beside it.
 */

export type StopIndex = 0 | 1 | 2;

/** Where the three named times sit on the track: day, low sun, dusk. */
export const STOP_VALUES: readonly [number, number, number] = [0, 0.5, 1];

/** Who moved the day. "open" and "clock" are the page's own moves; the rest are the guest's. */
export type DaySource = "input" | "frame" | "stop" | "open" | "clock";

export interface DayFrame {
  /** What the scene shows, 0 to 1. */
  shown: number;
  /** Where the control stands, 0 to 1. */
  value: number;
  /** The band is on its dark ground (see DUSK_ON). */
  dusk: boolean;
  /** The named time nearest the control. */
  stop: StopIndex;
  /** The guest has moved the day themselves. */
  touched: boolean;
  source: DaySource;
}

export interface Day {
  snapshot(): DayFrame;
  /**
   * Move the day. With `glide` (seconds) the control and the scene travel there together; without it
   * the control is there at once and the scene follows.
   */
  move(value: number, source: DaySource, glide?: number): void;
  /** Glide to a named stop; the further away it is, the longer it takes. */
  toStop(stop: StopIndex): void;
  /** Glide back to the present. Nothing happens until the present is known. */
  toNow(): void;
  /** The present, as dayProgress() reads it. While the guest has not touched the control it is followed. */
  setNow(value: number): void;
  /** The first sight of the band: travel from the day frame to the present. Happens once. */
  open(seconds: number): void;
  setReduced(reduced: boolean): void;
  /** Called on every change of either number. */
  onFrame(listener: (frame: DayFrame) => void): () => void;
  /** For useSyncExternalStore: called only when the named stop changes. */
  subscribeStop(listener: () => void): () => void;
  getStop(): StopIndex;
  /** Stop every tween. The store can still be used afterwards. */
  destroy(): void;
}

/**
 * The hard switch from the light ground to the dark one. No colour holds 4.5:1 against both ink and
 * paper, so the text cannot change colour gradually: the ground changes under it in one step, a little
 * past low sun. The two thresholds are a small dead band, so a hand resting on the line does not make
 * the band flicker. The stylesheet holds both grounds still between 0.5 and 0.6 for the same reason.
 */
const DUSK_ON = 0.56;
const DUSK_OFF = 0.54;

/** How long the scene takes to catch up with the control. */
const FOLLOW_SECONDS = 0.5;
/** A glide to a named stop: a base time plus more for distance. Day to dusk is 1.6s. */
const GLIDE_BASE = 0.5;
const GLIDE_PER_DAY = 1.1;
/** When the present is the daytime itself, the opening looks this far ahead and comes back. */
const PEEK = 0.16;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export const stopOf = (value: number): StopIndex => (value < 0.25 ? 0 : value < 0.75 ? 1 : 2);

export function createDay(): Day {
  const state = { value: 0, shown: 0 };
  let now: number | null = null;
  let dusk = false;
  let stop: StopIndex = 0;
  let touched = false;
  let opened = false;
  let reduced = false;
  let source: DaySource = "open";
  let glide: gsap.core.Animation | null = null;
  /** Where the glide in flight is going, so it can be finished at once if motion is switched off. */
  let glideEnd = 0;
  let follow: gsap.core.Tween | null = null;
  const frameListeners = new Set<(frame: DayFrame) => void>();
  const stopListeners = new Set<() => void>();

  const snapshot = (): DayFrame => ({ shown: state.shown, value: state.value, dusk, stop, touched, source });

  const emit = () => {
    if (!dusk && state.shown >= DUSK_ON) dusk = true;
    else if (dusk && state.shown < DUSK_OFF) dusk = false;
    const next = stopOf(state.value);
    const stopChanged = next !== stop;
    stop = next;
    const frame = snapshot();
    frameListeners.forEach((listener) => listener(frame));
    if (stopChanged) stopListeners.forEach((listener) => listener());
  };

  const halt = () => {
    glide?.kill();
    glide = null;
    follow?.kill();
    follow = null;
  };

  /** Control and scene travel to `to` together. */
  const travel = (to: number, seconds: number) => {
    halt();
    if (reduced || seconds <= 0) {
      state.value = to;
      state.shown = to;
      emit();
      return;
    }
    glideEnd = to;
    glide = gsap.to(state, { value: to, shown: to, duration: seconds, ease: "power2.inOut", onUpdate: emit });
  };

  const move: Day["move"] = (value, from, seconds = 0) => {
    const to = clamp01(value);
    source = from;
    if (from !== "open" && from !== "clock") touched = true;
    if (seconds > 0) {
      travel(to, seconds);
      return;
    }
    halt();
    state.value = to;
    if (reduced) {
      state.shown = to;
      emit();
      return;
    }
    // The control first, in this same frame; then the scene comes after it.
    emit();
    follow = gsap.to(state, { shown: to, duration: FOLLOW_SECONDS, ease: "power3.out", onUpdate: emit });
  };

  return {
    snapshot,
    move,
    toStop(index) {
      const to = STOP_VALUES[index];
      move(to, "stop", GLIDE_BASE + GLIDE_PER_DAY * Math.abs(to - state.value));
    },
    toNow() {
      if (now === null) return;
      move(now, "stop", GLIDE_BASE + GLIDE_PER_DAY * Math.abs(now - state.value));
    },
    setNow(value) {
      const first = now === null;
      now = clamp01(value);
      // The minute has turned and the guest has left the control alone: stay with the real evening.
      if (!first && opened && !touched && Math.abs(now - state.value) > 0.001) {
        source = "clock";
        travel(now, 1.2);
      }
    },
    open(seconds) {
      if (opened || now === null) return;
      opened = true;
      if (touched) return;
      source = "open";
      if (now > 0.005 || reduced || seconds <= 0) {
        travel(now, seconds);
        return;
      }
      // It is daytime already, so there is nowhere to travel. Look a little way toward the
      // evening and come back, once, so the band is seen to answer before the guest tries it.
      halt();
      glideEnd = 0;
      glide = gsap
        .timeline()
        .to(state, { value: PEEK, shown: PEEK, duration: seconds * 0.5, ease: "power2.inOut", onUpdate: emit })
        .to(state, { value: 0, shown: 0, duration: seconds * 0.55, ease: "power2.inOut", onUpdate: emit });
    },
    setReduced(value) {
      reduced = value;
      if (!reduced) return;
      // Whatever was under way is finished at once.
      const end = glide ? glideEnd : state.value;
      halt();
      if (state.value !== end || state.shown !== end) {
        state.value = end;
        state.shown = end;
        emit();
      }
    },
    onFrame(listener) {
      frameListeners.add(listener);
      return () => {
        frameListeners.delete(listener);
      };
    },
    subscribeStop(listener) {
      stopListeners.add(listener);
      return () => {
        stopListeners.delete(listener);
      };
    },
    getStop: () => stop,
    destroy: halt,
  };
}
