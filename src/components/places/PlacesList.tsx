"use client";

import { useCallback, useId, useRef, useState, type KeyboardEvent } from "react";
import { useGSAP } from "@gsap/react";
import type { Locale, NearbyPlace } from "@/content/schema";
import { Flip, gsap, ScrollTrigger, watchPending } from "@/components/motion/gsap";
import { useEntrance, type EntranceControl } from "@/components/motion/useEntrance";
import { useMotionActive } from "@/components/motion/useMotion";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { TextLink } from "@/components/ui/TextLink";
import { cx } from "@/components/ui/cx";
import { Phrases } from "./Phrases";
import styles from "./places.module.css";

/**
 * The client half of <PlacesFilter>: the chips, the count and the rows. See PlacesFilter.tsx for what it
 * is and the rules its content follows. It receives plain strings only.
 *
 * STATE. One value, the chosen group ("all" at first, which is also what the server renders). Every row
 * is always in the DOM; a row outside the chosen group carries `hidden`. So the server HTML, the page
 * before hydration and the page without JavaScript are the complete list.
 *
 * THE MOVE (only with the motion provider up and no reduced-motion request)
 *   press     the rows' positions and the list's height are recorded (Flip.getState)
 *   render    React hides and shows rows
 *   after     Flip.from: rows that stay slide to their new place; rows that leave are lifted out of the
 *             flow and fade; rows that arrive rise in, a beat later; the list's height eases from the
 *             old value to the new one, so whatever follows the list glides instead of jumping.
 * A second press while a move is running finishes the first at once and starts again from there.
 *
 * THE ENTRANCE. When the block scrolls in, the chips rise in turn. Then each row arrives on its own as it
 * comes up the screen: its hairline draws from the left and its words rise after it. Wrappers inside the
 * rows are animated, never the rows themselves, so an entrance cannot collide with a filter move; and a
 * filter press first shows every row that is still waiting. It is armed through useEntrance, which is what
 * keeps it honest: nothing is hidden on the server, before hydration, in view on arrival, or under
 * reduced motion, and each waiting row is watched so that it cannot stay hidden (focus, print, a row
 * that rests on screen short of its line).
 */

type Group = NearbyPlace["group"];
type Filter = Group | "all";

export interface NamePart {
  text: string;
  /** A Latin run inside a Thai name: marked lang="en" and set in the English display face. */
  latin: boolean;
}

export interface PlaceRow {
  id: string;
  group: Group;
  kind: string;
  name: NamePart[];
  blurb: string;
  url: string;
  linkLabel: string;
}

export interface PlacesListProps {
  lang: Locale;
  rows: PlaceRow[];
  groups: { id: Group; label: string }[];
  labels: {
    heading: string;
    filterLabel: string;
    all: string;
    count: { one: string; other: string };
    newTab: string;
    note: string;
  };
  headingLevel: 3 | 4;
  className?: string;
}

const MOVE = { duration: 0.7, ease: "power3.inOut" } as const;

export function PlacesList({ lang, rows, groups, labels, headingLevel, className }: PlacesListProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const active = useMotionActive();
  const listId = useId();

  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const figure = useRef<HTMLSpanElement>(null);
  /** What the list looked like at the moment a chip was pressed. Read once, by the effect that follows the render. */
  const before = useRef<{ state: Flip.FlipState; height: number } | null>(null);
  const moving = useRef<gsap.core.Timeline | null>(null);
  /** Shows, at once, every row whose entrance has not run yet. Set by the entrance; called before a filter move. */
  const settleRows = useRef<(() => void) | null>(null);

  const shown = rows.filter((row) => filter === "all" || row.group === filter);
  const count = shown.length;
  const [countLead, countTail = ""] = (count === 1 ? labels.count.one : labels.count.other).split("{count}");
  const Heading = headingLevel === 4 ? "h4" : "h3";
  const hasFilter = groups.length > 1;

  function select(next: Filter) {
    if (next === filter) return;
    const ul = list.current;
    // A row still waiting for its entrance is shown now: the filter must never leave a place invisible.
    settleRows.current?.();
    if (active && ul) {
      // A move still running is taken straight to its end: the next one starts from a settled list.
      const running = moving.current;
      if (running) {
        running.progress(1);
        running.kill();
        moving.current = null;
      }
      const items = Array.from(ul.children);
      gsap.set(items, { clearProps: "opacity,transform" });
      gsap.set(ul, { clearProps: "height,overflow" });
      before.current = { state: Flip.getState(items), height: ul.offsetHeight };
    }
    setFilter(next);
  }

  useGSAP(
    () => {
      const from = before.current;
      before.current = null;
      const ul = list.current;
      if (!from || !ul) return;

      const to = ul.offsetHeight;
      const settle = () => {
        gsap.set(ul, { clearProps: "height,overflow" });
        moving.current = null;
      };

      const timeline = Flip.from(from.state, {
        ...MOVE,
        absoluteOnLeave: true,
        prune: true,
        onEnter: (elements) =>
          gsap.fromTo(
            elements,
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.07, delay: 0.22, clearProps: "opacity,transform" },
          ),
        // Relative: Flip holds a lifted row in its old place with a transform of its own, which must be kept.
        onLeave: (elements) => gsap.to(elements, { opacity: 0, y: "-=14", duration: 0.32, ease: "power2.out" }),
      });
      // The list keeps its old height for the first frame and eases to the new one: nothing below it jumps.
      // While it moves it clips, so a row on its way out or in never overlaps what follows the list.
      gsap.set(ul, { overflow: "clip" });
      timeline.fromTo(ul, { height: from.height }, { height: to, ...MOVE }, 0);
      timeline.eventCallback("onComplete", settle);
      moving.current = timeline;

      // The count rolls over: the new figure rises into its place.
      if (figure.current) {
        gsap.fromTo(figure.current, { yPercent: 80, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: "power3.out", clearProps: "transform,opacity" });
      }
    },
    { dependencies: [filter], scope: root },
  );

  const build = useCallback((el: HTMLElement): EntranceControl => {
    // The toolbar arrives with the block.
    const chips = el.querySelectorAll("[data-places-chip]");
    const tally = el.querySelector("[data-places-count]");
    const toolbar = gsap.timeline({ paused: true });
    if (chips.length > 0) {
      toolbar.fromTo(chips, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.05, clearProps: "transform,opacity" }, 0);
    }
    if (tally) toolbar.fromTo(tally, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: "power2.out", clearProps: "opacity" }, 0.25);

    // Each row arrives on its own, as it comes up the screen: its hairline draws, then its words rise.
    const pending: Array<(instant?: boolean) => void> = [];
    const arrive = (trigger: Element, line: Element | null, words: Element | null) => {
      const timeline = gsap.timeline({ paused: true });
      if (line) {
        timeline.fromTo(line, { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 1.2, ease: "expo.out", clearProps: "transform,transformOrigin" }, 0);
      }
      if (words) timeline.fromTo(words, { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", clearProps: "transform,opacity" }, 0.1);

      let done = false;
      let stopWatching = () => {};
      const armed: { scroll?: ScrollTrigger } = {};
      const reveal = (instant = false) => {
        if (done) return;
        done = true;
        armed.scroll?.kill();
        stopWatching();
        if (instant) timeline.progress(1);
        else timeline.play();
      };
      // The trigger is killed when it has fired, when the row is revealed another way, and when the
      // component unmounts (it belongs to the entrance's GSAP context): each time, the safety net lets go.
      armed.scroll = ScrollTrigger.create({ trigger, start: "top 90%", once: true, onEnter: () => reveal(), onKill: () => stopWatching() });
      if (done) return;
      // Nothing armed stays hidden: a row that sits on screen without reaching its line, takes focus, or is printed, is shown.
      stopWatching = watchPending(trigger, reveal);
      pending.push(reveal);
    };

    for (const row of el.querySelectorAll("[data-places-row]")) {
      arrive(row, row.querySelector("[data-places-line]"), row.querySelector("[data-places-body]"));
    }
    const note = el.querySelector("[data-places-note]");
    if (note) arrive(note, el.querySelector("[data-places-end]"), note);

    const settle = () => pending.forEach((reveal) => reveal(true));
    settleRows.current = settle;

    return {
      play: () => toolbar.play(),
      finish: () => {
        toolbar.progress(1);
        settle();
      },
    };
  }, []);

  useEntrance(root, { trigger: "scroll", build });

  /** Left and Right move between the chips; Home and End jump to the ends. Tab still walks through them. */
  function onChipKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
    const at = buttons.findIndex((button) => button === document.activeElement);
    if (at < 0) return;
    event.preventDefault();
    const last = buttons.length - 1;
    const next = event.key === "Home" ? 0 : event.key === "End" ? last : event.key === "ArrowRight" ? (at === last ? 0 : at + 1) : at === 0 ? last : at - 1;
    buttons[next]?.focus();
  }

  return (
    <div ref={root} className={cx(styles.places, className)}>
      {hasFilter ? (
        <div className={styles.toolbar}>
          <div className={styles.chips} role="group" aria-label={labels.filterLabel} onKeyDown={onChipKeys}>
            <span className={styles.chipSlot} data-places-chip>
              <Chip as="button" selected={filter === "all"} aria-controls={listId} onClick={() => select("all")}>
                {labels.all}
              </Chip>
            </span>
            {groups.map((group) => (
              <span key={group.id} className={styles.chipSlot} data-places-chip>
                <Chip as="button" selected={filter === group.id} aria-controls={listId} onClick={() => select(group.id)}>
                  {group.label}
                </Chip>
              </span>
            ))}
          </div>
          <p className={styles.count} role="status" aria-atomic="true" data-places-count>
            {countLead}
            <span className={styles.countMask}>
              <span ref={figure} className={cx("figure", styles.countFigure)}>
                {count}
              </span>
            </span>
            <span className={styles.countWord}>{countTail}</span>
          </p>
          {/* Without script a filter cannot filter: the whole toolbar goes, and every row is there. */}
          <noscript>
            <style dangerouslySetInnerHTML={{ __html: `[class~="${styles.toolbar}"]{display:none}` }} />
          </noscript>
        </div>
      ) : null}

      <ul ref={list} id={listId} role="list" aria-label={labels.heading} className={styles.list}>
        {rows.map((row) => {
          const off = filter !== "all" && row.group !== filter;
          return (
            <li key={row.id} className={styles.row} hidden={off} data-places-row>
              <span aria-hidden="true" className={styles.line} data-places-line />
              <span aria-hidden="true" className={styles.accent} />
              <div className={styles.body} data-places-body>
                <p className={cx("eyebrow", styles.kind)}>{row.kind}</p>
                <div className={styles.main}>
                  <Heading className={cx("h3", styles.name)}>
                    {row.name.map((part, index) =>
                      part.latin ? (
                        <span key={index} lang="en" className={styles.latin}>
                          {part.text}
                        </span>
                      ) : (
                        part.text
                      ),
                    )}
                  </Heading>
                  <p className={styles.blurb}>{row.blurb}</p>
                  <TextLink href={row.url} external variant="arrow" target="_blank" className={styles.link}>
                    <span className="vh">
                      {row.name.map((part) => part.text).join("")}
                      {", "}
                    </span>
                    {row.linkLabel}
                    <span className="vh"> ({labels.newTab})</span>
                  </TextLink>
                </div>
                <span aria-hidden="true" className={styles.badge}>
                  <Icon name="arrow-up-right" size={20} className={styles.badgeIcon} />
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      <span aria-hidden="true" className={styles.endLine} data-places-end />

      <p className={styles.note} lang={lang} data-places-note>
        <Phrases lang={lang} text={labels.note} />
      </p>
    </div>
  );
}
