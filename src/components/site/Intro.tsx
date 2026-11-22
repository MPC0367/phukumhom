import type { Locale } from "@/content/schema";
import { site } from "@/content/site";
import { IntroScript } from "./IntroScript";
import styles from "./Intro.module.css";

/**
 * The opening: just the logo's text, "PHUKUMHOM / RESORT KHAO YAI", written over the forest-green panel as a
 * hand would write it: a fine line traces each letter left to right, overlapping the next, and each letter
 * inks in just behind it (the studio, 22 Nov 2026: "make it feel as if it is naturally written"). Then the
 * panel lifts away. About 2.6 seconds from first paint to gone.
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
 * rises (at 1.95 s); at 2.7 s the attribute goes and the overlay is display: none again.
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

/*
 * Drawing units for the lockup. The name and the line beneath are fitted to fixed widths with
 * lengthAdjust="spacing" (as GiantWordmark does), which gives the logo's wide tracking in every browser
 * without relying on letter-spacing inside SVG.
 */
const VIEW_W = 900;
const VIEW_H = 190;
const NAME = { y: 104, size: 100, width: 820 };
const SUB = { y: 172, size: 40, width: 500 };

/*
 * The pen. Letters are written left to right, each starting before the one before it has finished, the way
 * a hand moves on: wide letters take a little longer than narrow ones, and each letter inks in just behind
 * its outline. The line beneath follows, quicker and smaller, as the name is finishing.
 */
const WIDE = new Set(["M", "W", "H", "U", "O", "K", "A", "N", "Q", "G", "C", "D"]);
const PEN = {
  name: { start: 0.1, step: 0.085, wide: 0.5, narrow: 0.38, ink: 0.24 },
  sub: { start: 0.9, step: 0.034, wide: 0.34, narrow: 0.27, ink: 0.16 },
};

function Written({ text, pen }: { text: string; pen: (typeof PEN)["name"] }) {
  let at = pen.start;
  return (
    <>
      {Array.from(text).map((letter, i) => {
        if (letter === " ") {
          at += pen.step;
          return " ";
        }
        const write = WIDE.has(letter) ? pen.wide : pen.narrow;
        const style = {
          animationDelay: `${at.toFixed(3)}s, ${(at + write * 0.55).toFixed(3)}s`,
          animationDuration: `${write.toFixed(3)}s, ${(write * 0.9 + pen.ink).toFixed(3)}s`,
        };
        at += pen.step;
        return (
          <tspan key={i} style={style}>
            {letter}
          </tspan>
        );
      })}
    </>
  );
}

export function Intro({ lang }: { lang: Locale }) {
  // The resort's English name in both languages, set as the site's logo is set (Wordmark.tsx): the name
  // large and tracked, "Resort Khao Yai" small and tracked beneath it, both Noto Sans Thai 500 in capitals.
  void lang;
  const [first, ...rest] = site.name.en.split(" ");
  const name = first.toUpperCase();
  const sub = rest.join(" ").toUpperCase();
  return (
    <>
      <div className={styles.intro} aria-hidden="true">
        <svg className={styles.lockup} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} focusable="false">
          <text
            className={styles.name}
            x={(VIEW_W - NAME.width) / 2}
            y={NAME.y}
            fontSize={NAME.size}
            textLength={NAME.width}
            lengthAdjust="spacing"
          >
            <Written text={name} pen={PEN.name} />
          </text>
          <text className={styles.sub} x={(VIEW_W - SUB.width) / 2} y={SUB.y} fontSize={SUB.size} textLength={SUB.width} lengthAdjust="spacing">
            <Written text={sub} pen={PEN.sub} />
          </text>
        </svg>
      </div>
      <IntroScript code={SCRIPT} />
    </>
  );
}
