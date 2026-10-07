import Link from "next/link";
import type { Locale } from "@/content/schema";
import { cx } from "@/components/ui/cx";
import { t } from "@/i18n/ui";
import { href } from "@/lib/routes";
import styles from "./Wordmark.module.css";

/**
 * The wordmark (ART-DIRECTION section 1): the word PHUKUMHOM set in Noto Sans Thai 500, tracked, with
 * "Resort Khao Yai" / "รีสอร์ท เขาใหญ่" small beneath. It is text, not a drawn logo, and it always
 * links to the homepage of the language being read.
 *
 * The name is Latin script in both languages (`lang="en"`), so no Thai text is ever tracked.
 *
 *   sub="wide"    the second line appears from 72rem of the surrounding container (the header)
 *   sub="always"  the second line is always there (the mobile menu)
 *
 * It inherits its colour, so the same markup is forest on the paper header, paper over a hero and
 * paper on the forest ground of the menu and the footer.
 */
export interface WordmarkProps {
  lang: Locale;
  sub?: "wide" | "always";
  className?: string;
}

export function Wordmark({ lang, sub = "wide", className }: WordmarkProps) {
  const ui = t(lang);
  return (
    <Link href={href(lang, "home")} className={cx(styles.wordmark, className)}>
      <span className={styles.name} lang="en">
        {ui.wordmark.name}
      </span>
      <span className={cx(styles.sub, sub === "wide" && styles.subWide)}>{ui.wordmark.sub}</span>
      <span className="vh"> ({ui.nav.home})</span>
    </Link>
  );
}
