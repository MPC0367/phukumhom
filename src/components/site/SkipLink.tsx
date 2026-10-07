import type { Locale } from "@/content/schema";
import { t } from "@/i18n/ui";
import { MAIN_ID } from "./ids";
import { SkipLinkAnchor } from "./SkipLinkAnchor";
import styles from "./SkipLink.module.css";

/**
 * The first thing in <body>: lets a keyboard or switch user step over the header straight to the
 * page content. Off-screen until it takes focus. Its target is the layout's <main id={MAIN_ID}>.
 *
 * <main> carries no permanent `tabindex`: <SkipLinkAnchor> makes it focusable only for the moment
 * the link is used (Shell.module.css keeps that focus from drawing a ring around the whole page).
 */

export function SkipLink({ lang }: { lang: Locale }) {
  return (
    <SkipLinkAnchor targetId={MAIN_ID} className={styles.skip}>
      {t(lang).actions.skipToContent}
    </SkipLinkAnchor>
  );
}
