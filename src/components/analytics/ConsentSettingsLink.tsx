"use client";

import type { Locale } from "@/content/schema";
import { ANALYTICS_CONFIGURED } from "@/lib/analytics";
import { openConsentPanel } from "./consent";
import { CONSENT_COPY } from "./consent-copy";
import styles from "./ConsentBanner.module.css";

/**
 * "Cookie settings" — the persistent way back to the measurement choice, for the footer:
 *
 *   <ConsentSettingsLink lang={lang} className={footerStyles.link} />
 *
 * Renders nothing when analytics is not configured, so the footer never shows a control that has
 * nothing to open. If the footer wraps each link in its own <li>, check `ANALYTICS_CONFIGURED` from
 * "@/lib/analytics" before rendering that <li>, so no empty list item is left behind.
 */
export function ConsentSettingsLink({ lang, className }: { lang: Locale; className?: string }) {
  if (!ANALYTICS_CONFIGURED) return null;
  return (
    <button type="button" className={className ?? styles.settings} onClick={(event) => openConsentPanel(event.currentTarget)}>
      {CONSENT_COPY[lang].settings}
    </button>
  );
}
