import type { Locale } from "@/content/schema";
import { site } from "@/content/site";
import { IntroScript } from "./IntroScript";
import styles from "./Intro.module.css";

/**
 * The opening: just text. "Phukumhom Resort Khao Yai" forms letter by letter over the forest-green panel
 * (the studio's choice, 22 Nov 2026), then the panel lifts away. About 2 seconds from first paint to gone.
 *
 * WHY IT DOES NOT HOLD THE PAGE (audit of 8 Oct 2026, finding E removed a loading screen that did):
 * - The page underneath is the normal page, loading at full speed. Nothing waits on the intro: it is not
 *   a "loading" gate, it never waits for photographs or a timer of its own before the page can be used.
 * - The lift is a CSS animation of transform alone, so it finishes on time even while the page's script
 *   is still starting on a slow phone. pointer-events: none, so it never swallows a tap.
 * - It plays when a page is opened or reloaded. It does not play on Back or Forward, when coming from
 *   another page of this site, or without JavaScript. Under prefers-reduced-motion a still version plays:
 *   nothing moves, the panel simply fades. Nothing is stored in the browser to decide any of this (the
 *   privacy page promises only the language cookie). (Changed 22 Nov 2026: the studio could not see it
 *   when it skipped reloads and reduced motion.)
 *
 * HOW. The overlay is in the server's HTML, display: none. The tiny script right after it (IntroScript: in the
 * first document only, never created again by React in the browser) runs before
 * anything below it is painted and sets html[data-intro="on"], which shows it. At 0.85 s it switches to
 * "lift" and fires `phk:intro-done`, so the homepage hero's entrance (loader-bus.ts) plays as the panel
 * rises (at 1.45 s); at 2.2 s the attribute goes and the overlay is display: none again.
 *
 * Decorative: aria-hidden. The page's own content is in the document from the start for every reader.
 */

const SCRIPT = `(function(){try{
var d=document.documentElement,w=window;
var n=w.performance&&performance.getEntriesByType?performance.getEntriesByType("navigation")[0]:null;
if(n&&n.type==="back_forward")return;
if(document.referrer){try{if(new URL(document.referrer).origin===location.origin)return;}catch(e){}}
d.setAttribute("data-intro","on");
setTimeout(function(){d.setAttribute("data-intro","lift");try{w.dispatchEvent(new Event("phk:intro-done"));}catch(e){}},1450);
setTimeout(function(){d.removeAttribute("data-intro");},2200);
}catch(e){}})();`;

/** Seconds between one letter starting to form and the next. */
const STEP = 0.042;

export function Intro({ lang }: { lang: Locale }) {
  // The resort's English name in both languages, as the studio asked: "Phukumhom Resort Khao Yai".
  void lang;
  const words = site.name.en.split(" ");
  let index = 0;
  return (
    <>
      <div className={styles.intro} aria-hidden="true">
        <p className={styles.text}>
          {words.map((word, w) => (
            <span key={w}>
              {w > 0 ? " " : null}
              <span className={styles.word}>
                {Array.from(word).map((letter) => {
                  const delay = 0.08 + index++ * STEP;
                  return (
                    <span key={index} className={styles.letter} style={{ animationDelay: `${delay.toFixed(3)}s` }}>
                      {letter}
                    </span>
                  );
                })}
              </span>
            </span>
          ))}
        </p>
      </div>
      <IntroScript code={SCRIPT} />
    </>
  );
}
