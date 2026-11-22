import { preload } from "react-dom";
import type { CSSProperties } from "react";
import type { Locale } from "@/content/schema";
import { withBase } from "@/lib/base-path";
import { IntroScript } from "./IntroScript";
import styles from "./Intro.module.css";

/**
 * The opening: the mountain logo (three mountain lines over PHUKUMHOM / KHAO YAI, supplied by the studio on
 * 22 Nov 2026) written onto the paper-coloured panel: the mountains first, left to right, then the name,
 * then KHAO YAI, each line uncovered behind a soft edge as if it were being written. Then the panel lifts.
 * About 2.6 seconds from first paint to gone. Used here only, not in the header or footer (the studio's call).
 *
 * The logo is public/brand/phukumhom-logo.png: the supplied artwork cut out of its white ground by
 * _qa/logo-prep.mjs, in its own green (rgb 51 68 41), 984 x 331, the artwork centred in the file. It is shown
 * as three horizontal bands of the same image, stacked, so each line can be written on its own; together
 * they are the logo exactly as drawn.
 *
 * WHY IT DOES NOT HOLD THE PAGE (audit of 8 Oct 2026, finding E removed a loading screen that did):
 * - The page underneath is the normal page, loading at full speed. Nothing waits on the intro: it is not
 *   a "loading" gate, it never waits for photographs or a timer of its own before the page can be used.
 * - The lift is a CSS animation of transform alone, so it finishes on time even while the page's script
 *   is still starting on a slow phone. pointer-events: none, so it never swallows a tap.
 * - It plays when a page is opened or reloaded. It does not play on Back or Forward, when coming from
 *   another page of this site, or without JavaScript. Under prefers-reduced-motion a still version plays:
 *   nothing moves, the panel simply fades. Nothing is stored in the browser to decide any of this (the
 *   privacy page promises only the language cookie).
 *
 * HOW. The overlay is in the server's HTML, display: none. The tiny script right after it (IntroScript: in the
 * first document only, never created again by React in the browser) runs before anything below it is
 * painted and sets html[data-intro="on"], which shows it. At 1.95 s it switches to "lift" and fires
 * `phk:intro-done`, so the homepage hero's entrance (loader-bus.ts) plays as the panel rises; at 2.7 s the
 * attribute goes and the overlay is display: none again.
 *
 * Decorative: aria-hidden. The page's own content is in the document from the start for every reader.
 */

const SCRIPT = `(function(){try{
var d=document.documentElement,w=window;
var n=w.performance&&performance.getEntriesByType?performance.getEntriesByType("navigation")[0]:null;
if(n&&n.type==="back_forward")return;
if(document.referrer){try{if(new URL(document.referrer).origin===location.origin)return;}catch(e){}}
d.setAttribute("data-intro","on");
setTimeout(function(){d.setAttribute("data-intro","lift");try{w.dispatchEvent(new Event("phk:intro-done"));}catch(e){}},1950);
setTimeout(function(){d.removeAttribute("data-intro");},2700);
}catch(e){}})();`;

const LOGO = { src: "/brand/phukumhom-logo.png", width: 984, height: 331 };

/**
 * The three lines of the logo as rows of the image, split in the empty space between them (the artwork's
 * rows: mountains 4 to 148, PHUKUMHOM 188 to 256, KHAO YAI 296 to 326). Each band is written in turn.
 */
const BANDS = [
  { name: "mountains", top: 0, bottom: 168 },
  { name: "name", top: 168, bottom: 276 },
  { name: "place", top: 276, bottom: LOGO.height },
] as const;

export function Intro({ lang }: { lang: Locale }) {
  void lang; // the logo is the same in both languages
  const src = withBase(LOGO.src);
  // Fetched at once with the page, so the logo is there when the writing starts.
  preload(src, { as: "image", fetchPriority: "high" });
  return (
    <>
      <div className={styles.intro} aria-hidden="true">
        <div className={styles.logo}>
          {BANDS.map((band) => {
            const height = band.bottom - band.top;
            // The band shows its own rows of the full image: background-size is the image at the band's width,
            // and the vertical position puts row `top` at the band's top edge.
            const spare = LOGO.height - height;
            const style: CSSProperties = {
              aspectRatio: `${LOGO.width} / ${height}`,
              backgroundImage: `url(${src})`,
              backgroundPosition: `0 ${spare > 0 ? ((band.top / spare) * 100).toFixed(4) : 0}%`,
            };
            return <div key={band.name} data-band={band.name} className={styles.band} style={style} />;
          })}
        </div>
      </div>
      <IntroScript code={SCRIPT} />
    </>
  );
}
