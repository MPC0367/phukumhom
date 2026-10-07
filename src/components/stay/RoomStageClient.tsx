"use client";

import { useCallback, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/components/motion/gsap";
import { MediaReveal } from "@/components/motion/MediaReveal";
import { Reveal } from "@/components/motion/Reveal";
import { scrollToTarget } from "@/components/motion/runtime";
import s from "./RoomStage.module.css";

/**
 * The interactive half of the room stage. <RoomStage> (a Server Component) builds everything a guest
 * reads and hands it over as rendered nodes; this island only decides which entry is open and which
 * photograph the stage shows.
 *
 * STATES
 *   server HTML, before hydration, JavaScript off
 *       every entry is expanded and shows its own photograph; the stage is not displayed. Nothing is hidden.
 *   live (data-enhanced on the root)
 *       one entry is open; the others are collapsed by CSS keyed on that attribute, which only script
 *       sets. Where the root is at least 38rem wide the photographs inside the entries give way to the
 *       sticky stage beside the list; narrower, it is an accordion with the photographs inside.
 *
 * MOTION
 *   - the open panel eases its height (grid-template-rows 0fr to 1fr) and its content settles in, chips
 *     last and a beat apart. Transitions are switched on by the first interaction (data-animate), so the
 *     collapse that happens at hydration is not animated.
 *   - the stage dissolves to the selected room's photograph in 0.7s. The incoming frame is raised above
 *     the others and faded in from whatever opacity it has, so the frames beneath are never seen through
 *     and a second choice made mid-dissolve carries on from where the first one was.
 *   - reduced motion: the photograph changes at once and the CSS durations are 1ms.
 *
 * KEYBOARD
 *   Each header is a <button> inside the room's heading, with aria-expanded and aria-controls.
 *   Up and Down move between headers, Home and End jump to the first and last; Enter and Space toggle.
 *
 * SCROLL
 *   In the accordion, opening an entry closes the one above it and the page would slide the pressed
 *   header out of view. The island works out where the header will come to rest and glides the page so
 *   it stays just under the site header.
 */

export interface StageEntry {
  /** The room id. */
  id: string;
  /** "01". */
  numeral: string;
  /** The room name as the heading shows it, rendered by the server. */
  name: ReactNode;
  /** The short line under the name. */
  sub?: string;
  /** Everything inside the entry's panel, rendered by the server. */
  panel: ReactNode;
  /** The stage photograph: a <Picture fill>, rendered by the server. */
  photo: ReactNode;
  /** The line under the stage: the room name and what the frame shows. */
  caption: ReactNode;
}

export interface RoomStageClientProps {
  entries: StageEntry[];
  /** The id of the entry that is open at first. */
  initial: string;
  /** Accessible name of the list. */
  listLabel: string;
  /** Accessible name of the photograph stage. */
  photoLabel: string;
  /** Heading level of the room names: 3 under a chapter's <h2> (the default), 2 directly under a page title. */
  headingLevel?: 2 | 3;
}

const DISSOLVE = 0.7;

const neverChanges = () => () => {};
const onClient = () => true;
const onServer = () => false;

export function RoomStageClient({ entries, initial, listLabel, photoLabel, headingLevel = 3 }: RoomStageClientProps) {
  const baseId = useId();
  // false on the server and while hydrating, true from then on: the page is enhanced only once script runs.
  const live = useSyncExternalStore(neverChanges, onClient, onServer);
  const [state, setState] = useState({ selected: initial, open: true, touched: false });

  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  /** The photograph the stage is showing; null until the first pass has adopted the server's markup. */
  const shown = useRef<string | null>(null);
  /** Stacking order of the frame brought forward last. */
  const top = useRef(1);

  const Heading = `h${headingLevel}` as "h2" | "h3";
  const position = Math.max(
    0,
    entries.findIndex((entry) => entry.id === state.selected),
  );
  const current = entries[position];

  /* ── The stage follows the selection ── */

  useGSAP(
    () => {
      const box = stage.current;
      if (!box || !live) return;
      const layers = Array.from(box.querySelectorAll<HTMLElement>("[data-layer]"));
      const next = layers.find((layer) => layer.dataset.layer === state.selected);
      if (!next) return;
      const others = layers.filter((layer) => layer !== next);

      // First pass: adopt what the stylesheet already shows. Nothing moves.
      if (shown.current === null || shown.current === state.selected) {
        shown.current = state.selected;
        return;
      }
      shown.current = state.selected;

      gsap.killTweensOf(layers);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        gsap.set(others, { opacity: 0 });
        gsap.set(next, { opacity: 1 });
        return;
      }

      const from = Number(gsap.getProperty(next, "opacity"));
      if (from > 0.99) {
        // It is already fully there, underneath a frame that was on its way in: let that one go.
        gsap.to(others, { opacity: 0, duration: DISSOLVE, ease: "power2.inOut" });
        return;
      }

      top.current += 1;
      gsap.set(next, { zIndex: top.current });
      gsap.to(next, {
        opacity: 1,
        duration: DISSOLVE * (1 - from),
        ease: "power2.inOut",
        onComplete: () => gsap.set(others, { opacity: 0 }),
      });
      // The frame comes to rest as it arrives. Only when it starts from hidden: a restart would jolt.
      const picture = next.firstElementChild;
      if (picture && from < 0.2) {
        gsap.fromTo(picture, { scale: 1.07 }, { scale: 1, duration: 1.4, ease: "power3.out", overwrite: true, clearProps: "transform" });
      }
    },
    { dependencies: [state.selected, live] },
  );

  /* ── Choosing ── */

  /** Where the pressed header will rest once the panels above it have closed; glide the page if that is out of view. */
  const keepInView = useCallback((id: string) => {
    const box = root.current;
    if (!box) return;
    const heads = Array.from(box.querySelectorAll<HTMLElement>("[data-entry]"));
    const target = heads.find((el) => el.dataset.entry === id);
    if (!target) return;
    let rest = target.getBoundingClientRect().top;
    for (const el of heads) {
      if (el === target) break;
      const panel = el.querySelector<HTMLElement>("[data-panel]");
      if (el.dataset.open === "true" && panel) rest -= panel.getBoundingClientRect().height;
    }
    const clear = parseFloat(window.getComputedStyle(document.documentElement).scrollPaddingTop) || 96;
    if (rest < clear) scrollToTarget(Math.max(0, window.scrollY + rest - clear));
  }, []);

  const choose = useCallback(
    (id: string) => {
      if (state.selected !== id) keepInView(id);
      setState((before) => (before.selected === id ? { ...before, open: !before.open, touched: true } : { selected: id, open: true, touched: true }));
    },
    [keepInView, state.selected],
  );

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
    const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
    const box = root.current;
    if (!box) return;
    const triggers = Array.from(box.querySelectorAll<HTMLButtonElement>("[data-stage-trigger]"));
    const at = triggers.indexOf(event.currentTarget);
    if (at < 0) return;
    event.preventDefault();
    const to = event.key === "Home" ? 0 : event.key === "End" ? triggers.length - 1 : (at + (event.key === "ArrowDown" ? 1 : -1) + triggers.length) % triggers.length;
    triggers[to]?.focus();
  }, []);

  return (
    <div ref={root} className={s.root} data-enhanced={live ? "true" : undefined} data-animate={state.touched ? "true" : undefined}>
      <div className={s.layout}>
        <div role="group" aria-label={listLabel} className={s.listWrap}>
          <Reveal stagger={0.09} className={s.list}>
            {entries.map((entry) => {
              const open = !live || (state.open && state.selected === entry.id);
              const triggerId = `${baseId}-${entry.id}-head`;
              const panelId = `${baseId}-${entry.id}-panel`;
              return (
                <div key={entry.id} className={s.entry} data-entry={entry.id} data-open={open ? "true" : undefined}>
                  <div className={s.head}>
                    <span className={`numeral ${s.num}`} aria-hidden="true">
                      {entry.numeral}
                    </span>
                    <div className={s.titles}>
                      <Heading className={`h2 ${s.name}`}>
                        <button
                          type="button"
                          id={triggerId}
                          className={s.trigger}
                          aria-expanded={open}
                          aria-controls={panelId}
                          data-stage-trigger=""
                          onClick={() => choose(entry.id)}
                          onKeyDown={onKeyDown}
                        >
                          {entry.name}
                        </button>
                      </Heading>
                      {entry.sub ? <p className={s.sub}>{entry.sub}</p> : null}
                    </div>
                    <span className={s.toggle} aria-hidden="true" />
                  </div>
                  <div id={panelId} role="region" aria-labelledby={triggerId} className={s.panel} data-panel="" inert={live && !open ? true : undefined}>
                    <div className={s.panelClip}>{entry.panel}</div>
                  </div>
                </div>
              );
            })}
          </Reveal>
        </div>

        <figure className={s.stage} aria-label={photoLabel}>
          {/* Keyed on `live`: the stage is not displayed until the page is enhanced, and an entrance cannot arm on a box with no size. */}
          <MediaReveal key={live ? "live" : "static"} className={s.stageFrame}>
            <div ref={stage} className={s.stageLayers}>
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className={s.layer}
                  data-layer={entry.id}
                  data-initial={entry.id === initial ? "true" : undefined}
                  aria-hidden={entry.id === state.selected ? undefined : true}
                >
                  {entry.photo}
                </div>
              ))}
            </div>
            <div className={s.stageOverlay} aria-hidden="true">
              <p className={s.count}>
                <span key={current.id} className={`figure ${s.countNow}`}>
                  {current.numeral}
                </span>
                <span className={s.countRule} />
                <span className={s.countOf}>{String(entries.length).padStart(2, "0")}</span>
              </p>
              <span className={s.ticks}>
                {entries.map((entry) => (
                  <span key={entry.id} className={s.tick} data-on={entry.id === state.selected ? "true" : undefined} />
                ))}
              </span>
            </div>
          </MediaReveal>
          <figcaption key={current.id} className={s.stageCaption}>
            {current.caption}
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
