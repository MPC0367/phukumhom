import type { Locale } from "@/content/schema";
import { t } from "@/i18n/ui";
import { IntroScript } from "./IntroScript";
import styles from "./Intro.module.css";

/**
 * The opening: the wordmark draws itself over a forest-green sky, a small sun rises from behind its
 * horizon line, and the whole panel lifts away. About 1.8 seconds from first paint to gone.
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
 * rises (at 1.15 s); at 1.95 s the attribute goes and the overlay is display: none again.
 *
 * Decorative: aria-hidden. The page's own content is in the document from the start for every reader.
 */

const SCRIPT = `(function(){try{
var d=document.documentElement,w=window;
var n=w.performance&&performance.getEntriesByType?performance.getEntriesByType("navigation")[0]:null;
if(n&&n.type==="back_forward")return;
if(document.referrer){try{if(new URL(document.referrer).origin===location.origin)return;}catch(e){}}
d.setAttribute("data-intro","on");
setTimeout(function(){d.setAttribute("data-intro","lift");try{w.dispatchEvent(new Event("phk:intro-done"));}catch(e){}},1150);
setTimeout(function(){d.removeAttribute("data-intro");},1950);
}catch(e){}})();`;

export function Intro({ lang }: { lang: Locale }) {
  const ui = t(lang);
  const letters = Array.from(ui.wordmark.name);
  return (
    <>
      <div className={styles.intro} aria-hidden="true">
        <div className={styles.inner}>
          <p className={styles.name}>
            {letters.map((letter, i) => (
              <span key={i} className={styles.letter} style={{ animationDelay: `${0.06 + i * 0.045}s` }}>
                {letter}
              </span>
            ))}
          </p>
          <div className={styles.horizon}>
            <span className={styles.sun} />
            <span className={styles.line} />
          </div>
          <p className={styles.sub}>{ui.wordmark.sub}</p>
        </div>
      </div>
      <IntroScript code={SCRIPT} />
    </>
  );
}
