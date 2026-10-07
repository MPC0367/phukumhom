"use client";

import { useRef, useState, type ReactNode } from "react";
import { Button, type ButtonVariant } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Dialog } from "@/components/ui/Dialog";
import { Drawer } from "@/components/ui/Drawer";
import { toast } from "@/components/ui/toast";
import s from "./styleguide.module.css";

/**
 * The style guide's client islands. Each one is the pattern from the primitive's docblock, in use: a
 * small client parent owns the state and the trigger; the server page hands it strings and rendered
 * children. No function crosses from the server page into these.
 */

/* ── Drawer ── */

export function DrawerDemo({
  id,
  side,
  openLabel,
  closeLabel,
  title,
  variant = "secondary",
  children,
}: {
  id: string;
  side: "auto" | "right" | "bottom";
  openLabel: string;
  closeLabel: string;
  title: string;
  variant?: ButtonVariant;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const titleId = `${id}-title`;
  return (
    <>
      <Button variant={variant} aria-haspopup="dialog" data-demo={id} onClick={() => setOpen(true)}>
        {openLabel}
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} side={side} labelledBy={titleId} closeLabel={closeLabel}>
        <h3 id={titleId} className="h3">
          {title}
        </h3>
        <div className={s.overlayBody}>{children}</div>
      </Drawer>
    </>
  );
}

/* ── Dialog ── */

export function DialogDemo({ id, openLabel, closeLabel, title, children }: { id: string; openLabel: string; closeLabel: string; title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const titleId = `${id}-title`;
  return (
    <>
      <Button variant="secondary" aria-haspopup="dialog" data-demo={id} onClick={() => setOpen(true)}>
        {openLabel}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} labelledBy={titleId}>
        <div className={s.dialogBody}>
          <h3 id={titleId} className="h3">
            {title}
          </h3>
          {children}
          <div>
            <Button variant="quiet" onClick={() => setOpen(false)}>
              {closeLabel}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

/* ── Toast, and the copy button that turns into a tick ── */

export function CopyDemo({ label, text, message }: { label: string; text: string; message: string }) {
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // No clipboard permission (an insecure origin, an old browser): say nothing rather than claim a copy.
      return;
    }
    setDone(true);
    toast(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setDone(false), 2400);
  }

  return (
    <Button variant="secondary" icon={done ? "check" : "copy"} data-demo="copy" onClick={copy}>
      {label}
    </Button>
  );
}

export function ToastDemo({ label, message }: { label: string; message: string }) {
  return (
    <Button variant="quiet" data-demo="toast" onClick={() => toast(message)}>
      {label}
    </Button>
  );
}

/* ── Chips as a filter: one pressed at a time ── */

export function FilterDemo({ label, options }: { label: string; options: { id: string; label: string }[] }) {
  const [selected, setSelected] = useState(options[0]?.id);
  return (
    <div role="group" aria-label={label} className={s.chips}>
      {options.map((option) => (
        <Chip key={option.id} as="button" selected={selected === option.id} onClick={() => setSelected(option.id)}>
          {option.label}
        </Chip>
      ))}
    </div>
  );
}
