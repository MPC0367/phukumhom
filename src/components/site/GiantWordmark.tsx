/**
 * The name set giant and fitted to the width of whatever holds it (ART-DIRECTION section 1): the head
 * of the footer, the foot of the mobile menu.
 *
 * HOW IT FITS. One SVG <text> with `textLength` and `lengthAdjust="spacing"`: the browser spreads the
 * letters across exactly that length by adjusting the space between them, so the word spans its box in
 * the web font, in the fallback before it loads and at every width, with no measuring script. The
 * drawing is 1000 units wide. The text box starts 7 units outside it on each side, which is less than
 * the side bearing of the first and last letters, so their strokes stand on the box's edges; the SVG
 * does not clip, and the page gutter is far wider than any overhang, so no letter can be cut at any
 * width. The letter size is chosen so the spacing always opens the word out, as the small wordmark's
 * tracking does.
 *
 * It is decoration: `aria-hidden`. Wherever it is used the resort's name is also there as real text.
 * It takes the colour of its surroundings (currentColor) and the sans family from `className`.
 *
 * A plain component (no "use client", nothing server-only), so a Server Component and a client island
 * can both render it.
 */

/** Drawing units. The viewBox is VIEW_W by VIEW_H; the text runs from INSET to VIEW_W - INSET on the baseline. */
const VIEW_W = 1000;
const VIEW_H = 118;
/** The first and last letters carry side bearing (about a tenth of an em), so the text box starts a little outside the drawing. */
const INSET = -7;
const BASELINE = 103;
const FONT_SIZE = 120;

export function GiantWordmark({ text, className }: { text: string; className?: string }) {
  return (
    <svg className={className} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} aria-hidden="true" focusable="false">
      <text x={INSET} y={BASELINE} fontSize={FONT_SIZE} textLength={VIEW_W - 2 * INSET} lengthAdjust="spacing">
        {text}
      </text>
    </svg>
  );
}
