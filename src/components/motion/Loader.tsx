"use client";

import { useEffect, useSyncExternalStore, type CSSProperties } from "react";
import { announceLoaderSkipped } from "./loader-bus";
import styles from "./Loader.module.css";

/**
 * The first impression of a hard load: a paper screen, the wordmark's letters rising out of their
 * masks, a horizon line drawing while a counter runs 0 to 100, then the screen lifts like a blind.
 *
 *   <body>
 *     <Loader wordmark="PHUKUMHOM" sub={…} label={…} />     first in <body>, once, in the layout
 *
 * `wordmark` is split into letters only when it is Latin; `sub` is the small line beneath the horizon;
 * `label` names the screen for assistive technology.
 *
 * HOW IT STAYS OUT OF THE WAY
 * The markup is in the server's HTML but carries `hidden`, so with JavaScript off it is never shown.
 * A few lines of inline script, placed right after it, switch it on before the first paint, and only
 * when motion is welcome. Under prefers-reduced-motion it is never shown at all.
 *
 * WHY THE ANIMATION IS CSS
 * The loader exists to cover the moment the page hydrates, which is exactly when the main thread is
 * busiest. Its movement is CSS keyframes on transform and clip-path, so it runs on the compositor and
 * stays smooth while React works. Only the counter is script.
 *
 * TIMING
 * The page is in view about 1.8s after a first hard load of a session and about 0.9s after later ones
 * (sessionStorage); the last sliver of the blind is gone a moment after that. The blind
 * lifts as soon as its minimum time is up AND the page has hydrated; if hydration is slow, or never
 * comes, the inline script lifts it anyway so that it is gone by 3s. Nothing here can hold a page hostage.
 *
 * WHAT IT TELLS THE PAGE
 * window "pkh:loader-done" as the blind starts to lift (so the hero's entrance overlaps the reveal).
 * When the loader is skipped, the same event fires just after mount. Use onLoaderDone() rather than
 * the raw event: it also answers when the loader finished before you asked.
 */

export interface LoaderProps {
  /** The wordmark, for example "PHUKUMHOM". */
  wordmark: string;
  /** The line beneath it, for example "Resort Khao Yai". */
  sub: string;
  /** Accessible name of the loading screen, for example "Loading". */
  label: string;
}

/*
 * Runs while the document is still being parsed, straight after the loader's element. ES5 on purpose.
 * MIN is the earliest the lift may start, LIFT its length (kept in step with --lift in the stylesheet),
 * COUNT the counter's run, CAP the moment by which the loader is gone whatever happens.
 */
const BOOT = `(function(){
var w=window,d=document,s=d.currentScript,el=s&&s.previousElementSibling;
if(!el||!el.hasAttribute('data-pkh-loader')||w.__pkhLoader)return;
try{if(w.matchMedia('(prefers-reduced-motion: reduce)').matches)return}catch(e){return}
var seen=false;
try{seen=w.sessionStorage.getItem('pkh:seen')==='1';w.sessionStorage.setItem('pkh:seen','1')}catch(e){}
var MIN=seen?380:1100,LIFT=seen?480:700,COUNT=seen?360:1000,CAP=3000;
var state={done:false},lifted=false,fired=false,closed=false,hydrated=false,t0=w.performance.now();
w.__pkhLoader=state;
el.setAttribute('data-visit',seen?'repeat':'first');
el.hidden=false;
var count=el.querySelector('[data-count]');
function tick(now){
var p=Math.min(1,Math.max(0,(now-t0)/COUNT)),e=p<0.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
if(count&&!lifted)count.textContent=String(Math.round(e*100));
if(p<1&&!lifted)w.requestAnimationFrame(tick);
}
w.requestAnimationFrame(tick);
function fire(){if(fired)return;fired=true;state.done=true;w.dispatchEvent(new CustomEvent('pkh:loader-done'))}
function close(){if(closed)return;closed=true;el.hidden=true;el.setAttribute('data-state','done');fire()}
function lift(){if(lifted)return;lifted=true;if(count)count.textContent='100';el.setAttribute('data-state','out');w.setTimeout(fire,140);w.setTimeout(close,LIFT+140)}
state.ready=function(){if(hydrated)return;hydrated=true;var wait=MIN-(w.performance.now()-t0);if(wait>0)w.setTimeout(lift,wait);else lift()};
w.setTimeout(lift,CAP-LIFT-180);
w.setTimeout(close,CAP);
})();`;

const subscribeNever = () => () => {};
const LATIN = /^[ -~]+$/;

export function Loader({ wordmark, sub, label }: LoaderProps) {
  // False on the server and while hydrating, true ever after: the boot script belongs to the server's
  // HTML only. React removes it once it has run, and never creates it on the client.
  const hydrated = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

  useEffect(() => {
    const state = window.__pkhLoader;
    if (!state) announceLoaderSkipped();
    else if (!state.done) state.ready?.();
  }, []);

  // Latin letters rise one by one. Any other script (Thai) is never cut into characters: it rises whole.
  const pieces = LATIN.test(wordmark) ? Array.from(wordmark) : [wordmark];

  return (
    <>
      <div data-pkh-loader="" className={styles.loader} role="status" aria-label={label} hidden suppressHydrationWarning>
        <div className={styles.veil} aria-hidden="true" />
        <div className={styles.sheet} aria-hidden="true">
          <div className={styles.upper}>
            <p className={styles.wordmark} lang={pieces.length > 1 ? "en" : undefined}>
              {pieces.map((piece, i) => (
                <span key={i} className={piece === " " ? styles.space : styles.clip}>
                  <span className={styles.letter} style={{ "--i": i } as CSSProperties}>
                    {piece}
                  </span>
                </span>
              ))}
            </p>
          </div>
          <div className={styles.horizon}>
            <span className={styles.horizonFill} />
          </div>
          <div className={styles.lower}>
            <p className={styles.sub}>{sub}</p>
            <p className={styles.count} data-count="" suppressHydrationWarning>
              0
            </p>
          </div>
        </div>
      </div>
      {hydrated ? null : <script dangerouslySetInnerHTML={{ __html: BOOT }} />}
    </>
  );
}
