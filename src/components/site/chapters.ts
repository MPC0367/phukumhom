import { MAIN_ID } from "./ids";

/**
 * The chapters of the page being shown, and which one is being read: the data behind <ChapterIndex>.
 *
 * A chapter is any element inside <main> that carries `data-chapter` (ui/Chapter writes it, with
 * `data-chapter-number` and usually an `id`). The page is read once after every navigation
 * (`scanChapters`), and an IntersectionObserver whose root is a thin band a little above the middle of
 * the screen says which chapter is crossing it: that one is current. Between chapters (over a
 * full-bleed band, the hero, the footer) none is.
 *
 * A chapter needs an id to be linked to. One without is given `chapter-<number>` here, once; nothing
 * else about the page is changed.
 *
 * A plain module, read through useSyncExternalStore: the snapshot object is replaced only when
 * something in it changes.
 */

export interface ChapterEntry {
  id: string;
  /** The chapter's kicker: "The setting". */
  label: string;
  /** "01", when the chapter is numbered. */
  number: string | null;
}

export interface ChaptersState {
  chapters: ChapterEntry[];
  /** id of the chapter being read, or null between chapters. */
  current: string | null;
  /**
   * True once the last chapter has gone up past the reading band: what follows (a closing band, the
   * footer) belongs to no chapter, and an index with nothing left to point at steps aside.
   */
  ended: boolean;
}

/** The band a chapter must cross to be "being read": from 38% to 46% of the screen's height. */
const READING_BAND = "-38% 0px -54% 0px";

const EMPTY: ChaptersState = { chapters: [], current: null, ended: false };

type Listener = () => void;

const listeners = new Set<Listener>();
const reading = new Set<Element>();
let state: ChaptersState = EMPTY;
let observer: IntersectionObserver | null = null;
let order: Element[] = [];

function publish(next: ChaptersState): void {
  state = next;
  listeners.forEach((listener) => listener());
}

function sameChapters(a: ChapterEntry[], b: ChapterEntry[]): boolean {
  return a.length === b.length && a.every((entry, i) => entry.id === b[i].id && entry.label === b[i].label && entry.number === b[i].number);
}

function currentId(): string | null {
  // When two chapters touch the band at once, the later one is the one arriving.
  for (let i = order.length - 1; i >= 0; i--) if (reading.has(order[i])) return order[i].id;
  return null;
}

/** Read the page's chapters again. Call after a navigation has put a new page in place. */
export function scanChapters(): void {
  if (typeof document === "undefined" || listeners.size === 0) return;

  const found = Array.from(document.querySelectorAll<HTMLElement>(`#${MAIN_ID} [data-chapter]`)).filter((el) => (el.dataset.chapter ?? "").trim() !== "");
  const chapters = found.map((el, index): ChapterEntry => {
    const number = el.dataset.chapterNumber?.trim() || null;
    if (!el.id) el.id = `chapter-${number ?? index + 1}`;
    return { id: el.id, label: (el.dataset.chapter ?? "").trim(), number };
  });

  const unchanged = sameChapters(chapters, state.chapters) && found.every((el, i) => el === order[i]);
  if (unchanged && observer) return;

  observer?.disconnect();
  observer = null;
  reading.clear();
  order = found;

  if (found.length > 0 && typeof IntersectionObserver !== "undefined") {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) reading.add(entry.target);
          else reading.delete(entry.target);
        }
        const current = currentId();
        // Past the last chapter: none is being read, and the last one is wholly above the band. It is
        // measured on every report rather than taken from the last chapter's own entry, because a jump
        // (the Home key, "Back to top" without smooth scrolling) can leave the foot of the page without
        // the last chapter ever crossing the band, and no entry for it would arrive.
        let ended = false;
        const last = order[order.length - 1];
        if (current === null && last) {
          const bandTop = entries[0]?.rootBounds?.top ?? window.innerHeight * 0.38;
          ended = last.getBoundingClientRect().bottom <= bandTop;
        }
        if (current !== state.current || ended !== state.ended) publish({ chapters: state.chapters, current, ended });
      },
      { rootMargin: READING_BAND },
    );
    for (const el of found) observer.observe(el);
  }

  publish(chapters.length === 0 ? EMPTY : { chapters, current: null, ended: false });
}

export function subscribeChapters(listener: Listener): () => void {
  listeners.add(listener);
  if (listeners.size === 1) scanChapters();
  return () => {
    listeners.delete(listener);
    if (listeners.size > 0) return;
    observer?.disconnect();
    observer = null;
    reading.clear();
    order = [];
    state = EMPTY;
  };
}

export function chaptersNow(): ChaptersState {
  return state;
}

export function chaptersOnServer(): ChaptersState {
  return EMPTY;
}
