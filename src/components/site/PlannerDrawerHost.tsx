"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Drawer } from "@/components/ui/Drawer";
import { OPEN_PLANNER_ATTR } from "./ids";
import styles from "./PlannerDrawer.module.css";

/**
 * The planner drawer and the one listener that opens it from anywhere.
 *
 *   <a href={bookingHref()} data-open-planner>Check availability</a>
 *
 * Any element carrying `data-open-planner` (the header pill, the hero's ghost button, the phone action
 * bar, a room page) is a real link to the booking page. Mounted once in the language layout, this
 * component listens for clicks on the document: a plain click on such an element opens the stay planner
 * in a drawer (right-hand on wide screens, a bottom sheet on phones) instead of leaving. Everything else
 * is left to the browser, so the link still works in every other way:
 *
 *   - a modified click (Ctrl, Cmd, Shift, Alt, the middle button) opens the booking page as the guest asked;
 *   - a click another handler has already cancelled is ignored;
 *   - without script, or before hydration, the link simply goes to the booking page.
 *
 * ui/Drawer brings the modal behaviour: focus is trapped inside, Escape and a click on the backdrop
 * close it, the page behind stops scrolling, the overlay is announced ("pkh:overlay"), and focus
 * returns to the element that opened it. Opened from inside the mobile menu, the menu closes first and
 * focus comes back to its Menu button.
 *
 * It closes when the guest arrives on another page (the open state is stored with the pathname it was
 * opened on) and when a link to a page of this site is followed inside it.
 *
 * The content (title, planner form, reassurance, phone and contact links) is rendered on the server by
 * <PlannerDrawer> and arrives as children.
 */
export interface PlannerDrawerHostProps {
  /** id of the heading inside `children` that names the drawer. */
  titleId: string;
  /** Accessible name of the round close button: ui.actions.close. */
  closeLabel: string;
  children: ReactNode;
}

const TRIGGER = `[${OPEN_PLANNER_ATTR}]`;

export function PlannerDrawerHost({ titleId, closeLabel, children }: PlannerDrawerHostProps) {
  const pathname = usePathname();
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt !== null && openAt === pathname;
  const close = useCallback(() => setOpenAt(null), []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      if (target.closest(TRIGGER)) {
        event.preventDefault();
        setOpenAt(pathname);
        return;
      }

      // A link to a page of this site followed inside the drawer (it may be the page already open).
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (link && link.origin === window.location.origin && link.closest("dialog")?.classList.contains(styles.drawer)) setOpenAt(null);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);

  return (
    <Drawer open={open} onClose={close} side="auto" labelledBy={titleId} closeLabel={closeLabel} className={styles.drawer}>
      {children}
    </Drawer>
  );
}
