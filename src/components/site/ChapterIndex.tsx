"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useOverlayOpen } from "@/components/motion/useOverlayOpen";
import { chaptersNow, chaptersOnServer, scanChapters, subscribeChapters } from "./chapters";
import { useFooterInView, useHeaderOver } from "./shell-signals";
import styles from "./ChapterIndex.module.css";

/**
 * The chapter index (ART-DIRECTION section 7, feature 5): small dots at the right edge of a long page,
 * one for each chapter. Mount once, in the language layout.
 *
 *   - It reads every `[data-chapter]` section inside <main> after each navigation (chapters.ts). ui/Chapter
 *     writes that attribute, with the chapter's number and usually an id.
 *   - Each dot is a real link to its section (`<a href="#story">`): the motion system glides there, and
 *     without smooth scrolling the browser jumps there. The chapter's number and name are the link's
 *     text, shown beside the dot on hover and on keyboard focus.
 *   - The chapter being read is marked `aria-current="true"` and drawn as a short terracotta bar, so it
 *     is never told by colour alone.
 *   - A page with fewer than three chapters gets no index at all.
 *   - It is displayed from 80rem only (the stylesheet), and it steps aside while a hero is behind the
 *     header, once the last chapter has been read past (a closing band belongs to no chapter), while
 *     the footer is on screen and while an overlay is open.
 *
 * `label` names the landmark: ui.a11y.chapterIndex.
 */
export function ChapterIndex({ label }: { label: string }) {
  const pathname = usePathname();
  const { chapters, current, ended } = useSyncExternalStore(subscribeChapters, chaptersNow, chaptersOnServer);
  const heroBehindHeader = useHeaderOver();
  const footerInView = useFooterInView();
  const overlayOpen = useOverlayOpen();

  useEffect(() => {
    scanChapters();
    // Once more when the new page has settled (its entrance has armed, Next has placed the scroll).
    const frame = window.requestAnimationFrame(scanChapters);
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  if (chapters.length < 3) return null;

  const show = heroBehindHeader === false && !ended && !footerInView && !overlayOpen;

  return (
    <nav className={`${styles.index} no-print`} aria-label={label} data-state={show ? "shown" : "hidden"} inert={!show}>
      <ol role="list" className={styles.list}>
        {chapters.map((chapter) => (
          <li key={chapter.id} className={styles.item}>
            <a href={`#${chapter.id}`} className={styles.link} aria-current={chapter.id === current ? "true" : undefined}>
              <span className={styles.mark} aria-hidden="true" />
              <span className={styles.label}>
                {chapter.number ? <span className={styles.number}>{chapter.number}</span> : null}
                <span>{chapter.label}</span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
