"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { toast } from "@/components/ui/toast";
import { copyText, selectText } from "./clipboard";
import styles from "./HomeArrive.module.css";

/**
 * The two buttons under the address.
 *
 * COPY ADDRESS puts the address, exactly as printed, on the clipboard. When (and only when) that has
 * happened, the button turns into a tick for a moment (the outline fills, "Copied" rises into the
 * label's place, the tick draws itself) and the toast says "Address copied.". Its accessible name stays
 * "Copy address" throughout; the toast is what a screen reader hears. If the browser refuses the
 * clipboard altogether, nothing is claimed: the address is selected instead, ready for Ctrl or Cmd and C.
 *
 * SHARE LOCATION hands the resort's Google Maps listing to the device's own share sheet where there is
 * one (phones, mostly). Elsewhere, or if the sheet fails, it copies the link and says so. Closing the
 * sheet without sharing is not an error and says nothing.
 *
 * Every string and the two facts (the address, the listing link) arrive as props from the Server
 * Component; nothing is read from the content files here.
 */

/** How long the tick stays before the button is itself again. */
const COPIED_MS = 2600;

export interface AddressActionsProps {
  /** The address as printed. */
  address: string;
  /** id of the element that shows the address, selected when the clipboard is refused. */
  addressId: string;
  /** The resort's Google Maps listing, or null when it is withheld: then there is nothing to share. */
  mapUrl: string | null;
  /** The resort's name, as the title of what is shared. */
  shareTitle: string;
  labels: {
    copy: string;
    copied: string;
    copiedToast: string;
    share: string;
    linkCopiedToast: string;
  };
}

export function AddressActions({ address, addressId, mapUrl, shareTitle, labels }: AddressActionsProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copyAddress() {
    const ok = await copyText(address);
    if (!ok) {
      selectText(addressId);
      return;
    }
    setCopied(true);
    toast(labels.copiedToast);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_MS);
  }

  async function shareLocation() {
    if (!mapUrl) return;
    const data: ShareData = { title: shareTitle, text: address, url: mapUrl };
    if (typeof navigator.share === "function" && (typeof navigator.canShare !== "function" || navigator.canShare(data))) {
      try {
        await navigator.share(data);
        return;
      } catch (error) {
        // The guest closed the sheet: that is a choice, not a failure.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    if (await copyText(mapUrl)) toast(labels.linkCopiedToast);
  }

  return (
    <div className={styles.actions}>
      <Button variant="secondary" onClick={copyAddress} data-copied={copied ? "true" : "false"} className={styles.copy}>
        <span className={styles.copyInner}>
          <span className={styles.swap}>
            <span className={styles.swapRest}>{labels.copy}</span>
            <span className={styles.swapDone} aria-hidden="true">
              {labels.copied}
            </span>
          </span>
          <span className={styles.glyph} aria-hidden="true">
            <Icon name="copy" size={18} className={styles.glyphCopy} />
            <Icon name="check" size={18} className={styles.glyphCheck} />
          </span>
        </span>
      </Button>
      {mapUrl ? (
        <Button variant="ghost" icon="share" onClick={shareLocation}>
          {labels.share}
        </Button>
      ) : null}
    </div>
  );
}
