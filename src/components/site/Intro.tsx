import { preload } from "react-dom";
import type { CSSProperties } from "react";
import type { Locale } from "@/content/schema";
import { withBase } from "@/lib/base-path";
import { IntroScript } from "./IntroScript";
import styles from "./Intro.module.css";

/**
 * The opening: the text of the studio's logo, PHUKUMHOM / KHAO YAI (supplied 22 Nov 2026; the mountain lines
 * above it were then taken out at the studio's request), written onto the paper-coloured panel: the name
 * first, left to right, then KHAO YAI, each uncovered behind a soft edge as if it were being written. Then
 * the panel lifts. About 2.3 seconds from first paint to gone. Used here only, not in the header or footer (the studio's call).
 *
 * The image is public/brand/phukumhom-wordmark.png: the supplied artwork cut out of its white ground by
 * _qa/logo-prep.mjs, in its own green (rgb 51 68 41), cropped to the two lines of text (984 x 163, centred).
 * It is shown as two horizontal bands of the same image, stacked, so each line can be written on its own;
 * together they are the text exactly as drawn.
 *
 * WHY IT DOES NOT HOLD THE PAGE (audit of 8 Oct 2026, finding E removed a loading screen that did):
 * - The page underneath is the normal page, loading at full speed. Nothing waits on the intro: it is not
 *   a "loading" gate, it never waits for photographs or a timer of its own before the page can be used.
 * - The lift is a CSS animation of transform alone, so it finishes on time even while the page's script
 *   is still starting on a slow phone. pointer-events: none, so it never swallows a tap.
 * - It plays EVERY time the site is opened, on every device (the owner, 28 Nov 2026: "Ensure that the loading
 *   animation always on all devices this is crucial"): a typed address, a link from anywhere else, a reload,
 *   and the hops the static host makes on the way in (the root language chooser at phukumhom.com, an old
 *   2012 .php address forwarded by 404.html, a bare /stay). Until 28 Nov it was skipped whenever the previous
 *   page was on this origin, and those hops are on this origin, so a visitor who typed phukumhom.com never
 *   saw it. It is skipped only on Back or Forward and when the previous page was a real page of this site
 *   (a full page load from /th/… or /en/…, e.g. the language switch), and it cannot run without JavaScript.
 * - Under prefers-reduced-motion the name is still written (an uncovering in place, nothing travels) and the
 *   panel fades instead of lifting. Nothing is stored in the browser to decide any of this (the privacy page
 *   promises only the language cookie).
 *
 * HOW. The overlay is in the server's HTML, display: none. The tiny script right after it (IntroScript: in the
 * first document only, never created again by React in the browser) runs before anything below it is
 * painted and sets html[data-intro="on"], which shows it. At 1.6 s it switches to "lift" and fires
 * `phk:intro-done`, so the homepage hero's entrance (loader-bus.ts) plays as the panel rises; at 2.35 s the
 * attribute goes and the overlay is display: none again.
 *
 * Decorative: aria-hidden. The page's own content is in the document from the start for every reader.
 */

const SCRIPT = `(function(){try{
var d=document.documentElement,w=window;
var n=w.performance&&performance.getEntriesByType?performance.getEntriesByType("navigation")[0]:null,t=n&&n.type;
if(t==="back_forward")return;
if(t!=="reload"&&document.referrer){try{var r=new URL(document.referrer),p=r.pathname;if(r.origin===location.origin&&/\\/(th|en)\\//.test(p)&&!/\\.(php|html?)$/i.test(p)&&p.indexOf("/page-not-found")<0)return;}catch(e){}}
d.setAttribute("data-intro","on");
setTimeout(function(){d.setAttribute("data-intro","lift");try{w.dispatchEvent(new Event("phk:intro-done"));}catch(e){}},1600);
setTimeout(function(){d.removeAttribute("data-intro");},2350);
}catch(e){}})();`;

const LOGO = { src: "/brand/phukumhom-wordmark.png", width: 984, height: 163 };

/**
 * The two lines as rows of the image, split in the empty space between them (PHUKUMHOM is rows 20 to 88,
 * KHAO YAI rows 128 to 158). Each band is written in turn.
 */
const BANDS = [
  { name: "name", top: 0, bottom: 108 },
  { name: "place", top: 108, bottom: LOGO.height },
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
