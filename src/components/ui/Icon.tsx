import type { ReactNode } from "react";

/**
 * Line icons, drawn for this site on a 24-unit grid.
 *
 * Every shape carries its own presentation attributes (no <style>, no sprite, no external file), so an
 * icon renders identically in a Server Component, inside a client island and in a saved copy of the page.
 * `vector-effect: non-scaling-stroke` keeps the stroke at 1.5 CSS px at any `size`.
 *
 * Icons are decoration: the control they sit in carries the accessible name.
 */

export const ICON_NAMES = [
  "arrow-right",
  "arrow-left",
  "arrow-up-right",
  "chevron-down",
  "plus",
  "minus",
  "x",
  "close",
  "menu",
  "check",
  "copy",
  "share",
  "search",
  "grid",
  "play",
  "pause",
  "phone",
  "pin",
  "facebook",
  "calendar",
  "clock",
  "sun",
  "sunset",
  "moon",
  "moon-outline",
  "external",
] as const;

export type IconName = (typeof ICON_NAMES)[number];

export interface IconProps {
  name: IconName;
  /** Rendered width and height in CSS px. */
  size?: number;
  className?: string;
}

/** Shared by every shape: a 1.5px round-capped line in the current text colour. */
const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  vectorEffect: "non-scaling-stroke",
} as const;

const cross = (
  <>
    <path {...line} d="M6 6l12 12" />
    <path {...line} d="M18 6L6 18" />
  </>
);

const SHAPES: Record<IconName, ReactNode> = {
  "arrow-right": (
    <>
      <path {...line} d="M4 12h16" />
      <path {...line} d="M14 6l6 6-6 6" />
    </>
  ),
  "arrow-left": (
    <>
      <path {...line} d="M20 12H4" />
      <path {...line} d="M10 6l-6 6 6 6" />
    </>
  ),
  "arrow-up-right": (
    <>
      <path {...line} d="M7 17L17 7" />
      <path {...line} d="M8.5 7H17v8.5" />
    </>
  ),
  "chevron-down": <path {...line} d="M6 9.5l6 6 6-6" />,
  plus: (
    <>
      <path {...line} d="M12 5v14" />
      <path {...line} d="M5 12h14" />
    </>
  ),
  minus: <path {...line} d="M5 12h14" />,
  x: cross,
  close: cross,
  menu: (
    <>
      <path {...line} d="M3.5 8.5h17" />
      <path {...line} d="M3.5 15.5h17" />
    </>
  ),
  check: <path {...line} d="M5 12.5l4.5 4.5L19 7.5" />,
  copy: (
    <>
      <rect {...line} x="8.5" y="8.5" width="11" height="11" rx="2" />
      <path {...line} d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" />
    </>
  ),
  share: (
    <>
      <path {...line} d="M12 15V3.5" />
      <path {...line} d="M7.5 8L12 3.5 16.5 8" />
      <path {...line} d="M5 12.5v6A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-6" />
    </>
  ),
  search: (
    <>
      <circle {...line} cx="10.75" cy="10.75" r="6.25" />
      <path {...line} d="M15.4 15.4L20 20" />
    </>
  ),
  grid: (
    <>
      <rect {...line} x="4" y="4" width="6.5" height="6.5" rx="1.25" />
      <rect {...line} x="13.5" y="4" width="6.5" height="6.5" rx="1.25" />
      <rect {...line} x="4" y="13.5" width="6.5" height="6.5" rx="1.25" />
      <rect {...line} x="13.5" y="13.5" width="6.5" height="6.5" rx="1.25" />
    </>
  ),
  play: <path {...line} d="M8 5.25v13.5a.5.5 0 0 0 .77.42l10.2-6.75a.5.5 0 0 0 0-.84L8.77 4.83A.5.5 0 0 0 8 5.25z" />,
  pause: (
    <>
      <path {...line} d="M8.5 5.5v13" />
      <path {...line} d="M15.5 5.5v13" />
    </>
  ),
  phone: <path {...line} d="M5 4h3.2l1.6 4.2-2 1.5a12 12 0 0 0 6.5 6.5l1.5-2 4.2 1.6V19a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  pin: (
    <>
      <path {...line} d="M12 21s-6.5-5.6-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z" />
      <circle {...line} cx="12" cy="10.5" r="2.25" />
    </>
  ),
  facebook: (
    <>
      <rect {...line} x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path {...line} d="M13.25 20.5V10.25A2.75 2.75 0 0 1 16 7.5h1.25" />
      <path {...line} d="M10.25 13h6" />
    </>
  ),
  calendar: (
    <>
      <rect {...line} x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path {...line} d="M3.5 9.75h17" />
      <path {...line} d="M8 3v4" />
      <path {...line} d="M16 3v4" />
    </>
  ),
  clock: (
    <>
      <circle {...line} cx="12" cy="12" r="8.5" />
      <path {...line} d="M12 7.25V12l3.25 2" />
    </>
  ),
  sun: (
    <>
      <circle {...line} cx="12" cy="12" r="3.75" />
      <path {...line} d="M12 3v2.25" />
      <path {...line} d="M12 18.75V21" />
      <path {...line} d="M3 12h2.25" />
      <path {...line} d="M18.75 12H21" />
      <path {...line} d="M5.64 5.64l1.59 1.59" />
      <path {...line} d="M16.77 16.77l1.59 1.59" />
      <path {...line} d="M5.64 18.36l1.59-1.59" />
      <path {...line} d="M16.77 7.23l1.59-1.59" />
    </>
  ),
  /* The sun half below the horizon line, three rays above it. */
  sunset: (
    <>
      <path {...line} d="M3 17.5h18" />
      <path {...line} d="M6.75 17.5a5.25 5.25 0 0 1 10.5 0" />
      <path {...line} d="M12 6v2.5" />
      <path {...line} d="M4.9 10.4l1.8 1.8" />
      <path {...line} d="M19.1 10.4l-1.8 1.8" />
      <path {...line} d="M8 21h8" />
    </>
  ),
  moon: <path {...line} d="M20.5 13.4A8.5 8.5 0 1 1 10.6 3.5a7 7 0 0 0 9.9 9.9z" />,
  /* A full disc with the terminator drawn inside it: the outline the sky panel fills by phase. */
  "moon-outline": (
    <>
      <circle {...line} cx="12" cy="12" r="8.5" />
      <path {...line} d="M12 3.5a12.5 12.5 0 0 0 0 17" />
    </>
  ),
  external: (
    <>
      <path {...line} d="M18.5 13.5v5A1.5 1.5 0 0 1 17 20H5.5A1.5 1.5 0 0 1 4 18.5V7a1.5 1.5 0 0 1 1.5-1.5h5" />
      <path {...line} d="M14 4h6v6" />
      <path {...line} d="M20 4l-9 9" />
    </>
  ),
};

export function Icon({ name, size = 20, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {SHAPES[name]}
    </svg>
  );
}
