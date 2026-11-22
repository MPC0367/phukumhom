import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

/**
 * Draggable and InertiaPlugin, registered. Only the drifting reel uses them, and a reel is never on the
 * first screen: it asks for this module with `import()` once it is set up, so the two plugins (about a
 * fifth of the animation library) stay out of the script every page loads first. Until they arrive the
 * reel simply drifts; grabbing and throwing start working a moment later.
 */
gsap.registerPlugin(Draggable, InertiaPlugin);

export { Draggable };
