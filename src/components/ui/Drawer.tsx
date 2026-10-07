"use client";

import type { ReactNode } from "react";
import { cx } from "./cx";
import { Icon } from "./Icon";
import { useModal } from "./useModal";
import styles from "./Drawer.module.css";

/**
 * A panel that slides over the page: from the right on wide screens, up from the bottom edge as a sheet
 * (rounded top, a drag-handle mark) on phones. Built on the native <dialog>, opened with showModal():
 * focus is trapped inside, Escape and a click on the backdrop close it, focus returns to the control
 * that opened it, the page behind stops scrolling, and window "pkh:overlay" { detail: { open } } is
 * dispatched on open and on close.
 *
 *   side="auto"    (default) right-hand drawer from 48rem, bottom sheet below
 *   side="right"   always from the right
 *   side="bottom"  always a bottom sheet (centred and capped at 44rem on wide screens)
 *
 * Name it with `labelledBy` (the id of a heading inside) or `label`.
 * `closeLabel` renders the round close button in the top corner: pass ui.actions.close. Leave it out
 * only if the content brings its own visible way out.
 *
 * THE CLIENT-PARENT PATTERN. `onClose` is a function, and a function cannot cross from a Server
 * Component into a Client Component (Next 16 answers with a 500). So the open state lives in a small
 * client parent that owns the trigger; the server page hands that parent strings and rendered children.
 *
 *   // components/site/PlannerDrawer.tsx
 *   "use client";
 *   import { useState, type ReactNode } from "react";
 *   import { Button } from "@/components/ui/Button";
 *   import { Drawer } from "@/components/ui/Drawer";
 *
 *   export function PlannerDrawer({ label, title, closeLabel, fallbackHref, children }:
 *     { label: string; title: string; closeLabel: string; fallbackHref: string; children: ReactNode }) {
 *     const [open, setOpen] = useState(false);
 *     return (
 *       <>
 *         // A real link, so it works before hydration and with JavaScript off; script turns it into the trigger.
 *         <Button href={fallbackHref} external aria-haspopup="dialog"
 *                 onClick={(event) => { event.preventDefault(); setOpen(true); }}>{label}</Button>
 *         <Drawer open={open} onClose={() => setOpen(false)} labelledBy="planner-title" closeLabel={closeLabel}>
 *           <h2 id="planner-title" className="h3">{title}</h2>
 *           {children}
 *         </Drawer>
 *       </>
 *     );
 *   }
 *
 *   // a Server Component: data and rendered elements only
 *   <PlannerDrawer label={ui.actions.checkAvailability} title={…} closeLabel={ui.actions.close} fallbackHref={bookingHref()}>
 *     <StayPlanner lang={lang} />
 *   </PlannerDrawer>
 *
 * The children are in the HTML from the start (a closed <dialog> is not displayed), so anything the
 * drawer offers must also be reachable without it: the trigger above is a plain link to the same place.
 * The panel is always ink on white (data-ground="light"), wherever it is opened from.
 */

export interface DrawerProps {
  open: boolean;
  /** Called when the guest asks to close: Escape, the backdrop, the close button. */
  onClose: () => void;
  side?: "right" | "bottom" | "auto";
  /** Accessible name when there is no visible title. */
  label?: string;
  /** id of the heading inside that titles the drawer. */
  labelledBy?: string;
  /** Renders the round close button with this accessible name. */
  closeLabel?: string;
  className?: string;
  children: ReactNode;
}

export function Drawer({ open, onClose, side = "auto", label, labelledBy, closeLabel, className, children }: DrawerProps) {
  const { ref, dialogProps } = useModal(open, onClose);

  return (
    <dialog
      ref={ref}
      data-ground="light"
      data-side={side}
      className={cx(styles.drawer, styles[side], className)}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      {...dialogProps}
    >
      <div className={styles.panel} data-lenis-prevent>
        <span className={styles.handle} aria-hidden="true" />
        {closeLabel ? (
          <button type="button" className={styles.close} onClick={onClose} aria-label={closeLabel}>
            <Icon name="x" size={20} />
          </button>
        ) : null}
        <div className={styles.body}>{children}</div>
      </div>
    </dialog>
  );
}
