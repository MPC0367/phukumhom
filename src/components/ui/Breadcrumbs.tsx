import Link from "next/link";
import type { Locale } from "@/content/schema";
import styles from "./Breadcrumbs.module.css";

/**
 * Where this page sits. Used on deep pages only (a room, a policy) — not on first-level pages.
 *
 *   <Breadcrumbs lang={lang} trail={[
 *     { label: "Home", href: href(lang, "home") },
 *     { label: "Rooms", href: href(lang, "stay") },
 *     { label: "Executive Pool Spa" },
 *   ]} />
 *
 * The last item is the current page: it is text, not a link, and carries aria-current="page". Earlier
 * items need an `href` built with `href()` from lib/routes. `label` names the landmark for assistive
 * technology; it defaults to the glossary's a11y.breadcrumb in `lang`.
 */

export interface Crumb {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  lang: Locale;
  trail: Crumb[];
  /** aria-label of the <nav>. */
  label?: string;
  className?: string;
}

const NAV_LABEL: Record<Locale, string> = { en: "Breadcrumb", th: "เส้นทางนำทาง" };

export function Breadcrumbs({ lang, trail, label, className }: BreadcrumbsProps) {
  if (trail.length === 0) return null;
  const last = trail.length - 1;
  return (
    <nav aria-label={label ?? NAV_LABEL[lang]} className={className}>
      <ol role="list" className={styles.list}>
        {trail.map((crumb, i) => (
          <li key={`${i}-${crumb.label}`} className={styles.item}>
            {i === last ? (
              <span aria-current="page" className={styles.current}>
                {crumb.label}
              </span>
            ) : crumb.href ? (
              <Link href={crumb.href} className={styles.link}>
                {crumb.label}
              </Link>
            ) : (
              <span className={styles.plain}>{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
