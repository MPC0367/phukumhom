import gsap from "gsap";
import { Flip } from "gsap/Flip";

/**
 * Flip, registered. Only the places filter uses it, and only when a chip is pressed: the list asks for
 * this module with `import()` after it has mounted. A chip pressed before it has arrived still filters;
 * the rows change without the slide.
 */
gsap.registerPlugin(Flip);

export { Flip };
