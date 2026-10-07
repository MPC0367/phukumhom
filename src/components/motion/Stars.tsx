"use client";

import { useEffect, useRef } from "react";
import { gsap } from "./gsap";
import { motionReadyNow, reducedMotionNow, subscribeReady, subscribeReduced } from "./store";
import styles from "./Stars.module.css";

/**
 * A field of faint stars for the rooftop band at dusk. Purely decorative.
 *
 *   <Stars className={s.stars} />          position and fade it from the parent
 *   <Stars density={1.4} />                more of them (1 is about one star per 95 x 95 px)
 *
 * The canvas fills its box and is drawn at the device's pixel ratio (capped at 2). Each star keeps its
 * place across resizes (a seeded sequence, not Math.random), and takes its colour from the canvas's CSS
 * `color`, so `.on-twilight` and friends tint it.
 *
 * Motion allowed: each star brightens and dims on its own slow cycle of 3 to 9 seconds, redrawn about
 * twenty times a second, and only while the canvas is on screen and the tab is visible.
 * Reduced motion, or no motion provider: the same field, drawn once, still.
 * No JavaScript: an empty transparent canvas.
 */

export interface StarsProps {
  className?: string;
  /** Multiplier on the number of stars. Default 1. */
  density?: number;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  base: number;
  speed: number;
  phase: number;
}

/** CSS pixels of sky per star at density 1. */
const AREA_PER_STAR = 9000;
const MAX_STARS = 420;
const FRAME_MS = 50;

/** mulberry32: a tiny deterministic generator, so the sky is the same sky after every resize. */
function sequence(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeStars(count: number): Star[] {
  const next = sequence(20261007);
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    const bright = next() > 0.9;
    stars.push({
      x: next(),
      // A little denser toward the top of the box: the sky thins toward a horizon.
      y: next() ** 1.25,
      radius: bright ? 1 + next() * 0.6 : 0.45 + next() * 0.55,
      base: bright ? 0.65 + next() * 0.3 : 0.22 + next() * 0.38,
      speed: (Math.PI * 2) / (3 + next() * 6),
      phase: next() * Math.PI * 2,
    });
  }
  return stars;
}

export function Stars({ className, density = 1 }: StarsProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let colour = "#ffffff";
    let onScreen = true;
    let running = false;
    let elapsed = 0;
    let sinceDraw = FRAME_MS;

    const draw = (seconds: number, twinkle: boolean) => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = colour;
      for (const star of stars) {
        const flicker = twinkle ? 0.62 + 0.38 * Math.sin(seconds * star.speed + star.phase) : 0.85;
        context.globalAlpha = star.base * flicker;
        context.beginPath();
        context.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
    };

    const measure = () => {
      const box = canvas.getBoundingClientRect();
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      width = Math.max(1, Math.round(box.width));
      height = Math.max(1, Math.round(box.height));
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      colour = window.getComputedStyle(canvas).color || colour;
      const count = Math.min(MAX_STARS, Math.round(((width * height) / AREA_PER_STAR) * density));
      if (count !== stars.length) stars = makeStars(count);
      draw(elapsed, running);
    };

    const tick = (_time: number, deltaMs: number) => {
      if (!onScreen || document.hidden) return;
      const dt = Math.min(deltaMs, 100);
      elapsed += dt / 1000;
      sinceDraw += dt;
      if (sinceDraw < FRAME_MS) return;
      sinceDraw = 0;
      draw(elapsed, true);
    };

    const sync = () => {
      const shouldRun = motionReadyNow() && !reducedMotionNow();
      if (shouldRun === running) return;
      running = shouldRun;
      if (running) gsap.ticker.add(tick);
      else {
        gsap.ticker.remove(tick);
        draw(elapsed, false);
      }
    };

    measure();
    sync();
    const offReady = subscribeReady(sync);
    const offReduced = subscribeReduced(sync);
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    resize?.observe(canvas);
    const visibility =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([entry]) => {
            onScreen = entry.isIntersecting;
          });
    visibility?.observe(canvas);

    return () => {
      gsap.ticker.remove(tick);
      offReady();
      offReduced();
      resize?.disconnect();
      visibility?.disconnect();
    };
  }, [density]);

  return <canvas ref={ref} className={className ? `${styles.stars} ${className}` : styles.stars} aria-hidden="true" />;
}
