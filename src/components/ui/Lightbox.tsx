"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { preload } from "react-dom";
import { cx } from "./cx";
import { Icon } from "./Icon";
import type { LightboxItem, LightboxLabels } from "./lightbox-types";
import { useModal } from "./useModal";
import styles from "./Lightbox.module.css";

/**
 * The photograph viewer shared by every gallery, reel and room page.
 *
 *   // a Server Component
 *   <LightboxRoot items={lightboxItems(ids, lang)} labels={lightboxLabels(lang)}>
 *     {ids.map((id, i) => (
 *       <LightboxTrigger key={id} index={i} label={`${ui.actions.viewAllPhotos}: ${caption(id)}`}>
 *         <Picture asset={id} lang={lang} ratio="4/3" sizes="…" />
 *       </LightboxTrigger>
 *     ))}
 *   </LightboxRoot>
 *
 * LightboxRoot   holds the list and renders the one dialog. Everything it receives is plain data
 *                (lightbox-items.ts builds it on the server), so no function crosses the boundary.
 * LightboxTrigger  the photograph the guest presses. Before hydration and with JavaScript off it is a
 *                plain link to the largest file; once the page is live the same hit area is a real
 *                <button>. The link/button is a transparent layer over the children, which are never
 *                re-mounted, so a reveal or a reel that has hold of the picture keeps it.
 *
 * The viewer: dark and full-screen on the native <dialog>. The photograph is fitted to the stage with
 * its caption and a "3 / 12" counter; previous and next buttons, Left and Right arrow keys (Home and End
 * jump), a swipe on touch screens, Escape to close, and a strip of thumbnails on wide screens. Focus
 * returns to the trigger that opened it. Photographs load only when shown (the neighbours are preloaded).
 * It dispatches window "pkh:overlay" on open and close.
 */

/* ── Context ── */

interface LightboxApi {
  items: LightboxItem[];
  open: (index: number, trigger: HTMLElement | null) => void;
}

const LightboxContext = createContext<LightboxApi | null>(null);

/** For a custom trigger (a "View all photos" button): `const lightbox = useLightbox(); lightbox?.open(0, event.currentTarget)`. */
export function useLightbox(): LightboxApi | null {
  return useContext(LightboxContext);
}

const fill = (pattern: string, current: number, total: number) => pattern.replace("{current}", String(current)).replace("{total}", String(total));

/** The widest the viewer paints a frame: a fifth over its own pixels, never more. */
const paintedWidth = (item: LightboxItem) => Math.round(item.width * 1.2);
const sizesFor = (item: LightboxItem) => `min(100vw, ${paintedWidth(item)}px)`;

/* ── Root ── */

export interface LightboxRootProps {
  items: LightboxItem[];
  labels: LightboxLabels;
  children: ReactNode;
}

export function LightboxRoot({ items, labels, children }: LightboxRootProps) {
  const [index, setIndex] = useState<number | null>(null);
  const trigger = useRef<HTMLElement | null>(null);

  const open = useCallback(
    (at: number, from: HTMLElement | null) => {
      if (items.length === 0) return;
      trigger.current = from;
      setIndex(Math.min(Math.max(at, 0), items.length - 1));
    },
    [items.length],
  );
  const close = useCallback(() => setIndex(null), []);
  const api = useMemo(() => ({ items, open }), [items, open]);

  return (
    <LightboxContext.Provider value={api}>
      {children}
      <Viewer items={items} labels={labels} index={index} onIndex={setIndex} onClose={close} restoreTo={trigger} />
    </LightboxContext.Provider>
  );
}

/* ── Trigger ── */

export interface LightboxTriggerProps {
  /** Position of this photograph in the `items` given to LightboxRoot. */
  index: number;
  /** Accessible name of the control, in the page language: what opens ("Open photograph: the pond at dusk"). */
  label: string;
  className?: string;
  children: ReactNode;
}

const neverChanges = () => () => {};

export function LightboxTrigger({ index, label, className, children }: LightboxTriggerProps) {
  const lightbox = useContext(LightboxContext);
  // false on the server and for the hydration pass, true from then on: the link becomes a button.
  const live = useSyncExternalStore(
    neverChanges,
    () => true,
    () => false,
  );
  const item = lightbox?.items[index];

  return (
    <div className={cx(styles.trigger, className)}>
      <div className={styles.clip}>{children}</div>
      <span className={styles.badge} aria-hidden="true">
        <Icon name="plus" size={18} />
      </span>
      {live && lightbox ? (
        <button type="button" className={styles.hit} aria-haspopup="dialog" onClick={(event) => lightbox.open(index, event.currentTarget)}>
          <span className="vh">{label}</span>
        </button>
      ) : item ? (
        <a className={styles.hit} href={item.src}>
          <span className="vh">{label}</span>
        </a>
      ) : null}
    </div>
  );
}

/* ── The dialog ── */

interface ViewerProps {
  items: LightboxItem[];
  labels: LightboxLabels;
  index: number | null;
  onIndex: (index: number) => void;
  onClose: () => void;
  restoreTo: RefObject<HTMLElement | null>;
}

/** A horizontal travel of at least this many pixels, and clearly more sideways than up or down, is a swipe. */
const SWIPE_PX = 44;

function Viewer({ items, labels, index, onIndex, onClose, restoreTo }: ViewerProps) {
  const isOpen = index !== null;
  const { ref, dialogProps } = useModal(isOpen, onClose, restoreTo);
  const strip = useRef<HTMLOListElement>(null);
  const press = useRef<{ x: number; y: number } | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  const total = items.length;
  const item = isOpen ? items[index] : undefined;

  const go = useCallback(
    (to: number) => {
      if (total === 0) return;
      const next = ((to % total) + total) % total;
      // Warm the photographs on either side of where we are going, so the next press is instant.
      for (const near of [items[(next + 1) % total], items[(next - 1 + total) % total]]) {
        if (near) preload(near.src, { as: "image", imageSrcSet: near.webp, imageSizes: sizesFor(near), type: "image/webp" });
      }
      onIndex(next);
    },
    [items, onIndex, total],
  );

  // Keep the current thumbnail in view. Scrolls the strip only, never the page.
  useEffect(() => {
    const list = strip.current;
    if (index === null || !list) return;
    const current = list.children[index] as HTMLElement | undefined;
    if (!current) return;
    const left = current.offsetLeft - (list.clientWidth - current.clientWidth) / 2;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollTo({ left, behavior: calm ? "auto" : "smooth" });
  }, [index]);

  function onKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (index === null || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowRight") go(index + 1);
    else if (event.key === "ArrowLeft") go(index - 1);
    else if (event.key === "Home") go(0);
    else if (event.key === "End") go(total - 1);
    else return;
    event.preventDefault();
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    press.current = event.pointerType === "mouse" ? null : { x: event.clientX, y: event.clientY };
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const from = press.current;
    press.current = null;
    if (!from || index === null) return;
    const dx = event.clientX - from.x;
    const dy = event.clientY - from.y;
    if (Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? index + 1 : index - 1);
  }

  function onPointerCancel() {
    press.current = null;
  }

  const many = total > 1;

  return (
    <dialog ref={ref} className={cx("on-twilight", styles.lightbox)} aria-label={labels.viewer} {...dialogProps} onKeyDown={onKeyDown}>
      {item && index !== null ? (
        <div className={styles.layout}>
          <div className={styles.bar}>
            <p className={styles.counter} aria-hidden="true">
              <span className={styles.current}>{index + 1}</span>
              <span className={styles.slash}>/</span>
              <span>{total}</span>
            </p>
            <button type="button" className={styles.round} onClick={onClose} aria-label={labels.close}>
              <Icon name="x" size={20} />
            </button>
          </div>

          <div className={styles.stage} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={onPointerCancel}>
            {failed === item.id ? (
              <p className={styles.failed}>{labels.failed}</p>
            ) : (
              <picture key={item.id} className={styles.picture}>
                <source type="image/webp" srcSet={item.webp} sizes={sizesFor(item)} />
                {/* Pre-encoded derivatives with explicit dimensions, as in <Picture>: the catalogue cannot be imported into a client file. */}
                <img
                  className={styles.image}
                  src={item.src}
                  srcSet={item.jpg}
                  sizes={sizesFor(item)}
                  width={item.width}
                  height={item.height}
                  alt={item.alt}
                  decoding="async"
                  draggable={false}
                  style={{ maxWidth: `min(100%, ${paintedWidth(item)}px)`, backgroundColor: item.ground }}
                  onError={() => setFailed(item.id)}
                />
              </picture>
            )}
          </div>

          <div className={styles.foot}>
            {many ? (
              <button type="button" className={cx(styles.round, styles.previous)} onClick={() => go(index - 1)} aria-label={labels.previous}>
                <Icon name="arrow-left" size={20} />
              </button>
            ) : null}
            <p className={styles.caption}>{item.caption}</p>
            {many ? (
              <button type="button" className={cx(styles.round, styles.next)} onClick={() => go(index + 1)} aria-label={labels.next}>
                <Icon name="arrow-right" size={20} />
              </button>
            ) : null}
          </div>

          {many ? (
            <ol ref={strip} role="list" className={styles.thumbs} data-lenis-prevent>
              {items.map((thumb, i) => (
                <li key={thumb.id} className={styles.thumbItem}>
                  <button
                    type="button"
                    className={styles.thumb}
                    aria-label={fill(labels.count, i + 1, total)}
                    aria-current={i === index ? "true" : undefined}
                    onClick={() => go(i)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- the smallest pre-encoded derivative; decorative, the button is named */}
                    <img src={thumb.thumb} alt="" width={thumb.width} height={thumb.height} loading="lazy" decoding="async" draggable={false} style={{ backgroundColor: thumb.ground }} />
                  </button>
                </li>
              ))}
            </ol>
          ) : null}

          <p className="vh" aria-live="polite" aria-atomic="true">
            {fill(labels.count, index + 1, total)}
          </p>
        </div>
      ) : null}
    </dialog>
  );
}
