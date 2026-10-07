"use client";

import { useEffect, useId, useRef, type MouseEvent } from "react";
import Link from "next/link";
import type { Locale } from "@/content/schema";
import { ANALYTICS_CONFIGURED } from "@/lib/analytics";
import { href } from "@/lib/routes";
import { closeConsentPanel, setConsent, type ConsentChoice } from "./consent";
import { CONSENT_COPY } from "./consent-copy";
import { useConsent, useConsentPanelOpen } from "./useConsent";
import styles from "./ConsentBanner.module.css";

/**
 * The measurement choice. Mount once in the language layout: <ConsentBanner lang={lang} />.
 *
 * Renders NOTHING unless analytics is configured — a site that sets no optional cookies shows no
 * cookie banner. When it is configured:
 *   - it appears after hydration for a visitor with no stored choice, as a small panel that does not
 *     block the page: every link, the booking button and the mobile action bar stay reachable;
 *   - Accept and Reject are two identical buttons; nothing is pre-selected and there is no
 *     "accept by scrolling" — until Accept is pressed, no analytics script is loaded;
 *   - <ConsentSettingsLink> re-opens it at any time, showing the current choice, with a Close
 *     button and Escape to leave things as they are. Focus moves into the panel and returns to the
 *     control that opened it.
 *
 * A choice is only ever taken from a deliberate single activation: the second click of a double-click
 * is ignored, because the panel can open right under the pointer that pressed "Cookie settings".
 */
export function ConsentBanner({ lang }: { lang: Locale }) {
  return ANALYTICS_CONFIGURED ? <ConsentPanel lang={lang} /> : null;
}

function ConsentPanel({ lang }: { lang: Locale }) {
  const consent = useConsent();
  const reopened = useConsentPanelOpen();
  const panel = useRef<HTMLElement>(null);
  const titleId = useId();
  const copy = CONSENT_COPY[lang];

  const current = consent === "granted" || consent === "denied" ? copy.current[consent] : null;
  const showCurrent = reopened && current !== null;
  const visible = consent === "unset" || showCurrent;

  useEffect(() => {
    if (!reopened) return;
    panel.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeConsentPanel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [reopened]);

  const choose = (choice: ConsentChoice) => (event: MouseEvent<HTMLButtonElement>) => {
    // `detail` is the click count: 0 from the keyboard, 1 for a single click, 2+ inside a double-click.
    if (event.detail > 1) return;
    setConsent(choice);
  };

  if (!visible) return null;

  return (
    <section ref={panel} className={`${styles.panel} no-print`} aria-labelledby={titleId} tabIndex={-1}>
      <p id={titleId} className={styles.title}>
        {copy.title}
      </p>
      <p className={styles.body}>
        {copy.body}{" "}
        <Link href={href(lang, "privacy")} className={styles.link}>
          {copy.privacy}
        </Link>
      </p>
      {showCurrent ? <p className={styles.current}>{current}</p> : null}
      <div className={styles.actions}>
        <button type="button" className={styles.choice} onClick={choose("granted")}>
          {copy.accept}
        </button>
        <button type="button" className={styles.choice} onClick={choose("denied")}>
          {copy.reject}
        </button>
        {showCurrent ? (
          <button type="button" className={styles.close} onClick={closeConsentPanel}>
            {copy.close}
          </button>
        ) : null}
      </div>
    </section>
  );
}
