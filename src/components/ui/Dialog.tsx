"use client";

import type { ReactNode } from "react";
import { cx } from "./cx";
import { useModal } from "./useModal";
import styles from "./Dialog.module.css";

/**
 * A modal dialog on the native <dialog> element, opened with showModal().
 *
 * The platform does the hard parts: everything behind it is inert, Tab stays inside, Escape asks to
 * close. useModal adds what the platform leaves out: a click on the backdrop closes, the page behind
 * stops scrolling, focus goes back to whatever opened the dialog, and window "pkh:overlay" is dispatched
 * on open and close.
 *
 *   variant="sheet"  a rounded panel: centred from 40rem up, rising from the bottom edge on phones
 *   variant="full"   the whole viewport on paper: the mobile menu
 *
 * For a side panel use <Drawer>; for photographs use the lightbox.
 * Name it with `labelledBy` (the id of a heading inside) or `label`.
 * Always give the guest a visible way out: put a close <Button> inside.
 *
 * USING IT. `onClose` is a function, and a function cannot be passed from a Server Component to a Client
 * Component (Next 16 answers with a 500). So the open/closed state lives in a small client parent that
 * owns the trigger, and the server page passes that parent data and already-rendered children:
 *
 *   // components/room/AskSheet.tsx
 *   "use client";
 *   import { useState, type ReactNode } from "react";
 *   import { Button } from "@/components/ui/Button";
 *   import { Dialog } from "@/components/ui/Dialog";
 *
 *   export function AskSheet({ openLabel, closeLabel, title, children }:
 *     { openLabel: string; closeLabel: string; title: string; children: ReactNode }) {
 *     const [open, setOpen] = useState(false);
 *     return (
 *       <>
 *         <Button variant="secondary" aria-haspopup="dialog" onClick={() => setOpen(true)}>{openLabel}</Button>
 *         <Dialog open={open} onClose={() => setOpen(false)} labelledBy="ask-sheet-title">
 *           <h2 id="ask-sheet-title" className="h3">{title}</h2>
 *           {children}
 *           <Button variant="quiet" onClick={() => setOpen(false)}>{closeLabel}</Button>
 *         </Dialog>
 *       </>
 *     );
 *   }
 *
 *   // app/[lang]/stay/[room]/page.tsx: a Server Component passes strings and rendered elements only
 *   <AskSheet openLabel={ui.actions.askAboutRoom} closeLabel={ui.actions.close} title={room.name}>
 *     <p className="body">{…}</p>
 *   </AskSheet>
 *
 * The children are in the HTML from the start (a closed <dialog> is simply not displayed), so what the
 * dialog shows must also be reachable on the page for a visitor without JavaScript.
 */

export interface DialogProps {
  open: boolean;
  /** Called when the guest asks to close: Escape, a click on the backdrop, or a form[method=dialog] inside. */
  onClose: () => void;
  /** id of the element inside that titles the dialog. */
  labelledBy?: string;
  /** Accessible name when there is no visible title. */
  label?: string;
  variant?: "sheet" | "full";
  className?: string;
  children: ReactNode;
}

export function Dialog({ open, onClose, labelledBy, label, variant = "sheet", className, children }: DialogProps) {
  const { ref, dialogProps } = useModal(open, onClose);

  return (
    <dialog
      ref={ref}
      data-ground="light"
      className={cx(styles.dialog, styles[variant], className)}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      {...dialogProps}
    >
      <div className={styles.panel} data-lenis-prevent>
        {children}
      </div>
    </dialog>
  );
}
