/**
 * The motion system (ART-DIRECTION section 3). Pages never call GSAP directly; they compose these.
 *
 *   import { Reveal, SplitReveal, MediaReveal } from "@/components/motion";
 *
 * Mounted once by the language layout:
 *   Loader            first in <body>
 *   MotionProvider    around everything that moves
 *   ScrollProgress    inside the provider
 *   PageTransition    through src/app/[lang]/template.tsx
 *
 * For pages:
 *   SplitReveal · Reveal · MediaReveal · Parallax · CountUp · DriftReel · Stars
 *   Clock · SunsetTime · MoonTonight · SkyTonight · MoonIcon
 *
 * For client islands:
 *   useMotion()            { reduced, ready }
 *   useOverlayOpen()       true while any drawer, lightbox, menu or sheet is open
 *   announceOverlay(open)  say that one opened or closed
 *   onLoaderDone(cb)       run when the page is revealed (at once if it already is)
 *   scrollToTarget(t)      glide to a position, element or selector from script (links need nothing)
 *   useResortNow()         the current instant, to the minute; null on the server
 *
 * Every component is its own "use client" file, so a Server Component that imports one from here pulls
 * in only that file. A client module that needs its own timeline imports GSAP, with the plugins
 * registered, from "@/components/motion/gsap".
 *
 * The rule that holds everywhere: the server's HTML is complete and visible. Start states are written
 * by script, only to things the visitor cannot see yet, and never under reduced motion.
 */

export { MotionProvider } from "./MotionProvider";
export { useMotion, type MotionState } from "./useMotion";
export { scrollToTarget } from "./runtime";

export { announceOverlay, isOverlayOpen, OVERLAY_EVENT } from "./overlay-bus";
export { useOverlayOpen } from "./useOverlayOpen";

export { Loader, type LoaderProps } from "./Loader";
export { isLoaderDone, LOADER_DONE_EVENT, onLoaderDone } from "./loader-bus";

export { SplitReveal, type SplitRevealProps } from "./SplitReveal";
export { Reveal, type RevealProps, type RevealVariant } from "./Reveal";
export { MediaReveal, type MediaRevealProps } from "./MediaReveal";
export { Parallax, type ParallaxProps } from "./Parallax";
export { ScrollProgress, type ScrollProgressProps } from "./ScrollProgress";
export { DriftReel, type DriftReelProps } from "./DriftReel";
export { CountUp, type CountUpProps } from "./CountUp";
export { PageTransition } from "./PageTransition";
export { Stars, type StarsProps } from "./Stars";
export type { EntranceTrigger } from "./useEntrance";

export { useResortNow } from "./useResortNow";
export {
  Clock,
  MoonIcon,
  MoonTonight,
  SkyTonight,
  SunsetTime,
  type ClockProps,
  type MoonTonightProps,
  type SkyTonightProps,
  type SunsetTimeProps,
} from "./Sky";
