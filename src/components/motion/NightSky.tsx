"use client";

import { moonPhase, tonight } from "@/lib/sky";
import { MoonIcon } from "./Sky";
import { Stars } from "./Stars";
import { useResortNow } from "./useResortNow";
import styles from "./NightSky.module.css";

/**
 * A drawn night sky: deep blue fading to a faint glow at the horizon, the Milky Way as a soft band with a
 * dark dust lane, a full field of stars, tonight's moon as it really is at the resort, and two dark ridges.
 *
 *   <NightSky className={s.art} />        fills its box (position it from the parent)
 *
 * It is an illustration and looks like one. It stands in where no real photograph of the night sky at the
 * resort exists yet (the homepage stargazing tile) and never pretends to be a photograph of the resort.
 * Purely decorative (aria-hidden): the tile it sits in carries the name.
 *
 * LAYERS. The sky, the band and the stars are one SVG drawn on the server, so the picture is whole before
 * any script runs and without JavaScript. The star positions come from a fixed seed, so server and browser
 * draw the same sky. On top, the shared <Stars> canvas adds a few stars that twinkle (still under reduced
 * motion), the Milky Way fades on bright-moon nights, and the moon appears once the browser knows tonight's phase (src/lib/sky.ts).
 *
 * One per page: the drawing's gradient and filter ids are fixed (nightsky-*).
 */

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

/* The drawing is 400 x 500 and is cropped to fill whatever shape the box has (slice). */
const W = 400;
const H = 500;

/** A small fixed-seed generator (mulberry32): the same stars on the server and in the browser. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Dot {
  x: number;
  y: number;
  r: number;
  o: number;
}

const round = (n: number) => Math.round(n * 10) / 10;

/** The band runs from low left to high right. `along` 0..1 is the position on it; returns the centre line. */
function bandPoint(along: number) {
  const x = -40 + along * (W + 80);
  const y = H * 0.78 - along * H * 0.72 + Math.sin(along * Math.PI) * 26;
  return { x, y };
}

function makeStars(): { field: Dot[]; band: Dot[]; bright: Dot[] } {
  const rand = seeded(2026_11_22);
  const field: Dot[] = [];
  for (let i = 0; i < 150; i++) {
    const tiny = rand() < 0.8;
    field.push({ x: round(rand() * W), y: round(rand() * H * 0.78), r: round(tiny ? 0.45 + rand() * 0.5 : 0.9 + rand() * 0.7), o: round(0.35 + rand() * 0.6) });
  }
  // Dense, faint dust along the band: what makes it read as the Milky Way rather than a beam of light.
  const band: Dot[] = [];
  for (let i = 0; i < 260; i++) {
    const p = bandPoint(rand());
    const spread = (rand() + rand() + rand() - 1.5) * 46;
    band.push({ x: round(p.x + spread * 0.55), y: round(p.y + spread), r: round(0.3 + rand() * 0.45), o: round(0.25 + rand() * 0.5) });
  }
  const bright: Dot[] = [];
  for (let i = 0; i < 9; i++) {
    bright.push({ x: round(20 + rand() * (W - 40)), y: round(20 + rand() * H * 0.6), r: round(1.4 + rand() * 0.8), o: 1 });
  }
  return { field, band, bright };
}

const STARS = makeStars();

/** The band as one smooth curve along its centre line, offset sideways by `shift` (drawing units). */
function bandPath(shift: number, from = -0.05, to = 1.05): string {
  const points: string[] = [];
  for (let i = 0; i <= 24; i++) {
    const p = bandPoint(from + ((to - from) * i) / 24);
    points.push(`${round(p.x + shift * 0.55)} ${round(p.y + shift)}`);
  }
  return `M${points.join("L")}`;
}

/** The glow: a wide soft stroke, a narrower brighter one over it, and the dark dust lane a little off centre. */
const GLOW_WIDE = bandPath(0);
const GLOW_CORE = bandPath(-4, 0.1, 0.95);
const LANE = bandPath(9, 0.2, 0.8);

export interface NightSkyProps {
  className?: string;
}

export function NightSky({ className }: NightSkyProps) {
  const now = useResortNow();
  const phase = now ? moonPhase(tonight(now)) : null;
  // A bright moon washes the Milky Way out, as it does in the real sky: the band fades with tonight's moon.
  const band = phase ? round(1 - 0.65 * phase.illumination) : 1;
  return (
    <div className={cx(styles.sky, className)} aria-hidden="true">
      <svg className={styles.drawing} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" focusable="false">
        <defs>
          <linearGradient id="nightsky-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#060a16" />
            <stop offset="0.45" stopColor="#0c1428" />
            <stop offset="0.8" stopColor="#1b2340" />
            <stop offset="1" stopColor="#33304d" />
          </linearGradient>
          <radialGradient id="nightsky-horizon" cx="0.5" cy="1.05" r="0.7">
            <stop offset="0" stopColor="#c98d6b" stopOpacity="0.32" />
            <stop offset="1" stopColor="#c98d6b" stopOpacity="0" />
          </radialGradient>
          <filter id="nightsky-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
          <filter id="nightsky-lane" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <filter id="nightsky-glint" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        <rect width={W} height={H} fill="url(#nightsky-sky)" />
        <rect width={W} height={H} fill="url(#nightsky-horizon)" />

        <g fill="none" strokeLinecap="round" strokeLinejoin="round" className={styles.band} style={{ opacity: band }}>
          <path d={GLOW_WIDE} stroke="#d9d2ff" strokeWidth="120" opacity="0.1" filter="url(#nightsky-soft)" />
          <path d={GLOW_CORE} stroke="#fff1e2" strokeWidth="54" opacity="0.2" filter="url(#nightsky-soft)" />
          <path d={LANE} stroke="#070b16" strokeWidth="10" opacity="0.6" filter="url(#nightsky-lane)" />
        </g>

        <g fill="#f6f1e8">
          {STARS.band.map((d, i) => (
            <circle key={`b${i}`} cx={d.x} cy={d.y} r={d.r} opacity={d.o} />
          ))}
          {STARS.field.map((d, i) => (
            <circle key={`f${i}`} cx={d.x} cy={d.y} r={d.r} opacity={d.o} />
          ))}
        </g>
        <g fill="#fff8ee">
          {STARS.bright.map((d, i) => (
            <g key={`s${i}`}>
              <circle cx={d.x} cy={d.y} r={d.r * 2.6} opacity="0.35" filter="url(#nightsky-glint)" />
              <circle cx={d.x} cy={d.y} r={d.r} />
            </g>
          ))}
        </g>
      </svg>

      <Stars className={styles.twinkle} density={0.9} />

      <div className={styles.moon} data-live={phase ? "true" : "false"}>
        <MoonIcon phase={phase} />
      </div>

      <svg className={styles.hills} viewBox="0 0 400 100" preserveAspectRatio="none" focusable="false">
        <path className={styles.far} d="M0 46C34 34 62 30 96 38S150 22 196 26 262 44 300 34 362 18 400 30V100H0Z" />
        <path className={styles.near} d="M0 70C44 58 84 64 122 60S196 48 238 58 318 74 400 60V100H0Z" />
      </svg>
    </div>
  );
}
