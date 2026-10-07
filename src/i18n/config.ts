import { LOCALES, type Locale } from "@/content/schema";

export { LOCALES };
export type { Locale };

/** Thai first: the resort's guests are overwhelmingly domestic. */
export const DEFAULT_LOCALE: Locale = "th";

/** Remembers an explicit language choice so the root URL never overrides it. */
export const LOCALE_COOKIE = "pkh_lang";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "th" || value === "en";
}

export function otherLocale(lang: Locale): Locale {
  return lang === "th" ? "en" : "th";
}

/** BCP 47 tags for `lang` attributes, Intl formatters and hreflang. */
export const LOCALE_TAG: Record<Locale, string> = { th: "th", en: "en" };
export const INTL_LOCALE: Record<Locale, string> = { th: "th-TH-u-ca-gregory-nu-latn", en: "en-GB" };
export const OG_LOCALE: Record<Locale, string> = { th: "th_TH", en: "en_GB" };

/** Pick the localized value. */
export function pick<T>(value: Record<Locale, T>, lang: Locale): T {
  return value[lang];
}
