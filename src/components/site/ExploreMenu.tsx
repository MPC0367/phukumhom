"use client";

import { useCallback, useEffect, useId, useRef, useState, type FocusEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import type { NavItem } from "./nav";
import { ariaCurrent, currentState } from "./nav-state";
import styles from "./Header.module.css";

/**
 * "Explore" in the desktop header: a disclosure, not an ARIA menu — a real <button> with
 * `aria-expanded` that shows and hides a plain list of links, so every item is an ordinary link to
 * Tab through.
 *
 *   opens      on click or Enter / Space (never on hover)
 *   closes     on Escape (focus returns to the button), on a press anywhere outside, when focus
 *              tabs out of it, when one of its links is followed, and on any navigation
 *
 * The open state is remembered together with the pathname it was opened on, so arriving on another
 * page closes it without an effect having to notice the change.
 *
 * Without script the button cannot toggle anything, so a rule inside <noscript> shows the list while
 * focus is on the button or inside the list: Tab reaches every link, and a press on the button opens
 * it in browsers that focus a pressed button. The same pages are in the footer in any case.
 */
export function ExploreMenu({ label, items }: { label: string; items: NavItem[] }) {
  const pathname = usePathname();
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt !== null && openAt === pathname;
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const close = useCallback(() => setOpenAt(null), []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !wrap.current?.contains(event.target)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Hand focus back only if it was inside; a guest who has moved on keeps their place. The button
      // is in the sticky header and so already on screen: the page must not scroll to "reveal" it.
      if (wrap.current?.contains(document.activeElement)) button.current?.focus({ preventScroll: true });
      close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  /**
   * Focus left for somewhere else on the page (Tab past the last link). A blur with no destination is
   * ignored: Safari reports one when a link inside is pressed with a mouse, and closing then would
   * take the link away before the click lands. A press outside is handled above.
   */
  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) close();
  }

  const holdsCurrent = items.some((item) => currentState(pathname, item.path) !== null);

  return (
    <div ref={wrap} className={styles.exploreWrap} onBlur={handleBlur}>
      <button
        ref={button}
        type="button"
        className={styles.exploreButton}
        aria-expanded={open}
        aria-controls={panelId}
        data-current={holdsCurrent ? "true" : undefined}
        onClick={() => setOpenAt(open ? null : pathname)}
      >
        <span>{label}</span>
        <Icon name="chevron-down" size={16} className={styles.chevron} />
      </button>
      <ul id={panelId} role="list" className={styles.explorePanel} hidden={!open}>
        {items.map((item) => (
          <li key={item.id}>
            <Link href={item.href} className={styles.exploreLink} aria-current={ariaCurrent(currentState(pathname, item.path))} onClick={close}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <noscript>
        <style
          dangerouslySetInnerHTML={{
            __html: `[class~="${styles.exploreWrap}"]:focus-within>[class~="${styles.explorePanel}"]{display:block}`,
          }}
        />
      </noscript>
    </div>
  );
}
