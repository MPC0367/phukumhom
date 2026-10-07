"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/components/ui/cx";
import { NavLink } from "./NavLink";
import { FOOTER_ID } from "./ids";
import type { NavItem } from "./nav";
import styles from "./MobileMenu.module.css";

/**
 * The menu of the narrow header (narrower than 72rem of its own width): a "Menu" button (the word and
 * an icon) that opens a full-screen forest sheet (ui/Dialog, variant "full").
 *
 * Inside: the wordmark and a Close button where the Menu button was; the four main pages set large in
 * the display serif (Noto Serif Thai on Thai pages), numbered, each on a hairline; the Explore pages
 * in the sans; the booking pill; Call and the map link; the language switch and the resort's clock;
 * and, where the screen is tall enough to leave room, the giant wordmark along the foot.
 * From 48rem the sheet is two columns: the main pages on the left, everything else on the right.
 *
 * Motion: the sheet comes down like a blind and its rows rise in turn (CSS only, so it runs on the
 * compositor while React works; nothing moves under reduced motion). A closed dialog is not displayed,
 * so none of it can hide anything from a page without script.
 *
 * Behaviour:
 *   - the native modal dialog keeps focus inside and makes the page behind inert;
 *   - focus moves to Close on opening, and back to the Menu button on closing;
 *   - Escape closes; following any link inside closes (the booking pill then opens the planner
 *     drawer, and focus comes back to the Menu button when that closes); arriving on another page
 *     closes (the open state is stored with the pathname it was opened on); the header growing wide
 *     enough to show its own navigation closes;
 *   - ui/Dialog announces the overlay, so smooth scrolling stops and the phone action bar hides;
 *   - nothing depends on hover.
 *
 * The parts that need the string tables arrive already rendered from the server header (`brand`,
 * `booking`, `contact`, `language`, `clock`, `mark`), so this island carries only its own logic.
 *
 * Without script the button could do nothing, so it is replaced (inside <noscript>) by a plain link
 * of the same appearance to the footer, where every one of these pages is listed.
 */
export interface MobileMenuProps {
  labels: {
    /** Visible word on the button, and the dialog's name. */
    menu: string;
    /** Visible word on the close button. */
    close: string;
    /** Accessible name of the close button ("Close menu"). */
    closeMenu: string;
    /** Name of the navigation landmark that holds the main pages. */
    nav: string;
    /** Name of the second list ("More pages"). */
    more: string;
  };
  /** The four main pages: set large. */
  primary: NavItem[];
  /** The Explore pages: set smaller, two to a row. */
  more: NavItem[];
  brand: ReactNode;
  booking: ReactNode;
  contact: ReactNode;
  language: ReactNode;
  /** The resort's live clock, or nothing. */
  clock?: ReactNode;
  /** The giant wordmark that closes the sheet on a tall screen (decoration), or nothing. */
  mark?: ReactNode;
}

/** Position in the entrance: each row rises a moment after the one before it. */
const order = (index: number) => ({ "--i": index }) as CSSProperties;

export function MobileMenu({ labels, primary, more, brand, booking, contact, language, clock, mark }: MobileMenuProps) {
  const pathname = usePathname();
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt !== null && openAt === pathname;
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpenAt(null), []);

  // Runs after the Dialog's own effect has opened it: put focus on the control that undoes the opening.
  useEffect(() => {
    if (open) closeButton.current?.focus({ preventScroll: true });
  }, [open]);

  // The menu belongs to the narrow header. When the header becomes wide enough for its own navigation
  // the stylesheet stops displaying the Menu button; that is the moment to let go of the page. Asking
  // the button, rather than repeating the breakpoint here, keeps the two from ever disagreeing.
  useEffect(() => {
    if (!open) return;
    const onResize = () => {
      if (trigger.current && trigger.current.getClientRects().length === 0) close();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open, close]);

  function openMenu(event: MouseEvent<HTMLButtonElement>) {
    // Safari does not focus a button on click; focus it so the dialog knows where to return to.
    event.currentTarget.focus({ preventScroll: true });
    setOpenAt(pathname);
  }

  /** Any link followed inside the sheet closes it, including one to the page already open. */
  function handleSheetClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target instanceof Element && event.target.closest("a[href]")) close();
  }

  const after = primary.length;

  return (
    <>
      <button ref={trigger} type="button" className={styles.trigger} aria-haspopup="dialog" aria-expanded={open} onClick={openMenu}>
        <span>{labels.menu}</span>
        <Icon name="menu" size={22} className={styles.triggerIcon} />
      </button>
      <noscript>
        <a href={`#${FOOTER_ID}`} className={styles.fallback}>
          <span>{labels.menu}</span>
          <Icon name="menu" size={22} />
        </a>
        <style dangerouslySetInnerHTML={{ __html: `button[class~="${styles.trigger}"]{display:none}` }} />
      </noscript>
      <Dialog open={open} onClose={close} label={labels.menu} variant="full" className={styles.dialog}>
        <div className={cx("on-forest", styles.sheet)} onClick={handleSheetClick}>
          <div className={cx("container", styles.top)}>
            {brand}
            <button ref={closeButton} type="button" className={styles.close} aria-label={labels.closeMenu} onClick={close}>
              <span>{labels.close}</span>
              <Icon name="close" size={22} className={styles.closeIcon} />
            </button>
          </div>
          <div className={cx("container", styles.body)}>
            <nav aria-label={labels.nav} className={styles.primary}>
              <ul role="list" className={styles.majorList}>
                {primary.map((item, index) => (
                  <li key={item.id} className={cx(styles.major, styles.rise)} style={order(index)}>
                    <NavLink href={item.href} path={item.path} className={styles.majorLink}>
                      <span className={cx("numeral", styles.majorNumber)} aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className={styles.majorLabel}>{item.label}</span>
                      <Icon name="arrow-right" size={24} className={styles.majorArrow} />
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
            <div className={styles.side}>
              <nav aria-label={labels.more} className={cx(styles.rise, styles.moreNav)} style={order(after)}>
                <ul role="list" className={styles.minorList}>
                  {more.map((item) => (
                    <li key={item.id}>
                      <NavLink href={item.href} path={item.path} className={styles.minorLink}>
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className={cx(styles.actions, styles.rise)} style={order(after + 1)}>
                {booking}
                {contact}
              </div>
              <div className={cx(styles.foot, styles.rise)} style={order(after + 2)}>
                {language}
                {clock ? <p className={styles.clock}>{clock}</p> : null}
              </div>
            </div>
          </div>
          {mark ? (
            <div className={cx("container", styles.mark, styles.rise)} style={order(after + 3)}>
              {mark}
            </div>
          ) : null}
        </div>
      </Dialog>
    </>
  );
}
