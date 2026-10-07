/**
 * The sky over Pak Chong: sunset, sunrise, the moon, and how far the day has turned toward dusk.
 *
 * Pure arithmetic: no DOM, no Intl, no network, safe on the server and in a worker. Every function takes
 * the instant it should answer for, so nothing here reads the clock by itself.
 *
 * WHERE. The figures are worked out for Pak Chong town centre, a district-level point of public
 * geography. It is NOT the resort's own pin (BUILD-CONTRACT section 2 withholds coordinates), which is
 * why the constant is named PAK_CHONG and guest copy says "in Pak Chong". Across the district the
 * sunset moves by well under a minute, so the answer is honest as "about HH:MM".
 *
 * WHEN. Thailand keeps UTC+7 all year with no daylight saving, so the resort's wall clock is plain
 * arithmetic on UTC and no time-zone database is needed.
 *
 * Sun: the NOAA solar calculator equations (Meeus, Astronomical Algorithms, chapters 25 and 28), with
 * the usual 0.833 degree allowance for refraction and the sun's radius. Good to about a minute.
 * Moon: Meeus chapter 48 (mean elongation and anomalies with the six largest periodic terms). Good to a
 * fraction of a degree, which is far finer than a drawn moon can show.
 */

/** Pak Chong town centre. District-level geography, not the resort's location. */
export const PAK_CHONG = { lat: 14.71, lon: 101.42 } as const;

/** Asia/Bangkok is UTC+7 the whole year. */
export const BANGKOK_OFFSET_MINUTES = 420;

const MINUTE = 60_000;
const DAY_MINUTES = 1440;
const RAD = Math.PI / 180;

const sin = (deg: number) => Math.sin(deg * RAD);
const cos = (deg: number) => Math.cos(deg * RAD);
const tan = (deg: number) => Math.tan(deg * RAD);
const mod = (n: number, d: number) => ((n % d) + d) % d;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/* ───────────── The resort's wall clock ───────────── */

export interface BangkokClock {
  year: number;
  /** 1 to 12 */
  month: number;
  day: number;
  hour: number;
  minute: number;
  /** Minutes after midnight, 0 to 1439. */
  minutes: number;
}

/** The calendar date and wall-clock time in Asia/Bangkok for an instant. */
export function bangkokClock(date: Date): BangkokClock {
  const shifted = new Date(date.getTime() + BANGKOK_OFFSET_MINUTES * MINUTE);
  const hour = shifted.getUTCHours();
  const minute = shifted.getUTCMinutes();
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour,
    minute,
    minutes: hour * 60 + minute,
  };
}

/** The instant at which the Bangkok calendar day containing `date` shows `minutes` after midnight. */
export function bangkokInstant(date: Date, minutes: number): Date {
  const c = bangkokClock(date);
  return new Date(Date.UTC(c.year, c.month - 1, c.day, 0, 0, 0) + (minutes - BANGKOK_OFFSET_MINUTES) * MINUTE);
}

/** "17:58" from minutes after midnight (rounded to the minute, wrapped into one day). */
export function formatMinutes(minutes: number): string {
  const m = mod(Math.round(minutes), DAY_MINUTES);
  const hh = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

/* ───────────── Sun ───────────── */

const julianDay = (date: Date) => date.getTime() / 86_400_000 + 2440587.5;

interface SolarPosition {
  /** Degrees. */
  declination: number;
  /** Minutes: apparent solar time minus mean solar time. */
  equationOfTime: number;
}

function solarPosition(date: Date): SolarPosition {
  const t = (julianDay(date) - 2451545) / 36525;
  const meanLongitude = mod(280.46646 + t * (36000.76983 + t * 0.0003032), 360);
  const meanAnomaly = 357.52911 + t * (35999.05029 - 0.0001537 * t);
  const eccentricity = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
  const centre =
    sin(meanAnomaly) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    sin(2 * meanAnomaly) * (0.019993 - 0.000101 * t) +
    sin(3 * meanAnomaly) * 0.000289;
  const omega = 125.04 - 1934.136 * t;
  const apparentLongitude = meanLongitude + centre - 0.00569 - 0.00478 * sin(omega);
  const meanObliquity = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
  const obliquity = meanObliquity + 0.00256 * cos(omega);
  const declination = Math.asin(sin(obliquity) * sin(apparentLongitude)) / RAD;
  const y = tan(obliquity / 2) ** 2;
  const equationOfTime =
    (4 / RAD) *
    (y * sin(2 * meanLongitude) -
      2 * eccentricity * sin(meanAnomaly) +
      4 * eccentricity * y * sin(meanAnomaly) * cos(2 * meanLongitude) -
      0.5 * y * y * sin(4 * meanLongitude) -
      1.25 * eccentricity * eccentricity * sin(2 * meanAnomaly));
  return { declination, equationOfTime };
}

/** Sun 0.833 degrees below a level horizon: the standard definition of sunrise and sunset. */
const ZENITH = 90.833;

/**
 * Sunrise or sunset as minutes after local midnight, for the local calendar day containing `date`,
 * at a place whose clock runs `offsetMinutes` ahead of UTC. `null` in polar day or night.
 */
export function sunEventAt(
  date: Date,
  lat: number,
  lon: number,
  event: "rise" | "set",
  offsetMinutes: number = BANGKOK_OFFSET_MINUTES,
): number | null {
  const local = new Date(date.getTime() + offsetMinutes * MINUTE);
  const midnightUtc = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - offsetMinutes * MINUTE;
  // Two passes: the first uses the sun's position at local noon, the second its position at the event itself.
  let minutes = 720;
  for (let pass = 0; pass < 2; pass++) {
    const { declination, equationOfTime } = solarPosition(new Date(midnightUtc + minutes * MINUTE));
    const cosHourAngle = cos(ZENITH) / (cos(lat) * cos(declination)) - tan(lat) * tan(declination);
    if (cosHourAngle > 1 || cosHourAngle < -1) return null;
    const hourAngle = Math.acos(cosHourAngle) / RAD;
    const solarNoon = 720 - 4 * lon - equationOfTime + offsetMinutes;
    minutes = event === "set" ? solarNoon + 4 * hourAngle : solarNoon - 4 * hourAngle;
  }
  return minutes;
}

/** Today's sunset as minutes after midnight in Asia/Bangkok. Pass PAK_CHONG for the place. */
export function sunsetAt(date: Date, lat: number, lon: number): number {
  // Thailand lies in the tropics: the sun rises and sets every day of the year.
  return sunEventAt(date, lat, lon, "set") ?? 1080;
}

/** Today's sunrise as minutes after midnight in Asia/Bangkok. */
export function sunriseAt(date: Date, lat: number, lon: number): number {
  return sunEventAt(date, lat, lon, "rise") ?? 360;
}

/* ───────────── The day, as the rooftop chapter reads it ───────────── */

/** Minutes before sunset at which the afternoon starts to turn. */
const TURN_BEGINS = 180;
/** Minutes before sunset of the "low sun" photograph. */
const LOW_SUN = 60;
/** Minutes after sunset by which it is dusk. */
const DUSK = 20;
/** Minutes before sunrise over which the night gives way. */
const DAWN = 30;

/**
 * How far the day has turned, 0 to 1, for the rooftop chapter's three photographs.
 *
 *   0    from sunrise and through the afternoon
 *   0.5  about an hour before sunset (low sun)
 *   1    from about twenty minutes after sunset, and through the night
 *
 * Linear between those marks, and it eases back to 0 over the half hour before sunrise.
 */
export function dayProgress(date: Date): number {
  const now = bangkokClock(date).minutes;
  const rise = sunriseAt(date, PAK_CHONG.lat, PAK_CHONG.lon);
  const set = sunsetAt(date, PAK_CHONG.lat, PAK_CHONG.lon);
  if (now < rise - DAWN) return 1;
  if (now < rise) return clamp01((rise - now) / DAWN);
  if (now <= set - TURN_BEGINS) return 0;
  if (now <= set - LOW_SUN) return 0.5 * clamp01((now - (set - TURN_BEGINS)) / (TURN_BEGINS - LOW_SUN));
  if (now <= set + DUSK) return 0.5 + 0.5 * clamp01((now - (set - LOW_SUN)) / (LOW_SUN + DUSK));
  return 1;
}

/* ───────────── Moon ───────────── */

export const MOON_PHASES = [
  "new",
  "waxing-crescent",
  "first-quarter",
  "waxing-gibbous",
  "full",
  "waning-gibbous",
  "last-quarter",
  "waning-crescent",
] as const;
export type MoonPhaseName = (typeof MOON_PHASES)[number];

export interface MoonPhase {
  /** Position in the cycle: 0 new, 0.25 first quarter, 0.5 full, 0.75 last quarter. */
  fraction: number;
  /** Lit part of the disc, 0 to 1. */
  illumination: number;
  name: MoonPhaseName;
}

/**
 * Half-width of the window, as a part of the cycle, in which the four principal phases are named.
 * 0.034 of a 29.53 day cycle is one day either side: the nights on which the moon looks new, half or full.
 */
const PRINCIPAL_WINDOW = 0.034;

function phaseName(fraction: number): MoonPhaseName {
  const near = (mark: number) => Math.abs(fraction - mark) <= PRINCIPAL_WINDOW;
  if (fraction <= PRINCIPAL_WINDOW || fraction >= 1 - PRINCIPAL_WINDOW) return "new";
  if (near(0.25)) return "first-quarter";
  if (near(0.5)) return "full";
  if (near(0.75)) return "last-quarter";
  if (fraction < 0.25) return "waxing-crescent";
  if (fraction < 0.5) return "waxing-gibbous";
  if (fraction < 0.75) return "waning-gibbous";
  return "waning-crescent";
}

/** The moon's phase at an instant. */
export function moonPhase(date: Date): MoonPhase {
  const t = (julianDay(date) - 2451545) / 36525;
  const elongation = 297.8501921 + 445267.1114034 * t - 0.0018819 * t * t;
  const sunAnomaly = 357.5291092 + 35999.0502909 * t - 0.0001536 * t * t;
  const moonAnomaly = 134.9633964 + 477198.8675055 * t + 0.0087414 * t * t;
  // The Sun to Moon angle seen from Earth, with the six largest periodic terms.
  const angle = mod(
    elongation +
      6.289 * sin(moonAnomaly) -
      2.1 * sin(sunAnomaly) +
      1.274 * sin(2 * elongation - moonAnomaly) +
      0.658 * sin(2 * elongation) +
      0.214 * sin(2 * moonAnomaly) +
      0.11 * sin(elongation),
    360,
  );
  const fraction = angle / 360;
  return { fraction, illumination: (1 - cos(angle)) / 2, name: phaseName(fraction) };
}

/**
 * The instant "tonight's moon" is read at: 21:00 at the resort on the current evening. In the small
 * hours the evening in question is the one still going, so the moon is read as it is now.
 */
export function tonight(date: Date): Date {
  return bangkokClock(date).hour < 5 ? date : bangkokInstant(date, 21 * 60);
}
