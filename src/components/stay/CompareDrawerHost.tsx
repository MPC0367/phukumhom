"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { Drawer } from "@/components/ui/Drawer";
import s from "./CompareDrawerHost.module.css";

/**
 * The comparison drawer. Mount it once on a page; it opens for any link that carries data-open-compare.
 *
 *   // a Server Component
 *   <Button variant="secondary" href={href(lang, "stay", { hash: "compare" })} data-open-compare="">Compare rooms</Button>
 *   …
 *   <CompareDrawerHost title={ui.actions.compareRooms} intro={…} closeLabel={ui.actions.close}>
 *     <CompareTable lang={lang} />
 *   </CompareDrawerHost>
 *
 * The trigger is a real link to the comparison on the stay page, so before hydration and with
 * JavaScript off it simply goes there. Once this host is live, one listener on the document catches a
 * plain left click (or Enter) on such a link, stops the navigation and opens the drawer instead. A click
 * with a modifier key, a middle click and "open in new tab" are left alone: they still follow the link.
 *
 * The comparison is rendered by the server and passed in as children, so it is in the HTML from the
 * start and no function or catalogue data crosses into this island.
 *
 * <Drawer> does the rest: focus is trapped and returned to the link that opened it, Escape and the
 * backdrop close it, the page behind stops scrolling and window "pkh:overlay" is dispatched. It is a
 * right-hand panel from 48rem (made wide here, so the table has its columns) and a bottom sheet below,
 * where the comparison stacks into one group per room type.
 */

export interface CompareDrawerHostProps {
  /** The drawer's visible title: "Compare rooms". */
  title: string;
  /** One line under the title. */
  intro?: string;
  /** Accessible name of the close button. */
  closeLabel: string;
  children: ReactNode;
}

const TRIGGER = "[data-open-compare]";

export function CompareDrawerHost({ title, intro, closeLabel, children }: CompareDrawerHostProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const trigger = event.target instanceof Element ? event.target.closest(TRIGGER) : null;
      if (!trigger) return;
      // Capture phase, and stopped here: neither the router nor the smooth-scroll anchor handler follows the link.
      event.preventDefault();
      event.stopPropagation();
      setOpen(true);
    };
    document.addEventListener("click", onClick, true);
    // Tell assistive technology what these links now do. Without this host they stay plain links.
    const marked = Array.from(document.querySelectorAll<HTMLElement>(TRIGGER)).filter((el) => !el.hasAttribute("aria-haspopup"));
    for (const el of marked) el.setAttribute("aria-haspopup", "dialog");
    return () => {
      document.removeEventListener("click", onClick, true);
      for (const el of marked) el.removeAttribute("aria-haspopup");
    };
  }, []);

  return (
    <Drawer open={open} onClose={() => setOpen(false)} side="auto" labelledBy={titleId} closeLabel={closeLabel} className={s.drawer}>
      <header className={s.head}>
        <h2 id={titleId} className={`h2 ${s.title}`}>
          {title}
        </h2>
        {intro ? <p className={s.intro}>{intro}</p> : null}
      </header>
      {children}
    </Drawer>
  );
}
