"use client";

import { Fragment, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Locale } from "@/content/schema";
import { cx } from "@/components/ui/cx";
import { LOCALES, LOCALE_COOKIE } from "@/i18n/config";
import { switchLocale } from "@/lib/routes";
import styles from "./LangSwitch.module.css";

/**
 * TH / EN — the same page in the other language.
 *
 * The href is built from the pathname, so it is a real link in the server HTML and works without
 * script. On a click the query string and fragment are added from the address bar (a page never
 * reads `searchParams`, so only the browser knows them): /th/contact?type=stay&room=… switches to
 * /en/contact?type=stay&room=…, and /th/faq#pets to /en/faq#pets.
 *
 * Choosing a language stores it in the `pkh_lang` cookie for a year, which is what stops the root
 * URL from redirecting a returning visitor against their choice (src/proxy.ts). It is a preference
 * cookie set by an explicit action; nothing else is stored.
 *
 * The language being read is text, not a link, and carries aria-current="true". Each code is
 * followed by the language's own name for assistive technology ("EN English", "TH ไทย").
 *
 * Strings arrive as props so this island never imports the string tables.
 */

const CODE: Record<Locale, string> = { th: "TH", en: "EN" };
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function rememberLanguage(lang: Locale) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${LOCALE_COOKIE}=${lang}; Max-Age=${ONE_YEAR_SECONDS}; Path=/; SameSite=Lax${secure}`;
}

export interface LangSwitchProps {
  lang: Locale;
  /** Accessible name of the group — glossary a11y.languageSwitch. */
  label: string;
  /** Each language's own name — glossary labels.languageThai / labels.languageEnglish. */
  names: Record<Locale, string>;
  className?: string;
}

export function LangSwitch({ lang, label, names, className }: LangSwitchProps) {
  const pathname = usePathname() ?? `/${lang}`;
  const router = useRouter();

  function handleClick(event: MouseEvent<HTMLAnchorElement>, to: Locale) {
    rememberLanguage(to);
    // Only a plain click is completed here; a modified click (new tab, new window) is the browser's.
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const { search, hash } = window.location;
    if (!search && !hash) return; // the href already is the destination
    event.preventDefault();
    router.push(switchLocale(pathname + search + hash, to));
  }

  return (
    <div role="group" aria-label={label} className={cx(styles.switch, className)}>
      {LOCALES.map((code, index) => (
        <Fragment key={code}>
          {index > 0 ? (
            <span className={styles.separator} aria-hidden="true">
              /
            </span>
          ) : null}
          {code === lang ? (
            <span className={styles.item} lang={code} aria-current="true">
              {CODE[code]}
              <span className="vh"> {names[code]}</span>
            </span>
          ) : (
            <Link
              href={switchLocale(pathname, code)}
              className={cx(styles.item, styles.link)}
              lang={code}
              hrefLang={code}
              onClick={(event) => handleClick(event, code)}
            >
              {CODE[code]}
              <span className="vh"> {names[code]}</span>
            </Link>
          )}
        </Fragment>
      ))}
    </div>
  );
}
