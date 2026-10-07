"use client";

import { useCallback, useSyncExternalStore, type CSSProperties, type KeyboardEvent } from "react";
import { Chip } from "@/components/ui/Chip";
import { LightboxRoot, LightboxTrigger } from "@/components/ui/Lightbox";
import { cx } from "@/components/ui/cx";
import type { LightboxItem, LightboxLabels } from "@/components/ui/lightbox-types";
import s from "./GalleryBrowser.module.css";

/**
 * The gallery: filter chips over a wall of photographs, each opening the photograph viewer.
 *
 *   <GalleryBrowser items={…} filters={…} labels={…} viewer={lightboxLabels(lang)} />
 *
 * Everything arrives as plain data from the Server Component (srcsets, sizes, captions, the groups each
 * frame belongs to), so the photograph catalogue never reaches the browser bundle.
 *
 * THE FILTER is the page's query string: /gallery?filter=rooftops. It is read from the address bar
 * (never by the server, so the page stays static), written back with history.replaceState when a chip is
 * pressed, and followed on Back and Forward. An unknown value shows everything. The viewer moves
 * through the photographs that are showing, in the order they are showing.
 *
 * WITHOUT JAVASCRIPT every photograph is there, each a plain link to its largest file, and the chips
 * are not shown: a filter that cannot filter is worse than none.
 *
 * Changing the filter replaces the wall; the frames settle in one after another (CSS, and not at all
 * under reduced motion). Left and Right arrows move between chips; Home and End jump to the ends.
 */

export interface GalleryItem extends LightboxItem {
  /** The groups this frame belongs to. */
  groups: string[];
}

export interface GalleryFilterOption {
  id: string;
  label: string;
  count: number;
}

export interface GalleryBrowserProps {
  items: GalleryItem[];
  /** "all" first, then each group that has photographs. */
  filters: GalleryFilterOption[];
  labels: { filterLabel: string; countOne: string; countMany: string; open: string; gridLabel: string };
  viewer: LightboxLabels;
}

const FILTER_EVENT = "pkh:gallery-filter";
const ALL = "all";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("popstate", onChange);
  window.addEventListener(FILTER_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(FILTER_EVENT, onChange);
  };
}

const filterInAddress = () => new URLSearchParams(window.location.search).get("filter") ?? ALL;
const filterOnServer = () => ALL;
const neverChanges = () => () => {};

/** The widest a frame is laid out, by the number of columns at each width (GalleryBrowser.module.css). */
const SIZES = "(min-width: 80rem) 20rem, (min-width: 48rem) 31vw, 46vw";

export function GalleryBrowser({ items, filters, labels, viewer }: GalleryBrowserProps) {
  const requested = useSyncExternalStore(subscribe, filterInAddress, filterOnServer);
  const live = useSyncExternalStore(
    neverChanges,
    () => true,
    () => false,
  );
  const active = filters.some((option) => option.id === requested) ? requested : ALL;
  const shown = active === ALL ? items : items.filter((item) => item.groups.includes(active));
  const count = (shown.length === 1 ? labels.countOne : labels.countMany).replace("{count}", String(shown.length));

  const choose = useCallback((id: string) => {
    const url = new URL(window.location.href);
    if (id === ALL) url.searchParams.delete("filter");
    else url.searchParams.set("filter", id);
    window.history.replaceState(window.history.state, "", url);
    window.dispatchEvent(new Event(FILTER_EVENT));
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key)) return;
    const chips = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
    const at = chips.indexOf(document.activeElement as HTMLButtonElement);
    if (at < 0) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? chips.length - 1 : (at + (event.key === "ArrowRight" ? 1 : -1) + chips.length) % chips.length;
    chips[next]?.focus();
  };

  return (
    <div className={s.browser}>
      {live && filters.length > 2 ? (
        <div className={s.bar}>
          <div role="group" aria-label={labels.filterLabel} className={s.chips} onKeyDown={onKeyDown}>
            {filters.map((option) => (
              <Chip key={option.id} as="button" selected={option.id === active} onClick={() => choose(option.id)}>
                {option.label}
                <span className={cx("tabular", s.chipCount)}>{option.count}</span>
              </Chip>
            ))}
          </div>
          <p className={cx("small", "muted", "tabular", s.count)} role="status" aria-live="polite">
            {count}
          </p>
        </div>
      ) : null}

      {/* Keyed by the filter: a new wall is a new list, so the viewer's order is always the order on screen. */}
      <LightboxRoot key={active} items={shown} labels={viewer}>
        <ul role="list" aria-label={labels.gridLabel} className={s.wall} data-filtered={active !== ALL ? "true" : undefined}>
          {shown.map((item, index) => (
            <li key={item.id} className={s.cell} style={{ "--i": Math.min(index, 14) } as CSSProperties}>
              <LightboxTrigger index={index} label={labels.open.replace("{caption}", item.caption)} className={s.trigger}>
                <picture className={s.picture} style={{ backgroundColor: item.ground, aspectRatio: `${item.width} / ${item.height}` }}>
                  <source type="image/webp" srcSet={item.webp} sizes={SIZES} />
                  <img className={s.image} src={item.src} srcSet={item.jpg} sizes={SIZES} width={item.width} height={item.height} alt={item.alt} loading={index < 4 ? "eager" : "lazy"} decoding="async" />
                </picture>
              </LightboxTrigger>
              <p className={s.caption}>{item.caption}</p>
            </li>
          ))}
        </ul>
      </LightboxRoot>
    </div>
  );
}
